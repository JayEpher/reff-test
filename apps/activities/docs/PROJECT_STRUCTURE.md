# Activities 项目完整结构

```
apps/activities/
│
├── 📄 配置文件
│   ├── package.json              ✅ 项目依赖和脚本
│   ├── tsconfig.json             ✅ TypeScript 配置
│   └── vite.config.ts            ✅ Vite 构建配置
│
├── 📖 文档
│   ├── README.md                 ✅ 项目介绍
│   ├── DEV_GUIDE.md              ✅ 完整开发指南（推荐阅读）
│   └── QUICK_REFERENCE.md        ✅ 速查表
│
├── 📂 src/ (源代码目录)
│   │
│   ├── 🔧 shared/ (共享代码 - 已完成)
│   │   ├── webview-bridge.ts     ✅ WebView 通信桥接
│   │   ├── useWebViewActivity.ts ✅ 通用 Hook
│   │   └── index.ts              ✅ 导出文件
│   │
│   ├── 🎨 activities/ (活动组件 - 你主要工作的地方)
│   │   ├── CheckinActivity.tsx   ✅ 签到活动
│   │   ├── CheckinActivity.css   ✅ 签到样式
│   │   ├── HalloweenActivity.tsx ✅ 万圣节活动
│   │   ├── HalloweenActivity.css ✅ 万圣节样式
│   │   ├── MiniGameActivity.tsx  ✅ 迷你游戏
│   │   ├── MiniGameActivity.css  ✅ 游戏样式
│   │   └── TeamActivity.tsx      ✅ 团队活动
│   │
│   ├── 🚪 入口文件 (每个活动一个)
│   │   ├── checkin-entry.tsx     ✅ 签到入口
│   │   ├── halloween-entry.tsx   ✅ 万圣节入口
│   │   ├── mini-game-entry.tsx   ✅ 游戏入口
│   │   └── team-entry.tsx        ✅ 团队入口
│   │
│   └── index.css                 ✅ 全局样式
│
├── 📱 活动页面目录 (每个活动一个目录)
│   ├── checkin/
│   │   └── index.html            ✅ 签到 HTML
│   ├── halloween/
│   │   └── index.html            ✅ 万圣节 HTML
│   ├── mini-game/
│   │   └── index.html            ✅ 游戏 HTML
│   └── team/
│       └── index.html            ✅ 团队 HTML
│
```

## 📊 项目统计

- **配置文件**: 3 个
- **文档文件**: 4 个
- **源代码文件**: 15 个
- **HTML 页面**: 4 个
- **总文件数**: 26 个

## 🎯 现在你需要做什么？

### 1️⃣ 安装依赖

```bash
cd /Users/zhanghe/self/code/Front-end-Architecture/puff-monorepo/apps/activities
pnpm install
```

### 2️⃣ 启动开发服务器

```bash
pnpm dev
```

### 3️⃣ 在浏览器中访问

- 签到: http://localhost:3000/checkin/
- 万圣节: http://localhost:3000/halloween/
- 迷你游戏: http://localhost:3000/mini-game/
- 团队: http://localhost:3000/team/

### 4️⃣ 开始开发

编辑 `src/activities/` 下的组件文件，浏览器会自动刷新！

## 📝 开发新活动的步骤

参考 **DEV_GUIDE.md** 中的"开发一个新活动（完整流程）"章节。

简化版：

1. 在 `src/activities/` 创建 `YourActivity.tsx`
2. 在 `src/` 创建 `your-activity-entry.tsx`
3. 在 `your-activity/` 创建 `index.html`
4. 更新 `vite.config.ts` 的 input 配置

## 🔥 核心概念

### 所有活动共享

- ✅ 同一套依赖（React、TypeScript、Vite）
- ✅ 共享的 WebView 通信工具
- ✅ 共享的 UI 组件库 (@puff/ui)
- ✅ 共享的工具函数 (@puff/utils)
- ✅ 统一的开发和构建流程

### 每个活动独立

- ✅ 独立的组件文件
- ✅ 独立的入口文件
- ✅ 独立的 HTML 页面
- ✅ 独立的 URL 路径
- ✅ 独立的构建产物

## 💡 开发技巧

1. **热更新**: 修改代码后浏览器自动刷新
2. **TypeScript**: 享受类型检查和自动补全
3. **CSS 模块化**: 每个活动用独特的类名前缀
4. **WebView 通信**: 使用 `@/shared` 中的工具
5. **共享组件**: 使用 `@puff/ui` 中的 UI 组件

## 🚀 下一步

1. 阅读 [DEV_GUIDE.md](./DEV_GUIDE.md) - 详细的开发指南
2. 查看 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速参考
3. 运行 `pnpm dev` 开始开发
4. 查看现有的活动代码学习（CheckinActivity, HalloweenActivity 等）

## ❓ 还不明白？

查看示例代码：

- 简单示例: `src/activities/CheckinActivity.tsx`
- 复杂示例: `src/activities/MiniGameActivity.tsx`
- WebView 通信: `src/shared/webview-bridge.ts`
