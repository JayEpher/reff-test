# Puff Monorepo

基于 pnpm workspace + Turborepo + Changeset + tsup 搭建的 monorepo 项目。

## 项目结构

```
puff-monorepo/
├── apps/
│   ├── mobile/                    # React Native 移动端 (Expo)
│   ├── dapp/                      # DApp Web 应用 (Vite + React)
│   ├── admin-system-1/            # 后台管理系统 1 (UmiJS)
│   ├── admin-system-2/            # 后台管理系统 2 (UmiJS)
│   └── activities/
│       ├── halloween/             # 万圣节活动页 (Vite + React)
│       ├── team/                  # 组队活动页
│       ├── checkin/               # 签到页
│       └── mini-game/             # 小游戏
├── packages/
│   └── shared/
│       ├── ui/                    # 共享 UI 组件库
│       ├── business-logic/        # 共享业务逻辑
│       ├── types/                 # TypeScript 类型定义
│       ├── api/                   # API 调用层
│       ├── utils/                 # 工具函数
│       └── config/                # 共享配置
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

## 技术栈

- **包管理**: pnpm workspace
- **构建工具**: Turborepo
- **版本管理**: Changeset
- **打包工具**: tsup (用于共享包)
- **移动端**: React Native + Expo + Expo Router
- **Web端**: React + Vite / UmiJS
- **类型检查**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建所有包

```bash
pnpm build
```

### 3. 开发模式

```bash
# 启动所有应用的开发服务器
pnpm dev

# 或者启动特定应用
pnpm --filter @puff/dapp dev
pnpm --filter @puff/activity-halloween dev
```

## 常用命令

### 开发

```bash
# 开发模式（所有应用）
pnpm dev

# 开发特定应用
pnpm --filter @puff/dapp dev
pnpm --filter @puff/mobile dev
pnpm --filter @puff/activity-halloween dev
```

### 构建

```bash
# 构建所有包和应用
pnpm build

# 构建特定包
pnpm --filter @puff/ui build
```

### 测试

```bash
# 运行所有测试
pnpm test

# 测试特定包
pnpm --filter @puff/utils test
```

### 代码质量

```bash
# 运行 lint
pnpm lint

# 格式化代码
pnpm format
```

### 版本管理 (Changeset)

```bash
# 添加 changeset
pnpm changeset

# 更新版本号
pnpm version-packages

# 发布包
pnpm release
```

## 添加新依赖

### 为根项目添加依赖

```bash
pnpm add -w <package-name>
```

### 为特定工作区添加依赖

```bash
pnpm --filter @puff/dapp add <package-name>
```

### 在工作区之间添加依赖

```bash
# 在 dapp 中使用 @puff/ui
pnpm --filter @puff/dapp add @puff/ui@workspace:*
```

## 创建新的共享包

1. 在 `packages/shared/` 下创建新目录
2. 创建 `package.json`，设置 name 为 `@puff/package-name`
3. 添加 `tsup.config.ts` 配置
4. 添加 `tsconfig.json` 继承根配置
5. 在 `src/index.ts` 中导出内容

## 创建新的应用

1. 在 `apps/` 下创建新目录
2. 创建 `package.json`，设置 name 为 `@puff/app-name`
3. 配置构建工具（Vite, UmiJS 等）
4. 在依赖中引用共享包

## 工作流

### 开发新功能

1. 创建功能分支
2. 在相应的包/应用中开发
3. 运行测试和 lint
4. 添加 changeset: `pnpm changeset`
5. 提交代码并创建 PR

### 发布流程

1. 合并 PR 到 main 分支
2. 运行 `pnpm version-packages` 更新版本
3. 运行 `pnpm release` 发布包

## 注意事项

1. **依赖安装**: 始终在根目录使用 `pnpm install`
2. **版本管理**: 共享包使用 changeset 管理版本，应用不需要
3. **构建顺序**: Turborepo 会自动处理依赖顺序
4. **缓存**: Turborepo 会缓存构建结果，加速后续构建

## 环境变量

每个应用可以有自己的 `.env` 文件：

```
apps/dapp/.env.local
apps/mobile/.env
```

## IDE 配置

### VSCode

推荐安装以下扩展：

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

## 疑难解答

### 依赖安装失败

```bash
# 清理所有 node_modules 和锁文件
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 构建缓存问题

```bash
# 清理 Turborepo 缓存
rm -rf .turbo
pnpm build
```

### 类型检查错误

```bash
# 重新构建所有包
pnpm build
```

## 许可证

MIT
