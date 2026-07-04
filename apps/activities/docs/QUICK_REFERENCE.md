# 活动页面开发速查表

## 🚀 常用命令

```bash
# 开发
pnpm dev                 # 开发所有活动
pnpm dev:checkin         # 开发签到
pnpm dev:halloween       # 开发万圣节
pnpm dev:mini-game       # 开发游戏
pnpm dev:team            # 开发团队活动

# 构建
pnpm build               # 构建生产版本
```

## 📝 添加新活动 - 3 步走

### 1️⃣ 创建组件 `src/activities/NewActivity.tsx`

```tsx
import React from 'react';
import { useWebViewActivity, postMessageToRN } from '@/shared';
import './NewActivity.css';

export const NewActivity: React.FC = () => {
  const { isReady } = useWebViewActivity();

  if (!isReady) return <div>Loading...</div>;

  return (
    <div className="new-activity">
      <h1>标题</h1>
      <button onClick={() => postMessageToRN({ type: 'EVENT' })}>操作</button>
    </div>
  );
};
```

### 2️⃣ 创建入口 `src/new-activity-entry.tsx`

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

### 3️⃣ 创建 HTML `new-activity/index.html`

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

### ⚙️ 更新配置 `vite.config.ts`

```ts
input: {
  // ... 其他活动
  'new-activity': resolve(__dirname, 'new-activity/index.html'),
}
```

## 🔌 WebView 通信 API

```tsx
import {
  postMessageToRN, // 发送消息到 RN
  closeWebView, // 关闭 WebView
  navigateToRN, // 导航到 RN 页面
  onMessageFromRN, // 监听 RN 消息
  useWebViewActivity, // 通用 Hook
} from '@/shared';

// 发送消息
postMessageToRN({ type: 'EVENT', payload: { data: 'value' } });

// 关闭 WebView
closeWebView();

// 导航
navigateToRN('ScreenName', { param: 'value' });

// 监听消息
useEffect(() => {
  const unsubscribe = onMessageFromRN((msg) => {
    console.log(msg);
  });
  return unsubscribe;
}, []);
```

## 📦 可用的依赖

```tsx
// UI 组件
import { Button, Card, Modal } from '@puff/ui';

// 工具函数
import { formatDate, debounce } from '@puff/utils';

// API 调用
import { api } from '@puff/api';

// 类型定义
import type { User } from '@puff/types';
```

## 📁 项目结构

```
activities/
├── src/
│   ├── shared/          # 共享代码（不要修改）
│   ├── activities/      # 👈 你的活动组件
│   ├── *-entry.tsx      # 入口文件
│   └── index.css        # 全局样式
├── activity-name/       # 每个活动的 HTML
│   └── index.html
└── vite.config.ts       # 构建配置
```

## 🎯 开发流程

1. 运行 `pnpm dev`
2. 打开 http://localhost:3000/activity-name/
3. 编辑 `src/activities/ActivityName.tsx`
4. 浏览器自动刷新
5. 完成后运行 `pnpm build`

## ✨ 代码片段

### 基础活动模板

```tsx
import React from 'react';
import { useWebViewActivity } from '@/shared';

export const Activity: React.FC = () => {
  const { isReady } = useWebViewActivity();
  if (!isReady) return <div>Loading...</div>;
  return <div>Content</div>;
};
```

### 带状态的活动

```tsx
const [data, setData] = useState<any>(null);

useEffect(() => {
  // 加载数据
  fetchData().then(setData);
}, []);
```

### 表单提交

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  postMessageToRN({ type: 'FORM_SUBMIT', payload: formData });
};
```
