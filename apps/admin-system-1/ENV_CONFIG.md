# Admin System 1 - 环境配置说明

## 环境变量配置

本项目支持多环境配置（开发、测试、生产），用于区分接口地址和 Web3 链配置。

### 环境变量文件

- `.env` - 默认配置
- `.env.development` - 开发环境配置（Goerli 测试网）
- `.env.test` - 测试环境配置（Sepolia 测试网）
- `.env.production` - 生产环境配置（Ethereum 主网）
- `.env.local.example` - 本地配置模板

### 配置本地环境

```bash
# 复制配置模板
cp .env.local.example .env.local

# 编辑 .env.local 填入你的配置
# .env.local 会覆盖其他环境变量文件，且不会被提交到 git
```

### 环境变量说明

```bash
API_BASE_URL=https://dev-api.example.com       # API 基础地址
WEB3_CHAIN_ID=5                                # 链 ID（1=主网, 5=Goerli, 11155111=Sepolia）
WEB3_RPC_URL=https://goerli.infura.io/v3/YOUR_KEY  # RPC 节点地址
WEB3_CHAIN_NAME=Goerli                         # 链名称
WEB3_EXPLORER_URL=https://goerli.etherscan.io  # 区块浏览器地址
```

### 在代码中使用

```typescript
import { config, isDevelopment } from '@/config/env';

// API 请求
fetch(`${config.apiBaseUrl}/users/123`);

// Web3 配置
console.log(config.web3.chainId);  // 5
console.log(config.web3.chainName); // "Goerli"

// 环境判断
if (isDevelopment) {
  console.log('开发环境');
}
```

### 运行和构建命令

```bash
# 开发模式
pnpm dev           # 使用开发环境变量
pnpm dev:test      # 使用测试环境变量
pnpm dev:prod      # 使用生产环境变量

# 构建
pnpm build         # 使用生产环境变量构建（默认）
pnpm build:dev     # 使用开发环境变量构建
pnpm build:test    # 使用测试环境变量构建
pnpm build:prod    # 使用生产环境变量构建
```

## UmiJS 环境变量机制

UmiJS 通过 `UMI_ENV` 环境变量来选择对应的 `.env` 文件：

- `UMI_ENV=development` → 加载 `.env.development`
- `UMI_ENV=test` → 加载 `.env.test`
- `UMI_ENV=production` → 加载 `.env.production`
- 未设置 → 加载 `.env`

环境变量在 `.umirc.ts` 的 `define` 配置中被注入到代码中。

## 使用示例

### 1. API 请求

```typescript
import { config } from '@/config/env';
import { request } from '@umijs/max';

export const getUserList = () => {
  return request(`${config.apiBaseUrl}/api/users`);
};
```

### 2. Web3 连接

```typescript
import { config } from '@/config/env';

export const switchNetwork = async () => {
  if (window.ethereum) {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${config.web3.chainId.toString(16)}` }],
    });
  }
};
```

### 3. 环境特定功能

```typescript
import { isDevelopment } from '@/config/env';

// 开发环境显示调试信息
if (isDevelopment) {
  console.log('Debug mode enabled');
}
```

## 注意事项

1. 不要将 `.env.local` 提交到 git
2. 敏感信息（如 API Key）应存储在 `.env.local` 中
3. 环境变量需要在 `.umirc.ts` 的 `define` 中声明才能使用
4. 修改环境变量后需要重启开发服务器
5. 构建时会根据 `UMI_ENV` 使用对应的环境变量

## 安装依赖

首次使用需要安装 `cross-env` 依赖（跨平台环境变量设置）：

```bash
pnpm install
```
