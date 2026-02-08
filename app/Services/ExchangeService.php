<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ExchangeService
{
    public function __construct(
        protected PointService $pointService,
        private VerificationCodeService $verificationCodeService
    ) {}

    /**
     * Exchange product with redeemable points.
     */
    public function exchange(User $user, Product $product, array $shippingInfo): Order
    {
        return DB::transaction(function () use ($user, $product, $shippingInfo) {
            // Check stock
            if (! $product->hasStock()) {
                throw new \Exception('Product out of stock');
            }

            // Check points
            $points = $user->points;
            if (! $points || $points->redeemable_points < $product->points_required) {
                throw new \Exception('Insufficient redeemable points');
            }

            // Deduct redeemable points
            $this->pointService->deductRedeemablePoints(
                $user,
                $product->points_required,
                'product_exchange',
                [
                    'description' => "Exchanged for product: {$product->name}",
                    'product_id' => $product->id,
                ]
            );

            // Generate order number
            $orderNo = $this->generateOrderNo();

            // Generate and store verification code in Redis (24 hours expiry)
            $verificationCode = $this->generateVerificationCode();
            $this->verificationCodeService->store($orderNo, $verificationCode);

            // Create order
            $order = Order::create([
                'order_no' => $orderNo,
                'user_id' => $user->id,
                'product_id' => $product->id,
                'points_spent' => $product->points_required,
                'status' => 'pending',
                'shipping_info' => $shippingInfo,
            ]);

            // Update stock
            $product->decreaseStock();

            // Handle third-party exchange
            if ($product->is_third_party) {
                $this->handleThirdPartyExchange($order, $product);
            }

            return $order;
        });
    }

    /**
     * Generate unique order number.
     */
    protected function generateOrderNo(): string
    {
        return 'ORD'.date('Ymd').strtoupper(substr(uniqid(), -6));
    }

    /**
     * Generate 6-digit verification code.
     */
    protected function generateVerificationCode(): string
    {
        return sprintf('%06d', mt_rand(0, 999999));
    }

    /**
     * Handle third-party platform exchange.
     */
    protected function handleThirdPartyExchange(Order $order, Product $product): void
    {
        // Trigger event for third-party exchange
        event(new \App\Events\ThirdPartyExchangeRequested($order, $product));
    }
}
