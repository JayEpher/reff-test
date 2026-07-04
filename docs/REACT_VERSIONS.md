# React 版本隔离策略

本项目采用多 React 版本共存方案，支持不同应用使用不同版本的 React。

## React 版本分布

| 应用 | React 版本 | 原因 |
|------|-----------|------|
| **dapp** | 19.0.0 | Next.js 15 需要 React 19 的新特性 |
| **admin-system-1** | 18.3.1 | Umi 4 最佳实践版本 |
| **activities** | 18.3.1 | Umi 4 最佳实践版本 |
| **admin-system-3** | 17.0.2 | Umi 3.5 兼容性要求 |

## 隔离机制

### 1. pnpm 配置 (`.npmrc`)

```ini
shamefully-hoist=false         # 禁用提升，避免版本冲突
strict-peer-dependencies=false  # 允许 peer 依赖警告
node-linker=isolated           # 每个工作区隔离依赖
```

### 2. 共享包策略

#### 无 React 依赖的包（推荐）
- `@puff/types` - 纯类型定义
- `@puff/config` - 配置文件
- `@puff/utils` - 纯 JS 工具函数
- `@puff/api` - API 客户端（不依赖 React）

#### 有 React 依赖的包
- `@puff/ui` - 使用 `peerDependencies: "^17.0.0 || ^18.0.0 || ^19.0.0"`
- `@puff/business-logic` - 如需使用 React Hooks，同样用 peerDependencies

### 3. peerDependencies 规范

所有需要 React 的共享包必须使用 **peerDependencies**，而非 dependencies：

```json
{
  "peerDependencies": {
    "react": "^17.0.0 || ^18.0.0 || ^19.0.0",
    "react-dom": "^17.0.0 || ^18.0.0 || ^19.0.0"
  }
}
```

## 注意事项

### ✅ 可以做的事
- 各应用独立选择 React 版本
- 共享纯 JS/TS 工具函数
- 共享类型定义
- 共享 API 客户端

### ⚠️ 需要注意的事
- 共享 React 组件时确保兼容所有目标版本
- 避免在 @puff/* 包中使用最新 React API（如 use、Suspense 新特性）
- 测试组件在不同 React 版本下的表现

### ❌ 不要做的事
- 不要在共享包中 `dependencies` 锁定 React 版本
- 不要跨应用共享 React Context（会导致多实例问题）
- 不要在共享包中使用版本特定的 API

## 升级指南

如果未来需要统一 React 版本：

1. 选择目标版本（推荐 React 18）
2. 检查各框架兼容性：
   - Umi 3.5 支持 React 16/17/18
   - Umi 4 支持 React 17/18
   - Next.js 15 支持 React 18.3+/19
3. 批量更新各应用的 package.json
4. 运行 `pnpm install`
5. 测试所有应用

## 故障排查

### 问题：TypeScript 报 React 类型冲突

**解决**：在各应用的 `tsconfig.json` 中配置路径优先级：

```json
{
  "compilerOptions": {
    "paths": {
      "react": ["./node_modules/react"],
      "react-dom": ["./node_modules/react-dom"]
    }
  }
}
```

### 问题：pnpm peer 依赖警告

**解决**：这是正常的，已通过 `.npmrc` 配置为警告而非错误。

### 问题：共享 UI 组件在某个版本下异常

**解决**：
1. 检查该组件是否使用了特定版本 API
2. 在 @puff/ui 中添加版本兼容代码
3. 或者移除不兼容版本的支持范围
