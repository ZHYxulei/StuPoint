<?php

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

/**
 * Count queries that hit the settings table.
 */
function settingsQueryCount(): int
{
    return collect(DB::getQueryLog())
        ->filter(fn (array $query): bool => str_contains($query['query'], 'settings'))
        ->count();
}

it('loads the settings table once no matter how many keys are read', function () {
    // Insert directly so nothing is memoised or cached ahead of the reads.
    Setting::query()->create(['key' => 'site_name', 'value' => 'StuPoint', 'type' => 'string', 'group' => 'site']);
    Setting::query()->create(['key' => 'footer_icp', 'value' => 'ICP-1', 'type' => 'string', 'group' => 'footer']);

    DB::flushQueryLog();
    DB::enableQueryLog();

    expect(Setting::get('site_name'))->toBe('StuPoint')
        ->and(Setting::get('footer_icp'))->toBe('ICP-1')
        ->and(Setting::get('site_name'))->toBe('StuPoint')
        ->and(Setting::get('site_keywords', 'fallback'))->toBe('fallback');

    expect(settingsQueryCount())->toBe(1);
});

it('reflects a value written through set() straight away', function () {
    Setting::query()->create(['key' => 'site_name', 'value' => 'Original', 'type' => 'string', 'group' => 'site']);

    expect(Setting::get('site_name'))->toBe('Original');

    Setting::set('site_name', 'Changed', 'string', 'site');

    expect(Setting::get('site_name'))->toBe('Changed');
});

it('casts values by their stored type', function () {
    Setting::query()->create(['key' => 'captcha_enabled', 'value' => 'true', 'type' => 'boolean', 'group' => 'captcha']);
    Setting::query()->create(['key' => 'mail_port', 'value' => '587', 'type' => 'integer', 'group' => 'mail']);

    expect(Setting::get('captcha_enabled'))->toBeTrue()
        ->and(Setting::get('mail_port'))->toBe(587);
});
