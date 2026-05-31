<?php

return [

    'dsn' => env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN')),

    'environment' => env('SENTRY_ENVIRONMENT', env('APP_ENV', 'production')),

    'release' => env('SENTRY_RELEASE'),

    'sample_rate' => (float) env('SENTRY_SAMPLE_RATE', 1.0),

    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 1.0),

    'profiles_sample_rate' => (float) env('SENTRY_PROFILES_SAMPLE_RATE', 1.0),

    'send_default_pii' => env('SENTRY_SEND_DEFAULT_PII', false),

    'ignore_exceptions' => [],

    'http_proxy' => env('SENTRY_HTTP_PROXY', null),

    // Use system native CA store for SSL verification
    // Fixes "unable to get local issuer certificate" on Windows
    'http_ssl_native_ca' => env('SENTRY_SSL_NATIVE_CA', true),

    // Disable SSL peer verification as fallback (set to false only if native CA still fails)
    'http_ssl_verify_peer' => env('SENTRY_SSL_VERIFY_PEER', true),

];
