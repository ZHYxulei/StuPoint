<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Services\VerificationCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class OrderVerificationController extends Controller
{
    public function __construct(
        private VerificationCodeService $verificationCodeService
    ) {}

    /**
     * Verify an order using different methods.
     */
    public function verify(Request $request, Order $order)
    {
        $request->validate([
            'method' => 'required|in:code,password,id_card,direct',
            'admin_password' => 'required_if:method,direct|string',
        ]);

        // Check if order is already verified
        if ($order->verified_at) {
            return back()->with('error', '该订单已核销');
        }

        // Check if order is cancelled
        if ($order->status === 'cancelled') {
            return back()->with('error', '已取消的订单无法核销');
        }

        // For direct verification, verify admin password
        if ($request->input('method') === 'direct') {
            $admin = auth()->user();
            if (! Hash::check($request->input('admin_password'), $admin->password)) {
                return back()->with('error', '管理员密码错误');
            }
        }

        $method = $request->input('method');
        $success = false;
        $message = '';

        try {
            switch ($method) {
                case 'code':
                    $success = $this->verifyByCode($order, $request);
                    $message = $success ? '核销成功（验证码）' : '验证码错误或已过期';
                    break;

                case 'password':
                    $success = $this->verifyByPassword($order, $request);
                    $message = $success ? '核销成功（密码）' : '密码错误';
                    break;

                case 'id_card':
                    $success = $this->verifyByIdCard($order, $request);
                    $message = $success ? '核销成功（身份证）' : '身份证或姓名错误';
                    break;

                case 'direct':
                    $success = true;
                    $message = '直接核销成功';
                    break;
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

                return back()->with('success', $message);
            }

            return back()->with('error', $message);
        } catch (\Exception $e) {
            return back()->with('error', '核销失败: '.$e->getMessage());
        }
    }

    /**
     * Verify by verification code.
     */
    protected function verifyByCode(Order $order, Request $request): bool
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        // Check if verification code exists in Redis
        if (! $this->verificationCodeService->exists($order->order_no)) {
            return false;
        }

        return $this->verificationCodeService->verify($order->order_no, $request->input('code'));
    }

    /**
     * Verify by user password.
     */
    protected function verifyByPassword(Order $order, Request $request): bool
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $order->user;

        return Hash::check($request->input('password'), $user->password);
    }

    /**
     * Verify by ID card and name.
     */
    protected function verifyByIdCard(Order $order, Request $request): bool
    {
        $request->validate([
            'id_number' => 'required|string',
            'name' => 'required|string',
        ]);

        $user = $order->user;

        return $user->id_number === $request->input('id_number')
            && $user->name === $request->input('name');
    }
}
