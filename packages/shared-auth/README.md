# @puff/shared-auth

共享认证和授权工具库，为 monorepo 中的所有应用提供统一的权限管理。

## 特性

- 🔐 基于角色的访问控制（RBAC）
- 🎯 细粒度权限管理
- ⚛️ React Hooks 支持
- 🧩 权限保护组件
- 📦 TypeScript 类型安全
- 🚀 轻量级，无额外依赖

## 安装

在 monorepo 中，其他包可以直接引用：

```json
{
  "dependencies": {
    "@puff/shared-auth": "workspace:*"
  }
}
```

## 使用方法

### 1. 配置 AuthProvider

在应用入口处包裹 `AuthProvider`：

```tsx
import { AuthProvider } from '@puff/shared-auth';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### 2. 使用权限 Hook

```tsx
import { usePermission, Permission } from '@puff/shared-auth';

function UserManagement() {
  const { hasPermission, user } = usePermission();

  if (!hasPermission(Permission.USER_UPDATE)) {
    return <div>无权限访问</div>;
  }

  return (
    <div>
      <h1>用户管理</h1>
      <p>当前用户: {user?.name}</p>
    </div>
  );
}
```

### 3. 使用权限保护组件

```tsx
import { PermissionGuard, Permission } from '@puff/shared-auth';

function Dashboard() {
  return (
    <div>
      <h1>仪表板</h1>

      <PermissionGuard permission={Permission.USER_UPDATE}>
        <button>编辑用户</button>
      </PermissionGuard>

      <PermissionGuard
        permission={Permission.USER_DELETE}
        fallback={<span>无删除权限</span>}
      >
        <button>删除用户</button>
      </PermissionGuard>
    </div>
  );
}
```

### 4. 多权限检查

```tsx
import { PermissionGuard, Permission } from '@puff/shared-auth';

// 满足任意一个权限即可（默认）
<PermissionGuard
  permission={[Permission.USER_UPDATE, Permission.USER_DELETE]}
>
  <UserActions />
</PermissionGuard>

// 需要同时满足所有权限
<PermissionGuard
  permission={[Permission.SYSTEM_CONFIG_READ, Permission.SYSTEM_CONFIG_UPDATE]}
  requireAll
>
  <SystemConfig />
</PermissionGuard>
```

## API 文档

### Roles（角色）

```typescript
enum Role {
  SUPER_ADMIN = 'super_admin',  // 超级管理员
  ADMIN = 'admin',               // 管理员
  EDITOR = 'editor',             // 编辑者
  VIEWER = 'viewer',             // 查看者
  GUEST = 'guest',               // 访客
}
```

### Permissions（权限）

```typescript
enum Permission {
  // 用户管理
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // 内容管理
  CONTENT_CREATE = 'content:create',
  CONTENT_READ = 'content:read',
  CONTENT_UPDATE = 'content:update',
  CONTENT_DELETE = 'content:delete',
  CONTENT_PUBLISH = 'content:publish',

  // 系统配置
  SYSTEM_CONFIG_READ = 'system:config:read',
  SYSTEM_CONFIG_UPDATE = 'system:config:update',
  SYSTEM_LOGS_READ = 'system:logs:read',

  // Web3
  WEB3_READ = 'web3:read',
  WEB3_WRITE = 'web3:write',
  WEB3_ADMIN = 'web3:admin',

  // 媒体
  MEDIA_UPLOAD = 'media:upload',
  MEDIA_READ = 'media:read',
  MEDIA_DELETE = 'media:delete',
}
```

### usePermission Hook

```typescript
const {
  hasPermission,      // 检查单个权限
  hasAnyPermission,   // 检查是否拥有任意权限
  hasAllPermissions,  // 检查是否拥有所有权限
  hasRole,            // 检查角色
  user,               // 当前用户信息
} = usePermission();
```

### PermissionGuard Component

```typescript
interface PermissionGuardProps {
  permission: Permission | Permission[];  // 需要的权限
  requireAll?: boolean;                   // 是否需要全部权限
  fallback?: React.ReactNode;             // 无权限时显示的内容
  children: React.ReactNode;              // 子组件
}
```

## 权限矩阵

| 角色 | 用户管理 | 内容管理 | 系统配置 | Web3 | 媒体 |
|------|---------|---------|---------|------|------|
| **Super Admin** | CRUD | CRUD + 发布 | RW | RW + Admin | CRUD |
| **Admin** | CRU | CRUD + 发布 | RW | RW | CRUD |
| **Editor** | R | CRU | - | R | CRU |
| **Viewer** | R | R | - | R | R |
| **Guest** | - | R | - | - | - |

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm type-check
```

## License

MIT
