# StuPoint 插件开发指南

## 目录

- [概述](#概述)
- [目录结构](#目录结构)
- [manifest.json 清单文件](#manifestjson-清单文件)
- [插件基类接口](#插件基类接口)
- [生命周期](#生命周期)
- [可用服务](#可用服务)
- [路由注册](#路由注册)
- [模型与数据库](#模型与数据库)
- [权限系统](#权限系统)
- [Hook 系统](#hook-系统)
- [前端页面](#前端页面)
- [依赖管理](#依赖管理)
- [示例插件：公告栏](#示例插件公告栏)
- [最佳实践](#最佳实践)

---

## 概述

StuPoint 插件系统允许你在不修改主系统代码的情况下扩展功能。插件可以：

- 注册自定义路由
- 创建数据库表和模型
- 定义角色和权限
- 添加前端页面
- 依赖其他插件或 Composer 包
- 通过 Hook 系统与其他插件交互

所有插件存放在项目根目录的 `plugins/` 文件夹中，命名空间为 `Plugins\{PluginDir}`。

---

## 目录结构

```
plugins/
├── Plugin.php                          # 插件抽象基类（所有插件必须继承）
├── NoticeBoard/                        # 示例插件：公告栏
│   ├── manifest.json                   # 必须：插件清单文件
│   ├── NoticeBoardPlugin.php           # 必须：插件主类（继承 Plugin）
│   ├── NoticeBoardController.php       # 可选：控制器
│   └── Models/                         # 可选：模型目录
│       └── Notice.php
└── StudentCouncil/                     # 学生会插件
    ├── manifest.json
    ├── StudentCouncilPlugin.php
    ├── StudentCouncilController.php
    └── Models/
        ├── CouncilActivity.php
        ├── CouncilActivityParticipant.php
        └── CouncilActivityPoint.php
```

### 最小结构

一个插件最少需要两个文件：

```
plugins/MyPlugin/
├── manifest.json          # 插件清单
└── MyPluginPlugin.php     # 插件主类
```

---

## manifest.json 清单文件

每个插件**必须**包含 `manifest.json` 文件，用于声明插件的元数据和依赖。

### 完整格式

```json
{
    "name": "插件显示名称",
    "slug": "plugin_slug",
    "version": "1.0.0",
    "description": "插件功能描述",
    "author": "作者名称",
    "class": "MyPluginPlugin",
    "min_stupoint_version": "1.3.0",
    "dependencies": {
        "composer": {
            "laravel/sanctum": "^3.0",
            "spatie/laravel-permission": "^5.0"
        },
        "plugins": [
            "student_council"
        ]
    }
}
```

### 字段说明

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 插件的显示名称 |
| `slug` | string | 是 | 唯一标识符，使用下划线命名（如 `notice_board`） |
| `version` | string | 是 | 语义化版本号 |
| `description` | string | 是 | 插件功能描述 |
| `author` | string | 是 | 作者名称 |
| `class` | string | 是 | 插件主类名（不含命名空间） |
| `min_stupoint_version` | string | 否 | 最低 StuPoint 版本要求 |
| `dependencies.composer` | object | 否 | Composer 包依赖，key 为包名，value 为版本约束 |
| `dependencies.plugins` | array | 否 | 依赖的其他插件 slug 列表 |

### 依赖项说明

**Composer 依赖** (`dependencies.composer`)：
- 在插件启用时自动安装
- 格式与 `composer.json` 的 `require` 一致
- 示例：`"laravel/sanctum": "^3.0"`

**插件依赖** (`dependencies.plugins`)：
- 启用当前插件前，所列插件必须已启用
- 如果依赖不满足，系统会阻止启用并提示
- 示例：`["student_council", "notice_board"]`

---

## 插件基类接口

所有插件必须继承 `Plugins\Plugin` 抽象基类。

### 抽象方法（必须实现）

```php
abstract public function getName(): string;      // 插件名称
abstract public function getVersion(): string;    // 版本号
abstract public function getSlug(): string;       // 唯一标识符
abstract public function boot(PluginManager $manager): void;  // 启动逻辑
```

### 可选方法（按需覆盖）

```php
// 返回插件描述
public function getDescription(): ?string;

// 返回作者名
public function getAuthor(): ?string;

// 返回插件提供的权限列表
public function getPermissions(): array;

// 首次安装时调用（建表、种子数据等）
public function install(): void;

// 卸载时调用（清理数据、删表等）
public function uninstall(): void;

// 启用时调用
public function enable(): void;

// 禁用时调用
public function disable(): void;
```

### 完整示例

```php
<?php

namespace Plugins\MyPlugin;

use Plugins\Plugin as BasePlugin;
use App\Services\PluginManager;

class MyPluginPlugin extends BasePlugin
{
    public function getName(): string
    {
        return 'my_plugin';
    }

    public function getVersion(): string
    {
        return '1.0.0';
    }

    public function getSlug(): string
    {
        return 'my_plugin';
    }

    public function getDescription(): ?string
    {
        return '我的自定义插件';
    }

    public function getAuthor(): ?string
    {
        return 'Your Name';
    }

    public function getPermissions(): array
    {
        return [
            [
                'name' => '管理功能',
                'slug' => 'manage_feature',
                'description' => '管理插件提供的功能',
            ],
        ];
    }

    public function boot(PluginManager $manager): void
    {
        // 在此处注册路由、设置 Hook 等
        $this->loadRoutes();
    }

    protected function loadRoutes(): void
    {
        \Illuminate\Support\Facades\Route::middleware(['web', 'auth'])
            ->prefix('my-plugin')
            ->name('my_plugin.')
            ->group(function () {
                \Illuminate\Support\Facades\Route::get('/', [MyPluginController::class, 'index'])->name('index');
            });
    }

    public function install(): void
    {
        // 建表等安装操作
    }

    public function uninstall(): void
    {
        // 清理操作
    }
}
```

---

## 生命周期

```
插件放入 plugins/ 目录
    ↓
访问管理后台 → 自动注册到数据库（status: disabled）
    ↓
管理员点击"启用"
    ↓
系统检查 manifest.json 中的依赖
    ├─ Composer 依赖 → 自动安装
    ├─ 插件依赖 → 检查是否已启用
    └─ 依赖不满足 → 阻止启用，显示错误
    ↓
调用 enable() 方法
    ↓
调用 boot() 方法（每次应用启动都会调用）
    ↓
插件正常运行
    ↓
管理员点击"禁用" → 调用 disable()
    ↓
管理员点击"卸载" → 调用 uninstall() → 删除数据库记录
```

### 方法调用时机

| 方法 | 调用时机 | 次数 |
|------|----------|------|
| `install()` | 首次安装 | 一次 |
| `enable()` | 启用插件 | 每次启用 |
| `boot()` | 每次应用启动 + 启用时 | 每次请求 |
| `disable()` | 禁用插件 | 每次禁用 |
| `uninstall()` | 卸载插件 | 一次 |

---

## 可用服务

插件可以通过依赖注入或 `app()` 辅助函数访问主系统的所有服务。

### PluginManager

```php
use App\Services\PluginManager;

// 在 boot() 中通过参数获取
public function boot(PluginManager $manager): void
{
    // 注册 Hook
    $manager->addHook('my.hook', function ($arg) {
        return "result";
    });

    // 执行 Hook
    $result = $manager->executeHook('other.hook', $data);

    // 获取其他插件
    $other = $manager->getPlugin('other_plugin');

    // 获取已启用插件列表
    $enabled = $manager->getEnabledPluginSlugs();
}
```

### PointService（积分服务）

```php
use App\Services\PointService;

$pointService = app(PointService::class);

// 给用户添加积分
$pointService->addPoints($user, 100, 'my_plugin', [
    'description' => '完成任务奖励',
]);

// 扣除可兑换积分
$pointService->deductRedeemablePoints($user, 50, 'my_plugin', [
    'description' => '兑换商品',
]);

// 查询余额
$balance = $pointService->getBalance($user);

// 检查操作权限
$canModify = $pointService->canModifyPoints($operator, $target);
```

### 主系统模型

插件可以直接使用主系统的模型：

```php
use App\Models\User;       // 用户
use App\Models\Role;       // 角色
use App\Models\Permission; // 权限
use App\Models\Setting;    // 系统设置
use App\Models\SchoolClass; // 班级
```

### Inertia 共享数据

```php
use Inertia\Inertia;

// 在 boot() 中向所有页面共享数据
Inertia::share('my_plugin_enabled', true);
Inertia::share('my_plugin_config', $config);
```

---

## 路由注册

在 `boot()` 方法中注册路由。插件路由遵循 Laravel 标准路由定义。

### 示例

```php
protected function loadRoutes(): void
{
    Route::middleware(['web', 'auth', 'verified'])
        ->prefix('my-feature')
        ->name('my_feature.')
        ->group(function () {
            // 公开路由
            Route::get('/', [MyController::class, 'index'])->name('index');

            // 需要权限的路由
            Route::middleware(['permission:my_plugin'])->group(function () {
                Route::get('/create', [MyController::class, 'create'])->name('create');
                Route::post('/', [MyController::class, 'store'])->name('store');
            });
        });
}
```

### 中间件说明

| 中间件 | 说明 |
|--------|------|
| `web` | Web 中间件组（Session、CSRF 等） |
| `auth` | 需要登录 |
| `verified` | 需要邮箱验证 |
| `permission:slug` | 需要指定权限（`slug` 为插件 slug 或权限 slug） |

---

## 模型与数据库

### 模型存放

插件模型放在 `plugins/{PluginDir}/Models/` 目录下，命名空间为 `Plugins\{PluginDir}\Models`。

```php
namespace Plugins\NoticeBoard\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    protected $fillable = ['title', 'content', 'author_id', 'status'];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
```

### 数据库迁移

由于 Laravel 的迁移系统约定，迁移文件需要放在 `database/migrations/` 目录。推荐两种方式：

**方式一：在 `install()` 中直接建表**

```php
public function install(): void
{
    if (! Schema::hasTable('my_table')) {
        Schema::create('my_table', function ($table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
    }
}
```

**方式二：发布迁移文件**

将迁移文件放入 `database/migrations/`，在 `install()` 中运行：

```php
public function install(): void
{
    Artisan::call('migrate', ['--path' => 'plugins/MyPlugin/database/migrations']);
}
```

### 卸载清理

在 `uninstall()` 中清理数据：

```php
public function uninstall(): void
{
    Schema::dropIfExists('my_table');
}
```

---

## 权限系统

### 定义权限

在 `getPermissions()` 中声明插件提供的权限：

```php
public function getPermissions(): array
{
    return [
        [
            'name' => '权限显示名称',
            'slug' => 'permission_slug',
            'description' => '权限描述',
        ],
    ];
}
```

权限在插件安装时自动注册到 `plugin_permissions` 表。

### 使用权限中间件

```php
Route::middleware(['permission:my_plugin'])->group(function () {
    // 需要插件权限的路由
});
```

### 创建插件专属角色

```php
public function boot(PluginManager $manager): void
{
    $manager->addHook('plugins.booted', function () {
        Role::firstOrCreate(
            ['slug' => 'my_plugin_user'],
            [
                'name' => '我的插件用户',
                'description' => '可以使用我的插件功能',
                'is_system' => false,
                'level' => 50,
            ]
        );
    });
}
```

> **注意：** `is_system = false` 的角色不会出现在用户创建表单中，只能通过插件自身管理。

---

## Hook 系统

Hook 允许插件之间进行通信，无需直接依赖。

### 注册 Hook

```php
public function boot(PluginManager $manager): void
{
    // 注册一个 Hook，其他插件可以调用
    $manager->addHook('my_plugin.process', function (string $data) {
        return strtoupper($data);
    });
}
```

### 调用 Hook

```php
// 返回第一个非 null 结果
$result = $manager->executeHook('my_plugin.process', 'hello');
// $result = 'HELLO'
```

### 内置 Hook

| Hook | 触发时机 |
|------|----------|
| `plugins.booted` | 所有插件启动完成后 |

---

## 前端页面

插件的 Inertia 页面放在主系统的 `resources/js/pages/` 目录下（Inertia 的页面发现机制要求）。

### 目录命名

使用插件 slug 的 kebab-case 形式作为目录名：

```
resources/js/pages/
├── notice-board/           # notice_board 插件
│   ├── index.tsx
│   ├── show.tsx
│   └── create.tsx
└── student-council/        # student_council 插件
    ├── dashboard.tsx
    └── activities/
        ├── index.tsx
        ├── create.tsx
        ├── show.tsx
        └── edit.tsx
```

### 在控制器中渲染

```php
return inertia('notice-board/index', [
    'notices' => $notices,
]);
```

### 侧边栏集成

在 `resources/js/components/app-sidebar.tsx` 中，侧边栏通过检查 `enabledPlugins` 来决定是否显示插件菜单：

```tsx
const isMyPluginEnabled = enabledPlugins?.includes('my_plugin') || false;

// 只有插件启用时才显示菜单
{isMyPluginEnabled && (
    <SidebarGroup>
        <Link href="/my-plugin">我的插件</Link>
    </SidebarGroup>
)}
```

---

## 依赖管理

### Composer 依赖

在 `manifest.json` 中声明：

```json
{
    "dependencies": {
        "composer": {
            "spatie/laravel-permission": "^5.0"
        },
        "plugins": []
    }
}
```

系统在插件安装时自动运行 `composer require`。

### 插件依赖

```json
{
    "dependencies": {
        "composer": {},
        "plugins": ["student_council"]
    }
}
```

启用插件前，系统检查所有依赖插件是否已启用。如果 `student_council` 未启用，当前插件将无法启用，并提示：

> 插件依赖未满足，请先启用以下插件: student_council

---

## 示例插件：公告栏

以下是一个完整的公告栏插件示例，展示了所有核心功能。

### manifest.json

```json
{
    "name": "公告栏",
    "slug": "notice_board",
    "version": "1.0.0",
    "description": "简单的公告栏插件，支持发布和管理公告信息",
    "author": "StuPoint",
    "class": "NoticeBoardPlugin",
    "dependencies": {
        "composer": {},
        "plugins": []
    }
}
```

### NoticeBoardPlugin.php

```php
<?php

namespace Plugins\NoticeBoard;

use App\Models\Role;
use Plugins\Plugin as BasePlugin;
use App\Services\PluginManager;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

class NoticeBoardPlugin extends BasePlugin
{
    public function getName(): string { return 'notice_board'; }
    public function getVersion(): string { return '1.0.0'; }
    public function getSlug(): string { return 'notice_board'; }
    public function getDescription(): ?string { return '简单的公告栏插件'; }
    public function getAuthor(): ?string { return 'StuPoint'; }

    public function getPermissions(): array
    {
        return [
            ['name' => '发布公告', 'slug' => 'publish_notice', 'description' => '创建和发布公告'],
            ['name' => '管理公告', 'slug' => 'manage_notice', 'description' => '编辑、删除和置顶公告'],
        ];
    }

    public function boot(PluginManager $manager): void
    {
        $manager->addHook('plugins.booted', function () {
            Role::firstOrCreate(['slug' => 'notice_publisher'], [
                'name' => '公告发布员',
                'is_system' => false,
                'level' => 50,
            ]);
        });

        $this->loadRoutes();
    }

    protected function loadRoutes(): void
    {
        Route::middleware(['web', 'auth', 'verified'])
            ->prefix('notices')
            ->name('notices.')
            ->group(function () {
                Route::get('/', [NoticeBoardController::class, 'index'])->name('index');
                Route::get('/{id}', [NoticeBoardController::class, 'show'])->name('show');
                Route::middleware(['permission:notice_board'])->group(function () {
                    Route::get('/create', [NoticeBoardController::class, 'create'])->name('create');
                    Route::post('/', [NoticeBoardController::class, 'store'])->name('store');
                    Route::put('/{id}', [NoticeBoardController::class, 'update'])->name('update');
                    Route::delete('/{id}', [NoticeBoardController::class, 'destroy'])->name('destroy');
                });
            });
    }

    public function install(): void
    {
        if (! Schema::hasTable('notices')) {
            Schema::create('notices', function ($table) {
                $table->id();
                $table->string('title');
                $table->text('content')->nullable();
                $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
                $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
                $table->boolean('is_pinned')->default(false);
                $table->timestamp('published_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function uninstall(): void
    {
        Schema::dropIfExists('notices');
    }
}
```

---

## 最佳实践

1. **命名规范**
   - 插件目录名使用 PascalCase：`NoticeBoard`
   - slug 使用 snake_case：`notice_board`
   - 路由前缀使用 kebab-case：`/notices`
   - 控制器命名：`{PluginName}Controller`

2. **安全性**
   - 始终验证用户输入（`$request->validate()`）
   - 使用中间件保护路由（`auth`, `permission`）
   - 不要在 `boot()` 中执行数据库写操作，使用 Hook 延迟执行

3. **隔离性**
   - 不要修改主系统的文件
   - 模型放在插件自己的 `Models/` 目录
   - 使用 Hook 系统与其他插件通信，避免直接引用

4. **兼容性**
   - 在 `manifest.json` 中声明 `min_stupoint_version`
   - 使用 `Schema::hasTable()` 检查表是否存在再建表
   - 在 `uninstall()` 中清理所有创建的数据

5. **性能**
   - `boot()` 方法在每次请求都会执行，避免重计算
   - 使用 `$manager->addHook('plugins.booted', ...)` 延迟执行初始化
   - 使用 Laravel 的缓存系统存储插件配置
