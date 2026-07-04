# 项目结构说明

## 目录结构

```
puff-monorepo/
├── .changeset/                    # Changeset 配置
│   ├── config.json
│   └── README.md
├── apps/                          # 应用程序
│   ├── activities/                # 活动页面
│   │   ├── halloween/             # 万圣节活动
│   │   ├── team/                  # 组队活动 (待创建)
│   │   ├── checkin/               # 签到页 (待创建)
│   │   └── mini-game/             # 小游戏 (待创建)
│   ├── admin-system-1/            # 后台管理系统 1
│   ├── admin-system-2/            # 后台管理系统 2
│   ├── dapp/                      # DApp Web 应用
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── mobile/                    # React Native 移动端
│       ├── src/
│       └── package.json
├── packages/                      # 共享包
│   └── shared/
│       ├── api/                   # API 调用层
│       │   ├── src/index.ts
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   └── tsup.config.ts
│       ├── business-logic/        # 业务逻辑
│       │   ├── src/index.ts
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   └── tsup.config.ts
│       ├── config/                # 配置
│       │   ├── src/index.ts
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   └── tsup.config.ts
│       ├── types/                 # 类型定义
│       │   ├── src/index.ts
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   └── tsup.config.ts
│       ├── ui/                    # UI 组件
│       │   ├── src/
│       │   │   ├── Button.tsx
│       │   │   └── index.ts
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   └── tsup.config.ts
│       └── utils/                 # 工具函数
│           ├── src/index.ts
│           ├── package.json
│           ├── tsconfig.json
│           └── tsup.config.ts
├── .gitignore
├── .prettierrc
├── package.json                   # 根 package.json
├── pnpm-workspace.yaml            # pnpm workspace 配置
├── README.md
├── tsconfig.json                  # 根 TypeScript 配置
└── turbo.json                     # Turborepo 配置
```

## 包命名规范

### 应用 (apps/)

- `@puff/mobile` - React Native 移动端
- `@puff/dapp` - DApp Web 应用
- `@puff/admin-system-1` - 后台管理系统 1
- `@puff/admin-system-2` - 后台管理系统 2
- `@puff/activity-halloween` - 万圣节活动页
- `@puff/activity-team` - 组队活动页 (待创建)
- `@puff/activity-checkin` - 签到页 (待创建)
- `@puff/activity-mini-game` - 小游戏 (待创建)

### 共享包 (packages/shared/)

- `@puff/ui` - UI 组件库
- `@puff/types` - TypeScript 类型定义
- `@puff/api` - API 调用层
- `@puff/utils` - 工具函数
- `@puff/config` - 配置
- `@puff/business-logic` - 业务逻辑

## 依赖关系图

```
应用层 (apps/)
  ├── mobile
  │   └── 依赖: @puff/ui, @puff/api, @puff/types, @puff/utils, @puff/business-logic, @puff/config
  ├── dapp
  │   └── 依赖: @puff/ui, @puff/api, @puff/types, @puff/utils, @puff/business-logic, @puff/config
  ├── activities/*
  │   └── 依赖: @puff/ui, @puff/api, @puff/types, @puff/utils
  └── admin-system-*
      └── 依赖: @puff/api, @puff/types, @puff/utils

共享包层 (packages/shared/)
  ├── business-logic
  │   └── 依赖: @puff/api, @puff/types, @puff/utils
  ├── api
  │   └── 依赖: @puff/types
  ├── ui
  │   └── 依赖: react, react-dom
  ├── types
  ├── utils
  └── config
```

## 下一步

### 1. 完善其他活动页面

需要创建：

- `apps/activities/team/` - 组队活动
- `apps/activities/checkin/` - 签到页
- `apps/activities/mini-game/` - 小游戏

可以参考 `apps/activities/halloween/` 的结构。

### 2. 配置 React Native

`apps/mobile/` 需要完整的 React Native 配置：

- 添加 `metro.config.js`
- 添加 `babel.config.js`
- 配置 iOS 和 Android 原生项目

### 3. 配置 UmiJS

后台管理系统需要添加：

- `.umirc.ts` 配置文件
- `src/` 目录结构
- 路由配置

### 4. 添加 ESLint

在根目录添加 `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
};
```

### 5. 安装依赖

```bash
cd /Users/zhanghe/self/code/Front-end-Architecture/puff-monorepo
pnpm install
```

### 6. 初始化 Git

```bash
git init
git add .
git commit -m "Initial monorepo setup"
```
