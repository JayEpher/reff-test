# Next.js 渲染策略演示

此应用程序演示了 Next.js 15 中可用的四种不同渲染策略。

## 可用页面

### 1. 服务端渲染 (SSR) - `/ssr`
**适用场景：** 频繁变化的动态、个性化内容

**特点：**
- 每次请求都会获取数据
- 始终显示最新数据
- 适合频繁变化的内容
- 相比静态页面，TTFB（首字节时间）较慢

**实现方式：**
```typescript
export default async function SSRPage() {
  const data = await fetch('...', { cache: 'no-store' });
  // ...
}
```

### 2. 增量静态再生成 (ISR) - `/isr`
**适用场景：** 定期更新但不需要实时数据的内容

**特点：**
- 页面在构建时静态生成
- 在指定时间后在后台重新验证（本例中为 60 秒）
- 快速响应时间（从缓存提供服务）
- 平衡静态性能与动态内容

**实现方式：**
```typescript
export default async function ISRPage() {
  const data = await fetch('...', { next: { revalidate: 60 } });
  // ...
}
```

### 3. 静态站点生成 (SSG) - `/ssg`
**适用场景：** 文档、博客或营销页面等静态内容

**特点：**
- 页面在构建时生成
- 最快的页面加载速度
- 可以从 CDN 提供服务
- 请求时无需服务器端处理
- 对 SEO 友好

**实现方式：**
```typescript
export default async function SSGPage() {
  const data = await fetch('...');
  // ...
}

export const dynamic = 'force-static';
```

### 4. 客户端渲染 (CSR) - `/csr`
**适用场景：** 高度交互的仪表板和应用程序

**特点：**
- 首先将页面外壳发送到客户端
- 数据在客户端使用 JavaScript 获取
- 需要启用 JavaScript
- 更适合高度交互的 UI
- 不利于 SEO（内容不在初始 HTML 中）
- 可以显示数据获取期间的加载状态

**实现方式：**
```typescript
'use client';

export default function CSRPage() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('...').then(res => res.json()).then(setData);
  }, []);
  // ...
}
```

## 构建输出

运行 `npm run build` 时，可以看到每个页面使用的渲染策略：

```
Route (app)                              Size     First Load JS
┌ ○ /                                    9.26 kB         109 kB
├ ○ /csr                                 1.32 kB         101 kB
├ ○ /isr                                 142 B          99.9 kB
├ ○ /ssg                                 142 B          99.9 kB
└ ƒ /ssr                                 142 B          99.9 kB

○  (Static)   预渲染为静态内容
ƒ  (Dynamic)  按需服务端渲染
```

## 运行演示

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

访问 `http://localhost:3000` 查看包含所有渲染策略示例链接的主页。

## 关键要点

1. **SSR** - 最适合个性化或实时内容
2. **ISR** - 定期变化内容的最佳选择
3. **SSG** - 静态内容的最高性能
4. **CSR** - 最适合 SEO 不重要的高度交互应用

根据以下因素选择渲染策略：
- 数据更新频率
- SEO 要求
- 性能需求
- 用户体验目标
