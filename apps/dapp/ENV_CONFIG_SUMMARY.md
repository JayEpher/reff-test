# DApp 环境配置实施总结

## 已创建的文件

### 1. 环境变量文件
- `.env.development` - 开发环境配置（Goerli 测试网）
- `.env.test` - 测试环境配置（Sepolia 测试网）
- `.env.production` - 生产环境配置（Ethereum 主网）
- `.env.local.example` - 本地配置模板
- ✅ `.gitignore` 已包含 `.env*.local` 规则

### 2. 配置代码
- `types/env.d.ts` - TypeScript 环境变量类型定义
- `config/env.ts` - 环境配置模块（主文件）
- `config/index.ts` - 配置模块导出
- `config/usage-example.ts` - 使用示例

### 3. 配置文件更新
- 更新 `package.json` - 添加多环境运行和构建脚本

### 4. 文档
- `ENV_CONFIG.md` - 完整的环境配置说明文档

## 配置内容

### API 配置
- `NEXT_PUBLIC_API_BASE_URL` - API 基础地址

### Web3 配置
- `NEXT_PUBLIC_WEB3_CHAIN_ID` - 链 ID
- `NEXT_PUBLIC_WEB3_RPC_URL` - RPC 节点地址
- `NEXT_PUBLIC_WEB3_CHAIN_NAME` - 链名称
- `NEXT_PUBLIC_WEB3_EXPLORER_URL` - 区块浏览器地址

**重要提示**：所有环境变量都以 `NEXT_PUBLIC_` 开头，这样才能在浏览器端（Client Components）使用。

## 使用方式

### 1. 配置本地环境（可选）
\`\`\`bash
cp .env.local.example .env.local
# 编辑 .env.local 填入实际配置
\`\`\`

### 2. 在代码中使用

#### Server Component
\`\`\`typescript
// app/page.tsx
import { config } from '@/config/env';

export default async function HomePage() {
  const data = await fetch(\`\${config.apiBaseUrl}/data\`);
  return <div>{/* ... */}</div>;
}
\`\`\`

#### Client Component
\`\`\`typescript
// app/components/WalletConnect.tsx
'use client';

import { config } from '@/config/env';

export default function WalletConnect() {
  const connectWallet = async () => {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: \`0x\${config.web3.chainId.toString(16)}\` }],
    });
  };
  
  return <button onClick={connectWallet}>Connect</button>;
}
\`\`\`

### 3. 运行和构建
\`\`\`bash
pnpm dev           # 使用开发环境
pnpm dev:test      # 使用测试环境
pnpm dev:prod      # 使用生产环境

pnpm build         # 构建生产版本
pnpm build:dev     # 构建开发版本
pnpm build:test    # 构建测试版本

pnpm start         # 启动生产服务器
\`\`\`

## Next.js 15 环境变量特性

### 变量类型

#### 1. 公共变量（浏览器端可用）
\`\`\`bash
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
\`\`\`
- ✅ Server Components 可用
- ✅ Client Components 可用
- ✅ API Routes 可用
- ✅ Server Actions 可用

#### 2. 服务器端变量（仅服务器端可用）
\`\`\`bash
DATABASE_URL=postgres://...
API_SECRET_KEY=secret123
\`\`\`
- ✅ Server Components 可用
- ❌ Client Components 不可用
- ✅ API Routes 可用
- ✅ Server Actions 可用

### 加载顺序

Next.js 按以下顺序加载环境变量（后面的会覆盖前面的）：

1. \`.env\`
2. \`.env.\${NODE_ENV}\` (development/test/production)
3. \`.env.local\`
4. \`.env.\${NODE_ENV}.local\`

## 特性

✅ 类型安全 - 完整的 TypeScript 类型定义
✅ 环境隔离 - 开发、测试、生产环境独立配置
✅ 本地覆盖 - .env.local 可覆盖任何环境变量
✅ Git 安全 - .env*.local 不会提交到版本控制
✅ 易于使用 - 简洁的 API 和使用示例
✅ Next.js 集成 - 完全兼容 Next.js 15 的环境变量机制
✅ App Router 支持 - 支持 Server Components 和 Client Components
✅ 无需 cross-env - Next.js 原生支持跨平台

## 与其他应用的对比

### DApp (Next.js 15) vs Activities (Vite) vs Admin Systems (UmiJS)

| 特性 | DApp (Next.js) | Activities (Vite) | Admin Systems (UmiJS) |
|------|----------------|-------------------|----------------------|
| **框架** | Next.js 15 | Vite 5.2 | UmiJS 3/4 |
| **变量前缀** | `NEXT_PUBLIC_` | `VITE_` | 无要求 |
| **访问方式** | `process.env.NEXT_PUBLIC_*` | `import.meta.env.VITE_*` | `process.env.*` |
| **环境切换** | `NODE_ENV` | `--mode` | `UMI_ENV` |
| **配置注入** | 自动 | 自动 | 需在 .umirc.ts 声明 |
| **SSR 支持** | ✅ 原生支持 | ❌ | ✅ 通过插件 |
| **跨平台** | ✅ 原生支持 | ✅ | ✅ 需 cross-env |

### 关键差异

**DApp (Next.js)**
- 环境变量必须以 \`NEXT_PUBLIC_\` 开头才能在浏览器端使用
- 支持 Server Components 和 Client Components
- 支持 SSR、SSG、ISR、CSR 多种渲染模式
- 环境变量在构建时被内联
- 不需要额外配置，开箱即用

**Activities (Vite)**
- 环境变量必须以 \`VITE_\` 开头
- 纯客户端渲染（CSR）
- 更快的开发服务器启动速度

**Admin Systems (UmiJS)**
- 环境变量无前缀要求
- 需要在配置文件中显式声明
- 内置状态管理和路由

## 实际应用场景

### 1. Web3 DApp 开发

\`\`\`typescript
'use client';

import { config } from '@/config/env';
import { useState, useEffect } from 'react';

export default function Web3Provider({ children }) {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      // 切换到配置的链
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: \`0x\${config.web3.chainId.toString(16)}\` }],
      });

      // 请求账户
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      setAccount(accounts[0]);
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>
        {account ? \`Connected: \${account.slice(0, 6)}...\` : 'Connect Wallet'}
      </button>
      {children}
    </div>
  );
}
\`\`\`

### 2. API 数据获取（SSR）

\`\`\`typescript
// app/users/page.tsx
import { config } from '@/config/env';

export default async function UsersPage() {
  // 在服务器端获取数据
  const response = await fetch(\`\${config.apiBaseUrl}/users\`, {
    cache: 'no-store', // SSR
  });
  const users = await response.json();

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

### 3. 混合渲染（Server + Client）

\`\`\`typescript
// app/dashboard/page.tsx
import { config } from '@/config/env';
import ClientChart from './ClientChart';

// Server Component - 获取数据
export default async function DashboardPage() {
  const response = await fetch(\`\${config.apiBaseUrl}/stats\`, {
    cache: 'no-store',
  });
  const stats = await response.json();

  return (
    <div>
      <h1>Dashboard</h1>
      {/* 服务器端渲染的静态内容 */}
      <div>Total Users: {stats.totalUsers}</div>
      
      {/* 客户端渲染的交互式图表 */}
      <ClientChart data={stats.chartData} />
    </div>
  );
}
\`\`\`

## 下一步

1. **配置环境变量**：根据实际项目填写各环境的真实配置值
2. **替换 API Key**：将 \`YOUR_INFURA_KEY\` 替换为实际的 Infura API Key
3. **集成 Web3 库**：可选择 ethers.js、viem、wagmi 等库
4. **配置部署**：在 Vercel 或其他平台配置环境变量
5. **测试不同环境**：运行 \`pnpm dev:test\` 和 \`pnpm dev:prod\` 验证配置

## 常见问题

### Q: 为什么环境变量要以 NEXT_PUBLIC_ 开头？
A: Next.js 出于安全考虑，只有以 \`NEXT_PUBLIC_\` 开头的变量才会被内联到浏览器端代码中。这样可以防止意外泄露服务器端的敏感信息。

### Q: 如何在 Server Components 中使用私有环境变量？
A: Server Components 可以访问所有环境变量（包括不带 \`NEXT_PUBLIC_\` 前缀的）。例如：
\`\`\`typescript
const apiKey = process.env.PRIVATE_API_KEY; // 仅服务器端可用
\`\`\`

### Q: 修改环境变量后需要重启吗？
A: 是的，修改环境变量后需要重启开发服务器才能生效。

### Q: 如何在 Client Components 中判断是否为生产环境？
A: 使用配置模块：
\`\`\`typescript
import { isProduction } from '@/config/env';

if (isProduction) {
  // 生产环境逻辑
}
\`\`\`

### Q: Vercel 部署时如何配置环境变量？
A: 在 Vercel 项目设置 → Environment Variables 中添加所有 \`NEXT_PUBLIC_*\` 变量，并为每个环境（Development/Preview/Production）分别配置。

## 技术栈

- **Next.js**: 15.0.4 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5+
- **样式**: Tailwind CSS 3.4.1
- **构建工具**: Turbopack (Next.js 内置)
