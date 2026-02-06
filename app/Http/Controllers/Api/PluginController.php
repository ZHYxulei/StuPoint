<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PluginController extends Controller
{
    public function index(): JsonResponse
    {
        $plugins = Plugin::withCount('permissions')
            ->latest()
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'version' => $p->version,
                'description' => $p->description,
                'author' => $p->author,
                'status' => $p->status,
                'permissions_count' => $p->permissions_count,
                'created_at' => $p->created_at->toIso8601String(),
            ]);

        return response()->json([
            'success' => true,
            'data' => $plugins,
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        // This is handled by the Admin\PluginController
        // Just keeping the route for consistency
        return response()->json([
            'success' => false,
            'message' => '请使用管理员界面上传插件',
        ], 403);
    }
}
