# Admin System 3

基于 UmiJS 4 + React 18.3 + Ant Design 5 的现代化后台管理系统。

## 技术栈

- **框架**: UmiJS 4 (Max)
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **语言**: TypeScript 5
- **包管理**: pnpm
- **Node 版本**: 20+

## 功能模块

- 📊 **仪表板** - 数据统计和可视化
- 👥 **用户管理** - 用户列表和操作
- 📝 **内容管理** - 文章管理和媒体库
- ⚙️ **系统设置** - 系统配置和操作日志

## 环境配置

项目支持三种环境：

### 开发环境 (development)
```bash
npm run dev
# or
npm run build:dev
```

### 测试环境 (test)
```bash
npm run dev:test
# or
npm run build:test
```

### 生产环境 (production)
```bash
npm run build
```

## 环境变量

在 `.env.{environment}` 文件中配置：

- `API_BASE_URL` - API 接口地址
- `WEB3_CHAIN_ID` - Web3 链 ID
- `WEB3_RPC_URL` - Web3 RPC URL
- `WEB3_CHAIN_NAME` - 链名称
- `WEB3_EXPLORER_URL` - 区块浏览器地址

## 开发

```bash
# 安装依赖（在根目录）
pnpm install

# 启动开发服务器
cd apps/admin-system-3
pnpm dev

# 构建生产版本
pnpm build
```

## 项目结构

```
apps/admin-system-3/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── Dashboard/      # 仪表板
│   │   ├── Users/          # 用户管理
│   │   ├── Content/        # 内容管理
│   │   └── System/         # 系统设置
│   ├── config/             # 配置文件
│   │   └── env.ts          # 环境配置
│   └── app.tsx             # 应用入口配置
├── .env.development        # 开发环境变量
├── .env.test               # 测试环境变量
├── .env.production         # 生产环境变量
├── .umirc.ts               # UmiJS 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 项目配置
```

## 特性

- ✅ React 18.3 - 最新的 React 特性
- ✅ UmiJS 4 - 企业级框架
- ✅ Ant Design 5 - 最新的组件库
- ✅ ProComponents - 开箱即用的中后台组件
- ✅ TypeScript - 类型安全
- ✅ 环境变量配置 - 支持多环境
- ✅ 路由配置 - 约定式路由 + 配置式路由
- ✅ 布局系统 - ProLayout 自动布局

## 访问地址

- 开发环境: http://localhost:8000
- 生产构建: 部署到 Nginx

## Docker 支持

使用通用 Dockerfile 构建：

```bash
# 在根目录执行
./build-docker.sh admin-system-3

# 或使用 docker-compose
docker-compose up admin-system-3
```

访问地址: http://localhost:3003
