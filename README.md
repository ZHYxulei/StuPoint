# StuPoint

> 一款轻量级、可扩展的学生积分管理与成长激励系统

StuPoint 是由 **ZHYxulei** 开发的一款轻量级、可扩展的学生积分管理与成长激励系统。适用于高中小学、培训机构或班级场景，帮助教师高效记录、统计与可视化学生的日常表现积分。

---

## 项目地址

- **主项目**: https://github.com/ZHYxulei/StuPoint
- **参考项目**: https://github.com/ZHYxulei/Laravel-Demo

---

## 目录

- [主要功能](#主要功能)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [环境变量说明](#环境变量说明)
- [系统要求](#系统要求)
- [安装部署](#安装部署)
- [使用说明](#使用说明)
- [开发指南](#开发指南)
- [目录结构](#目录结构)
- [常见问题](#常见问题)
- [更新日志](#更新日志)
- [免责声明](#免责声明)
- [贡献者](#贡献者)
- [参考项目](#参考项目)
- [许可证](#许可证)
- [联系方式](#联系方式)

---

## 主要功能

### 🎯 积分管理
- **灵活的积分系统**: 支持教师手动增减学生积分
- **多种积分来源**: 作业完成、课堂表现、考试成绩、自定义规则
- **积分历史记录**: 完整的积分变动历史，可追溯每次积分变化
- **积分统计图表**: 直观的图表展示积分趋势和排名

### 🏪 积分商城
- **商品管理**: 支持添加、编辑、删除兑换商品
- **商品分类**: 可按类别组织商品，便于浏览
- **积分兑换**: 学生可使用积分兑换商品或奖励
- **订单管理**: 完整的订单系统，支持订单状态跟踪
- **多种核销方式**:
  - 验证码核销（6位数字验证码，24小时有效）
  - 密码核销（使用下单账号密码）
  - 身份证核销（使用身份证号和姓名）
  - 直接核销（管理员密码确认）

### 📊 数据统计
- **积分排名**: 学生积分排行榜，激励良性竞争
- **统计分析**: 详细的积分消费和获取统计
- **数据可视化**: 图表展示积分数据趋势
- **订单统计**: 订单量、积分消耗等关键指标

### 👥 角色权限
- **超级管理员**: 拥有所有权限，管理系统配置
- **管理员**: 管理用户、订单、商品等
- **年级主任**: 管理整个年级的学生和班级
- **班主任**: 管理本班学生，查看和操作积分
- **教师**: 查看和操作所教班级学生的积分
- **学生**: 查看自己的积分和订单
- **家长**: 查看孩子的积分和订单情况

### 🔔 订单核销
- **多种核销方式**: 支持验证码、密码、身份证、直接核销
- **核销权限**: 管理员、班主任、年级主任可核销订单
- **核销记录**: 完整的核销历史记录
- **验证码管理**: 自动生成和过期验证码

### 🔌 插件系统
- **可扩展架构**: 支持第三方插件扩展功能
- **插件市场**: 内置插件源管理功能
- **插件管理**: 一键安装、启用、禁用插件
- **插件配置**: 灵活的插件配置选项

### 📱 响应式设计
- **多端适配**: 完美支持桌面、平板、手机
- **现代化UI**: 基于Tailwind CSS 4的美观界面
- **暗黑模式**: 支持亮色和暗色主题切换
- **流畅交互**: 优化的用户交互体验

---

## 技术栈

### 后端技术

#### 核心框架
- **Laravel 12** - 优雅的 PHP Web 应用框架
- **PHP 8.2+** - 现代化 PHP 语言特性

#### Laravel 生态系统
- **Laravel Fortify** - 无头身份验证后端，提供完整的认证功能
- **Laravel Folio** - 基于文件的路由系统，简化路由管理
- **Laravel Horizon** - Redis 队列监控和管理工具
- **Laravel Passport** - OAuth2 服务器，提供 API 认证
- **Laravel Pulse** - 应用性能监控工具
- **Laravel Scout** - 基于驱动的全文搜索
- **Laravel Socialite** - OAuth 社交登录支持
- **Laravel Telescope** - 优雅的调试助手
- **Laravel Wayfinder** - TypeScript 路由生成器
- **Livewire 4** - 全栈框架，用 PHP 构建动态界面
- **Volt** - 单文件 Livewire 组件
- **Pest 3** - 优雅的 PHP 测试框架

#### 数据库
- **Eloquent ORM** - Laravel 的 ORM
- **MySQL / PostgreSQL / SQLite** - 支持多种数据库
- **Redis** - 缓存和队列驱动

### 前端技术

#### 核心框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite 7** - 下一代前端构建工具

#### UI 框架和库
- **Inertia.js 2** - 现代单页应用解决方案
- **Tailwind CSS 4** - 功能类优先的 CSS 框架
- **Radix UI** - 无样式的可访问 UI 组件库
- **Headless UI** - 完全无样式的 UI 组件
- **Lucide React** - 美观一致的图标库
- **shadcn/ui** - 基于 Radix UI 和 Tailwind CSS 的组件库

#### 开发工具
- **ESLint 9** - JavaScript 和 TypeScript 代码检查
- **Prettier 3** - 代码格式化工具
- **Laravel Vite Plugin** - Vite 的 Laravel 集成
- **@laravel/vite-plugin-wayfinder** - TypeScript 路由生成

---

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户界面层                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  管理员界面   │  │  教师界面     │  │  学生/家长界面 │      │
│  │  (Admin)     │  │  (Teacher)   │  │  (Student)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       前端层 (React + Inertia)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  页面组件     │  │  UI 组件      │  │  状态管理      │      │
│  │  (Pages)     │  │  (Components) │  │  (Forms)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      路由层 (Laravel Routes)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web 路由     │  │  Admin 路由   │  │  API 路由      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     控制器层 (Controllers)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  业务逻辑     │  │  数据验证      │  │  权限检查      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     服务层 (Services)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  积分服务      │  │  兑换服务      │  │  核销服务      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     模型层 (Models)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Eloquent    │  │  关系定义      │  │  业务方法      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     数据层 (Database)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  MySQL/PG    │  │  Redis        │  │  File Cache   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 数据流程

1. **用户操作** → 前端组件捕获用户交互
2. **表单提交** → Inertia.js 表单提交到后端
3. **路由分发** → Laravel 路由将请求分发到对应控制器
4. **权限验证** → 中间件验证用户权限
5. **业务处理** → 控制器调用服务层处理业务逻辑
6. **数据操作** → 服务层通过模型操作数据库
7. **缓存更新** → 更新 Redis 缓存（如适用）
8. **响应返回** → 返回 Inertia 响应，前端更新页面

### 缓存策略

- **应用缓存**: 基于 Redis 或文件系统，可配置
- **验证码缓存**: 使用 Cache 驱动，24小时自动过期
- **配置缓存**: 生产环境建议启用 `php artisan config:cache`
- **路由缓存**: 生产环境建议启用 `php artisan route:cache`

---

## 环境变量说明

### 应用配置

```env
# 应用名称
APP_NAME="学生积分管理系统"

# 应用环境 (local, production, testing)
APP_ENV=local

# 应用密钥（通过 php artisan key:generate 生成）
APP_KEY=base64:...

# 调试模式 (true/false)
APP_DEBUG=true

# 应用 URL
APP_URL="http://localhost:8000"

# 应用语言
APP_LOCALE="zh"
APP_FALLBACK_LOCALE="zh"
APP_FAKER_LOCALE=zh_CN
```

### 数据库配置

```env
# 数据库连接类型 (sqlite, mysql, pgsql)
DB_CONNECTION=mysql

# MySQL/PostgreSQL 配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stupoint
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 缓存和会话配置

```env
# 缓存驱动 (file, database, redis)
CACHE_STORE=redis

# 会话驱动 (file, database, redis)
SESSION_DRIVER=file

# 会话有效期（分钟）
SESSION_LIFETIME=120

# 队列驱动 (database, redis, sync)
QUEUE_CONNECTION=database
```

### Redis 配置

```env
# Redis 客户端 (phpredis, predis)
REDIS_CLIENT=phpredis

# Redis 主机
REDIS_HOST=127.0.0.1

# Redis 密码
REDIS_PASSWORD=null

# Redis 端口
REDIS_PORT=6379

# Redis 数据库 (0-15)
REDIS_DB=0

# Redis 缓存数据库 (0-15)
REDIS_CACHE_DB=0
```

### 邮件配置

```env
# 邮件驱动 (smtp, sendmail, log)
MAIL_MAILER=log

# 邮件服务器配置
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null

# 发件人信息
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

---

## 系统要求

### 服务器要求

- **PHP**: >= 8.2
- **Composer**: 2.x
- **Web 服务器**: Apache / Nginx
- **数据库**: MySQL 5.7+ / PostgreSQL 9.6+ / SQLite 3.8.8+
- **Redis**: 5.0+ (可选，用于缓存和队列)

### PHP 扩展

- BCMath
- Ctype
- cURL
- DOM
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PCRE
- PDO
- Tokenizer
- XML

### 前端开发要求

- **Node.js**: >= 18.0.0
- **NPM**: >= 9.0.0

---

## 安装部署

### 方式一：通过安装向导安装（推荐）

1. **克隆项目**

```bash
git clone https://github.com/ZHYxulei/StuPoint.git
cd StuPoint
```

2. **安装依赖**

```bash
# 安装 PHP 依赖
composer install

# 安装前端依赖
npm install
```

3. **启动开发服务器**

```bash
# 使用 Composer 启动（推荐）
composer run dev

# 这将同时启动：
# - PHP 内置服务器 (http://localhost:8000)
# - Vite 开发服务器
# - 队列监听器
```

4. **访问安装向导**

打开浏览器访问 `http://localhost:8000/install`，按照提示完成安装：

   - 步骤 1: 欢迎页面
   - 步骤 2: 语言选择
   - 步骤 3: 环境检测
   - 步骤 4: 数据库配置
   - 步骤 5: Redis 配置（可选）
   - 步骤 6: 缓存配置
   - 步骤 7: 站点配置
   - 步骤 8: 创建管理员账号

5. **完成安装**

安装向导会自动：
- 配置 `.env` 文件
- 运行数据库迁移
- 填充初始数据
- 创建管理员账号

### 方式二：手动安装

1. **克隆项目并安装依赖**

```bash
git clone https://github.com/ZHYxulei/StuPoint.git
cd StuPoint
composer install
npm install
```

2. **配置环境**

```bash
cp .env.example .env
php artisan key:generate
```

3. **编辑 `.env` 文件**，配置数据库连接等参数（参考[环境变量说明](#环境变量说明)）

4. **运行数据库迁移**

```bash
php artisan migrate
php artisan db:seed
```

5. **构建前端资源**

```bash
npm run build
```

6. **启动服务**

```bash
# 开发环境
composer run dev

# 或仅启动 PHP 服务器
php artisan serve
```

### 生产环境部署

1. **优化配置**

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

2. **构建生产资源**

```bash
npm run build
```

3. **设置文件权限**

```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

4. **配置队列处理器**（使用 Supervisor）

```bash
php artisan queue:work --tries=1 --backoff=3
```

5. **配置 Horizon**（如果使用 Redis 队列）

```bash
php artisan horizon
```

---

## 使用说明

### 管理员操作指南

#### 1. 用户管理

- **创建用户**: 导航到 用户管理 → 创建用户
- **分配角色**: 为用户分配合适的角色（管理员、教师、学生等）
- **调整积分**: 可以直接为用户增减积分
- **查看历史**: 查看用户的积分变动历史

#### 2. 商品管理

- **添加商品**: 商城管理 → 商品管理 → 创建商品
- **设置分类**: 为商品设置分类，便于学生浏览
- **配置积分**: 设置商品所需的积分数
- **商品统计**: 查看商品的兑换统计

#### 3. 订单管理

- **查看订单**: 订单管理 → 订单列表
- **订单详情**: 点击"查看详情"查看完整订单信息
- **订单核销**:
  - 点击"核销"按钮
  - 选择核销方式（验证码/密码/身份证/直接核销）
  - 按照提示完成核销
- **更新状态**: 可以手动更新订单状态

#### 4. 插件管理

- **浏览插件**: 插件管理 → 查看可用插件
- **安装插件**: 从插件源安装第三方插件
- **启用/禁用**: 控制插件的启用状态
- **配置插件**: 为插件配置参数

### 教师操作指南

#### 1. 查看班级

- 查看自己负责的班级列表
- 查看班级学生信息

#### 2. 积分管理

- 为学生增减积分
- 选择积分变动原因
- 添加备注说明

#### 3. 查看排名

- 查看班级积分排名
- 查看年级积分排名

### 学生/家长操作指南

#### 1. 积分商城

- 浏览可兑换商品
- 使用积分兑换商品
- 填写收货信息

#### 2. 我的订单

- 查看订单列表
- 查看订单详情
- 获取核销验证码
- 重新生成验证码（如果过期）

#### 3. 积分历史

- 查看积分获取记录
- 查看积分消费记录
- 查看当前积分余额

---

## 开发指南

### 开发环境搭建

1. **克隆项目**

```bash
git clone https://github.com/ZHYxulei/StuPoint.git
cd StuPoint
```

2. **安装依赖**

```bash
composer install
npm install
```

3. **配置环境**

```bash
cp .env.example .env
php artisan key:generate
```

4. **启动开发服务器**

```bash
composer run dev
```

### 代码规范

#### PHP 代码规范

- 遵循 PSR-12 编码标准
- 使用 Laravel Pint 格式化代码：
  ```bash
  vendor/bin/pint
  ```

#### JavaScript/TypeScript 规范

- 使用 ESLint 检查代码：
  ```bash
  npm run lint
  ```
- 使用 Prettier 格式化代码：
  ```bash
  npm run format
  ```

### 测试

#### 运行测试

```bash
# 运行所有测试
php artisan test

# 运行特定测试
php artisan test --filter testExample

# 生成测试覆盖率报告
php artisan test --coverage
```

#### 编写测试

- 使用 Pest 3 编写测试
- 单元测试放在 `tests/Unit` 目录
- 功能测试放在 `tests/Feature` 目录

### 添加新功能

1. **创建数据库迁移**

```bash
php artisan make:migration create_new_table
```

2. **创建模型**

```bash
php artisan make:model ModelName
```

3. **创建控制器**

```bash
php artisan make:controller ControllerName
```

4. **创建前端页面**

在 `resources/js/pages/` 下创建新的页面组件

5. **定义路由**

在 `routes/web.php` 或 `routes/admin.php` 中定义路由

### 前端开发

#### 创建新组件

在 `resources/js/components/` 下创建组件

#### 使用 Wayfinder

```typescript
import route from '@/routes/example';

// 使用命名路由
const url = route({ id: 1 });
```

#### 使用 Inertia Forms

```typescript
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing } = useForm({
  field: 'value',
});

const handleSubmit = () => {
  post('/endpoint', {
    onSuccess: () => {
      // 成功回调
    },
  });
};
```

### 调试

#### 使用 Telescope

```bash
php artisan telescope:install
php artisan telescope:publish
```

访问 `/telescope` 查看调试信息

#### 使用 Laravel Debugbar (可选)

安装并启用 Laravel Debugbar 进行性能分析

---

## 目录结构

```
StuPoint/
├── app/                                    # 应用核心代码
│   ├── Http/                               # HTTP 层
│   │   ├── Controllers/                    # 控制器
│   │   │   ├── Admin/                     # 管理员控制器
│   │   │   │   ├── ClassManagementController.php  # 班级管理
│   │   │   │   ├── OrderController.php            # 订单管理
│   │   │   │   ├── OrderVerificationController.php # 订单核销
│   │   │   │   ├── PluginController.php           # 插件管理
│   │   │   │   ├── ProductController.php          # 商品管理
│   │   │   │   ├── SettingsController.php         # 系统设置
│   │   │   │   ├── SubjectController.php          # 科目管理
│   │   │   │   └── UserController.php             # 用户管理
│   │   │   ├── Install/                   # 安装向导控制器
│   │   │   │   └── InstallController.php          # 安装流程控制
│   │   │   ├── Shop/                     # 商城控制器
│   │   │   │   └── OrderController.php            # 用户订单
│   │   │   ├── Controller.php              # 基础控制器
│   │   │   └── DashboardController.php     # 仪表板控制器
│   │   ├── Middleware/                   # 中间件
│   │   └── Requests/                     # 表单请求验证
│   ├── Models/                            # Eloquent 模型
│   │   ├── CouncilActivity.php           # 班级活动
│   │   ├── Order.php                     # 订单模型
│   │   ├── OrderStatusHistory.php        # 订单状态历史
│   │   ├── Permission.php                # 权限模型
│   │   ├── Plugin.php                    # 插件模型
│   │   ├── Point.php                     # 积分记录
│   │   ├── Product.php                   # 商品模型
│   │   ├── ProductCategory.php           # 商品分类
│   │   ├── Role.php                      # 角色模型
│   │   └── User.php                      # 用户模型
│   └── Services/                         # 业务逻辑服务层
│       ├── ExchangeService.php           # 积分兑换服务
│       └── VerificationCodeService.php   # 核销码服务
├── bootstrap/                             # 框架启动文件
│   ├── app.php                          # 应用启动配置
│   └── providers.php                    # 服务提供者
├── config/                               # 配置文件
│   ├── app.php                          # 应用配置
│   ├── cache.php                        # 缓存配置
│   ├── database.php                     # 数据库配置
│   ├── filesystems.php                  # 文件系统配置
│   ├── fortify.php                      # Fortify 认证配置
│   ├── inertia.php                      # Inertia 配置
│   ├── permissions.php                  # 权限配置
│   ├── sanctum.php                      # Sanctum API 配置
│   └── vite.php                         # Vite 配置
├── database/                             # 数据库相关文件
│   ├── factories/                       # 数据库工厂
│   ├── migrations/                      # 数据库迁移文件
│   │   ├── 2024_12_28_..._create_users_table.php
│   │   ├── 2024_12_28_..._create_products_table.php
│   │   ├── 2024_12_28_..._create_orders_table.php
│   │   ├── 2024_12_28_..._create_points_table.php
│   │   └── ...                           # 其他迁移文件
│   └── seeders/                         # 数据填充文件
│       ├── RolePermissionSeeder.php     # 角色权限填充
│       └── DatabaseSeeder.php           # 主填充文件
├── public/                               # 公共入口文件
│   ├── index.php                        # 应用入口
│   └── build/                           # Vite 编译资源
├── resources/                            # 前端资源
│   ├── css/                             # 样式文件
│   │   └── app.css                      # 主样式文件
│   ├── js/                              # JavaScript/TypeScript 文件
│   │   ├── components/                  # React 组件
│   │   │   ├── ui/                     # UI 基础组件
│   │   │   │   ├── alert.tsx           # 警告组件
│   │   │   │   ├── badge.tsx           # 徽章组件
│   │   │   │   ├── button.tsx          # 按钮组件
│   │   │   │   ├── card.tsx            # 卡片组件
│   │   │   │   ├── dialog.tsx          # 对话框组件
│   │   │   │   ├── input.tsx           # 输入框组件
│   │   │   │   ├── select.tsx          # 下拉选择组件
│   │   │   │   ├── tabs.tsx            # 标签页组件
│   │   │   │   └── ...                # 其他 UI 组件
│   │   │   ├── heading.tsx             # 页面标题组件
│   │   │   ├── input-error.tsx         # 错误提示组件
│   │   │   └── pagination.tsx          # 分页组件
│   │   ├── layouts/                    # 布局组件
│   │   │   ├── app-layout.tsx          # 主应用布局
│   │   │   └── guest-layout.tsx        # 访客布局
│   │   ├── pages/                      # 页面组件
│   │   │   ├── admin/                  # 管理员页面
│   │   │   │   ├── classes/            # 班级管理
│   │   │   │   ├── dashboard.tsx       # 管理员仪表板
│   │   │   │   ├── orders/             # 订单管理
│   │   │   │   │   ├── index.tsx       # 订单列表
│   │   │   │   │   └── show.tsx        # 订单详情
│   │   │   │   ├── plugins/            # 插件管理
│   │   │   │   ├── products/           # 商品管理
│   │   │   │   ├── settings/           # 系统设置
│   │   │   │   ├── subjects/           # 科目管理
│   │   │   │   └── users/              # 用户管理
│   │   │   ├── install/                # 安装向导页面
│   │   │   │   ├── welcome.tsx         # 欢迎页
│   │   │   │   ├── language.tsx        # 语言选择
│   │   │   │   ├── check.tsx           # 环境检测
│   │   │   │   ├── database.tsx        # 数据库配置
│   │   │   │   ├── redis.tsx           # Redis 配置
│   │   │   │   ├── cache.tsx           # 缓存配置
│   │   │   │   ├── site.tsx            # 站点配置
│   │   │   │   ├── account.tsx         # 管理员账号
│   │   │   │   └── complete.tsx        # 安装完成
│   │   │   ├── points/                 # 积分管理
│   │   │   │   ├── index.tsx           # 积分列表
│   │   │   │   └── history.tsx         # 积分历史
│   │   │   ├── ranking.tsx             # 排行榜
│   │   │   ├── shop/                   # 商城页面
│   │   │   │   ├── index.tsx           # 商品列表
│   │   │   │   └── order-detail.tsx    # 订单详情
│   │   │   ├── auth/                   # 认证页面
│   │   │   │   ├── login.tsx           # 登录
│   │   │   │   ├── register.tsx        # 注册
│   │   │   │   └── ...                 # 其他认证页面
│   │   │   └── welcome.tsx             # 欢迎页
│   │   ├── server.ts                    # Vite 服务入口
│   │   ├── types/                       # TypeScript 类型定义
│   │   │   └── auth.ts                 # 认证相关类型
│   │   └── utils/                       # 工具函数
│   └── views/                           # Blade 视图文件
├── routes/                               # 路由定义
│   ├── admin.php                        # 管理员路由
│   ├── console.php                      # Artisan 控制台路由
│   ├── settings.php                     # 设置相关路由
│   └── web.php                          # Web 路由
├── storage/                              # 存储目录
│   ├── app/                             # 应用文件
│   ├── framework/                       # 框架文件
│   │   ├── cache/                       # 缓存文件
│   │   ├── sessions/                    # 会话文件
│   │   └── views/                       # 视图缓存
│   └── logs/                            # 日志文件
├── tests/                                # 测试文件
│   ├── Feature/                         # 功能测试
│   ├── Unit/                            # 单元测试
│   └── Pest.php                         # Pest 配置
├── vendor/                               # Composer 依赖（不提交）
├── .env.example                          # 环境变量示例文件
├── .gitignore                            # Git 忽略文件
├── artisan                               # Artisan 命令行工具
├── composer.json                         # Composer 配置
├── package.json                          # NPM 配置
├── phpunit.xml                           # PHPUnit 配置
├── pint.json                             # Pint 配置
├── postcss.config.js                     # PostCSS 配置
├── tailwind.config.js                    # Tailwind 配置
├── tsconfig.json                         # TypeScript 配置
├── vite.config.ts                        # Vite 配置
└── README.md                             # 项目说明文件
```

---

## 常见问题

### 1. 安装向导无法访问？

**答**: 确保已正确配置数据库连接，并且 `storage` 和 `bootstrap/cache` 目录具有写权限。

### 2. 验证码无法生成？

**答**: 检查 Redis 连接是否正常，或切换缓存驱动为文件或数据库。

### 3. 页面显示 404 错误？

**答**: 检查路由配置，确保已登录并具有相应权限。

### 4. 前端资源未加载？

**答**: 运行 `npm run build` 或 `npm run dev` 构建前端资源。

### 5. 队列任务不执行？

**答**: 启动队列监听器 `php artisan queue:work`。

### 6. 如何重置管理员密码？

**答**: 使用 Artisan 命令 `php artisan tinker` 然后执行：
```php
$user = \App\Models\User::find(1);
$user->password = Hash::make('new-password');
$user->save();
```

---

## 更新日志

### v1.2.0 (2025-02-09)

#### 新增功能
- ✨ 添加订单核销功能，支持四种核销方式
- ✨ 在订单列表添加核销按钮
- ✨ 添加订单状态历史记录
- ✨ 添加 Redis 缓存配置选项
- ✨ 添加安装向导 Redis 数据库选择功能
- ✨ 完善 README.md 文档，添加详细的技术说明

#### 改进优化
- 🔧 修改 Redis 缓存数据库从 1 改为 0
- 🔧 优化订单详情页面，添加安全检查
- 🔧 防止已完成订单生成验证码
- 🔧 简化订单核销按钮权限检查
- 🔧 改进缓存系统，根据 .env 配置自动选择驱动

#### Bug 修复
- 🐛 修复订单详情页面 statusHistory 为 undefined 的错误
- 🐛 修复已核销订单仍可生成验证码的问题
- 🐛 修复订单列表核销按钮不显示的问题
- 🐛 修复订单详情页面 HTML 结构错误

### v1.1.0 (2025-01)

#### 新增功能
- ✨ 添加插件系统支持
- ✨ 添加插件源管理功能
- ✨ 添加班级管理功能
- ✨ 添加科目管理功能
- ✨ 添加家长账户功能

#### 改进优化
- 🔧 优化用户权限系统
- 🔧 改进积分统计功能
- 🔧 优化订单管理界面

### v1.0.0 (2024-12)

#### 初始版本发布
- ✨ 完整的积分管理系统
- ✨ 积分商城功能
- ✨ 订单管理功能
- ✨ 多角色权限系统
- ✨ 响应式前端界面
- ✨ 安装向导

---

## 免责声明

1. 本软件仅供学习和研究使用，不得用于商业目的。
2. 使用本软件所造成的任何损失，开发者不承担责任。
3. 用户应自行承担使用本软件的风险。
4. 本软件可能包含第三方组件，请遵守相应的许可证。
5. 开发者保留随时修改或终止本软件的权利。

---

## 贡献者

### 感谢所有为本项目做出贡献的开发者朋友们，是大家们的帮助让StuPoint越来越好！

以下为贡献者列表：

[![Contributors](https://contrib.rocks/image?repo=ZHYxulei/StuPoint&repo=ZHYxulei/Laravel-Dome)](https://github.com/ZHYxulei/StuPoint/graphs/contributors)

欢迎通过 Pull Request 贡献代码！

---

## 参考项目

本项目的开发过程中参考使用了以下优秀的开源项目和技术：

### 核心框架

- **[Laravel Framework](https://laravel.com)** - 优雅的 PHP Web 应用框架，具有表达力强、语法优雅的特点，提供了丰富的功能组件，包括路由、中间件、Eloquent ORM、模板引擎等，是现代 PHP 开发的首选框架。

- **[Symfony Components](https://symfony.com)** - 高性能的 PHP 组件库，Laravel 的底层依赖，提供了大量可复用的组件，如 HttpFoundation、Console、EventDispatcher 等，是 PHP 生态系统的基石。

- **[React](https://react.dev)** - 由 Meta (Facebook) 开发的前端库，用于构建用户界面，采用组件化开发模式，具有虚拟 DOM、单向数据流等特点，是目前最流行的前端框架之一。

- **[Vite](https://vitejs.dev)** - 下一代前端构建工具，由 Vue.js 作者尤雨溪开发，利用浏览器原生 ES 模块导入实现极速冷启动，支持热模块替换 (HMR)，提供极佳的开发体验。

### Laravel 生态系统

- **[Laravel Fortify](https://github.com/laravel/fortify)** - Laravel 的无头身份验证后端，提供完整的认证功能实现，包括登录、注册、双因素认证、密码重置等，不包含前端 UI，可与任何前端框架配合使用。

- **[Laravel Folio](https://github.com/laravel/folio)** - 基于文件的路由系统，灵感来自 Ruby on Rails，通过在 resources/views/pages 目录下创建 Blade 文件即可自动定义路由，极大简化了路由管理。

- **[Laravel Horizon](https://github.com/laravel/horizon)** - Redis 队列的优雅仪表板和管理工具，提供美观的界面监控队列任务执行情况、任务失败率、作业吞吐量等关键指标，支持多队列管理和标签监控。

- **[Laravel Passport](https://github.com/laravel/passport)** - Laravel 的 OAuth2 服务器和 API 认证管理包，可在几分钟内让 Laravel 应用成为 OAuth2 服务提供者，支持授权码、个人访问、密码授权、客户端凭证等授权类型。

- **[Laravel Pulse](https://github.com/laravel/pulse)** - Laravel 的应用性能监控工具，实时捕获请求、异常、数据库查询、队列任务等性能指标，提供直观的仪表板，帮助开发者快速发现和解决性能瓶颈。

- **[Laravel Scout](https://github.com/laravel/scout)** - 基于驱动的全文搜索解决方案，为 Eloquent 模型提供简单的全文搜索功能，支持 Algolia、Meilisearch、MySQL Full-Text 等多种驱动，轻松实现搜索功能。

- **[Laravel Socialite](https://github.com/laravel/socialite)** - OAuth 社交登录支持，支持通过 Facebook、Twitter、LinkedIn、Google、GitHub 等社交平台进行身份认证，提供统一的 API 接口，简化社交登录集成。

- **[Laravel Telescope](https://github.com/laravel/telescope)** - 优雅的调试助手和请求监控工具，提供友好的界面查看请求、异常、数据库查询、缓存操作、队列任务、邮件发送等应用运行情况，是开发调试的利器。

- **[Laravel Wayfinder](https://github.com/laravel/wayfinder)** - TypeScript 路由生成器，自动将 Laravel 路由转换为类型安全的 TypeScript 函数，在 Inertia 和 React 应用中提供智能的路由类型提示和自动完成功能。

- **[Livewire](https://livewire.laravel.com)** - 全栈框架，用 PHP 构建动态界面，无需编写复杂的 JavaScript，在 Laravel 应用中实现实时交互功能，提供类似 SPA 的用户体验。

- **[Volt](https://github.com/laravel/volt)** - Laravel Livewire 的单文件组件，允许在单个 Blade 文件中编写 Livewire 组件，支持函数式和类式 API，简化组件开发流程。

- **[Pest](https://pestphp.com)** - 优雅的 PHP 测试框架，提供简洁的语法和丰富的断言，支持并行测试、快照测试、数据集等高级功能，让编写测试成为一种享受。

### 前端组件库

- **[Inertia.js](https://inertiajs.com)** - 现代单页应用解决方案，在不改变传统服务器端路由模式的前提下，构建类似 SPA 的用户体验，通过适配器连接 React、Vue、Svelte 等前端框架，实现无刷新页面切换。

- **[Tailwind CSS](https://tailwindcss.com)** - 功能类优先的 CSS 框架，提供大量预定义的工具类，通过组合这些类快速构建自定义设计，无需离开 HTML 即可完成样式编写，支持响应式设计和暗黑模式。

- **[Radix UI](https://www.radix-ui.com)** - 无样式的可访问 UI 组件库，采用原始 Web Component 和 React 构建，提供对话框、下拉菜单、标签页等复杂交互组件，注重无障碍访问和键盘导航。

- **[Headless UI](https://headlessui.com)** - 完全无样式的 UI 组件库，由 Tailwind CSS 团队开发，为 React 和 Vue 提供下拉菜单、对话框、切换开关等组件，设计精美且完全可访问。

- **[Lucide Icons](https://lucide.dev)** - 美观一致的图标库，是从 Feather Icons 分支发展而来，提供 1000+ 精心设计的开源图标，支持 React、Vue、Svelte 等框架，是现代 Web 应用的理想选择。

- **[shadcn/ui](https://ui.shadcn.com)** - 基于 Radix UI 和 Tailwind CSS 构建的组件集合，可通过 CLI 直接复制组件代码到项目中，完全可定制，是构建现代 Web 应用的理想基础。

### 开发工具

- **[TypeScript](https://www.typescript.com)** - JavaScript 的超集，添加静态类型检查，提升代码质量和开发效率，提供强大的 IDE 支持和智能提示，是大型前端项目的首选语言。

- **[ESLint](https://eslint.org)** - JavaScript 和 TypeScript 代码检查工具，发现和修复代码中的问题，支持自定义规则和插件，帮助团队保持一致的代码风格。

- **[Prettier](https://prettier.io)** - 代码格式化工具，支持多种语言，自动格式化代码，消除团队中的代码风格争论，提高代码可读性。

- **[PHPStan](https://phpstan.org)** - PHP 静态分析工具，在运行前发现代码中的错误，支持多种分析级别，帮助编写更安全、更健壮的 PHP 代码。

### 参考项目

- **[Laravel-Demo](https://github.com/ZHYxulei/Laravel-Demo)** - Laravel 学习和参考项目，包含 Laravel 框架的核心功能示例和最佳实践，是本项目的重要参考来源。

---

## 鸣谢

特别感谢以下开源项目和社区：

- **Laravel 社区** - 感谢 Taylor Otwell 和整个 Laravel 团队创造了如此优雅的框架
- **React 团队** - 感谢 Meta 和 React 社区提供了强大的前端解决方案
- **Tailwind CSS 团队** - 感谢 Adam Wathan 和团队让 CSS 开发变得更加高效
- **开源贡献者** - 感谢所有为上述开源项目做出贡献的开发者

---

## 许可证

本项目采用 **MIT** 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

---

## 联系方式

- **作者**: [ZHYxulei](https://github.com/ZHYxulei)
- **邮箱**: ZHYxulei@outlook.com
- **项目地址**: https://github.com/ZHYxulei/StuPoint
- **问题反馈**: https://github.com/ZHYxulei/StuPoint/issues

---

## 星标历史

感谢所有为本项目添加 Star 的开发者！

如果您觉得这个项目对您有帮助，请给它一个 Star ⭐

<p align="center">
  <a href="https://www.star-history.com/#ZHYxulei/StuPoint&type=date&legend=top-left">
    <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=ZHYxulei/StuPoint&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=ZHYxulei/StuPoint&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=ZHYxulei/StuPoint&type=date&legend=top-left" />
    </picture>
  </a>
</p>

---

<div align="center">

**Made with ❤️ by ZHYxulei**

**Powered By ZHYxulei @ 2025-2026**

</div>
