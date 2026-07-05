# Admin System 1 环境配置实施总结

## 已创建的文件

### 1. 环境变量文件
- `.env` - 默认配置（开发环境）
- `.env.development` - 开发环境配置（Goerli 测试网）
- `.env.test` - 测试环境配置（Sepolia 测试网）
- `.env.production` - 生产环境配置（Ethereum 主网）
- `.env.local.example` - 本地配置模板
- 更新 `.gitignore` - 忽略本地环境变量文件

### 2. 配置代码
- `src/typings.d.ts` - TypeScript 环境变量类型定义
- `src/config/env.ts` - 环境配置模块（主文件）
- `src/config/index.ts` - 配置模块导出
- `src/config/usage-example.ts` - 使用示例

### 3. 配置文件更新
- 更新 `.umirc.ts` - 添加 `define` 配置注入环境变量
- 更新 `package.json` - 添加多环境运行和构建脚本，添加 `cross-env` 依赖

### 4. 文档
- `ENV_CONFIG.md` - 完整的环境配置说明文档

## 配置内容

### API 配置
- `API_BASE_URL` - API 基础地址

### Web3 配置
- `WEB3_CHAIN_ID` - 链 ID
- `WEB3_RPC_URL` - RPC 节点地址
- `WEB3_CHAIN_NAME` - 链名称
- `WEB3_EXPLORER_URL` - 区块浏览器地址

## 使用方式

### 1. 安装依赖
\`\`\`bash
cd apps/admin-system-1
pnpm install
\`\`\`

### 2. 配置本地环境
\`\`\`bash
cp .env.local.example .env.local
# 编辑 .env.local 填入实际配置
\`\`\`

### 3. 在代码中使用
\`\`\`typescript
import { config, isDevelopment } from '@/config/env';

// 使用 API 配置
fetch(\`\${config.apiBaseUrl}/users\`);

// 使用 Web3 配置
console.log(config.web3.chainId);
\`\`\`

### 4. 运行和构建
\`\`\`bash
pnpm dev           # 使用开发环境
pnpm dev:test      # 使用测试环境
pnpm dev:prod      # 使用生产环境

pnpm build         # 构建生产版本
pnpm build:dev     # 构建开发版本
pnpm build:test    # 构建测试版本
\`\`\`

## UmiJS 特性

### 环境变量加载机制
UmiJS 使用 `UMI_ENV` 环境变量来选择对应的 `.env` 文件：
- `UMI_ENV=development` → `.env.development`
- `UMI_ENV=test` → `.env.test`
- `UMI_ENV=production` → `.env.production`

### 环境变量注入
在 `.umirc.ts` 中通过 `define` 配置将环境变量注入到代码中：
\`\`\`typescript
define: {
  'process.env.API_BASE_URL': process.env.API_BASE_URL,
  'process.env.WEB3_CHAIN_ID': process.env.WEB3_CHAIN_ID,
  // ...
}
\`\`\`

## 特性

✅ 类型安全 - 完整的 TypeScript 类型定义
✅ 环境隔离 - 开发、测试、生产环境独立配置
✅ 本地覆盖 - .env.local 可覆盖任何环境变量
✅ Git 安全 - .env.local 不会提交到版本控制
✅ 易于使用 - 简洁的 API 和使用示例
✅ UmiJS 集成 - 完全兼容 UmiJS 的环境变量机制
✅ 跨平台 - 使用 cross-env 确保跨平台兼容性

## 与 activities 应用的区别

### Activities (Vite)
- 使用 `import.meta.env` 访问环境变量
- 环境变量必须以 `VITE_` 开头
- 直接在 Vite 配置中自动加载

### Admin System 1 (UmiJS)
- 使用 `process.env` 访问环境变量
- 环境变量不需要特定前缀
- 需要在 `.umirc.ts` 的 `define` 中声明
- 使用 `UMI_ENV` 切换环境

## 下一步

1. 安装依赖：`cd apps/admin-system-1 && pnpm install`
2. 根据实际项目填写各环境的真实配置值
3. 将 `YOUR_INFURA_KEY` 替换为实际的 Infura API Key
4. 在需要的页面和组件中引入并使用配置
5. 考虑将敏感信息（如 API Key）存储在 .env.local 中
