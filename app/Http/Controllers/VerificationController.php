<?php

namespace App\Http\Controllers;

use App\Models\VerificationCode;
use App\Services\Sms\SmsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    /**
     * Send verification code via SMS.
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'type' => 'required|in:register,login,reset',
        ]);

        // Rate limit: 1 per minute per phone
        $recent = VerificationCode::where('phone', $validated['phone'])
            ->where('created_at', '>', now()->subMinute())
            ->first();

        if ($recent) {
            return response()->json(['success' => false, 'message' => '发送过于频繁，请1分钟后再试'], 429);
        }

        // Generate 6-digit code
        $code = str_pad((string) mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);

        VerificationCode::create([
            'phone' => $validated['phone'],
            'code' => $code,
            'type' => $validated['type'],
            'expires_at' => now()->addMinutes(10),
        ]);

        // Send SMS
        $sms = app(SmsManager::class);
        $sent = $sms->sendCode($validated['phone'], $code);

        if (! $sent) {
            return response()->json(['success' => false, 'message' => '短信发送失败，请检查短信服务配置'], 500);
        }

        return response()->json(['success' => true, 'message' => '验证码已发送']);
    }

    /**
     * Verify code.
     */
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'code' => 'required|string|size:6',
            'type' => 'required|in:register,login,reset',
        ]);

        $record = VerificationCode::where('phone', $validated['phone'])
            ->where('code', $validated['code'])
            ->where('type', $validated['type'])
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $record) {
            return response()->json(['success' => false, 'message' => '验证码错误或已过期'], 422);
        }

        return response()->json(['success' => true, 'message' => '验证成功']);
    }
}
