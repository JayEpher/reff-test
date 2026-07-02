# Activities - 活动页面容器

这是一个统一的活动页面项目，所有嵌入到 React Native WebView 的活动页面都在这里开发和维护。

## 📁 目录结构

```
apps/activities/
├── src/
│   ├── shared/              # 共享代码
│   │   ├── webview-bridge.ts   # WebView 通信桥接
│   │   └── useWebViewActivity.ts # 活动页面通用 Hook
│   ├── activities/          # 各个活动页面组件
│   │   ├── CheckinActivity.tsx
│   │   ├── HalloweenActivity.tsx
│   │   └── ...
│   ├── checkin-entry.tsx    # 签到页面入口
│   ├── halloween-entry.tsx  # 万圣节活动入口
│   └── index.css           # 全局样式
├── checkin/
│   └── index.html          # 签到页面 HTML
├── halloween/
│   └── index.html          # 万圣节活动 HTML
├── mini-game/
│   └── index.html          # 小游戏 HTML
├── team/
│   └── index.html          # 团队活动 HTML
├── package.json
├── tsconfig.json
└── vite.config.ts

```

## 🚀 使用方式

### 开发模式

```bash
# 开发所有活动页面
pnpm dev

# 开发特定活动
pnpm dev:checkin
pnpm dev:halloween
pnpm dev:mini-game
pnpm dev:team
```

### 构建

```bash
pnpm build
```

构建后会在 `dist/` 目录生成所有活动页面：

- `dist/checkin/index.html`
- `dist/halloween/index.html`
- `dist/mini-game/index.html`
- `dist/team/index.html`

## 📝 如何添加新活动

### 1. 创建活动组件

在 `src/activities/` 中创建新的活动组件：

```tsx
// src/activities/NewActivity.tsx
import React from 'react';
import { useWebViewActivity, closeWebView } from '@/shared';

export const NewActivity: React.FC = () => {
  const { isReady } = useWebViewActivity();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return <div className="new-activity">{/* 你的活动内容 */}</div>;
};
```

### 2. 创建入口文件

创建 `src/new-activity-entry.tsx`：

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { NewActivity } from './activities/NewActivity';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NewActivity />
  </React.StrictMode>
);
```

### 3. 创建 HTML 页面

创建 `new-activity/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>新活动</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="../src/new-activity-entry.tsx"></script>
  </body>
</html>
```

### 4. 更新配置

在 `vite.config.ts` 的 `build.rollupOptions.input` 中添加：

```ts
input: {
  // ...existing entries
  'new-activity': resolve(__dirname, 'new-activity/index.html'),
}
```

在 `package.json` 中添加开发脚本（可选）：

```json
{
  "scripts": {
    "dev:new-activity": "vite --mode new-activity"
  }
}
```

## 🔌 WebView 通信

### 向 React Native 发送消息

```tsx
import { postMessageToRN, closeWebView, navigateToRN } from '@/shared';

// 发送自定义消息
postMessageToRN({
  type: 'CUSTOM_EVENT',
  payload: { data: 'some data' },
});

// 关闭 WebView
closeWebView();

// 导航到 RN 页面
navigateToRN('ProfileScreen', { userId: '123' });
```

### 监听来自 React Native 的消息

```tsx
import { useEffect } from 'react';
import { onMessageFromRN } from '@/shared';

useEffect(() => {
  const unsubscribe = onMessageFromRN((message) => {
    console.log('Received:', message);
    // 处理消息
  });

  return unsubscribe;
}, []);
```

## 💡 优势

1. **单一项目管理**：所有活动页面在一个项目中，易于维护
2. **代码复用**：共享组件、工具函数、样式
3. **统一构建**：一次构建生成所有活动页面
4. **类型安全**：统一的 TypeScript 配置
5. **依赖共享**：所有活动共享同一套依赖，减少冗余
6. **开发效率**：使用 monorepo 的共享包（@puff/ui、@puff/utils 等）

## 🌐 在 React Native 中使用

```tsx
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: 'https://your-domain.com/activities/checkin/index.html' }}
  onMessage={(event) => {
    const message = JSON.parse(event.nativeEvent.data);
    console.log('Message from WebView:', message);
  }}
/>;
```
