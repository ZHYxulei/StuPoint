<?php

use App\Services\Locale;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('normalises legacy locale codes onto the bundled ones', function () {
    // The installer and older .env files write the bare `zh`.
    expect(Locale::normalize('zh'))->toBe('zh-CN')
        ->and(Locale::normalize('zh_CN'))->toBe('zh-CN')
        ->and(Locale::normalize('zh-Hans'))->toBe('zh-CN')
        ->and(Locale::normalize('en-US'))->toBe('en')
        // Retired: it validated during install but never had a bundle.
        ->and(Locale::normalize('ja'))->toBe('zh-CN')
        ->and(Locale::normalize(null))->toBe('zh-CN');
});

it('stores the chosen locale in the session', function () {
    $this->post('/settings/locale', ['locale' => 'en'])
        ->assertRedirect()
        ->assertSessionHas('locale', 'en');
});

it('also persists the locale as a cookie so it survives logout', function () {
    // Signing out invalidates the whole session, which would otherwise reset
    // the language the user picked.
    $this->post('/settings/locale', ['locale' => 'en'])
        ->assertCookie('locale', 'en');
});

it('resolves the locale from the cookie when the session has none', function () {
    // The state right after a logout: session flushed, cookie kept.
    $this->withSession([])
        ->withCookie('locale', 'en')
        ->get('/login')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
});

it('rejects a locale the frontend has no bundle for', function () {
    $this->post('/settings/locale', ['locale' => 'ja'])
        ->assertSessionHasErrors('locale');
});

it('serves the session locale to Inertia and to the html tag', function () {
    $response = $this->withSession(['locale' => 'en'])->get('/login');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));

    // Proves SetLocale ran before the root view was rendered, not just before
    // the Inertia props were built.
    expect($response->getContent())->toContain('lang="en"');
});

it('falls back to the configured locale when nothing is stored', function () {
    config(['app.locale' => 'zh']);

    $response = $this->get('/login');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'zh-CN'));

    expect($response->getContent())->toContain('lang="zh-CN"');
});
