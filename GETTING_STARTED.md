# 快速启动指南

## 初始化项目

### 1. 安装依赖

```bash
# 在项目根目录
cd /Users/zhanghe/self/code/Front-end-Architecture/puff-monorepo
pnpm install
```

### 2. 构建共享包

在启动任何应用之前，需要先构建共享包：

```bash
pnpm build
```

这会构建所有 `packages/shared/*` 下的包。

## 启动应用

### Mobile App (Expo)

```bash
# 方式1：从根目录启动
pnpm --filter @puff/mobile dev

# 方式2：进入目录启动
cd apps/mobile
pnpm dev
```

启动后：

- 按 `i` 打开 iOS 模拟器
- 按 `a` 打开 Android 模拟器
- 按 `w` 在浏览器中打开
- 扫描二维码在真机运行（需安装 Expo Go）

**注意**：首次运行可能需要：

1. 安装 Expo Go App（真机调试）
2. 配置 iOS 模拟器（Mac）
3. 配置 Android 模拟器（需要 Android Studio）

### DApp (Web)

```bash
# 从根目录启动
pnpm --filter @puff/dapp dev

# 或
cd apps/dapp
pnpm dev
```

访问：http://localhost:3000

### 万圣节活动页

```bash
pnpm --filter @puff/activity-halloween dev
```

访问：http://localhost:5173

### 后台管理系统

```bash
# 管理系统 1
pnpm --filter @puff/admin-system-1 dev

# 管理系统 2
pnpm --filter @puff/admin-system-2 dev
```

## 常见问题

### 问题1：共享包找不到

**错误**：Cannot find module '@puff/types'

**解决**：确保已构建共享包

```bash
pnpm build
# 或只构建特定包
pnpm --filter @puff/types build
```

### 问题2：Mobile app 无法启动

**错误**：Expo 相关错误

**解决**：

```bash
cd apps/mobile
# 清理缓存
rm -rf node_modules .expo
cd ../..
pnpm install
pnpm --filter @puff/mobile dev --clear
```

### 问题3：TypeScript 类型错误

**解决**：

```bash
# 重新构建所有包
pnpm build

# 检查类型
pnpm --filter @puff/dapp tsc --noEmit
```

### 问题4：依赖安装失败

**解决**：

```bash
# 清理所有依赖
pnpm clean
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

## 开发工作流

### 1. 修改共享包

当修改 `packages/shared/*` 中的代码时：

```bash
# 方式1：自动监听重新构建
pnpm --filter @puff/ui dev

# 方式2：手动重新构建
pnpm --filter @puff/ui build
```

### 2. 添加新的共享包

参考现有包的结构，例如 `packages/shared/ui`：

1. 创建包目录和文件
2. 配置 `package.json`
3. 配置 `tsup.config.ts`
4. 配置 `tsconfig.json`
5. 在需要使用的应用中添加依赖

### 3. 添加依赖

```bash
# 为特定应用添加依赖
pnpm --filter @puff/dapp add lodash

# 为共享包添加依赖
pnpm --filter @puff/utils add date-fns

# 添加开发依赖
pnpm --filter @puff/ui add -D @types/react
```

## 推荐开发顺序

### 首次开发

1. **先构建共享包**

   ```bash
   pnpm build
   ```

2. **启动一个应用测试**

   ```bash
   pnpm --filter @puff/dapp dev
   ```

3. **完善共享包内容**
   - 在 `packages/shared` 中添加更多组件、工具、类型
   - 开启 watch 模式：`pnpm --filter @puff/ui dev`

4. **在各个应用中使用共享包**
   - 在 mobile、dapp、activities 中使用共享的组件和逻辑

### 日常开发

1. 启动需要开发的应用
2. 如果修改共享包，开启对应包的 dev 模式
3. 应用会自动热更新

## 性能优化

### Turborepo 缓存

Turborepo 会缓存构建结果，第二次构建会很快。

查看缓存：

```bash
ls -la .turbo
```

清理缓存：

```bash
rm -rf .turbo
```

### 并行开发

可以同时启动多个终端：

- 终端1：`pnpm --filter @puff/ui dev`（监听共享包变化）
- 终端2：`pnpm --filter @puff/dapp dev`（Web 应用）
- 终端3：`pnpm --filter @puff/mobile dev`（移动应用）

## 下一步

1. ✅ 熟悉项目结构
2. ✅ 启动一个应用
3. ⬜ 添加更多 UI 组件到 `@puff/ui`
4. ⬜ 完善业务逻辑到 `@puff/business-logic`
5. ⬜ 实现真实的 API 调用
6. ⬜ 添加更多活动页面
7. ⬜ 配置 CI/CD

## 有用的命令

```bash
# 查看所有工作区
pnpm -r list

# 查看依赖关系
pnpm why <package-name>

# 更新依赖
pnpm update

# 检查过时的依赖
pnpm outdated

# 运行所有测试
pnpm test

# 代码格式化
pnpm format

# Lint 检查
pnpm lint
```
