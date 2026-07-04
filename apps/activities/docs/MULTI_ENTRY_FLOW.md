# 多入口工作流程图解

## 📊 开发模式流程

```
用户访问 URL
    ↓
http://localhost:3000/checkin/
    ↓
Vite 开发服务器
    ↓
找到 checkin/index.html
    ↓
解析 <script src="../src/checkin-entry.tsx">
    ↓
加载 checkin-entry.tsx
    ↓
导入 CheckinActivity 组件
    ↓
挂载到 <div id="root">
    ↓
渲染签到页面 ✅
```

## 🏗️ 构建模式流程

```
执行 pnpm build
    ↓
Vite 读取 vite.config.ts
    ↓
发现 4 个入口：
├── checkin/index.html
├── halloween/index.html
├── mini-game/index.html
└── team/index.html
    ↓
对每个入口分别打包
    ↓
分析依赖树
    ↓
├─ checkin/index.html
│   └─ ../src/checkin-entry.tsx
│       └─ ./activities/CheckinActivity.tsx
│           ├─ @/shared/webview-bridge
│           └─ ./CheckinActivity.css
│
├─ halloween/index.html
│   └─ ../src/halloween-entry.tsx
│       └─ ./activities/HalloweenActivity.tsx
│           ├─ @/shared/webview-bridge
│           ├─ @puff/ui (Button)
│           └─ ./HalloweenActivity.css
│
└─ ... (其他入口)
    ↓
提取共享代码
    ↓
├─ @/shared/* → 共享 chunk
├─ @puff/ui → vendor chunk
└─ React/ReactDOM → vendor chunk
    ↓
生成输出文件
    ↓
dist/
├── checkin/
│   ├── index.html
│   └── assets/
│       ├── checkin-entry-abc123.js    (入口代码)
│       ├── checkin-entry-xyz789.css   (样式)
│       └── shared-def456.js           (共享代码)
│
├── halloween/
│   ├── index.html
│   └── assets/
│       ├── halloween-entry-ghi012.js
│       ├── halloween-entry-jkl345.css
│       └── shared-def456.js           (复用共享代码)
│
└── ... (其他目录)
    ↓
构建完成 ✅
```

## 🔄 文件关系图

```
┌─────────────────────────────────────────────────────────┐
│                    vite.config.ts                       │
│  定义所有入口的映射关系                                    │
└─────────────────────────────────────────────────────────┘
                         │
           ┌─────────────┼─────────────┬──────────────┐
           ↓             ↓             ↓              ↓
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ checkin/ │  │halloween/│  │mini-game/│  │  team/   │
    │index.html│  │index.html│  │index.html│  │index.html│
    └──────────┘  └──────────┘  └──────────┘  └──────────┘
           │             │             │              │
           └─────────────┼─────────────┴──────────────┘
                         ↓
                   src/*-entry.tsx
                   (各自的入口文件)
                         │
           ┌─────────────┼─────────────┐
           ↓             ↓             ↓
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │activities│  │  shared/ │  │index.css │
    │   组件    │  │  工具类   │  │ 全局样式  │
    └──────────┘  └──────────┘  └──────────┘
           │             │             │
           └─────────────┼─────────────┘
                         ↓
              ┌──────────────────┐
              │  monorepo 共享包  │
              │ @puff/ui, utils  │
              └──────────────────┘
```

## 📁 完整的文件依赖关系

### Checkin 活动

```
checkin/index.html
    └─→ ../src/checkin-entry.tsx
            ├─→ ./activities/CheckinActivity.tsx
            │       ├─→ @/shared/webview-bridge.ts
            │       ├─→ @/shared/useWebViewActivity.ts
            │       └─→ ./CheckinActivity.css
            │
            └─→ ./index.css (全局样式)
```

### Halloween 活动

```
halloween/index.html
    └─→ ../src/halloween-entry.tsx
            ├─→ ./activities/HalloweenActivity.tsx
            │       ├─→ @/shared/webview-bridge.ts
            │       ├─→ @/shared/useWebViewActivity.ts
            │       ├─→ @puff/ui (Button 组件)
            │       └─→ ./HalloweenActivity.css
            │
            └─→ ./index.css (全局样式)
```

## 🚀 URL 到组件的映射

```
访问 URL                           加载的组件
───────────────────────────────────────────────────────
localhost:3000/checkin/      →    CheckinActivity
localhost:3000/halloween/    →    HalloweenActivity
localhost:3000/mini-game/    →    MiniGameActivity
localhost:3000/team/         →    TeamActivity
```

## 💾 构建产物对比

### 单入口应用 (传统方式)

```
dist/
├── index.html
└── assets/
    ├── index-abc123.js   (包含所有页面的代码)
    └── index-xyz789.css  (包含所有样式)
```

### 多入口应用 (当前方式)

```
dist/
├── checkin/
│   ├── index.html
│   └── assets/
│       ├── checkin-entry-abc.js   (只包含签到页面)
│       └── checkin-entry-xyz.css  (只包含签到样式)
│
├── halloween/
│   ├── index.html
│   └── assets/
│       ├── halloween-entry-def.js (只包含万圣节页面)
│       └── halloween-entry-ghi.css
│
└── shared/
    └── assets/
        └── vendor-jkl.js          (共享的依赖)
```

### ✅ 优势对比

| 特性         | 单入口                 | 多入口              |
| ------------ | ---------------------- | ------------------- |
| 初始加载大小 | 大 (包含所有代码)      | 小 (只加载当前页面) |
| 部署灵活性   | 必须全部部署           | 可以选择部署        |
| 缓存策略     | 更新一个页面，全部失效 | 只更新修改的页面    |
| 独立性       | 所有页面耦合           | 每个页面独立        |
| WebView 集成 | 需要路由判断           | 直接加载对应 HTML   |

## 🎯 总结

多入口配置就是：

1. **每个活动目录** = 一个独立的 Web 应用
2. **每个 index.html** = 应用的入口点
3. **每个 entry.tsx** = 应用的启动代码
4. **Vite 自动处理** = 打包、优化、代码分割

这样你就可以在 React Native WebView 中直接加载：

```tsx
<WebView source={{ uri: 'https://domain.com/activities/checkin/' }} />
<WebView source={{ uri: 'https://domain.com/activities/halloween/' }} />
```

每个 URL 都是一个完整、独立、优化过的应用！
