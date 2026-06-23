<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['提供的凭证不正确。'],
            ]);
        }

        // Revoke previous tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('api-token')->accessToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 31536000, // 1 year ( Passport personal access tokens don't expire by default)
                'user' => new UserResource($user->load('roles')),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->token()->revoke();

        return response()->json([
            'success' => true,
            'message' => '已成功登出',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'points']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }
}
