<?php

namespace App\Events;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ThirdPartyExchangeRequested
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Order $order,
        public Product $product
    ) {}
}
