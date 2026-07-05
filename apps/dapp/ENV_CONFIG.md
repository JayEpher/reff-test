# DApp - 环境配置说明

## 环境变量配置

本项目使用 Next.js 15，支持多环境配置（开发、测试、生产），用于区分接口地址和 Web3 链配置。

### 环境变量文件

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
NEXT_PUBLIC_API_BASE_URL=https://dev-api.example.com       # API 基础地址
NEXT_PUBLIC_WEB3_CHAIN_ID=5                                # 链 ID（1=主网, 5=Goerli, 11155111=Sepolia）
NEXT_PUBLIC_WEB3_RPC_URL=https://goerli.infura.io/v3/YOUR_KEY  # RPC 节点地址
NEXT_PUBLIC_WEB3_CHAIN_NAME=Goerli                         # 链名称
NEXT_PUBLIC_WEB3_EXPLORER_URL=https://goerli.etherscan.io  # 区块浏览器地址
```

**重要提示**：
- Next.js 中，只有以 `NEXT_PUBLIC_` 开头的环境变量才会暴露给浏览器端
- 不带 `NEXT_PUBLIC_` 前缀的变量只能在服务器端使用

### 在代码中使用

```typescript
import { config, isDevelopment } from '@/config/env';

// 在 Server Component 中
async function ServerComponent() {
  const data = await fetch(`${config.apiBaseUrl}/users`);
  return <div>{/* ... */}</div>;
}

// 在 Client Component 中
'use client';
function ClientComponent() {
  console.log(config.apiBaseUrl);
  console.log(config.web3.chainId);
  return <div>{/* ... */}</div>;
}
```

### 运行和构建命令

```bash
# 开发模式
pnpm dev           # 使用开发环境变量（默认）
pnpm dev:test      # 使用测试环境变量
pnpm dev:prod      # 使用生产环境变量

# 构建
pnpm build         # 使用生产环境变量构建（默认）
pnpm build:dev     # 使用开发环境变量构建
pnpm build:test    # 使用测试环境变量构建
pnpm build:prod    # 使用生产环境变量构建

# 启动生产服务器
pnpm start         # 启动构建后的生产服务器
```

## Next.js 环境变量机制

### 加载顺序

Next.js 按以下顺序加载环境变量文件（后面的会覆盖前面的）：

1. `.env` - 所有环境
2. `.env.development` / `.env.production` / `.env.test` - 特定环境
3. `.env.local` - 本地覆盖（所有环境）
4. `.env.development.local` / `.env.production.local` / `.env.test.local` - 本地覆盖（特定环境）

### 环境变量类型

#### 1. 公共变量（浏览器端可用）

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

以 `NEXT_PUBLIC_` 开头的变量会被内联到浏览器端代码中。

#### 2. 服务器端变量（仅服务器端可用）

```bash
DATABASE_URL=postgres://...
API_SECRET_KEY=secret123
```

不带 `NEXT_PUBLIC_` 前缀的变量只能在服务器端使用（Server Components、API Routes、Server Actions）。

## 使用示例

### 1. Server Component 中使用

```typescript
// app/users/page.tsx
import { config } from '@/config/env';

export default async function UsersPage() {
  // 在服务器端运行，可以访问所有环境变量
  const response = await fetch(`${config.apiBaseUrl}/users`, {
    cache: 'no-store', // 或 'force-cache' 用于 SSG
  });
  const users = await response.json();

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 2. Client Component 中使用

```typescript
// app/components/WalletConnect.tsx
'use client';

import { config } from '@/config/env';
import { useState } from 'react';

export default function WalletConnect() {
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: \`0x\${config.web3.chainId.toString(16)}\` }],
        });
        setConnected(true);
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    }
  };

  return (
    <button onClick={connectWallet}>
      {connected ? 'Connected' : 'Connect Wallet'}
    </button>
  );
}
```

### 3. API Route 中使用

```typescript
// app/api/users/route.ts
import { config } from '@/config/env';

export async function GET() {
  const response = await fetch(\`\${config.apiBaseUrl}/users\`);
  const data = await response.json();
  return Response.json(data);
}
```

### 4. Server Action 中使用

```typescript
// app/actions/user.ts
'use server';

import { config } from '@/config/env';

export async function createUser(formData: FormData) {
  const response = await fetch(\`\${config.apiBaseUrl}/users\`, {
    method: 'POST',
    body: JSON.stringify({
      name: formData.get('name'),
    }),
  });
  return response.json();
}
```

### 5. 环境特定功能

```typescript
import { isDevelopment, isProduction } from '@/config/env';

// 开发环境显示调试信息
if (isDevelopment) {
  console.log('Debug mode enabled');
}

// 生产环境启用分析
if (isProduction) {
  // 初始化分析工具
}
```

## Next.js 15 特性支持

### App Router

本项目使用 Next.js 15 的 App Router，支持：

- ✅ Server Components（默认）
- ✅ Client Components（使用 'use client'）
- ✅ Server Actions（使用 'use server'）
- ✅ Route Handlers（API Routes）
- ✅ SSR、SSG、ISR

### 渲染策略

```typescript
// SSR (Server-Side Rendering) - 每次请求时渲染
export default async function SSRPage() {
  const data = await fetch(\`\${config.apiBaseUrl}/data\`, {
    cache: 'no-store',
  });
  return <div>{/* ... */}</div>;
}

// SSG (Static Site Generation) - 构建时渲染
export default async function SSGPage() {
  const data = await fetch(\`\${config.apiBaseUrl}/data\`, {
    cache: 'force-cache',
  });
  return <div>{/* ... */}</div>;
}

// ISR (Incremental Static Regeneration) - 定期重新生成
export default async function ISRPage() {
  const data = await fetch(\`\${config.apiBaseUrl}/data\`, {
    next: { revalidate: 3600 }, // 每小时重新生成
  });
  return <div>{/* ... */}</div>;
}

// CSR (Client-Side Rendering) - 在客户端渲染
'use client';
export default function CSRPage() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch(\`\${config.apiBaseUrl}/data\`)
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

## 注意事项

1. **不要将 `.env.local` 提交到 git** - 已在 .gitignore 中配置
2. **敏感信息（如 API Key）应存储在 `.env.local` 中**
3. **修改环境变量后需要重启开发服务器**
4. **只有 `NEXT_PUBLIC_` 开头的变量才能在浏览器端使用**
5. **环境变量在构建时被内联到代码中**
6. **不要在 Client Components 中使用服务器端专用的环境变量**

## 部署

### Vercel 部署

在 Vercel 项目设置中添加环境变量：

1. 进入项目设置 → Environment Variables
2. 添加所有 `NEXT_PUBLIC_*` 变量
3. 选择对应的环境（Development / Preview / Production）

### 其他平台部署

确保在部署平台配置所有必需的环境变量，包括：

- \`NEXT_PUBLIC_API_BASE_URL\`
- \`NEXT_PUBLIC_WEB3_CHAIN_ID\`
- \`NEXT_PUBLIC_WEB3_RPC_URL\`
- \`NEXT_PUBLIC_WEB3_CHAIN_NAME\`
- \`NEXT_PUBLIC_WEB3_EXPLORER_URL\`

## 技术栈信息

- **框架**: Next.js 15.0.4
- **React**: v19.0.0
- **TypeScript**: v5
- **样式**: Tailwind CSS v3.4.1
- **渲染模式**: App Router (Server Components + Client Components)
