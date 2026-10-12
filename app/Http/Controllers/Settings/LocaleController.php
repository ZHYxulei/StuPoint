<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\Locale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    /**
     * Store the visitor's language preference for subsequent requests.
     *
     * Deliberately open to guests as well as signed-in users: the locale is a
     * display preference, and public pages (login, welcome) should be
     * switchable too. The write is CSRF-protected like any other session write.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', Rule::in(Locale::supported())],
        ]);

        $locale = Locale::normalize($validated['locale']);

        $request->session()->put('locale', $locale);

        // Also a cookie: signing out flushes the session, and the language
        // should not reset just because the user logged out.
        Cookie::queue('locale', $locale, 60 * 24 * 365);

        return back();
    }
}
