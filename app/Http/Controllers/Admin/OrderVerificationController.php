<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\VerificationCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

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
        $method = $request->input('method');

        if ($method === 'password') {
            return response()->json([
                'success' => false,
                'message' => '无效的核销方式',
            ], 400);
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

                    return $this->verifyByPersistedCode($order->id, $request->input('code'));

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
                $this->markOrderVerified($order, $message);

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
        } catch (ValidationException $e) {
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
                'message' => '核销失败，请稍后重试',
            ], 500);
        }
    }

    /**
     * Verify by persisted verification code using atomic locking.
     */
    protected function verifyByPersistedCode(int $orderId, string $code): JsonResponse
    {
        return DB::transaction(function () use ($orderId, $code) {
            $order = Order::query()->lockForUpdate()->findOrFail($orderId);

            if ($order->verified_at) {
                return response()->json([
                    'success' => false,
                    'message' => '该订单已核销',
                ], 400);
            }

            if ($order->status === 'cancelled') {
                return response()->json([
                    'success' => false,
                    'message' => '已取消的订单无法核销',
                ], 400);
            }

            if ($order->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => '已完成的订单无法核销',
                ], 400);
            }

            if (! $order->verification_code || $order->isVerificationCodeExpired()) {
                Log::warning('Persisted verification code not found or expired', [
                    'order_id' => $order->id,
                    'order_no' => $order->order_no,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => '验证码不存在或已过期',
                ], 422);
            }

            if (! hash_equals($order->verification_code, $code)) {
                Log::warning('Persisted verification code mismatch', [
                    'order_id' => $order->id,
                    'order_no' => $order->order_no,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => '验证码错误',
                ], 422);
            }

            $message = '核销成功（验证码）';

            $this->markOrderVerified($order, $message);
            $this->verificationCodeService->delete($order->order_no);

            Log::info('Order verified successfully', [
                'order_id' => $order->id,
                'order_no' => $order->order_no,
                'method' => 'code',
                'verified_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        }, 5);
    }

    /**
     * Mark the order verified and record a single status transition when needed.
     */
    protected function markOrderVerified(Order $order, string $message): void
    {
        $currentStatus = $order->status;

        $order->forceFill([
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'status' => 'completed',
        ])->save();

        if ($currentStatus !== 'completed') {
            $order->statusHistory()->create([
                'from_status' => $currentStatus,
                'to_status' => 'completed',
                'note' => "订单已核销（方式：{$message}）",
                'operator_id' => auth()->id(),
            ]);
        }
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
