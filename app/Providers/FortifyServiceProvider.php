<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);

        // Customize authentication to check registration status
        Fortify::authenticateUsing(function (Request $request) {
            $login = $request->input('login');

            $request->validate([
                'login' => 'required|string',
                'password' => 'required|string',
            ]);

            // Support login by email, phone, or username
            $user = User::where('email', $login)
                ->orWhere('phone', $login)
                ->orWhere('name', $login)
                ->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'login' => '用户名、手机号或密码错误',
                ]);
            }

            // Check registration status
            if ($user->registration_status === 'pending') {
                Session::flash('error', '您的账号正在审核中，暂时无法登录');

                // Throw validation exception to show proper error message
                throw ValidationException::withMessages([
                    'login' => '您的账号正在审核中，暂时无法登录',
                ]);
            }

            if ($user->registration_status === 'rejected') {
                Session::flash('error', '您的账号暂无法登录，请联系管理员');

                throw ValidationException::withMessages([
                    'login' => '您的账号暂无法登录，请联系管理员',
                ]);
            }

            return $user;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register', [
            'classes' => SchoolClass::select('id', 'name', 'grade')
                ->orderBy('grade')
                ->orderBy('name')
                ->get()
                ->map(fn ($class) => [
                    'id' => $class->id,
                    'full_name' => $class->full_name,
                ]),
            'subjects' => Subject::active()
                ->ordered()
                ->get(['id', 'name', 'code']),
            'grades' => Grade::active()
                ->orderBy('name')
                ->get(['id', 'name']),
        ]));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
