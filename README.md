# StuPoint

> 一款轻量级、可扩展的学生积分管理与成长激励系统

StuPoint 是由 **ZHYxulei** 开发的一款轻量级、可扩展的学生积分管理与成长激励系统。适用于高中小学、培训机构或班级场景，帮助教师高效记录、统计与可视化学生的日常表现积分。

## 项目地址

- **主项目**: https://github.com/ZHYxulei/StuPoint
- **参考项目**: https://github.com/ZHYxulei/Laravel-Demo

## 主要功能

- 🎯 **积分管理**: 灵活的积分增减系统，支持多种积分来源
- 🏪 **积分商城**: 学生可使用积分兑换商品或奖励
- 📊 **数据统计**: 详细的积分统计和排名系统
- 👥 **角色权限**: 完善的角色和权限管理系统
- 🔐 **订单核销**: 支持多种核销方式（验证码、密码、身份证、直接核销）
- 🔌 **插件系统**: 可扩展的插件架构
- 📱 **响应式设计**: 支持桌面和移动设备

## 技术栈

### 后端

- **Laravel 12** - PHP 框架
- **Laravel Fortify** - 身份验证
- **Laravel Folio** - 基于文件的路由
- **Laravel Horizon** - 队列监控
- **Laravel Passport** - API 认证
- **Laravel Pulse** - 性能监控
- **Laravel Scout** - 全文搜索
- **Laravel Socialite** - 社交登录
- **Laravel Telescope** - 调试助手
- **Laravel Wayfinder** - TypeScript 路由生成
- **Livewire 4** - 全栈框架
- **Volt** - 单文件 Livewire 组件
- **Pest 3** - 测试框架

### 前端

- **React 19** - UI 库
- **Inertia.js 2** - 全栈框架
- **Vite** - 构建工具
- **TypeScript** - 类型安全
- **Tailwind CSS 4** - CSS 框架
- **Radix UI** - 无样式组件库
- **Lucide React** - 图标库
- **Headless UI** - 无样式 UI 组件

## 系统要求

- PHP >= 8.2
- Composer
- Node.js >= 18
- NPM 或 Yarn
- MySQL / PostgreSQL / SQLite
- Redis（可选，用于缓存和队列）

## 安装部署

### 1. 克隆项目

```bash
git clone https://github.com/ZHYxulei/StuPoint.git
cd StuPoint
```

### 2. 安装依赖

```bash
# 安装 PHP 依赖
composer install

# 安装前端依赖
npm install
```

### 3. 环境配置

```bash
# 复制环境配置文件
cp .env.example .env

# 生成应用密钥
php artisan key:generate
```

编辑 `.env` 文件，配置数据库连接和其他环境变量：

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stupoint
DB_USERNAME=your_username
DB_PASSWORD=your_password

CACHE_STORE=redis  # 或 file, database
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 4. 数据库迁移

```bash
php artisan migrate
php artisan db:seed
```

### 5. 构建前端资源

```bash
npm run build
```

### 6. 启动开发服务器

```bash
# 使用 Composer 启动（推荐）
composer run dev

# 或者使用 Laravel 内置服务器
php artisan serve

# 启动队列监听器
php artisan queue:work
```

访问 http://localhost:8000 开始使用系统。

## 生产环境部署

```bash
# 优化配置
php artisan config:cache

# 优化路由
php artisan route:cache

# 优化视图
php artisan view:cache

# 构建生产资源
npm run build

# 启动 Horizon（如果使用 Redis 队列）
php artisan horizon
```

## 测试

```bash
# 运行所有测试
php artisan test

# 运行 Pint 代码格式化
vendor/bin/pint

# 运行 ESLint 检查
npm run lint
```

## 项目结构

```
StuPoint/
├── app/              # 应用核心代码
│   ├── Http/         # 控制器和中间件
│   ├── Models/       # Eloquent 模型
│   └── Services/     # 业务逻辑服务
├── config/           # 配置文件
├── database/         # 数据库迁移和填充
├── resources/
│   ├── js/           # React 组件和页面
│   └── css/          # 样式文件
├── routes/           # 路由定义
├── storage/          # 存储文件
└── tests/            # 测试文件
```

## 核心功能说明

### 积分管理

系统支持多种积分获取方式：
- 教师手动增减积分
- 作业完成奖励
- 课堂表现奖励
- 考试成绩奖励
- 自定义积分规则

### 积分商城

- 学生可使用积分兑换商品
- 支持多种商品分类
- 订单管理和核销功能
- 多种核销方式（验证码、密码、身份证、直接核销）

### 权限系统

- 超级管理员
- 管理员
- 年级主任
- 班主任
- 教师
- 学生
- 家长

## 鸣谢

本项目在开发过程中使用了许多优秀的开源项目和技术，特此致谢：

### 核心框架

- **Laravel Framework** - 优雅的 PHP Web 框架
- **Symfony Components** - Laravel 的底层组件库
- **React** - 用于构建用户界面的 JavaScript 库
- **Vite** - 下一代前端构建工具

### Laravel 生态系统

- **Laravel Fortify** - Laravel 的无头身份验证后端
- **Laravel Folio** - 基于文件的页面路由
- **Laravel Horizon** - Redis 队列的优雅仪表板
- **Laravel Passport** - Laravel 的 OAuth2 服务器
- **Laravel Pulse** - Laravel 的性能监控
- **Laravel Scout** - Laravel 的基于驱动的全文搜索
- **Laravel Socialite** - Laravel 的 OAuth 认证
- **Laravel Telescope** - 优雅的调试助手
- **Laravel Wayfinder** - Laravel 的 TypeScript 路由生成器
- **Livewire** - 全栈框架 for Laravel
- **Volt** - Laravel Livewire 的单文件组件
- **Pest** - 优雅的 PHP 测试框架

### 前端组件库

- **Inertia.js** - 构建现代单页应用
- **Tailwind CSS** - 功能类优先的 CSS 框架
- **Radix UI** - 无样式的可访问 UI 组件
- **Headless UI** - 完全无样式的 UI 组件
- **Lucide** - 美观一致的图标库
- **shadcn/ui** - 使用 Radix UI 和 Tailwind CSS 构建的组件

### 开发工具

- **TypeScript** - JavaScript 的超集
- **ESLint** - JavaScript 和 TypeScript 的代码检查工具
- **Prettier** - 代码格式化工具
- **Vite Plugin React** - Vite 的 React 插件
- **Laravel Vite Plugin** - Vite 的 Laravel 集成插件

### 参考项目

- **Laravel-Demo** - https://github.com/ZHYxulei/Laravel-Demo

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

- 作者: ZHYxulei
- 项目地址: https://github.com/ZHYxulei/StuPoint

## 更新日志

### v1.0.0 (2025)

- 初始版本发布
- 完整的积分管理系统
- 积分商城功能
- 订单核销功能
- 角色权限系统
- 插件系统
