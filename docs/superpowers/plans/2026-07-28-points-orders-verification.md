# Points Orders and Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make points writes concurrency-safe, support multi-quantity orders, enforce a transactional order state machine with idempotent compensation, and make SMS/order verification single-use and purpose-isolated.

**Architecture:** Keep the existing one-order/one-product model and add quantity plus unit-point snapshot rather than introducing order items. Centralize locking and ledger writes in point/order services, persist refund and order-code lifecycles for idempotency, and separate SMS verification from order redemption codes. Web and API controllers become thin adapters around shared services.

**Tech Stack:** Laravel 13 transactions and `lockForUpdate`, Eloquent, PHP 8.4 enums, MySQL, Pest 4.

---

## File Map

- Add order quantity/snapshot columns, refund ledger table, persisted order verification codes, and SMS consumption fields.
- Add order/refund/code models and focused order services.
- Refactor `PointService` and keep `ExchangeService` as a thin compatibility facade.
- Refactor API shop and admin order/verification controllers.
- Correct `OrderResource`, history mappings, and invalid factory states.
- Add focused unit/feature and MySQL concurrency tests.

### Task 1: Define Multi-Quantity Order Behavior with Failing Tests

**Files:**
- Create: `tests/Feature/Api/Shop/CreateOrderQuantityTest.php`

- [ ] **Step 1: Generate test**

```bash
php artisan make:test --pest Api/Shop/CreateOrderQuantityTest --no-interaction
```

- [ ] **Step 2: Add quantity success test**

```php
it('creates a multi quantity order and charges the total point cost', function () {
    $user = User::factory()->approved()->create();
    $product = Product::factory()->create([
        'points_required' => 50,
        'stock' => 10,
        'status' => 'active',
    ]);

    UserPoint::factory()->create([
        'user_id' => $user->id,
        'points' => 500,
        'redeemable_points' => 500,
    ]);

    Passport::actingAs($user);

    $this->postJson('/api/shop/orders', [
        'product_id' => $product->id,
        'quantity' => 3,
        'shipping_info' => [
            'name' => '测试用户',
            'phone' => '13800000000',
            'address' => '测试地址',
        ],
    ])->assertSuccessful();

    $order = Order::query()->latest('id')->firstOrFail();

    expect($order->quantity)->toBe(3)
        ->and($order->unit_points)->toBe(50)
        ->and($order->points_spent)->toBe(150)
        ->and($product->fresh()->stock)->toBe(7)
        ->and($user->points()->firstOrFail()->redeemable_points)->toBe(350);
});
```

Adapt factory/field names to existing models; preserve the assertions.

- [ ] **Step 3: Add stock and balance rejection tests**

Cover requested quantity above stock and total cost above redeemable points. Assert no order, no stock change, and no point change.

- [ ] **Step 4: Run and verify red**

```bash
php artisan test --compact tests/Feature/Api/Shop/CreateOrderQuantityTest.php
```

Expected: FAIL because `quantity`/`unit_points` are absent and service charges one unit.

- [ ] **Step 5: Commit tests**

```bash
git add tests/Feature/Api/Shop/CreateOrderQuantityTest.php
git commit -m "test: define multi quantity order behavior"
```

### Task 2: Add Order Quantity and Point Snapshot

**Files:**
- Create: `database/migrations/*_add_quantity_and_point_snapshot_to_orders_table.php`
- Modify: `app/Models/Order.php`
- Modify: `database/factories/OrderFactory.php`
- Modify: `app/Http/Resources/OrderResource.php`

- [ ] **Step 1: Generate migration**

```bash
php artisan make:migration add_quantity_and_point_snapshot_to_orders_table --table=orders --no-interaction
```

- [ ] **Step 2: Add fields and useful composite indexes**

```php
Schema::table('orders', function (Blueprint $table) {
    $table->unsignedInteger('quantity')->default(1)->after('product_id');
    $table->unsignedBigInteger('unit_points')->default(0)->after('quantity');
    $table->index(['user_id', 'status', 'created_at']);
    $table->index(['product_id', 'status', 'created_at']);
});

DB::table('orders')->update([
    'quantity' => 1,
    'unit_points' => DB::raw('points_spent'),
]);
```

If `points_spent` is nullable or typed differently, backfill defensively.

- [ ] **Step 3: Update model/factory/resource contracts**

Add integer casts/fillable values. Remove the illegal factory `approved()` state and replace it with valid order statuses. In `OrderResource`, expose `quantity`, `unit_points`, and actual status history fields:

```php
'status_history' => OrderStatusHistoryResource::collection($this->whenLoaded('statusHistory')),
```

If no history resource exists, map `from_status`, `to_status`, `note`, and timestamps accurately; remove nonexistent `notes` fields.

- [ ] **Step 4: Run tests**

```bash
php artisan test --compact tests/Feature/Api/Shop/CreateOrderQuantityTest.php
```

Expected: still red at service behavior, not schema/resource errors.

- [ ] **Step 5: Commit**

```bash
git add database/migrations app/Models/Order.php database/factories/OrderFactory.php app/Http/Resources/OrderResource.php
git commit -m "feat: persist order quantity and point snapshot"
```

### Task 3: Centralize Locked Point Mutations

**Files:**
- Modify: `app/Services/PointService.php`
- Modify: `tests/Unit/Services/PointServiceTest.php`
- Create: `app/Services/Orders/Exceptions/InsufficientRedeemablePointsException.php`

- [ ] **Step 1: Add failing service tests**

Add tests that one mutation updates balances and transaction rows atomically, refund restores redeemable points, and insufficient balance throws a domain exception without a ledger write.

- [ ] **Step 2: Create domain exception**

```bash
php artisan make:class Services/Orders/Exceptions/InsufficientRedeemablePointsException --no-interaction
```

- [ ] **Step 3: Implement a locked account helper**

```php
private function lockedAccount(User $user): UserPoint
{
    $account = UserPoint::query()
        ->where('user_id', $user->id)
        ->lockForUpdate()
        ->first();

    if ($account) {
        return $account;
    }

    try {
        UserPoint::query()->create([
            'user_id' => $user->id,
            'points' => 0,
            'redeemable_points' => 0,
        ]);
    } catch (QueryException $exception) {
        if (! $this->isUniqueConstraintViolation($exception)) {
            throw $exception;
        }
    }

    return UserPoint::query()
        ->where('user_id', $user->id)
        ->lockForUpdate()
        ->firstOrFail();
}
```

Use the actual initial fields and Laravel/driver error helpers available.

- [ ] **Step 4: Expose transactional operations**

```php
public function addPoints(User $user, int $amount, string $source, array $metadata = []): void;
public function deductRedeemablePoints(User $user, int $amount, string $source, array $metadata = []): void;
public function restoreRedeemablePoints(User $user, int $amount, string $source, array $metadata = []): void;
```

Each method must use `DB::transaction(..., attempts: 3)`, lock the account, update the correct balances, and insert ledger rows before commit.

- [ ] **Step 5: Run tests and commit**

```bash
php artisan test --compact tests/Unit/Services/PointServiceTest.php
vendor/bin/pint --dirty --format agent
git add app/Services/PointService.php app/Services/Orders/Exceptions/InsufficientRedeemablePointsException.php tests/Unit/Services/PointServiceTest.php
git commit -m "fix: serialize point balance and ledger mutations"
```

### Task 4: Implement Transactional Order Placement

**Files:**
- Create: `app/Services/Orders/OrderPlacementService.php`
- Create: `app/Services/Orders/Exceptions/ProductOutOfStockException.php`
- Modify: `app/Services/ExchangeService.php`
- Modify: `app/Http/Controllers/Api/ShopController.php`

- [ ] **Step 1: Generate classes**

```bash
php artisan make:class Services/Orders/OrderPlacementService --no-interaction
php artisan make:class Services/Orders/Exceptions/ProductOutOfStockException --no-interaction
```

- [ ] **Step 2: Implement placement contract**

```php
/** @param array{name:string, phone:string, address:string} $shippingInfo */
public function place(User $user, Product $product, int $quantity, array $shippingInfo): Order
```

Inside a retrying transaction:

1. Lock product by ID.
2. Validate active status and `stock >= quantity`.
3. Compute `totalPoints = points_required * quantity`.
4. Deduct points through a PointService operation that participates in the existing transaction and does not open an independent commit boundary.
5. Decrement stock by quantity.
6. Create order with quantity, unit snapshot, total points, shipping information, and pending status.
7. Create initial history only if current conventions require it.

- [ ] **Step 3: Make `ExchangeService` a compatibility facade**

```php
public function exchange(
    User $user,
    Product $product,
    array $shippingInfo,
    int $quantity = 1,
): Order {
    return $this->orderPlacementService->place($user, $product, $quantity, $shippingInfo);
}
```

- [ ] **Step 4: Pass quantity from API and map domain errors**

`ShopController::createOrder()` passes validated quantity. Use 409 for stock/state conflicts and 422 for insufficient redeemable balance; follow existing API error envelope.

- [ ] **Step 5: Run tests**

```bash
php artisan test --compact tests/Feature/Api/Shop/CreateOrderQuantityTest.php
php artisan test --compact tests/Feature/Api/ShopTest.php
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Services/Orders app/Services/ExchangeService.php app/Http/Controllers/Api/ShopController.php
git commit -m "feat: place multi quantity orders transactionally"
```

### Task 5: Define and Test the Order State Machine

**Files:**
- Create: `app/Services/Orders/OrderStatus.php`
- Create: `app/Services/Orders/OrderStateMachineService.php`
- Create: `app/Services/Orders/Exceptions/InvalidOrderStatusTransitionException.php`
- Create: `tests/Unit/Services/Orders/OrderStateMachineServiceTest.php`
- Modify: `app/Models/Order.php`
- Modify: `app/Http/Controllers/Admin/OrderController.php`

- [ ] **Step 1: Generate files**

```bash
php artisan make:class Services/Orders/OrderStatus --no-interaction
php artisan make:class Services/Orders/OrderStateMachineService --no-interaction
php artisan make:class Services/Orders/Exceptions/InvalidOrderStatusTransitionException --no-interaction
php artisan make:test --pest --unit Services/Orders/OrderStateMachineServiceTest --no-interaction
```

- [ ] **Step 2: Define enum and transitions**

```php
enum OrderStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Failed = 'failed';
}
```

Allowed transitions:

```php
private const TRANSITIONS = [
    'pending' => ['processing', 'cancelled', 'failed'],
    'processing' => ['completed', 'cancelled', 'failed'],
    'completed' => [],
    'cancelled' => [],
    'failed' => [],
];
```

- [ ] **Step 3: Write failing unit tests**

Cover pending→processing, pending→cancelled, processing→completed, and completed→pending rejection.

- [ ] **Step 4: Implement transition**

```php
public function transition(
    Order $order,
    OrderStatus $targetStatus,
    User $operator,
    ?string $note = null,
): Order
```

Lock the order, validate transition, perform side effects through delegated services, update status exactly once, then create one history record with the original and target values.

- [ ] **Step 5: Refactor controller**

Validate status using `Rule::enum(OrderStatus::class)` in a Form Request if the controller currently validates inline. `OrderController::updateStatus()` calls only the state-machine service.

- [ ] **Step 6: Run and commit**

```bash
php artisan test --compact tests/Unit/Services/Orders/OrderStateMachineServiceTest.php
git add app/Services/Orders app/Models/Order.php app/Http/Controllers/Admin/OrderController.php tests/Unit/Services/Orders/OrderStateMachineServiceTest.php
git commit -m "feat: enforce order status transitions"
```

### Task 6: Add Idempotent Refund and Restock

**Files:**
- Create: `database/migrations/*_create_order_refunds_table.php`
- Create: `app/Models/OrderRefund.php`
- Create: `database/factories/OrderRefundFactory.php`
- Create: `app/Services/Orders/OrderRefundService.php`
- Create: `tests/Unit/Services/Orders/OrderRefundServiceTest.php`
- Create: `tests/Feature/Admin/Orders/TransitionOrderStatusTest.php`
- Modify: `app/Services/Orders/OrderStateMachineService.php`

- [ ] **Step 1: Generate files**

```bash
php artisan make:model OrderRefund --factory --no-interaction
php artisan make:migration create_order_refunds_table --create=order_refunds --no-interaction
php artisan make:class Services/Orders/OrderRefundService --no-interaction
php artisan make:test --pest --unit Services/Orders/OrderRefundServiceTest --no-interaction
php artisan make:test --pest Admin/Orders/TransitionOrderStatusTest --no-interaction
```

- [ ] **Step 2: Define refund ledger**

```php
Schema::create('order_refunds', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
    $table->unsignedBigInteger('points_restored');
    $table->unsignedInteger('stock_restored');
    $table->string('reason', 500);
    $table->foreignId('operator_id')->nullable()->constrained('users')->nullOnDelete();
    $table->string('idempotency_key', 64)->unique();
    $table->json('metadata')->nullable();
    $table->timestamp('processed_at');
    $table->timestamps();
});
```

- [ ] **Step 3: Write red tests**

Assert one refund row per order, repeated cancellation does not change points/stock twice, and compensation uses `unit_points * quantity` plus `quantity` stock.

- [ ] **Step 4: Implement refund**

```php
public function refund(
    Order $order,
    User $operator,
    string $reason,
    ?string $idempotencyKey = null,
): OrderRefund
```

Lock order/product/account, check or create the unique refund row, restore points using `PointService`, increment stock, and persist audit metadata in one retrying transaction. Treat an existing refund as the successful idempotent result rather than performing side effects again.

- [ ] **Step 5: Delegate terminal transitions**

When transitioning to cancelled/failed, the state machine invokes refund before committing the status/history. Completed orders must not be refundable through this automatic path.

- [ ] **Step 6: Run and commit**

```bash
php artisan test --compact tests/Unit/Services/Orders/OrderRefundServiceTest.php
php artisan test --compact tests/Feature/Admin/Orders/TransitionOrderStatusTest.php
git add database/migrations app/Models/OrderRefund.php database/factories/OrderRefundFactory.php app/Services/Orders tests/Unit/Services/Orders/OrderRefundServiceTest.php tests/Feature/Admin/Orders/TransitionOrderStatusTest.php
git commit -m "feat: add idempotent order refund and restock"
```

### Task 7: Make SMS Codes Purpose-Isolated and Single-Use

**Files:**
- Create: `database/migrations/*_add_consumption_fields_to_verification_codes_table.php`
- Create: `app/Services/Verification/SmsVerificationPurpose.php`
- Create: `app/Services/Verification/SmsVerificationService.php`
- Create: `tests/Feature/Verification/SmsVerificationCodeConsumptionTest.php`
- Modify: `app/Models/VerificationCode.php`
- Modify: `app/Http/Controllers/VerificationController.php`

- [ ] **Step 1: Generate files**

```bash
php artisan make:migration add_consumption_fields_to_verification_codes_table --table=verification_codes --no-interaction
php artisan make:class Services/Verification/SmsVerificationPurpose --no-interaction
php artisan make:class Services/Verification/SmsVerificationService --no-interaction
php artisan make:test --pest Verification/SmsVerificationCodeConsumptionTest --no-interaction
```

- [ ] **Step 2: Add lifecycle fields**

```php
Schema::table('verification_codes', function (Blueprint $table) {
    $table->timestamp('used_at')->nullable();
    $table->string('used_ip', 45)->nullable();
    $table->timestamp('superseded_at')->nullable();
    $table->index(['phone', 'type', 'used_at', 'expires_at']);
    $table->index(['phone', 'type', 'superseded_at', 'created_at']);
});
```

- [ ] **Step 3: Define purposes**

```php
enum SmsVerificationPurpose: string
{
    case Register = 'register';
    case Login = 'login';
    case Reset = 'reset';
}
```

Use only purposes already supported by the application; add no speculative flows.

- [ ] **Step 4: Write red tests**

Cover same-purpose single consumption, cross-purpose rejection, new-code superseding old code, expiry, and send failure leaving no usable code.

- [ ] **Step 5: Implement service**

```php
public function send(string $phone, SmsVerificationPurpose $purpose, ?string $ip = null): VerificationCode;
public function consume(string $phone, string $code, SmsVerificationPurpose $purpose, ?string $ip = null): VerificationCode;
```

`send()` creates or stages the code, calls the SMS provider, and only leaves it usable after successful send; supersede older unused same-purpose codes. `consume()` locks the matching row and atomically sets `used_at`/`used_ip`.

- [ ] **Step 6: Refactor controller and remove plaintext logging**

Controller parses purpose enum, invokes service, and preserves rate limits. Ensure log providers are prohibited or loudly rejected in production configuration.

- [ ] **Step 7: Run and commit**

```bash
php artisan test --compact tests/Feature/Verification/SmsVerificationCodeConsumptionTest.php
git add database/migrations app/Services/Verification app/Models/VerificationCode.php app/Http/Controllers/VerificationController.php tests/Feature/Verification/SmsVerificationCodeConsumptionTest.php
git commit -m "feat: consume sms verification codes once per purpose"
```

### Task 8: Persist and Atomically Consume Order Verification Codes

**Files:**
- Create: `database/migrations/*_create_order_verification_codes_table.php`
- Create: `app/Models/OrderVerificationCode.php`
- Create: `database/factories/OrderVerificationCodeFactory.php`
- Create: `app/Services/Orders/OrderVerificationCodeService.php`
- Modify: `app/Services/VerificationCodeService.php`
- Modify: `app/Services/Orders/OrderPlacementService.php`

- [ ] **Step 1: Generate files**

```bash
php artisan make:model OrderVerificationCode --factory --no-interaction
php artisan make:migration create_order_verification_codes_table --create=order_verification_codes --no-interaction
php artisan make:class Services/Orders/OrderVerificationCodeService --no-interaction
```

- [ ] **Step 2: Create code table**

```php
Schema::create('order_verification_codes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->cascadeOnDelete();
    $table->unsignedInteger('version')->default(1);
    $table->char('code_hash', 64);
    $table->text('code_ciphertext');
    $table->timestamp('issued_at');
    $table->timestamp('expires_at');
    $table->timestamp('consumed_at')->nullable();
    $table->foreignId('consumed_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('invalidated_at')->nullable();
    $table->timestamps();

    $table->unique(['order_id', 'version']);
    $table->index(['order_id', 'consumed_at', 'expires_at']);
    $table->index('expires_at');
});
```

Do not make the six-digit hash globally unique.

- [ ] **Step 3: Implement issue and consume contracts**

```php
/** @return array{code:string, expires_at:string, version:int} */
public function issue(Order $order): array;

public function consume(Order $order, string $code, User $operator): OrderVerificationCode;
```

Issue stores SHA-256 hash plus encrypted ciphertext; consume locks the current valid order code, constant-time compares, and sets consumed fields atomically.

- [ ] **Step 4: Integrate issuance during order placement**

Issue a code after order creation inside the transaction. Return plaintext only to the immediate response path that currently needs it; do not log it.

- [ ] **Step 5: Keep old service as compatibility facade temporarily**

Redirect existing callers to the new persisted service, then remove cache compare/delete behavior after all references migrate.

- [ ] **Step 6: Commit**

```bash
git add database/migrations app/Models/OrderVerificationCode.php database/factories/OrderVerificationCodeFactory.php app/Services/Orders/OrderVerificationCodeService.php app/Services/VerificationCodeService.php app/Services/Orders/OrderPlacementService.php
git commit -m "feat: persist single-use order verification codes"
```

### Task 9: Centralize Secure Order Verification

**Files:**
- Create: `app/Services/Orders/OrderVerificationMethod.php`
- Create: `app/Services/Orders/OrderVerificationService.php`
- Create: `app/Services/Orders/Exceptions/OrderVerificationFailedException.php`
- Create: `tests/Feature/Admin/Orders/VerifyOrderTest.php`
- Modify: `app/Http/Controllers/Admin/OrderVerificationController.php`
- Modify: `app/Http/Controllers/Admin/OrderController.php`

- [ ] **Step 1: Generate files and tests**

```bash
php artisan make:class Services/Orders/OrderVerificationMethod --no-interaction
php artisan make:class Services/Orders/OrderVerificationService --no-interaction
php artisan make:class Services/Orders/Exceptions/OrderVerificationFailedException --no-interaction
php artisan make:test --pest Admin/Orders/VerifyOrderTest --no-interaction
```

- [ ] **Step 2: Define allowed methods**

Do not include user login password. Use only methods retained by approved business policy, for example:

```php
enum OrderVerificationMethod: string
{
    case Code = 'code';
    case Direct = 'direct';
}
```

If identity-card verification remains explicitly approved, isolate and redact it; otherwise remove it.

- [ ] **Step 3: Write red tests**

Cover atomic code consumption, second attempt rejection, correct single history record, direct verification restricted to explicit roles, and absence of provided code/password/ID values in logs.

- [ ] **Step 4: Implement verification service**

```php
/** @param array<string, mixed> $payload */
public function verify(
    Order $order,
    OrderVerificationMethod $method,
    array $payload,
    User $operator,
): Order
```

Lock order, authorize, require a legal transition to completed, atomically consume code when applicable, and call the state machine once. Never update status before calling transition.

- [ ] **Step 5: Refactor controllers**

`OrderVerificationController` validates method/payload, delegates, and emits sanitized responses. `OrderController::show()` uses the persisted code service for any authorized display path.

- [ ] **Step 6: Run and commit**

```bash
php artisan test --compact tests/Feature/Admin/Orders/VerifyOrderTest.php
git add app/Services/Orders app/Http/Controllers/Admin/OrderVerificationController.php app/Http/Controllers/Admin/OrderController.php tests/Feature/Admin/Orders/VerifyOrderTest.php
git commit -m "feat: verify orders through atomic domain service"
```

### Task 10: Prove MySQL Concurrency

**Files:**
- Create: `tests/Feature/Orders/MySqlOrderConcurrencyTest.php`

- [ ] **Step 1: Generate test**

```bash
php artisan make:test --pest Orders/MySqlOrderConcurrencyTest --no-interaction
```

- [ ] **Step 2: Mark and guard the suite**

```php
uses()->group('mysql');

beforeEach(function () {
    if (config('database.default') !== 'mysql') {
        $this->markTestSkipped('Concurrency tests require MySQL.');
    }
});
```

- [ ] **Step 3: Add real concurrent request tests**

Cover:

- two requests competing for the same final stock/balance;
- two verification attempts for one code;
- two cancellation retries for one order.

Use separate HTTP processes or connections. Do not claim concurrency from sequential calls inside one transaction. Each test asserts exactly one successful side effect and one refund/code-consumption row.

- [ ] **Step 4: Run on disposable MySQL**

```bash
DB_CONNECTION=mysql CACHE_STORE=file php artisan test --compact tests/Feature/Orders/MySqlOrderConcurrencyTest.php
```

Expected: PASS with deterministic final balances, stock, refund count, and consumed code.

- [ ] **Step 5: Commit**

```bash
git add tests/Feature/Orders/MySqlOrderConcurrencyTest.php
git commit -m "test: prove order point and verification concurrency"
```

### Task 11: Final Domain Verification

- [ ] **Step 1: Format PHP**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 2: Run focused suites**

```bash
php artisan test --compact tests/Unit/Services/PointServiceTest.php
php artisan test --compact tests/Feature/Api/Shop/CreateOrderQuantityTest.php
php artisan test --compact tests/Unit/Services/Orders/OrderStateMachineServiceTest.php
php artisan test --compact tests/Unit/Services/Orders/OrderRefundServiceTest.php
php artisan test --compact tests/Feature/Admin/Orders/TransitionOrderStatusTest.php
php artisan test --compact tests/Feature/Verification/SmsVerificationCodeConsumptionTest.php
php artisan test --compact tests/Feature/Admin/Orders/VerifyOrderTest.php
```

Expected: all pass.

- [ ] **Step 3: Run existing regression suites**

```bash
php artisan test --compact tests/Feature/Api/ShopTest.php
php artisan test --compact tests/Feature/AdminAdjustUserPointsTest.php
php artisan test --compact
```

Expected: exit 0.
