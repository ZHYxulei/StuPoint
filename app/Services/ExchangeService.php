<?php

namespace App\Services;

use App\Events\ThirdPartyExchangeRequested;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ExchangeService
{
    public function __construct(
        protected PointService $pointService,
        private VerificationCodeService $verificationCodeService
    ) {}

    /**
     * Exchange product with redeemable points.
     */
    public function exchange(User $user, Product $product, int $quantity, array $shippingInfo): Order
    {
        return DB::transaction(function () use ($user, $product, $quantity, $shippingInfo) {
            $product = Product::query()->lockForUpdate()->findOrFail($product->id);
            $points = $user->points()->lockForUpdate()->first();
            $unitPointsSpent = $product->points_required;
            $totalPointsSpent = $unitPointsSpent * $quantity;

            if (! $product->hasStock($quantity)) {
                throw new RuntimeException('商品库存不足');
            }

            if (! $points || $points->redeemable_points < $totalPointsSpent) {
                throw new RuntimeException('Insufficient redeemable points');
            }

            $this->pointService->deductRedeemablePoints(
                $user,
                $totalPointsSpent,
                'product_exchange',
                [
                    'description' => "Exchanged for product: {$product->name}",
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_points_spent' => $unitPointsSpent,
                ]
            );

            $orderNo = $this->generateOrderNo();
            $verificationCode = $this->generateVerificationCode();
            $this->verificationCodeService->store($orderNo, $verificationCode);

            $order = Order::create([
                'order_no' => $orderNo,
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_points_spent' => $unitPointsSpent,
                'points_spent' => $totalPointsSpent,
                'status' => 'pending',
                'shipping_info' => $shippingInfo,
            ]);

            $product->decreaseStock($quantity);

            if ($product->is_third_party) {
                $this->handleThirdPartyExchange($order, $product);
            }

            return $order;
        }, attempts: 5);
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
        event(new ThirdPartyExchangeRequested($order, $product));
    }
}
