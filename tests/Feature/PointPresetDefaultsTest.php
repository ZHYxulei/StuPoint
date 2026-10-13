<?php

use App\Models\PointPreset;
use Illuminate\Support\Facades\App;

it('returns the default presets in the active locale', function () {
    App::setLocale('zh-CN');
    $zh = PointPreset::defaults();

    App::setLocale('en');
    $en = PointPreset::defaults();

    expect($zh)->toHaveCount(8)
        ->and($en)->toHaveCount(8)
        // Only the wording changes; order, types and amounts must not.
        ->and(array_column($en, 'type'))->toBe(array_column($zh, 'type'))
        ->and(array_column($en, 'amount'))->toBe(array_column($zh, 'amount'))
        ->and($zh[0]['name'])->toBe('上课回答问题')
        ->and($en[0]['name'])->toBe('Answered a question');
});

it('keeps both preset bundles covering exactly the same keys', function () {
    // Laravel's __() returns the key path itself when a translation is
    // missing, which would surface as "presets.foo.name" in the UI — so an
    // untranslated key has to be caught here rather than at runtime.
    $zh = require base_path('lang/zh-CN/presets.php');
    $en = require base_path('lang/en/presets.php');

    expect(array_keys($en))->toBe(array_keys($zh));

    foreach ($zh as $key => $entry) {
        expect($entry)->toHaveKeys(['name', 'reason'])
            ->and($entry['name'])->not->toBeEmpty();

        expect($en[$key])->toHaveKeys(['name', 'reason'])
            ->and($en[$key]['name'])->not->toBeEmpty()
            ->and($en[$key]['reason'])->not->toBeEmpty();
    }
});

it('never falls back to a raw translation key', function () {
    foreach (['zh-CN', 'en'] as $locale) {
        App::setLocale($locale);

        foreach (PointPreset::defaults() as $preset) {
            expect($preset['name'])->not->toContain('presets.')
                ->and($preset['reason'])->not->toContain('presets.');
        }
    }
});
