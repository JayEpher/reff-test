# 环境配置对比 - Activities vs Admin System 1

## 概览

两个应用都已完成环境变量配置，但由于使用不同的构建工具（Vite vs UmiJS），实现方式有所不同。

## 对比表

| 特性 | Activities (Vite) | Admin System 1 (UmiJS) |
|------|-------------------|------------------------|
| 构建工具 | Vite | UmiJS (Max) |
| 环境变量前缀 | `VITE_` | 无要求 |
| 访问方式 | `import.meta.env` | `process.env` |
| 类型定义文件 | `src/vite-env.d.ts` | `src/typings.d.ts` |
| 环境切换 | `--mode` flag | `UMI_ENV` 环境变量 |
| 配置注入 | 自动 | 需在 `.umirc.ts` 的 `define` 中声明 |
| 跨平台工具 | 不需要 | `cross-env` |

## 文件结构对比

### Activities
\`\`\`
apps/activities/
├── .env.development          # 开发环境
├── .env.test                 # 测试环境
├── .env.production           # 生产环境
├── .env.local.example        # 配置模板
├── src/
│   ├── vite-env.d.ts         # 类型定义
│   └── config/
│       ├── env.ts            # 配置模块
│       ├── index.ts          # 导出
│       └── usage-example.ts  # 使用示例
└── vite.config.ts            # Vite 配置
\`\`\`

### Admin System 1
\`\`\`
apps/admin-system-1/
├── .env                      # 默认配置
├── .env.development          # 开发环境
├── .env.test                 # 测试环境
├── .env.production           # 生产环境
├── .env.local.example        # 配置模板
├── src/
│   ├── typings.d.ts          # 类型定义
│   └── config/
│       ├── env.ts            # 配置模块
│       ├── index.ts          # 导出
│       └── usage-example.ts  # 使用示例
└── .umirc.ts                 # UmiJS 配置
\`\`\`

## 环境变量对比

### Activities (Vite)
\`\`\`bash
VITE_ENV=development
VITE_API_BASE_URL=https://dev-api.example.com
VITE_WEB3_CHAIN_ID=5
VITE_WEB3_RPC_URL=https://goerli.infura.io/v3/YOUR_KEY
VITE_WEB3_CHAIN_NAME=Goerli
VITE_WEB3_EXPLORER_URL=https://goerli.etherscan.io
\`\`\`

### Admin System 1 (UmiJS)
\`\`\`bash
API_BASE_URL=https://dev-api.example.com
WEB3_CHAIN_ID=5
WEB3_RPC_URL=https://goerli.infura.io/v3/YOUR_KEY
WEB3_CHAIN_NAME=Goerli
WEB3_EXPLORER_URL=https://goerli.etherscan.io
\`\`\`

## 代码使用对比

### Activities (Vite)
\`\`\`typescript
// 类型定义 (vite-env.d.ts)
interface ImportMetaEnv {
  readonly VITE_ENV: 'development' | 'test' | 'production';
  readonly VITE_API_BASE_URL: string;
  // ...
}

// 配置模块 (config/env.ts)
export const config: AppConfig = {
  env: import.meta.env.VITE_ENV || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  web3: {
    chainId: parseInt(import.meta.env.VITE_WEB3_CHAIN_ID, 10),
    // ...
  },
};

// 使用
import { config } from '@/config/env';
fetch(\`\${config.apiBaseUrl}/users\`);
\`\`\`

### Admin System 1 (UmiJS)
\`\`\`typescript
// 类型定义 (typings.d.ts)
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    API_BASE_URL: string;
    // ...
  }
}

// 配置模块 (config/env.ts)
export const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  apiBaseUrl: process.env.API_BASE_URL,
  web3: {
    chainId: parseInt(process.env.WEB3_CHAIN_ID, 10),
    // ...
  },
};

// 使用
import { config } from '@/config/env';
fetch(\`\${config.apiBaseUrl}/users\`);
\`\`\`

## 构建命令对比

### Activities (Vite)
\`\`\`bash
pnpm dev              # 开发环境
pnpm build            # 生产构建
pnpm build:dev        # 开发构建
pnpm build:test       # 测试构建
pnpm build:prod       # 生产构建
\`\`\`

### Admin System 1 (UmiJS)
\`\`\`bash
pnpm dev              # 开发环境
pnpm dev:test         # 测试环境
pnpm dev:prod         # 生产环境
pnpm build            # 生产构建
pnpm build:dev        # 开发构建
pnpm build:test       # 测试构建
pnpm build:prod       # 生产构建
\`\`\`

## 配置文件对比

### Activities (vite.config.ts)
\`\`\`typescript
export default defineConfig({
  plugins: [react()],
  // Vite 自动加载环境变量
  // 无需额外配置
});
\`\`\`

### Admin System 1 (.umirc.ts)
\`\`\`typescript
export default defineConfig({
  // 需要显式声明环境变量
  define: {
    'process.env.API_BASE_URL': process.env.API_BASE_URL,
    'process.env.WEB3_CHAIN_ID': process.env.WEB3_CHAIN_ID,
    'process.env.WEB3_RPC_URL': process.env.WEB3_RPC_URL,
    'process.env.WEB3_CHAIN_NAME': process.env.WEB3_CHAIN_NAME,
    'process.env.WEB3_EXPLORER_URL': process.env.WEB3_EXPLORER_URL,
  },
});
\`\`\`

## 最佳实践

### 相同点
1. 使用 `.env.local` 存储本地覆盖配置
2. 不将 `.env.local` 提交到 git
3. 敏感信息存储在 `.env.local` 中
4. 提供 `.env.local.example` 作为模板

### 不同点

**Activities (Vite)**
- 环境变量必须以 `VITE_` 开头才能暴露给客户端
- 使用 `--mode` flag 切换环境
- 更简单的配置，无需额外声明

**Admin System 1 (UmiJS)**
- 环境变量名称更灵活
- 使用 `UMI_ENV` 环境变量切换
- 需要在 `.umirc.ts` 中显式声明
- 需要 `cross-env` 确保跨平台兼容

## 统一的配置 API

尽管底层实现不同，但两个应用提供了统一的配置 API：

\`\`\`typescript
import { config, isDevelopment, isTest, isProduction } from '@/config/env';

// 统一的使用方式
console.log(config.apiBaseUrl);
console.log(config.web3.chainId);
console.log(isDevelopment);
\`\`\`

这确保了代码在不同应用之间的可移植性。
