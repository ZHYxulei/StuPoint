<?php

namespace App\Plugins;

use App\Services\PluginManager;

abstract class Plugin
{
    abstract public function getName(): string;

    abstract public function getVersion(): string;

    abstract public function getSlug(): string;

    abstract public function boot(PluginManager $manager): void;

    public function getDescription(): ?string
    {
        return null;
    }

    public function getAuthor(): ?string
    {
        return null;
    }

    public function getPermissions(): array
    {
        return [];
    }

    public function register(): void
    {
        //
    }

    public function install(): void
    {
        //
    }

    public function uninstall(): void
    {
        //
    }

    public function enable(): void
    {
        //
    }

    public function disable(): void
    {
        //
    }
}
