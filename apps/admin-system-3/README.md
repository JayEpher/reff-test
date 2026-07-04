# Admin System 3

基于 Umi 3.5 和 React 17 的后台管理系统，集成 Axios 和完整的认证功能。

## 技术栈

- **Umi 3.5.41** - 企业级前端框架
- **React 17.0.2** - UI 库
- **Ant Design 4.24.15** - UI 组件库
- **TypeScript 4.9.5** - 类型系统
- **Axios 1.18** - HTTP 客户端
- **@puff/api** - 统一 API 封装（workspace 共享包）

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 功能特性

### 🔐 认证系统
- ✅ 登录/登出功能
- ✅ Token 管理（localStorage）
- ✅ 路由权限控制
- ✅ 401 自动跳转登录
- ✅ 用户信息展示

### 📊 数据管理
- ✅ Axios 统一请求封装
- ✅ 请求/响应拦截器
- ✅ 自动 Token 注入
- ✅ 错误统一处理
- ✅ Loading 状态管理

### 🎨 UI 功能
- ✅ 响应式布局
- ✅ 可折叠侧边栏
- ✅ 用户下拉菜单
- ✅ 仪表盘统计展示
- ✅ 用户管理表格（增删改查）

## 项目结构

```
src/
├── layouts/               # 布局组件
│   └── BasicLayout.tsx   # 主布局（侧边栏+顶栏）
├── pages/                # 页面组件
│   ├── Login/            # 登录页
│   ├── Dashboard/        # 仪表盘
│   └── Users/            # 用户管理
├── providers/            # Context Providers
│   └── AuthProvider.tsx  # 认证上下文
├── services/             # API 服务
│   └── api.ts            # API 接口定义
└── components/           # 公共组件
    ├── PageLoading.tsx   # 加载组件
    └── PrivateRoute.tsx  # 路由守卫
```

## API 集成

项目使用 `@puff/api` workspace 包统一管理 HTTP 请求：

```typescript
import { apiClient } from '@puff/api';

// 自动携带 Token
const users = await apiClient.get('/users');

// 登录
await apiClient.login('admin', 'admin123');

// 登出
await apiClient.logout();
```

### API 功能
- ✅ Axios 拦截器（请求/响应）
- ✅ 自动注入 Bearer Token
- ✅ 401 自动清理 Token 并跳转
- ✅ 统一错误处理
- ✅ TypeScript 类型支持

## 数据请求示例

### 使用 useState + useEffect

```typescript
import { useState, useEffect } from 'react';
import { dashboardApi } from '@/services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await dashboardApi.getStats();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return <div>{/* 使用 data 渲染 */}</div>;
};
```

## 测试账号

```
用户名：admin
密码：admin123
```

## 与 admin-system-1 的对比

| 特性 | admin-system-1 | admin-system-3 |
|------|---------------|---------------|
| Umi 版本 | 4.3.36 | 3.5.41 |
| React 版本 | 18.3.1 | 17.0.2 |
| Ant Design | 5.16.0 | 4.24.15 |
| 数据请求 | @ahooksjs/use-request | Axios + useState |
| HTTP 客户端 | Umi 内置 axios | @puff/api (axios) |
| 认证系统 | ❌ | ✅ 完整实现 |

## 开发建议

1. **API Mock**：开发时可使用 Umi 的 Mock 功能模拟后端
2. **环境变量**：在 `.env` 中配置 `API_BASE_URL`
3. **Token 刷新**：可在 `@puff/api` 中扩展 refresh token 逻辑
4. **权限控制**：可基于 `useAuth` Hook 扩展角色权限

## 请求状态管理最佳实践

由于项目使用原生 React State 管理请求，建议遵循以下模式：

```typescript
// 1. 列表页面 - 支持刷新
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);

const fetchData = async () => {
  try {
    setLoading(true);
    const result = await api.getList();
    setData(result);
  } catch (error) {
    message.error('加载失败');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, [dependency]);

// 2. 操作后刷新
const handleDelete = async (id) => {
  await api.delete(id);
  await fetchData(); // 重新获取列表
};
```
