<?php

namespace App\Logging;

use Monolog\Formatter\LineFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Level;
use Monolog\Logger;
use Monolog\LogRecord;
use Monolog\Processor\PsrLogMessageProcessor;
use ZipArchive;

class SizeAndDateRotatingLogger
{
    /**
     * Create a custom Monolog instance.
     */
    public function __invoke(array $config): Logger
    {
        $logger = new Logger('laravel');
        $path = $config['path'] ?? storage_path('logs/laravel.log');
        $level = Logger::toMonologLevel($config['level'] ?? 'debug');
        $maxSize = (int) ($config['max_size'] ?? (5 * 1024 * 1024));

        $handler = new SizeAndDateRotatingHandler(
            $path,
            $maxSize,
            $level,
            true,
            null,
            true
        );

        $handler->setFormatter(new LineFormatter(null, null, true, true));

        $logger->pushProcessor(new PsrLogMessageProcessor);
        $logger->pushHandler($handler);

        return $logger;
    }
}

class SizeAndDateRotatingHandler extends StreamHandler
{
    public function __construct(
        private string $logFilePath,
        private int $maxSizeBytes,
        int|string|Level $level = Level::Debug,
        bool $bubble = true,
        ?int $filePermission = null,
        bool $useLocking = false
    ) {
        parent::__construct($logFilePath, $level, $bubble, $filePermission, $useLocking);
    }

    protected function write(LogRecord $record): void
    {
        $this->rotateIfNeeded();

        parent::write($record);
    }

    private function rotateIfNeeded(): void
    {
        if (! is_file($this->logFilePath)) {
            return;
        }

        clearstatcache(true, $this->logFilePath);
        $size = filesize($this->logFilePath);

        if ($size === false || $size < $this->maxSizeBytes) {
            return;
        }

        $this->closeStream();

        $rotatedPath = $this->buildRotatedPath();

        if (! @rename($this->logFilePath, $rotatedPath)) {
            return;
        }

        $this->compress($rotatedPath);
    }

    private function closeStream(): void
    {
        if (is_resource($this->stream)) {
            fclose($this->stream);
        }

        $this->stream = null;
    }

    private function buildRotatedPath(): string
    {
        $info = pathinfo($this->logFilePath);
        $dirname = $info['dirname'] ?? dirname($this->logFilePath);
        $filename = $info['filename'] ?? 'laravel';
        $extension = isset($info['extension']) ? '.'.$info['extension'] : '';
        $timestamp = date('Y-m-d_His');

        $path = sprintf('%s/%s-%s%s', $dirname, $filename, $timestamp, $extension);
        $counter = 1;

        while (file_exists($path) || file_exists($path.'.zip') || file_exists($path.'.gz')) {
            $path = sprintf('%s/%s-%s-%d%s', $dirname, $filename, $timestamp, $counter, $extension);
            $counter++;
        }

        return $path;
    }

    private function compress(string $sourcePath): void
    {
        if (class_exists(ZipArchive::class)) {
            $zipPath = $sourcePath.'.zip';
            $zip = new ZipArchive;

            if ($zip->open($zipPath, ZipArchive::CREATE) === true) {
                $zip->addFile($sourcePath, basename($sourcePath));
                $zip->close();
                @unlink($sourcePath);

                return;
            }
        }

        $content = @file_get_contents($sourcePath);

        if ($content === false) {
            return;
        }

        $gzipContent = @gzencode($content, 9);

        if ($gzipContent === false) {
            return;
        }

        if (@file_put_contents($sourcePath.'.gz', $gzipContent) !== false) {
            @unlink($sourcePath);
        }
    }
}
