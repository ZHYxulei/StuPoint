<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Services\VerificationCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class OrderVerificationController extends Controller
{
    public function __construct(
        private VerificationCodeService $verificationCodeService
    ) {}

    /**
     * Verify an order using different methods.
     */
    public function verify(Request $request, string $id)
    {
        // Clear opcache to ensure latest code is loaded
        if (function_exists('opcache_reset')) {
            opcache_reset();
        }

        // Manually find the order to avoid model binding issues
        $order = Order::findOrFail($id);

        // Log order details for debugging
        Log::info('Order verification request', [
            'order_id' => $order->id,
            'order_no' => $order->order_no,
            'route_param_id' => $id,
        ]);

        // Check if order has order_no
        if (! $order->order_no) {
            return response()->json([
                'success' => false,
                'message' => '订单数据异常：订单号缺失',
            ], 400);
        }

        // Check if order is already verified
        if ($order->verified_at) {
            return response()->json([
                'success' => false,
                'message' => '该订单已核销',
            ], 400);
        }

        // Check if order is cancelled
        if ($order->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => '已取消的订单无法核销',
            ], 400);
        }

        // Check if order is completed (but not verified)
        if ($order->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => '已完成的订单无法核销',
            ], 400);
        }

        $method = $request->input('method');
        $success = false;
        $message = '';

        Log::info('Order verification attempt', [
            'order_id' => $order->id,
            'order_no' => $order->order_no,
            'method' => $method,
            'user_id' => auth()->id(),
        ]);

        try {
            switch ($method) {
                case 'code':
                    $request->validate([
                        'code' => 'required|string|size:6',
                    ]);

                    // Check if verification code exists
                    if (! $this->verificationCodeService->exists($order->order_no)) {
                        $message = '验证码不存在或已过期';
                        Log::warning('Verification code not found', [
                            'order_no' => $order->order_no,
                        ]);
                        break;
                    }

                    $success = $this->verificationCodeService->verify($order->order_no, $request->input('code'));
                    $message = $success ? '核销成功（验证码）' : '验证码错误';

                    if (! $success) {
                        Log::warning('Verification code mismatch', [
                            'order_no' => $order->order_no,
                            'provided_code' => $request->input('code'),
                        ]);
                    }
                    break;

                case 'password':
                    $request->validate([
                        'password' => 'required|string',
                    ]);

                    $success = $this->verifyByPassword($order, $request);
                    $message = $success ? '核销成功（密码）' : '密码错误';
                    break;

                case 'id_card':
                    $request->validate([
                        'id_number' => 'required|string',
                        'name' => 'required|string',
                    ]);

                    $success = $this->verifyByIdCard($order, $request);
                    $message = $success ? '核销成功（身份证）' : '身份证或姓名错误';
                    break;

                case 'direct':
                    $request->validate([
                        'admin_password' => 'required|string',
                    ]);

                    // Verify admin password
                    $admin = auth()->user();
                    if (! Hash::check($request->input('admin_password'), $admin->password)) {
                        $message = '管理员密码错误';
                        Log::warning('Admin password verification failed', [
                            'admin_id' => $admin->id,
                            'order_id' => $order->id,
                        ]);
                        break;
                    }

                    $success = true;
                    $message = '直接核销成功';
                    break;

                default:
                    return response()->json([
                        'success' => false,
                        'message' => '无效的核销方式',
                    ], 400);
            }

            if ($success) {
                // Update order as verified
                $order->update([
                    'verified_at' => now(),
                    'verified_by' => auth()->id(),
                    'status' => 'completed',
                ]);

                // Delete verification code from Redis after successful verification
                $this->verificationCodeService->delete($order->order_no);

                // Record status history
                $order->updateStatus('completed', "订单已核销（方式：{$message}）", auth()->id());

                Log::info('Order verified successfully', [
                    'order_id' => $order->id,
                    'order_no' => $order->order_no,
                    'method' => $method,
                    'verified_by' => auth()->id(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $message,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 422);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => '数据验证失败',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Order verification error', [
                'order_id' => $order->id,
                'order_no' => $order->order_no,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '核销失败: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify by user password.
     */
    protected function verifyByPassword(Order $order, Request $request): bool
    {
        $user = $order->user;

        return Hash::check($request->input('password'), $user->password);
    }

    /**
     * Verify by ID card and name.
     */
    protected function verifyByIdCard(Order $order, Request $request): bool
    {
        $user = $order->user;

        return $user->id_number === $request->input('id_number')
            && $user->name === $request->input('name');
    }
}
