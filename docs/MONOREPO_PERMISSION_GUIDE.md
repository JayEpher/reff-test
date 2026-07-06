# Monorepo 权限管理方案

## 📋 权限管理概述

在 monorepo 架构中，权限管理主要分为以下几个层面：

1. **代码访问权限** - Git 和文件系统级别
2. **包发布权限** - npm/pnpm 包管理
3. **CI/CD 权限** - Jenkins/GitHub Actions
4. **应用访问权限** - 运行时用户权限

---

## 🔐 1. 代码访问权限（Git）

### 方案 A: 使用 Git Submodules（不推荐）

**优点**:
- 每个子模块可以独立设置权限
- 可以有独立的仓库

**缺点**:
- 管理复杂
- 失去 monorepo 的核心优势
- 不适合我们的场景

### 方案 B: CODEOWNERS + Branch Protection（推荐）✅

#### 步骤 1: 创建 CODEOWNERS 文件

```bash
# .github/CODEOWNERS 或 CODEOWNERS（根目录）
```

```
# 全局所有者
* @team-leads @zhanghe

# Applications - 各应用的负责人
/apps/activities/ @activities-team @zhanghe
/apps/admin-system-1/ @admin-team @zhanghe
/apps/admin-system-3/ @admin-team @zhanghe
/apps/dapp/ @dapp-team @zhanghe

# Shared Packages - 需要更严格的审查
/packages/ @core-team @zhanghe

# Infrastructure - DevOps 团队
/docker/ @devops-team @zhanghe
/Dockerfile* @devops-team @zhanghe
/Jenkinsfile @devops-team @zhanghe
/.github/ @devops-team @zhanghe

# Configuration - 需要团队 lead 审批
/package.json @team-leads @zhanghe
/pnpm-workspace.yaml @team-leads @zhanghe
/tsconfig.json @team-leads @zhanghe

# Documentation - 技术写作团队
/docs/ @tech-writers @team-leads
README.md @tech-writers @team-leads
```

#### 步骤 2: GitHub 分支保护规则

**主分支保护** (`main`):
```yaml
分支保护规则:
  - 要求 pull request 审查
    - 必需审查者数量: 2
    - 代码所有者审查
    - 驳回过期的审查
  - 要求状态检查通过
    - CI/CD 测试
    - 代码质量检查
    - 类型检查
  - 禁止强制推送
  - 要求签名提交
```

**开发分支保护** (`develop`):
```yaml
分支保护规则:
  - 要求 pull request 审查
    - 必需审查者数量: 1
  - 要求状态检查通过
```

---

## 📦 2. 包发布权限（npm/pnpm）

### 组织级别权限

#### 创建 npm 组织
```bash
# 假设组织名为 @puff
npm org create puff
```

#### 团队设置

```
@puff/developers      - 只读权限
@puff/maintainers     - 发布权限
@puff/admins          - 完全控制
```

#### 包访问控制

```json
// 在每个 package.json 中
{
  "name": "@puff/shared-utils",
  "publishConfig": {
    "access": "restricted",  // 或 "public"
    "registry": "https://registry.npmjs.org/"
  }
}
```

### 私有 npm Registry（可选）

如果需要更严格的控制，可以使用：

#### 方案 A: Verdaccio（自托管）

```yaml
# verdaccio.yaml
packages:
  '@puff/*':
    access:
      - $authenticated
    publish:
      - maintainers
      - admins
    unpublish:
      - admins
```

#### 方案 B: GitHub Packages

```yaml
# .npmrc
@puff:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

---

## 🏗️ 3. CI/CD 权限（Jenkins）

### Jenkins 权限配置

#### 全局权限

```groovy
// Jenkins Security 配置
authorization:
  - admin: ['zhanghe', 'devops-lead']
  - developer: ['dev-team']
  - viewer: ['qa-team', 'product-team']
```

#### Pipeline 权限

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    options {
        // 限制谁可以触发构建
        authorizationMatrix([
            'hudson.model.Item.Build:activities-team',
            'hudson.model.Item.Build:admin-team',
            'hudson.model.Item.Build:devops-team'
        ])
    }
    
    parameters {
        choice(
            name: 'APP_TO_BUILD',
            choices: ['activities', 'admin-system-1', 'admin-system-3', 'dapp'],
            description: '选择要构建的应用'
        )
    }
    
    stages {
        stage('Permission Check') {
            steps {
                script {
                    // 检查用户是否有权限构建特定应用
                    def user = currentBuild.rawBuild.getCause(Cause.UserIdCause).getUserId()
                    def app = params.APP_TO_BUILD
                    
                    if (!hasPermission(user, app)) {
                        error("User ${user} does not have permission to build ${app}")
                    }
                }
            }
        }
    }
}
```

---

## 👥 4. 应用运行时权限（RBAC）

### 方案：基于角色的访问控制（RBAC）

#### 权限设计

```typescript
// packages/shared-auth/src/types/permission.ts

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

export enum Permission {
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
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  
  [Role.ADMIN]: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_READ,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_PUBLISH,
    Permission.SYSTEM_CONFIG_READ,
    Permission.SYSTEM_CONFIG_UPDATE,
    Permission.SYSTEM_LOGS_READ,
    Permission.WEB3_READ,
  ],
  
  [Role.EDITOR]: [
    Permission.USER_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_READ,
    Permission.CONTENT_UPDATE,
    Permission.SYSTEM_LOGS_READ,
  ],
  
  [Role.VIEWER]: [
    Permission.USER_READ,
    Permission.CONTENT_READ,
    Permission.SYSTEM_LOGS_READ,
  ],
  
  [Role.GUEST]: [
    Permission.CONTENT_READ,
  ],
};
```

#### 权限检查 Hook

```typescript
// packages/shared-auth/src/hooks/usePermission.ts

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Permission, RolePermissions } from '../types/permission';

export function usePermission() {
  const { user } = useContext(AuthContext);
  
  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.role) {
      return false;
    }
    
    const rolePermissions = RolePermissions[user.role];
    return rolePermissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };
  
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
```

#### 权限保护组件

```typescript
// packages/shared-auth/src/components/PermissionGuard.tsx

import React from 'react';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../types/permission';

interface PermissionGuardProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();
  
  const permissions = Array.isArray(permission) ? permission : [permission];
  
  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
```

#### 路由保护

```typescript
// apps/admin-system-3/src/access.ts

import { Permission } from '@puff/shared-auth';

export default function access(initialState: { user?: any }) {
  const { user } = initialState || {};
  
  return {
    canViewDashboard: true, // 所有人都能看
    
    canManageUsers: user?.permissions?.includes(Permission.USER_UPDATE),
    
    canManageContent: user?.permissions?.includes(Permission.CONTENT_UPDATE),
    
    canConfigSystem: user?.permissions?.includes(Permission.SYSTEM_CONFIG_UPDATE),
    
    canViewLogs: user?.permissions?.includes(Permission.SYSTEM_LOGS_READ),
    
    isSuperAdmin: user?.role === 'super_admin',
  };
}
```

```typescript
// apps/admin-system-3/.umirc.ts

export default {
  routes: [
    {
      path: '/dashboard',
      component: './Dashboard',
      // 不需要权限
    },
    {
      path: '/users',
      component: './Users',
      access: 'canManageUsers', // 需要用户管理权限
    },
    {
      path: '/content',
      component: './Content',
      access: 'canManageContent', // 需要内容管理权限
    },
    {
      path: '/system',
      access: 'canConfigSystem', // 需要系统配置权限
      routes: [
        {
          path: '/system/config',
          component: './System/Config',
        },
        {
          path: '/system/logs',
          component: './System/Logs',
          access: 'canViewLogs',
        },
      ],
    },
  ],
};
```

---

## 🔧 5. 共享包权限管理

### 创建共享认证包

```bash
# 创建共享认证包
mkdir -p packages/shared-auth
```

```json
// packages/shared-auth/package.json
{
  "name": "@puff/shared-auth",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "typescript": "^5.6.3"
  }
}
```

### 使用共享包

```typescript
// apps/admin-system-3/src/app.tsx

import { AuthProvider } from '@puff/shared-auth';

export function rootContainer(container: any) {
  return (
    <AuthProvider>
      {container}
    </AuthProvider>
  );
}
```

```typescript
// apps/admin-system-3/src/pages/Users/index.tsx

import { PermissionGuard, Permission } from '@puff/shared-auth';

export default function Users() {
  return (
    <PermissionGuard 
      permission={Permission.USER_UPDATE}
      fallback={<div>你没有权限访问此页面</div>}
    >
      <ProTable {...} />
    </PermissionGuard>
  );
}
```

---

## 📊 6. 权限矩阵

### 应用级别权限

| 应用 | Super Admin | Admin | Editor | Viewer | Guest |
|------|------------|-------|--------|--------|-------|
| **Activities** | ✅ 完全访问 | ✅ 管理 | ✅ 编辑 | ✅ 只读 | ❌ |
| **Admin System 1** | ✅ 完全访问 | ✅ 管理 | ✅ 编辑 | ✅ 只读 | ❌ |
| **Admin System 3** | ✅ 完全访问 | ✅ 管理 | ✅ 编辑 | ✅ 只读 | ❌ |
| **DApp** | ✅ 完全访问 | ✅ 管理 | ❌ | ❌ | ✅ 只读 |

### 功能级别权限

| 功能 | Super Admin | Admin | Editor | Viewer |
|------|------------|-------|--------|--------|
| **用户管理** | CRUD | CRU | R | R |
| **内容管理** | CRUD + 发布 | CRUD | CRU | R |
| **系统配置** | RW | RW | - | - |
| **操作日志** | R | R | R | R |
| **Web3 操作** | RW | R | - | - |

### 代码访问权限

| 路径 | Team Leads | Core Team | App Teams | DevOps | 说明 |
|------|-----------|-----------|-----------|--------|------|
| `/apps/` | ✅ | ❌ | ✅ (自己的) | ❌ | 应用代码 |
| `/packages/` | ✅ | ✅ | ❌ | ❌ | 共享包 |
| `/docker/` | ✅ | ❌ | ❌ | ✅ | Docker 配置 |
| `/docs/` | ✅ | ✅ | ✅ | ✅ | 文档 |
| 根配置文件 | ✅ | ❌ | ❌ | ❌ | package.json 等 |

---

## 🛠️ 7. 实施步骤

### Phase 1: 代码级别权限（立即）

1. **创建 CODEOWNERS 文件**
   ```bash
   touch .github/CODEOWNERS
   # 参考上面的模板
   ```

2. **配置分支保护**
   - GitHub Settings → Branches → Add rule
   - 设置 main 和 develop 分支保护

3. **添加团队成员**
   - GitHub Settings → Manage access
   - 创建团队并分配权限

### Phase 2: 包管理权限（1周内）

1. **创建 npm 组织**
   ```bash
   npm org create puff
   ```

2. **配置包访问**
   ```bash
   # 为每个包配置访问权限
   npm access restricted @puff/shared-auth
   ```

3. **更新 package.json**
   - 添加 publishConfig
   - 更新包名为 @puff/xxx

### Phase 3: 应用权限（2周内）

1. **创建共享认证包**
   ```bash
   mkdir -p packages/shared-auth
   # 实现 RBAC 系统
   ```

2. **集成到应用**
   - 在各应用中引入 @puff/shared-auth
   - 配置路由权限
   - 添加 UI 权限控制

3. **后端 API 集成**
   - 实现 JWT 认证
   - 实现权限中间件
   - 数据库权限表设计

### Phase 4: CI/CD 权限（1周内）

1. **配置 Jenkins 权限**
   - 安装 Role-based Authorization Strategy 插件
   - 创建角色和用户组

2. **更新 Pipeline**
   - 添加权限检查阶段
   - 实现审批流程

---

## 📝 8. 配置文件示例

### CODEOWNERS 完整示例

```
# 默认所有者
* @zhanghe @team-leads

# Apps
/apps/activities/ @activities-team @frontend-lead
/apps/admin-system-1/ @admin-team @frontend-lead
/apps/admin-system-3/ @admin-team @frontend-lead
/apps/dapp/ @dapp-team @web3-lead

# Packages - 更严格的审查
/packages/shared-auth/ @core-team @security-team @tech-lead
/packages/shared-utils/ @core-team @tech-lead
/packages/shared-ui/ @core-team @design-system-team

# Infrastructure
/docker/ @devops-team @infra-lead
/Dockerfile* @devops-team @infra-lead
/Jenkinsfile @devops-team @infra-lead
/.github/ @devops-team @infra-lead
/build-docker.sh @devops-team @infra-lead

# Configuration - 需要最高权限
/package.json @zhanghe @tech-lead
/pnpm-workspace.yaml @zhanghe @tech-lead
/tsconfig.json @zhanghe @tech-lead
/pnpm-lock.yaml @zhanghe @tech-lead

# Documentation
/docs/ @tech-writers @all-teams
/*.md @tech-writers @team-leads
```

### .npmrc 配置

```ini
# .npmrc
# npm 组织配置
@puff:registry=https://registry.npmjs.org/
# 或使用私有 registry
# @puff:registry=https://npm.yourcompany.com/

# 自动保存精确版本
save-exact=true

# pnpm 特定配置
shamefully-hoist=false
strict-peer-dependencies=true
```

---

## ✅ 9. 最佳实践

### Do's ✅

1. **最小权限原则**
   - 默认给最小权限
   - 按需申请和审批

2. **定期审计**
   - 每季度审查权限
   - 及时回收离职员工权限

3. **文档化**
   - 记录所有权限变更
   - 维护权限申请流程文档

4. **自动化**
   - 使用 CI/CD 自动检查权限
   - 自动化权限审批流程

5. **分层设计**
   - 代码访问权限
   - 运行时权限
   - 数据权限

### Don'ts ❌

1. **不要硬编码权限**
   ```typescript
   // ❌ 不好
   if (user.email === 'admin@example.com') {
     // 管理员逻辑
   }
   
   // ✅ 好
   if (hasPermission(Permission.ADMIN_ACCESS)) {
     // 管理员逻辑
   }
   ```

2. **不要跳过权限检查**
   ```typescript
   // ❌ 不好 - 直接执行
   deleteUser(userId);
   
   // ✅ 好 - 先检查权限
   if (hasPermission(Permission.USER_DELETE)) {
     deleteUser(userId);
   }
   ```

3. **不要在前端依赖权限**
   - 前端权限只是 UI 优化
   - 后端必须有完整的权限检查

4. **不要共享账号**
   - 每个人使用独立账号
   - 便于审计和追踪

---

## 🎯 总结

### 当前项目建议

对于你的 puff-monorepo 项目，建议实施：

#### 立即实施（高优先级）✅
1. **CODEOWNERS** - 保护关键代码
2. **分支保护** - 防止直接推送到 main
3. **基础 RBAC** - 应用级别权限控制

#### 近期实施（中优先级）
1. **共享认证包** - 统一权限管理
2. **npm 组织** - 包访问控制
3. **Jenkins 权限** - CI/CD 安全

#### 长期规划（低优先级）
1. **细粒度权限** - 功能级别控制
2. **审计日志** - 完整的操作记录
3. **SSO 集成** - 企业级认证

### 实施成本

| 阶段 | 工作量 | 时间 | 难度 |
|------|--------|------|------|
| CODEOWNERS + 分支保护 | 1人天 | 1天 | 低 |
| 基础 RBAC 系统 | 5人天 | 1周 | 中 |
| 完整权限系统 | 15人天 | 3周 | 高 |

---

## 📚 参考资源

- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [npm 权限管理](https://docs.npmjs.com/about-access-tokens)
- [RBAC 设计模式](https://en.wikipedia.org/wiki/Role-based_access_control)
- [Jenkins 权限插件](https://plugins.jenkins.io/role-strategy/)
