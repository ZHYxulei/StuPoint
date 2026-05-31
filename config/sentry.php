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

    // SSL CA certificate bundle for HTTPS verification
    // Uses project-bundled cacert.pem to avoid "unable to get local issuer certificate" errors
    'ssl_cafile' => env('SENTRY_SSL_CAFILE', base_path('storage/certs/cacert.pem')),

];
