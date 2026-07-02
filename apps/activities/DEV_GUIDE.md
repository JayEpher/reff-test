# 活动页面开发指南

## 📚 项目结构说明

```
apps/activities/
├── src/
│   ├── shared/                    # ✅ 共享代码（已完成）
│   │   ├── webview-bridge.ts      # WebView 通信桥接
│   │   ├── useWebViewActivity.ts  # 通用 Hook
│   │   └── index.ts
│   │
│   ├── activities/                # ✅ 活动组件（你主要工作的地方）
│   │   ├── CheckinActivity.tsx    # 签到活动
│   │   ├── CheckinActivity.css
│   │   ├── HalloweenActivity.tsx  # 万圣节活动
│   │   ├── HalloweenActivity.css
│   │   ├── MiniGameActivity.tsx   # 迷你游戏
│   │   ├── MiniGameActivity.css
│   │   └── TeamActivity.tsx       # 团队活动
│   │
│   ├── checkin-entry.tsx          # 入口文件（每个活动一个）
│   ├── halloween-entry.tsx
│   ├── mini-game-entry.tsx
│   ├── team-entry.tsx
│   └── index.css                  # 全局样式
│
├── checkin/
│   └── index.html                 # HTML 模板（每个活动一个）
├── halloween/
│   └── index.html
├── mini-game/
│   └── index.html
├── team/
│   └── index.html
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd apps/activities
pnpm install
```

### 2. 开发单个活动

```bash
# 方式 1: 开发所有活动（推荐开始时使用）
pnpm dev

# 方式 2: 开发特定活动
pnpm dev:checkin      # 开发签到页面
pnpm dev:halloween    # 开发万圣节活动
pnpm dev:mini-game    # 开发迷你游戏
pnpm dev:team         # 开发团队活动
```

### 3. 在浏览器中访问

开发服务器启动后，访问：

- 签到: http://localhost:3000/checkin/
- 万圣节: http://localhost:3000/halloween/
- 迷你游戏: http://localhost:3000/mini-game/
- 团队活动: http://localhost:3000/team/

### 4. 构建生产版本

```bash
pnpm build
```

构建产物在 `dist/` 目录：

```
dist/
├── checkin/
│   └── index.html
├── halloween/
│   └── index.html
├── mini-game/
│   └── index.html
└── team/
    └── index.html
```

## 📝 开发一个新活动（完整流程）

### 例子：添加一个"抽奖"活动

#### Step 1: 创建活动组件

在 `src/activities/` 创建 `LotteryActivity.tsx`：

```tsx
import React, { useState } from 'react';
import { useWebViewActivity, postMessageToRN, closeWebView } from '@/shared';
import './LotteryActivity.css';

export const LotteryActivity: React.FC = () => {
  const { isReady } = useWebViewActivity();
  const [isDrawing, setIsDrawing] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);

  const handleDraw = () => {
    setIsDrawing(true);

    // 模拟抽奖
    setTimeout(() => {
      const prizes = ['一等奖', '二等奖', '三等奖', '谢谢参与'];
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      setPrize(randomPrize);
      setIsDrawing(false);

      // 通知 RN
      postMessageToRN({
        type: 'LOTTERY_RESULT',
        payload: { prize: randomPrize },
      });
    }, 2000);
  };

  if (!isReady) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="lottery-container">
      <h1>🎁 幸运抽奖</h1>

      {!prize ? (
        <div>
          <p>点击按钮开始抽奖</p>
          <button onClick={handleDraw} disabled={isDrawing} className="draw-button">
            {isDrawing ? '抽奖中...' : '开始抽奖'}
          </button>
        </div>
      ) : (
        <div>
          <h2>恭喜您抽中：{prize}</h2>
          <button onClick={() => setPrize(null)} className="retry-button">
            再抽一次
          </button>
          <button onClick={closeWebView} className="close-button">
            关闭
          </button>
        </div>
      )}
    </div>
  );
};
```

#### Step 2: 创建样式文件

在 `src/activities/` 创建 `LotteryActivity.css`：

```css
.lottery-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-align: center;
}

.draw-button,
.retry-button,
.close-button {
  margin: 10px;
  padding: 12px 32px;
  font-size: 16px;
  background: white;
  color: #f5576c;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
}

.draw-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.draw-button:active:not(:disabled),
.retry-button:active,
.close-button:active {
  transform: scale(0.95);
}
```

#### Step 3: 创建入口文件

在 `src/` 创建 `lottery-entry.tsx`：

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

#### Step 4: 创建 HTML 模板

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

#### Step 5: 更新 Vite 配置

编辑 `vite.config.ts`，在 `build.rollupOptions.input` 中添加：

```ts
export default defineConfig({
  // ...
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

#### Step 6: 添加开发脚本（可选）

编辑 `package.json`，在 `scripts` 中添加：

```json
{
  "scripts": {
    "dev:lottery": "vite --mode lottery"
  }
}
```

#### Step 7: 开始开发

```bash
pnpm dev:lottery
```

访问：http://localhost:3000/lottery/

## 🔌 WebView 通信 API

### 向 React Native 发送消息

```tsx
import { postMessageToRN } from '@/shared';

// 发送自定义消息
postMessageToRN({
  type: 'YOUR_EVENT_TYPE',
  payload: {
    data: 'any data you want to send',
  },
});
```

### 常用通信方法

```tsx
import {
  closeWebView, // 关闭 WebView
  navigateToRN, // 导航到 RN 页面
  notifyPageReady, // 通知页面已就绪
} from '@/shared';

// 关闭 WebView
closeWebView();

// 导航到 RN 页面
navigateToRN('ProfileScreen', { userId: '123' });

// 通知页面加载完成（通常在 useWebViewActivity 中自动调用）
notifyPageReady();
```

### 监听来自 RN 的消息

```tsx
import { useEffect } from 'react';
import { onMessageFromRN } from '@/shared';

function MyActivity() {
  useEffect(() => {
    const unsubscribe = onMessageFromRN((message) => {
      if (message.type === 'USER_INFO') {
        console.log('User info:', message.payload);
      }
    });

    return unsubscribe; // 清理监听器
  }, []);
}
```

### 使用通用 Hook

```tsx
import { useWebViewActivity } from '@/shared';

function MyActivity() {
  const { isReady } = useWebViewActivity();

  // isReady 为 true 时表示：
  // 1. 组件已挂载
  // 2. 已向 RN 发送 PAGE_READY 消息
  // 3. 已设置消息监听器

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return <div>Your activity content</div>;
}
```

## 🎨 使用共享 UI 组件

项目已集成 `@puff/ui` 包，可以直接使用：

```tsx
import { Button, Card, Modal } from '@puff/ui';

export const MyActivity = () => {
  return (
    <div>
      <Card>
        <h2>Title</h2>
        <Button onClick={() => {}}>Click me</Button>
      </Card>
    </div>
  );
};
```

## 📦 使用共享工具函数

项目已集成 `@puff/utils` 包：

```tsx
import { formatDate, debounce } from '@puff/utils';

const formattedDate = formatDate(new Date());
const debouncedFn = debounce(() => console.log('hello'), 300);
```

## 🌐 在 React Native 中使用

```tsx
import { WebView } from 'react-native-webview';

export const ActivityScreen = () => {
  const handleMessage = (event) => {
    const message = JSON.parse(event.nativeEvent.data);

    switch (message.type) {
      case 'CLOSE_WEBVIEW':
        navigation.goBack();
        break;
      case 'NAVIGATE':
        navigation.navigate(message.payload.routeName, message.payload.params);
        break;
      default:
        console.log('Message from WebView:', message);
    }
  };

  return (
    <WebView
      source={{ uri: 'https://your-domain.com/activities/checkin/index.html' }}
      onMessage={handleMessage}
    />
  );
};
```

## 💡 开发技巧

### 1. 热更新

Vite 会自动热更新，修改代码后浏览器会自动刷新。

### 2. 调试

在浏览器中打开开发者工具（F12）查看控制台输出和网络请求。

### 3. 模拟 RN 环境

在开发时，`window.ReactNativeWebView` 不存在，但 `postMessageToRN` 会输出警告到控制台，方便调试。

### 4. 样式隔离

每个活动的 CSS 文件使用唯一的类名前缀（如 `.checkin-*`、`.halloween-*`），避免样式冲突。

### 5. TypeScript 支持

项目已配置 TypeScript，享受类型检查和自动补全。

## ❓ 常见问题

### Q: 如何删除一个活动？

1. 删除 `src/activities/ActivityName.tsx` 和对应的 CSS
2. 删除 `src/activity-entry.tsx`
3. 删除 `activity/index.html` 目录
4. 从 `vite.config.ts` 的 input 中移除对应条目
5. 从 `package.json` 的 scripts 中移除对应脚本

### Q: 如何共享代码？

将共享的组件、工具函数放在 `src/shared/` 目录中，然后通过 `@/shared` 导入。

### Q: 如何使用图片资源？

将图片放在 `public/` 目录，然后在代码中使用：

```tsx
<img src="/images/logo.png" alt="Logo" />
```

### Q: 构建后的文件在哪里？

在 `dist/` 目录，每个活动都有独立的子目录。

## 📚 总结

这个项目让你能够：

✅ 在一个项目中管理所有活动页面  
✅ 共享代码和组件，避免重复  
✅ 使用统一的开发和构建流程  
✅ 享受 TypeScript 和热更新  
✅ 轻松与 React Native WebView 通信
