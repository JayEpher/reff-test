# Monorepo Workspace 依赖构建问题修复

## 问题描述

Jenkins 构建失败，TypeScript 找不到 workspace 内部依赖：

```
error TS2307: Cannot find module '@puff/ui' or its corresponding type declarations.
```

## 根本原因

在 Dockerfile 的构建阶段，直接构建应用时：

```dockerfile
RUN pnpm --filter "@puff/${APP_NAME}" build
```

此时 workspace 内部的依赖包（`@puff/ui`, `@puff/api` 等）**还没有被构建**，只有源代码，没有编译后的 `dist` 目录。

## Monorepo 构建顺序

在 monorepo 中，如果应用依赖其他 workspace packages，必须：

1. ✅ **先构建被依赖的 packages**（如 `@puff/ui`）
2. ✅ **再构建应用本身**（如 `@puff/activities`）

否则会找不到模块或类型声明。

## 解决方案

### 使用 pnpm 的 `...` 语法

pnpm 提供了一个强大的过滤器语法：

```dockerfile
RUN pnpm --filter "@puff/${APP_NAME}..." build
```

**`...` 的含义：**
- 包含目标包本身
- **以及它所有的 workspace 依赖**
- pnpm 会自动按**拓扑顺序**构建

### 构建流程示例

对于 `@puff/activities` 应用：

```
依赖关系：
@puff/activities
├── @puff/ui ────────┐
├── @puff/api ───────┤
├── @puff/types ─────┼── 都是 workspace 依赖
├── @puff/utils ─────┘
└── react (外部依赖，node_modules)

构建顺序（自动计算）：
1. @puff/types  (被其他包依赖)
2. @puff/utils  (被其他包依赖)
3. @puff/ui     (依赖 types)
4. @puff/api    (依赖 types, utils)
5. @puff/activities  (最后构建)
```

### 其他可行方案（不推荐）

**方案 2: 手动构建所有 packages**

```dockerfile
# 先构建所有 shared packages
RUN pnpm --filter "@puff/*" --filter "!@puff/${APP_NAME}" build

# 再构建应用
RUN pnpm --filter "@puff/${APP_NAME}" build
```

**缺点：**
- ❌ 构建了不需要的 packages（浪费时间）
- ❌ 需要手动排除目标应用
- ❌ 没有利用 pnpm 的智能依赖解析

**方案 3: 使用 turbo 构建**

```dockerfile
RUN pnpm --filter "@puff/${APP_NAME}" exec turbo build
```

**缺点：**
- ❌ 需要正确配置 `turbo.json`
- ❌ 增加了复杂度

## pnpm filter 语法参考

| 语法 | 含义 | 示例 |
|------|------|------|
| `--filter <name>` | 仅该包 | `--filter @puff/activities` |
| `--filter <name>...` | 该包 + 其依赖 | `--filter @puff/activities...` |
| `--filter ...<name>` | 依赖该包的所有包 | `--filter ...@puff/ui` |
| `--filter <name>^...` | 仅该包的依赖（不含自己） | `--filter @puff/activities^...` |
| `--filter ./packages/*` | 路径匹配 | `--filter ./packages/shared/*` |

## 验证修复

### 1. 本地测试

```bash
# 测试构建命令
pnpm --filter "@puff/activities..." build

# 应该看到构建顺序：
# Building @puff/types
# Building @puff/utils  
# Building @puff/ui
# Building @puff/api
# Building @puff/activities
```

### 2. Docker 测试

```bash
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg APP_NAME=activities \
  --build-arg BUILD_ENV=production \
  --target builder \
  -t test-builder \
  -f Dockerfile.universal \
  .

# 检查构建产物
docker run --rm test-builder sh -c "ls -la /app/packages/shared/ui/dist"
docker run --rm test-builder sh -c "ls -la /app/apps/activities/dist"
```

### 3. Jenkins 验证

提交代码后，Jenkins 应该能成功：

1. ✅ 安装依赖
2. ✅ 构建 shared packages（按顺序）
3. ✅ 构建目标应用
4. ✅ 生成最终镜像

## 常见问题

### 问题 1: 构建时间过长

**现象：** 构建所有依赖需要很长时间

**优化：**

1. 使用 Docker 缓存层：
   ```dockerfile
   # dependencies 阶段缓存依赖安装
   # builder 阶段缓存代码构建
   ```

2. 并行构建（如果包之间没有依赖关系）：
   ```bash
   pnpm --filter "@puff/activities..." build --workspace-concurrency=4
   ```

3. 使用 turbo 的增量构建：
   ```bash
   pnpm exec turbo build --filter=@puff/activities
   ```

### 问题 2: 内存不足

**现象：** 构建时 Docker 容器内存溢出

**解决：**

1. 限制并发数：
   ```dockerfile
   RUN pnpm --filter "@puff/${APP_NAME}..." build --workspace-concurrency=2
   ```

2. 增加 Docker 内存限制：
   ```bash
   docker build --memory=4g ...
   ```

3. 使用多阶段构建（已实现）

### 问题 3: 找不到类型声明

**现象：** 运行时正常，但 TypeScript 报错找不到类型

**原因：** shared package 没有正确导出类型

**检查：**

```bash
# 查看 package.json 的 types 字段
cat packages/shared/ui/package.json | grep types

# 应该有：
"types": "./dist/index.d.ts"
```

**修复：**

确保 `tsup.config.ts` 生成类型声明：

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,  // 生成 .d.ts 文件
  splitting: false,
  sourcemap: true,
  clean: true,
});
```

## 性能优化建议

### 1. 使用 BuildKit 缓存

```bash
export DOCKER_BUILDKIT=1

docker build \
  --cache-from type=registry,ref=107.173.87.162:8001/puff/activities:cache \
  --cache-to type=inline \
  --build-arg APP_NAME=activities \
  -t 107.173.87.162:8001/puff/activities:latest \
  -f Dockerfile.universal \
  .
```

### 2. 分离 shared packages 构建层

如果 shared packages 很少变化，可以创建单独的缓存层：

```dockerfile
FROM dependencies AS shared-builder
COPY packages ./packages
RUN pnpm --filter "./packages/**" build

FROM shared-builder AS app-builder
COPY apps/${APP_NAME} ./apps/${APP_NAME}
RUN pnpm --filter "@puff/${APP_NAME}" build
```

### 3. 使用 turbo 的远程缓存

配置 turbo 使用远程缓存，避免重复构建：

```json
{
  "remoteCache": {
    "signature": true
  }
}
```

## 最佳实践总结

1. ✅ 使用 `pnpm --filter <package>...` 自动处理依赖顺序
2. ✅ 利用 Docker 多阶段构建减小最终镜像大小
3. ✅ 合理使用缓存层避免重复构建
4. ✅ shared packages 必须正确配置入口和类型声明
5. ✅ 考虑使用 turbo 进行增量构建和缓存
6. ✅ 限制并发数避免内存问题

## 相关文件

- `Dockerfile.universal` - 通用 Dockerfile
- `pnpm-workspace.yaml` - Workspace 配置
- `turbo.json` - Turbo 构建配置
- `packages/shared/*/package.json` - 各 shared package 配置
- `packages/shared/*/tsup.config.ts` - 构建配置

## 参考资料

- [pnpm filtering](https://pnpm.io/filtering)
- [pnpm workspace](https://pnpm.io/workspaces)
- [turbo handbook](https://turbo.build/repo/docs/handbook)
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
