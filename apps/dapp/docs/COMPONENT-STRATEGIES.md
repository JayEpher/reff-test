# 组件级渲染策略

## 概述

Next.js 15 支持在同一个页面中混合使用不同的渲染策略，实现细粒度的性能优化。你可以根据每个组件的特性选择最合适的渲染方式。

## 组件类型

### 1. 服务端组件 (Server Component)

**默认行为**，无需任何特殊标记。

```typescript
// app/components/ServerComponent.tsx
// 不需要 'use client'

async function getServerData() {
  // 可以直接访问服务端资源
  return fetch('...').then(res => res.json());
}

export default async function ServerComponent() {
  const data = await getServerData();
  return <div>{data.title}</div>;
}
```

**特点：**
- ✅ 可以直接访问数据库、文件系统、环境变量
- ✅ 减少客户端 JavaScript 包大小
- ✅ 对 SEO 友好
- ✅ 可以使用 async/await
- ❌ 不能使用 React hooks（useState、useEffect 等）
- ❌ 不能处理浏览器事件（onClick、onChange 等）
- ❌ 不能使用浏览器 API（localStorage、window 等）

**适用场景：**
- 需要访问服务端资源的组件
- 静态内容展示
- 数据获取和处理
- 布局和导航组件

### 2. 客户端组件 (Client Component)

使用 `'use client'` 指令声明。

```typescript
// app/components/ClientComponent.tsx
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  );
}
```

**特点：**
- ✅ 可以使用所有 React hooks
- ✅ 可以处理用户交互
- ✅ 可以访问浏览器 API
- ✅ 可以使用第三方客户端库
- ❌ 增加客户端 JavaScript 包大小
- ❌ 不能直接访问服务端资源

**适用场景：**
- 交互式组件（按钮、表单、切换等）
- 需要使用状态的组件
- 需要监听浏览器事件的组件
- 使用浏览器 API 的组件

### 3. 静态组件 (Static Component)

服务端组件 + `export const dynamic = 'force-static'`

```typescript
// app/components/StaticComponent.tsx

async function getStaticData() {
  return fetch('...').then(res => res.json());
}

export default async function StaticComponent() {
  const data = await getStaticData();
  return <div>{data.content}</div>;
}

// 强制静态生成
export const dynamic = 'force-static';
```

**特点：**
- ✅ 构建时生成，内容固定
- ✅ 最快的加载速度
- ✅ 可以缓存到 CDN
- ✅ 对 SEO 最友好
- ❌ 内容不会自动更新（除非重新构建）

**适用场景：**
- 页脚、关于页面
- 文档内容
- 营销页面
- 很少变化的内容

### 4. 动态数据组件 (Dynamic Data Component)

客户端组件 + useEffect 数据获取

```typescript
// app/components/DynamicDataComponent.tsx
'use client';

import { useState, useEffect } from 'react';

export default function DynamicDataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('...')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>加载中...</div>;
  return <div>{data?.title}</div>;
}
```

**特点：**
- ✅ 不阻塞页面初始渲染
- ✅ 可以显示加载状态
- ✅ 适合非关键数据
- ❌ 需要额外的网络请求
- ❌ 不利于 SEO（内容在初始 HTML 中不存在）

**适用场景：**
- 个性化推荐
- 实时数据更新
- 非关键内容
- 懒加载内容

## 混合使用示例

```typescript
// app/page.tsx (服务端组件)
import ServerComponent from './components/ServerComponent';
import ClientComponent from './components/ClientComponent';

export default function Page() {
  return (
    <div>
      {/* 服务端组件：获取初始数据 */}
      <ServerComponent />
      
      {/* 客户端组件：处理用户交互 */}
      <ClientComponent />
    </div>
  );
}
```

## 组件组合规则

### ✅ 允许的组合

```typescript
// 服务端组件可以导入客户端组件
import ClientComponent from './ClientComponent';

export default function ServerComponent() {
  return <ClientComponent />;
}
```

```typescript
// 客户端组件可以导入其他客户端组件
'use client';
import AnotherClientComponent from './AnotherClientComponent';

export default function ClientComponent() {
  return <AnotherClientComponent />;
}
```

### ❌ 不允许的组合

```typescript
// ❌ 客户端组件不能直接导入服务端组件
'use client';
import ServerComponent from './ServerComponent'; // 这会变成客户端组件

export default function ClientComponent() {
  return <ServerComponent />; // 错误！
}
```

**解决方案：通过 props 传递**

```typescript
// app/page.tsx (服务端组件)
import ClientWrapper from './ClientWrapper';
import ServerComponent from './ServerComponent';

export default function Page() {
  return (
    <ClientWrapper>
      <ServerComponent /> {/* 作为 children 传递 */}
    </ClientWrapper>
  );
}

// ClientWrapper.tsx
'use client';
export default function ClientWrapper({ children }) {
  return <div className="wrapper">{children}</div>;
}
```

## 最佳实践

### 1. 默认使用服务端组件

除非需要交互性或浏览器 API，否则使用服务端组件。

```typescript
// ✅ 好的做法
export default function Header() {
  return <header>...</header>;
}

// ❌ 不必要的客户端组件
'use client';
export default function Header() {
  return <header>...</header>;
}
```

### 2. 将客户端组件推到叶子节点

```typescript
// ✅ 好的做法 - 只有交互部分是客户端组件
export default function Page() {
  return (
    <div>
      <Header />
      <Article />
      <InteractiveButton /> {/* 只有这个是客户端组件 */}
    </div>
  );
}

// ❌ 不好的做法 - 整个页面都是客户端组件
'use client';
export default function Page() {
  return (
    <div>
      <Header />
      <Article />
      <InteractiveButton />
    </div>
  );
}
```

### 3. 使用 Suspense 处理异步服务端组件

```typescript
import { Suspense } from 'react';
import AsyncComponent from './AsyncComponent';

export default function Page() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <AsyncComponent />
    </Suspense>
  );
}
```

### 4. 合理选择数据获取位置

```typescript
// ✅ 关键数据 - 服务端获取
export default async function ProductPage() {
  const product = await fetchProduct(); // 服务端
  return (
    <div>
      <ProductDetails product={product} />
      <RecommendationsWidget /> {/* 客户端获取推荐 */}
    </div>
  );
}

// RecommendationsWidget.tsx
'use client';
export default function RecommendationsWidget() {
  const [recs, setRecs] = useState([]);
  useEffect(() => {
    fetchRecommendations().then(setRecs); // 客户端
  }, []);
  // ...
}
```

### 5. 避免重复的 'use client'

```typescript
// Button.tsx
'use client';
export function Button() { ... }

// Form.tsx
'use client';
import { Button } from './Button'; // Button 已经是客户端组件了

// ⚠️ Button.tsx 中的 'use client' 已经足够
// 不需要在 Form.tsx 中再次声明（虽然不会出错）
```

## 性能对比

| 渲染策略 | 首屏加载 | 交互性 | SEO | JS 包大小 | 适用场景 |
|---------|---------|--------|-----|----------|---------|
| 服务端组件 | ⭐⭐⭐ | ❌ | ⭐⭐⭐ | 最小 | 静态内容、数据展示 |
| 客户端组件 | ⭐⭐ | ⭐⭐⭐ | ⭐ | 较大 | 交互式 UI |
| 静态组件 | ⭐⭐⭐ | ❌ | ⭐⭐⭐ | 最小 | 固定内容 |
| 动态数据组件 | ⭐⭐ | ⭐⭐⭐ | ❌ | 较大 | 非关键数据 |

## 决策树

```
需要用户交互？
├─ 是 → 使用客户端组件
└─ 否
   └─ 需要访问服务端资源？
      ├─ 是 → 使用服务端组件
      └─ 否
         └─ 内容会变化吗？
            ├─ 否 → 使用静态组件
            └─ 是 → 
               └─ 是关键内容？
                  ├─ 是 → 使用服务端组件（SSR/ISR）
                  └─ 否 → 使用动态数据组件（CSR）
```

## 总结

组件级渲染策略让你能够：

1. **精细控制**：每个组件独立选择最优渲染方式
2. **性能优化**：减少不必要的客户端 JavaScript
3. **用户体验**：重要内容快速呈现，交互部分延迟加载
4. **可维护性**：清晰的组件边界和职责划分

记住：**默认服务端，按需客户端**。
