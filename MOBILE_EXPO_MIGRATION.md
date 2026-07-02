# Mobile App (Expo) 改造完成

## 改造内容

已将 React Native 移动端从传统的 React Native CLI 改造为使用 **Expo** 和 **Expo Router** 构建。

## 技术栈更新

### 之前

- React Native CLI
- 需要手动配置原生代码
- 复杂的构建流程

### 现在

- **Expo SDK 51**
- **Expo Router 3.5** (文件路由系统)
- **React Native 0.74.2**
- **TypeScript 5.3.3**
- 零原生配置，开箱即用

## 项目结构

```
apps/mobile/
├── app/                           # Expo Router 路由目录
│   ├── _layout.tsx               # 根布局
│   ├── index.tsx                 # 首页
│   └── (tabs)/                   # Tab 导航组
│       ├── _layout.tsx           # Tab 布局
│       ├── home.tsx              # 首页 Tab
│       ├── activities.tsx        # 活动列表 Tab
│       └── profile.tsx           # 个人中心 Tab
├── assets/                        # 静态资源目录
│   └── README.md                 # 资源文件说明
├── app.json                      # Expo 配置
├── babel.config.js               # Babel 配置
├── tsconfig.json                 # TypeScript 配置
├── expo-env.d.ts                 # Expo 类型声明
├── package.json                  # 依赖配置
├── .gitignore                    # Git 忽略文件
└── README.md                     # 项目文档
```

## 已实现的功能

### 1. 路由系统

- ✅ 文件路由（Expo Router）
- ✅ 根布局配置
- ✅ Tab 导航结构
- ✅ 类型安全的路由

### 2. 页面

- ✅ **首页** (`/`) - 欢迎页面，展示应用信息
- ✅ **首页 Tab** (`/(tabs)/home`) - 展示应用信息和集成的共享包
- ✅ **活动 Tab** (`/(tabs)/activities`) - 展示活动列表，使用共享包的类型和业务逻辑
- ✅ **个人中心 Tab** (`/(tabs)/profile`) - 用户信息展示

### 3. 共享包集成

已集成所有 monorepo 共享包：

```typescript
// 类型定义
import type { User, Activity } from '@puff/types';

// 业务逻辑
import { useAuth, validateActivity } from '@puff/business-logic';

// 配置
import { config } from '@puff/config';

// API 客户端
import { apiClient } from '@puff/api';

// 工具函数
import { formatDate, debounce } from '@puff/utils';
```

### 4. 示例功能

- ✅ 活动状态验证（使用 `validateActivity`）
- ✅ 模拟用户数据展示
- ✅ 活动列表展示
- ✅ 响应式布局

## 启动方式

### 开发模式

```bash
# 从根目录
pnpm --filter @puff/mobile dev

# 或进入目录
cd apps/mobile
pnpm dev
```

### 运行选项

启动后可以：

- 按 `i` - iOS 模拟器
- 按 `a` - Android 模拟器
- 按 `w` - 浏览器（Web）
- 扫描二维码 - 真机运行（需安装 Expo Go）

## 优势

### 1. 开发体验

- 🚀 快速启动，无需原生配置
- 🔥 支持热更新
- 🌐 同时支持 iOS、Android、Web
- 📱 真机调试简单（Expo Go）

### 2. 文件路由

- 📁 基于文件系统的路由
- 🔒 类型安全
- 🎯 自动代码分割
- 🔄 深度链接支持

### 3. Monorepo 集成

- ✅ 完美集成共享包
- ✅ TypeScript 类型支持
- ✅ 热更新保持工作
- ✅ 统一的构建流程

## 与其他应用的交互

### 嵌入活动页面

可以使用 WebView 嵌入活动页面：

```bash
# 安装 WebView
pnpm --filter @puff/mobile add react-native-webview
```

创建活动页面：

```typescript
// app/activity/[id].tsx
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

export default function ActivityPage() {
  const { id } = useLocalSearchParams();

  return (
    <WebView
      source={{ uri: `https://your-domain.com/activities/${id}` }}
      style={{ flex: 1 }}
    />
  );
}
```

### 与 DApp 共享代码

Mobile 和 DApp 共享：

- 业务逻辑 (`@puff/business-logic`)
- API 调用 (`@puff/api`)
- 类型定义 (`@puff/types`)
- 工具函数 (`@puff/utils`)

不共享：

- UI 组件（React Native vs React DOM）
- 但可以共享组件逻辑和样式定义

## 后续开发建议

### 1. 添加 UI 组件库

为 React Native 创建专用的 UI 组件：

```bash
# 创建 React Native 专用 UI 包
mkdir -p packages/shared/ui-native/src
```

### 2. 添加导航图标

```bash
pnpm --filter @puff/mobile add @expo/vector-icons
```

然后在 Tab 布局中使用图标。

### 3. 添加状态管理

```bash
pnpm --filter @puff/mobile add zustand
# 或
pnpm --filter @puff/mobile add @tanstack/react-query
```

### 4. 添加更多页面

基于 Expo Router 的文件系统路由，只需创建文件即可：

- `app/activity/[id].tsx` - 活动详情页
- `app/settings.tsx` - 设置页
- `app/notifications.tsx` - 通知页

### 5. 配置构建

使用 EAS Build 进行生产构建：

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录
eas login

# 配置
eas build:configure

# 构建
eas build --platform ios
eas build --platform android
```

### 6. 添加资源文件

在 `apps/mobile/assets/` 中添加：

- `icon.png` - 应用图标 (1024x1024)
- `splash.png` - 启动屏 (1284x2778)
- `adaptive-icon.png` - Android 自适应图标 (1024x1024)
- `favicon.png` - Web favicon (48x48)

## 注意事项

### 1. 首次运行

首次运行需要：

- 安装 Expo Go App（iOS/Android 真机调试）
- 配置模拟器（开发机器）

### 2. 清理缓存

如遇问题，清理缓存：

```bash
cd apps/mobile
rm -rf node_modules .expo
cd ../..
pnpm install
pnpm --filter @puff/mobile dev --clear
```

### 3. 共享包更新

修改共享包后，确保重新构建：

```bash
pnpm --filter @puff/types build
# 或开启 watch 模式
pnpm --filter @puff/types dev
```

## 文档

详细文档请查看：

- `apps/mobile/README.md` - Mobile 应用详细文档
- `GETTING_STARTED.md` - 项目快速启动指南
- `README.md` - 项目总体说明

## 总结

Mobile 应用已成功改造为 Expo + Expo Router 架构，具备：

✅ 现代化的文件路由系统
✅ 完整的 Tab 导航结构
✅ 与 monorepo 共享包的深度集成
✅ 类型安全的开发体验
✅ 跨平台支持（iOS、Android、Web）
✅ 快速的开发和热更新
✅ 详细的文档和示例代码

可以开始开发了！🚀
