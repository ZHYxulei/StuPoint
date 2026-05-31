<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Support\Facades\Process;

class AboutController extends Controller
{
    public function index()
    {
        $version = $this->getVersion();
        $commitHash = $this->getCommitHash();
        $commitDate = $this->getCommitDate();
        $phpVersion = phpversion();
        $laravelVersion = app()->version();
        $schoolName = Setting::get('site_name', config('app.name', 'StuPoint'));
        $schoolLogo = Setting::get('site_logo', '');

        return inertia('about/index', [
            'version' => $version,
            'commitHash' => $commitHash,
            'commitDate' => $commitDate,
            'phpVersion' => $phpVersion,
            'laravelVersion' => $laravelVersion,
            'schoolName' => $schoolName,
            'schoolLogo' => $schoolLogo,
        ]);
    }

    private function getVersion(): string
    {
        $versionFile = base_path('VERSION');
        if (file_exists($versionFile)) {
            return trim(file_get_contents($versionFile));
        }

        return '1.0.0';
    }

    private function getCommitHash(): string
    {
        try {
            $result = trim((string) Process::run('git log --format="%h" -1')->output());

            return $result ?: 'unknown';
        } catch (\Throwable) {
            return 'unknown';
        }
    }

    private function getCommitDate(): string
    {
        try {
            $result = trim((string) Process::run('git log --format="%ai" -1')->output());

            return $result ? substr($result, 0, 10) : 'unknown';
        } catch (\Throwable) {
            return 'unknown';
        }
    }
}
