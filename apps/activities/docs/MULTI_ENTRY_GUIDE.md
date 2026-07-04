# Vite 多入口配置说明

## 📝 什么是多入口配置？

多入口配置允许一个项目构建出多个独立的 HTML 页面，每个页面都是一个完整的应用。

## 🏗️ 当前配置解析

### 目录结构

```
activities/
├── checkin/
│   └── index.html          ← 入口 1
├── halloween/
│   └── index.html          ← 入口 2
├── mini-game/
│   └── index.html          ← 入口 3
├── team/
│   └── index.html          ← 入口 4
└── src/
    ├── checkin-entry.tsx   ← 入口 1 的 React 代码
    ├── halloween-entry.tsx ← 入口 2 的 React 代码
    ├── mini-game-entry.tsx ← 入口 3 的 React 代码
    └── team-entry.tsx      ← 入口 4 的 React 代码
```

### vite.config.ts 配置

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 键名: 访问路径和构建输出目录名
        // 值: HTML 文件的物理路径
        checkin: resolve(__dirname, 'checkin/index.html'),
        halloween: resolve(__dirname, 'halloween/index.html'),
        'mini-game': resolve(__dirname, 'mini-game/index.html'),
        team: resolve(__dirname, 'team/index.html'),
      },
    },
  },
});
```

## 🚀 运行效果

### 开发模式 (`pnpm dev`)

启动开发服务器后，可以通过不同路径访问每个页面：

- http://localhost:3000/checkin/ → `checkin/index.html`
- http://localhost:3000/halloween/ → `halloween/index.html`
- http://localhost:3000/mini-game/ → `mini-game/index.html`
- http://localhost:3000/team/ → `team/index.html`

### 构建模式 (`pnpm build`)

构建后会在 `dist/` 目录生成独立的应用：

```
dist/
├── checkin/
│   ├── index.html
│   └── assets/
│       ├── checkin-entry-[hash].js
│       └── checkin-entry-[hash].css
├── halloween/
│   ├── index.html
│   └── assets/
│       ├── halloween-entry-[hash].js
│       └── halloween-entry-[hash].css
├── mini-game/
│   ├── index.html
│   └── assets/
│       └── ...
└── team/
    ├── index.html
    └── assets/
        └── ...
```

## 📋 HTML 入口文件格式

每个 HTML 文件必须引用对应的 entry 文件：

### checkin/index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>每日签到</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- 关键：引用对应的 entry 文件 -->
    <script type="module" src="../src/checkin-entry.tsx"></script>
  </body>
</html>
```

### halloween/index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>Halloween Activity</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- 引用 halloween 的 entry 文件 -->
    <script type="module" src="../src/halloween-entry.tsx"></script>
  </body>
</html>
```

## ➕ 添加新的入口

### Step 1: 创建 HTML 文件

创建 `lottery/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>幸运抽奖</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="../src/lottery-entry.tsx"></script>
  </body>
</html>
```

### Step 2: 创建 Entry 文件

创建 `src/lottery-entry.tsx`：

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LotteryActivity } from './activities/LotteryActivity';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LotteryActivity />
  </React.StrictMode>
);
```

### Step 3: 创建活动组件

创建 `src/activities/LotteryActivity.tsx`：

```tsx
import React from 'react';
import { useWebViewActivity } from '@/shared';

export const LotteryActivity: React.FC = () => {
  const { isReady } = useWebViewActivity();

  if (!isReady) return <div>Loading...</div>;

  return (
    <div>
      <h1>🎁 幸运抽奖</h1>
      {/* 你的活动逻辑 */}
    </div>
  );
};
```

### Step 4: 更新 vite.config.ts

在 `build.rollupOptions.input` 中添加：

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        checkin: resolve(__dirname, 'checkin/index.html'),
        halloween: resolve(__dirname, 'halloween/index.html'),
        'mini-game': resolve(__dirname, 'mini-game/index.html'),
        team: resolve(__dirname, 'team/index.html'),
        lottery: resolve(__dirname, 'lottery/index.html'), // ✅ 新增
      },
    },
  },
});
```

### Step 5: 开始开发

```bash
pnpm dev
```

访问：http://localhost:3000/lottery/

## 🎯 工作原理

### 1. HTML 作为入口点

每个 `目录/index.html` 文件都是一个独立的入口点。

### 2. 引用对应的 Entry

HTML 通过 `<script type="module">` 引用对应的 entry 文件。

### 3. Entry 加载组件

Entry 文件负责：

- 导入对应的活动组件
- 挂载到 `#root` DOM 节点
- 应用全局样式

### 4. Vite 处理依赖

Vite 会：

- 追踪每个 entry 的依赖树
- 打包成独立的 bundle
- 自动代码分割和优化
- 生成带 hash 的文件名

### 5. 输出独立应用

每个入口最终构建成独立的应用，可以单独部署。

## 💡 关键点

### ✅ 优势

1. **独立性**: 每个活动是独立的应用，互不影响
2. **共享代码**: 共享的代码（如 `src/shared/`）会被自动提取
3. **按需加载**: 只加载当前活动需要的代码
4. **灵活部署**: 可以选择部署全部或部分活动

### ⚠️ 注意事项

1. **路径引用**: HTML 中的 script src 要用相对路径
2. **命名规范**: input 的键名会成为 URL 路径和输出目录名
3. **共享依赖**: 如果多个入口使用相同的依赖，Vite 会自动提取到共享 chunk

## 🔍 调试技巧

### 查看构建产物

```bash
pnpm build
ls -R dist/
```

### 预览构建结果

```bash
pnpm preview
```

然后访问：

- http://localhost:4173/checkin/
- http://localhost:4173/halloween/
- http://localhost:4173/mini-game/
- http://localhost:4173/team/

## 📚 总结

多入口配置的核心是：

1. **每个目录一个 `index.html`**
2. **每个 HTML 引用一个 entry 文件**
3. **在 vite.config.ts 中注册所有入口**
4. **Vite 自动处理打包和优化**

这样就可以在一个项目中管理多个独立的应用！
