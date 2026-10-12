<?php

namespace App\Http\Middleware;

use App\Services\Locale;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply the visitor's chosen locale for the rest of the request.
 *
 * Listed first in the web group's appended middleware, so it runs after the
 * default group (which starts the session) but before HandleInertiaRequests,
 * which is what shares the resolved locale with the client.
 *
 * Without a stored preference the configured `app.locale` wins — which
 * AppServiceProvider has already canonicalised.
 */
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        // Cookie as well as session: signing out invalidates the whole
        // session, and a display preference should outlive that.
        $stored = $request->session()->get('locale') ?? $request->cookie('locale');

        App::setLocale(
            $stored !== null
                ? Locale::normalize($stored)
                : Locale::normalize(config('app.locale'))
        );

        return $next($request);
    }
}
