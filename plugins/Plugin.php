<?php

namespace Plugins;

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

    /**
     * Define the configuration schema for this plugin.
     * Return an array of config fields with type, default, label, and description.
     *
     * Example:
     * return [
     *     'max_items' => ['type' => 'number', 'default' => 10, 'label' => '最大数量', 'description' => '0表示无限制'],
     *     'auto_approve' => ['type' => 'boolean', 'default' => false, 'label' => '自动批准', 'description' => '是否自动批准'],
     * ];
     */
    public function getConfigSchema(): array
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
