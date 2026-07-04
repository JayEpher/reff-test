# Activities - 活动页面容器

这是一个统一的活动页面项目，所有嵌入到 React Native WebView 的活动页面都在这里开发和维护。

## ⚙️ 环境配置

项目支持多环境配置（开发、测试、生产），用于区分接口地址和 Web3 链配置。

### 环境变量文件

- `.env.development` - 开发环境配置
- `.env.test` - 测试环境配置
- `.env.production` - 生产环境配置
- `.env.local.example` - 本地配置模板

### 配置本地环境

```bash
# 复制配置模板
cp .env.local.example .env.local

# 编辑 .env.local 填入你的配置
# .env.local 会覆盖其他环境变量文件，且不会被提交到 git
```

### 环境变量说明

```bash
VITE_ENV=development                           # 环境名称
VITE_API_BASE_URL=https://dev-api.example.com  # API 基础地址
VITE_WEB3_CHAIN_ID=5                           # 链 ID（1=主网, 5=Goerli, 11155111=Sepolia）
VITE_WEB3_RPC_URL=https://goerli.infura.io/v3/YOUR_KEY  # RPC 节点地址
VITE_WEB3_CHAIN_NAME=Goerli                    # 链名称
VITE_WEB3_EXPLORER_URL=https://goerli.etherscan.io  # 区块浏览器地址
```

### 在代码中使用

```typescript
import { config, isDevelopment, isProduction } from '@/config/env';

// API 请求
fetch(`${config.apiBaseUrl}/users/123`);

// Web3 配置
console.log(config.web3.chainId);  // 5
console.log(config.web3.chainName); // "Goerli"

// 环境判断
if (isDevelopment) {
  console.log('开发环境');
}
```

### 构建不同环境

```bash
pnpm build:dev   # 使用开发环境变量构建
pnpm build:test  # 使用测试环境变量构建
pnpm build:prod  # 使用生产环境变量构建
```

## 🚀 快速开始

### 开发模式（推荐）

使用主入口 + React Router，支持所有活动页面：

```bash
pnpm dev

# 访问各个活动页面
http://localhost:3000/halloween
http://localhost:3000/checkin
http://localhost:3000/mini-game
http://localhost:3000/team
```

### 独立入口模式

每个活动独立的 HTML 入口（用于生产构建）：

```bash
# 访问独立入口
http://localhost:3000/halloween/index.html
http://localhost:3000/checkin/index.html
http://localhost:3000/mini-game/index.html
http://localhost:3000/team/index.html
```

## 📁 目录结构

```
apps/activities/
├── index.html              # 主入口（React Router）
├── src/
│   ├── main.tsx            # 主入口文件（路由配置）
│   ├── shared/             # 共享代码
│   │   ├── webview-bridge.ts   # WebView 通信桥接
│   │   └── useWebViewActivity.ts # 活动页面通用 Hook
│   ├── activities/         # 各个活动页面组件
│   │   ├── CheckinActivity.tsx
│   │   ├── HalloweenActivity.tsx
│   │   ├── MiniGameActivity.tsx
│   │   └── TeamActivity.tsx
│   ├── checkin-entry.tsx   # 签到页面独立入口
│   ├── halloween-entry.tsx # 万圣节活动独立入口
│   └── index.css          # 全局样式
├── checkin/
│   └── index.html         # 签到页面独立 HTML
├── halloween/
│   └── index.html         # 万圣节活动独立 HTML
├── mini-game/
│   └── index.html         # 小游戏独立 HTML
├── team/
│   └── index.html         # 团队活动独立 HTML
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🏗️ 架构说明

### 双入口模式

项目支持两种访问方式：

1. **主入口模式**（开发推荐）
   - 文件：`index.html` → `src/main.tsx`
   - 使用 React Router 管理所有活动
   - 支持客户端路由导航
   - 更好的开发体验

2. **独立入口模式**（生产构建）
   - 每个活动有独立的 HTML 入口
   - 适合 WebView 直接加载
   - 减小单页面体积

### 路由配置

```typescript
// src/main.tsx
<Routes>
  <Route path="/" element={<Navigate to="/halloween" />} />
  <Route path="/halloween" element={<HalloweenActivity />} />
  <Route path="/checkin" element={<CheckinActivity />} />
  <Route path="/mini-game" element={<MiniGameActivity />} />
  <Route path="/team" element={<TeamActivity />} />
</Routes>
```

## 🔧 构建配置

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    input: {
      main: 'index.html',           // 主入口
      halloween: 'halloween/index.html',
      checkin: 'checkin/index.html',
      'mini-game': 'mini-game/index.html',
      team: 'team/index.html',
    },
  },
}
```

## 📦 构建

```bash
pnpm build

# 输出
dist/
├── index.html              # 主入口
├── halloween/index.html    # 各活动独立入口
├── checkin/index.html
├── mini-game/index.html
├── team/index.html
└── assets/                 # 静态资源
```

## 🔌 WebView 集成

### React Native 端加载

```typescript
// 开发环境 - 使用主入口
<WebView source={{ uri: 'http://localhost:3000/halloween' }} />

// 生产环境 - 使用独立入口
<WebView source={{ uri: 'https://cdn.example.com/activities/halloween/index.html' }} />
```

### 通信桥接

```typescript
import { useWebViewActivity } from '@/shared/useWebViewActivity';

const HalloweenActivity = () => {
  const { postMessage, onMessage } = useWebViewActivity();

  // 发送消息到 RN
  postMessage({ type: 'CLOSE_ACTIVITY', data: {} });

  // 接收来自 RN 的消息
  onMessage((message) => {
    console.log('Received from RN:', message);
  });
};
```

## 🎯 新增活动

1. 创建活动组件：`src/activities/NewActivity.tsx`
2. 创建独立入口：`src/new-entry.tsx`
3. 创建 HTML：`new/index.html`
4. 更新路由：`src/main.tsx` 添加路由
5. 更新构建配置：`vite.config.ts` 添加入口

## ⚠️ 注意事项

- 开发时使用主入口 `http://localhost:3000/活动路径`
- 生产构建会生成多个独立 HTML 文件
- WebView 可根据需求选择主入口或独立入口
- 所有活动共享 `@puff/*` 包的代码
