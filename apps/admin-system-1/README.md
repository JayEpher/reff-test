# Admin System 1

用户和活动管理后台系统，基于 UmiJS 4 + Ant Design Pro 构建。

## 功能模块

### 1. Dashboard (首页)

- 📊 数据统计卡片
- 📈 用户增长趋势
- 🎯 活动状态监控
- 🔔 系统状态提醒

### 2. User Management (用户管理)

- 👥 用户列表查看
- ➕ 添加新用户
- ✏️ 编辑用户信息
- 🗑️ 删除用户

### 3. Activity Management (活动管理)

- 📋 活动列表
  - 查看所有活动
  - 活动状态验证（使用 `@puff/business-logic`）
  - 日期格式化（使用 `@puff/utils`）
- ➕ 创建活动
  - 活动名称
  - 活动类型（Halloween, Team, Check-in, Mini Game）
  - 时间范围选择

### 4. Settings (系统设置)

- ⚙️ 通用设置
- 🔔 功能开关
- 📧 邮件配置

## 技术栈

- **框架**: UmiJS 4 + @umijs/max
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: Umi Model
- **路由**: Umi 约定式路由
- **TypeScript**: 5.4.5
- **共享包**: @puff/api, @puff/types, @puff/utils

## 目录结构

```
apps/admin-system-1/
├── src/
│   ├── pages/                 # 页面
│   │   ├── Home/             # 首页
│   │   ├── Users/            # 用户管理
│   │   ├── Activities/       # 活动管理
│   │   │   ├── List.tsx      # 活动列表
│   │   │   └── Create.tsx    # 创建活动
│   │   └── Settings/         # 系统设置
│   ├── components/           # 组件
│   ├── services/             # API 服务
│   ├── layouts/              # 布局
│   └── app.tsx              # 运行时配置
├── .umirc.ts                # Umi 配置
├── tsconfig.json            # TypeScript 配置
└── package.json
```

## 启动开发

### 安装依赖

从项目根目录：

```bash
pnpm install
```

### 启动开发服务器

```bash
# 从根目录
pnpm --filter @puff/admin-system-1 dev

# 或进入目录
cd apps/admin-system-1
pnpm dev
```

访问：http://localhost:8000

### 构建生产版本

```bash
pnpm --filter @puff/admin-system-1 build
```

## 集成共享包

### 使用类型定义

```typescript
import type { User, Activity } from '@puff/types';

const user: User = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
};
```

### 使用业务逻辑

```typescript
import { validateActivity, useAuth } from '@puff/business-logic';

// 验证活动是否在有效期内
const isActive = validateActivity(activity.startTime, activity.endTime);

// 使用认证逻辑
const { login, logout } = useAuth();
```

### 使用工具函数

```typescript
import { formatDate, debounce } from '@puff/utils';

// 格式化日期
const formatted = formatDate(new Date());

// 防抖函数
const debouncedSearch = debounce(searchFunction, 300);
```

### 使用 API 客户端

```typescript
import { apiClient } from '@puff/api';

// 获取用户信息
const user = await apiClient.getUser('123');
```

## 路由配置

路由在 `.umirc.ts` 中配置：

```typescript
routes: [
  { path: '/', redirect: '/home' },
  { name: 'Dashboard', path: '/home', component: './Home' },
  { name: 'User Management', path: '/users', component: './Users' },
  {
    name: 'Activity Management',
    path: '/activities',
    routes: [
      { path: '/activities/list', component: './Activities/List' },
      { path: '/activities/create', component: './Activities/Create' },
    ],
  },
  { name: 'Settings', path: '/settings', component: './Settings' },
];
```

## 布局配置

使用 Ant Design Pro Layout，在 `.umirc.ts` 中配置：

```typescript
layout: {
  title: 'Puff Admin System 1',
}
```

## 开发建议

### 1. 添加新页面

在 `src/pages/` 下创建新目录和 `index.tsx`，UmiJS 会自动识别。

### 2. 添加 API 服务

在 `src/services/` 中创建服务文件：

```typescript
// src/services/user.ts
import { apiClient } from '@puff/api';

export async function getUserList() {
  return apiClient.request('/users');
}
```

### 3. 使用 Model

```typescript
// src/models/user.ts
import { useState } from 'react';

export default function useUserModel() {
  const [users, setUsers] = useState([]);

  return {
    users,
    setUsers,
  };
}
```

### 4. 添加 Mock 数据

在开发环境，可以在 `mock/` 目录下添加 mock 数据。

## 部署

### 构建

```bash
pnpm build
```

构建产物在 `dist/` 目录。

### 部署到服务器

将 `dist/` 目录上传到服务器，使用 Nginx 或其他 Web 服务器托管。

Nginx 配置示例：

```nginx
server {
  listen 80;
  server_name admin1.example.com;

  root /path/to/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 环境变量

创建 `.env` 文件：

```env
# API 地址
API_BASE_URL=https://api.example.com

# 其他配置
PORT=8000
```

## 常见问题

### 1. 端口被占用

修改 `.umirc.ts`：

```typescript
export default defineConfig({
  devServer: {
    port: 8001,
  },
});
```

### 2. 构建失败

清理缓存：

```bash
rm -rf .umi .umi-production node_modules
pnpm install
```

### 3. 共享包类型找不到

确保已构建共享包：

```bash
pnpm build
```

## 更多资源

- [UmiJS 文档](https://umijs.org/)
- [Ant Design Pro 文档](https://pro.ant.design/)
- [Ant Design 文档](https://ant.design/)
