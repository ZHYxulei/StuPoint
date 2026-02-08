<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class VerificationCodeService
{
    private const PREFIX = 'verification_code:';

    private const EXPIRY_SECONDS = 86400; // 24 hours

    /**
     * Store verification code for an order.
     */
    public function store(string $orderNo, string $code): void
    {
        $key = $this->getKey($orderNo);
        Cache::put($key, $code, self::EXPIRY_SECONDS);
    }

    /**
     * Get verification code for an order.
     */
    public function get(string $orderNo): ?string
    {
        $key = $this->getKey($orderNo);
        $code = Cache::get($key);

        return $code ? $code : null;
    }

    /**
     * Verify verification code for an order.
     */
    public function verify(string $orderNo, string $code): bool
    {
        return $this->get($orderNo) === $code;
    }

    /**
     * Check if verification code exists and is valid.
     */
    public function exists(string $orderNo): bool
    {
        $key = $this->getKey($orderNo);

        return Cache::has($key);
    }

    /**
     * Get TTL (time to live) in seconds.
     */
    public function getTTL(string $orderNo): int
    {
        $key = $this->getKey($orderNo);

        // Note: Not all cache drivers support TTL
        // Return default expiry if unable to determine
        return self::EXPIRY_SECONDS;
    }

    /**
     * Delete verification code.
     */
    public function delete(string $orderNo): void
    {
        $key = $this->getKey($orderNo);
        Cache::forget($key);
    }

    /**
     * Regenerate verification code for an order.
     */
    public function regenerate(string $orderNo, string $newCode): void
    {
        $this->delete($orderNo);
        $this->store($orderNo, $newCode);
    }

    /**
     * Get cache key for an order.
     */
    private function getKey(string $orderNo): string
    {
        return self::PREFIX.$orderNo;
    }
}
