# Admin System 3 环境配置实施总结

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
cd apps/admin-system-3
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

## UmiJS v3 特性

### 环境变量加载机制
UmiJS v3 使用 `UMI_ENV` 环境变量来选择对应的 `.env` 文件：
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
✅ UmiJS 集成 - 完全兼容 UmiJS v3 的环境变量机制
✅ 跨平台 - 使用 cross-env 确保跨平台兼容性
✅ Dva 兼容 - 可在 Dva models 中使用

## Admin System 3 技术栈

- **框架**: UmiJS v3.5.41
- **React**: v17.0.2
- **状态管理**: Dva (内置)
- **UI 组件**: Ant Design v4.24.15
- **布局**: @ant-design/pro-layout v6.38.0
- **请求库**: Axios v1.18.1

## 与其他应用的对比

### Admin System 1 vs Admin System 3

| 特性 | Admin System 1 | Admin System 3 |
|------|----------------|----------------|
| UmiJS 版本 | v4 (Max) | v3 |
| React 版本 | v18 | v17 |
| Ant Design | v5 | v4 |
| 状态管理 | 内置 model | Dva |
| 环境变量配置 | 相同 | 相同 |
| 配置方式 | 相同 | 相同 |

两个应用的环境配置方式**完全一致**，只是底层依赖版本不同。

## 实际应用场景

### 1. 更新现有 API 调用

如果项目中已有 `services/api.ts`，可以更新为：

\`\`\`typescript
import { config } from '@/config/env';
import axios from 'axios';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
});

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加 token 等
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
\`\`\`

### 2. 在 Dva Models 中使用

\`\`\`typescript
import { config } from '@/config/env';

export default {
  namespace: 'user',
  state: {},
  effects: {
    *fetchUsers(_, { call, put }) {
      const response = yield call(
        fetch,
        \`\${config.apiBaseUrl}/api/users\`
      );
      const data = yield response.json();
      yield put({ type: 'saveUsers', payload: data });
    },
  },
  reducers: {
    saveUsers(state, { payload }) {
      return { ...state, users: payload };
    },
  },
};
\`\`\`

### 3. 在页面组件中使用

\`\`\`typescript
import { config, isDevelopment } from '@/config/env';
import { useEffect } from 'react';

const Dashboard = () => {
  useEffect(() => {
    if (isDevelopment) {
      console.log('Current environment:', config.env);
      console.log('API URL:', config.apiBaseUrl);
    }
  }, []);

  return <div>Dashboard</div>;
};
\`\`\`

## 下一步

1. **安装依赖**：`cd apps/admin-system-3 && pnpm install`
2. **配置环境变量**：根据实际项目填写各环境的真实配置值
3. **替换 API Key**：将 `YOUR_INFURA_KEY` 替换为实际的 Infura API Key
4. **集成现有代码**：在现有的 services 和 models 中使用新的配置
5. **测试不同环境**：运行 `pnpm dev:test` 和 `pnpm dev:prod` 验证配置

## 常见问题

### Q: 为什么需要 cross-env？
A: cross-env 确保环境变量设置在 Windows、macOS 和 Linux 上都能正常工作。

### Q: .env 和 .env.development 有什么区别？
A: `.env` 是默认配置，当没有指定 `UMI_ENV` 时使用。`.env.development` 是开发环境专用配置。

### Q: 如何在 CI/CD 中使用？
A: 在 CI/CD 脚本中设置 `UMI_ENV=production` 或直接使用 `pnpm build:prod`。

### Q: 环境变量何时生效？
A: 环境变量在构建时被注入到代码中，修改后需要重启开发服务器或重新构建。
