<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile information page.
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load('roles');

        return Inertia::render('profile/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'nickname' => $user->nickname,
                'email' => $user->email,
                'phone' => $user->phone,
                'student_id' => $user->student_id,
                'id_number' => $user->id_number ? $this->maskIdNumber($user->id_number) : null,
                'grade' => $user->grade,
                'class' => $user->class,
                'is_head_teacher' => $user->is_head_teacher,
                'avatar' => $user->avatar,
                'last_login_at' => $user->last_login_at?->toDateTimeString(),
                'last_login_ip' => $user->last_login_ip,
                'roles' => $user->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ]),
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Mask ID number showing only first 4 and last 2 characters.
     */
    protected function maskIdNumber(string $idNumber): string
    {
        $length = strlen($idNumber);
        if ($length <= 6) {
            return $idNumber;
        }

        $prefix = substr($idNumber, 0, 4);
        $suffix = substr($idNumber, -2);
        $maskedLength = $length - 6;

        return $prefix.str_repeat('*', $maskedLength).$suffix;
    }

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
