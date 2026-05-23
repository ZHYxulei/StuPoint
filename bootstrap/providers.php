<?php

use App\Providers\AppServiceProvider;
use App\Providers\EventServiceProvider;
use App\Providers\FolioServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\HorizonServiceProvider;
use App\Providers\PluginServiceProvider;
use SocialiteProviders\Manager\ServiceProvider;

return [
    AppServiceProvider::class,
    EventServiceProvider::class,
    FolioServiceProvider::class,
    FortifyServiceProvider::class,
    HorizonServiceProvider::class,
    PluginServiceProvider::class,
    ServiceProvider::class,
];
