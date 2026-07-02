# Admin System 2

内容管理和系统监控后台，基于 UmiJS 4 + Ant Design Pro 构建。

## 功能模块

### 1. Dashboard (仪表盘)

- 📊 内容统计
- 📈 系统性能监控
- 📱 流量来源分析
- 🔔 最近更新动态

### 2. Content Management (内容管理)

- 📝 Articles (文章管理)
  - 文章列表
  - 状态管理（草稿、已发布、已归档）
  - 浏览量统计
- 🖼️ Media (媒体管理)
  - 图片、视频、文档管理
  - 预览功能
  - 文件大小显示

### 3. Reports (报表分析)

- 📊 页面访问量统计
- 👥 用户参与度分析
- 📈 内容效果分析
- 🌐 流量来源分布

### 4. System (系统管理)

- 📋 Logs (日志查看)
  - 系统日志
  - 错误日志
  - 警告信息
- ⚙️ Config (系统配置)
  - 上传设置
  - 安全设置
  - 性能优化
  - 监控配置

## 技术栈

- **框架**: UmiJS 4 + @umijs/max
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **图表**: @ant-design/plots
- **状态管理**: Umi Model
- **路由**: Umi 约定式路由
- **TypeScript**: 5.4.5
- **共享包**: @puff/api, @puff/types, @puff/utils

## 目录结构

```
apps/admin-system-2/
├── src/
│   ├── pages/                 # 页面
│   │   ├── Dashboard/        # 仪表盘
│   │   ├── Content/          # 内容管理
│   │   │   ├── Articles.tsx  # 文章管理
│   │   │   └── Media.tsx     # 媒体管理
│   │   ├── Reports/          # 报表
│   │   └── System/           # 系统管理
│   │       ├── Logs.tsx      # 日志
│   │       └── Config.tsx    # 配置
│   ├── components/           # 组件
│   ├── services/             # API 服务
│   ├── layouts/              # 布局
│   └── app.tsx              # 运行时配置
├── .umirc.ts                # Umi 配置
├── tsconfig.json            # TypeScript 配置
└── package.json
```

## 启动开发

### 安装依赖

从项目根目录：

```bash
pnpm install
```

### 启动开发服务器

```bash
# 从根目录
pnpm --filter @puff/admin-system-2 dev

# 或进入目录
cd apps/admin-system-2
pnpm dev
```

访问：http://localhost:8000

**注意**：如果 Admin System 1 也在运行，需要修改端口（见下方配置）。

### 修改开发端口

在 `.umirc.ts` 中添加：

```typescript
export default defineConfig({
  // ... 其他配置
  devServer: {
    port: 8001, // 修改为其他端口
  },
});
```

### 构建生产版本

```bash
pnpm --filter @puff/admin-system-2 build
```

## 特色功能

### 1. 图表可视化

使用 @ant-design/plots 展示数据：

```typescript
import { Column } from '@ant-design/plots';

const config = {
  data: chartData,
  xField: 'month',
  yField: 'value',
};

<Column {...config} />
```

### 2. 媒体预览

支持图片预览和多种文件类型展示：

```typescript
import { Image } from 'antd';

<Image width={60} src={url} />
```

### 3. 系统监控

实时显示系统性能指标：

```typescript
import { Progress } from 'antd';

<Progress percent={cpuUsage} status="active" />
```

## 集成共享包

### 使用工具函数

```typescript
import { formatDate } from '@puff/utils';

// 格式化文章创建时间
const createdAt = formatDate(new Date(article.createdAt));
```

### 使用 API 客户端

```typescript
import { apiClient } from '@puff/api';

// 获取文章列表
const articles = await apiClient.request('/articles');
```

## 路由配置

```typescript
routes: [
  { path: '/', redirect: '/dashboard' },
  { name: 'Dashboard', path: '/dashboard', component: './Dashboard' },
  {
    name: 'Content Management',
    path: '/content',
    routes: [
      { path: '/content/articles', component: './Content/Articles' },
      { path: '/content/media', component: './Content/Media' },
    ],
  },
  { name: 'Reports', path: '/reports', component: './Reports' },
  {
    name: 'System',
    path: '/system',
    routes: [
      { path: '/system/logs', component: './System/Logs' },
      { path: '/system/config', component: './System/Config' },
    ],
  },
];
```

## 与 Admin System 1 的区别

| 特性         | Admin System 1     | Admin System 2   |
| ------------ | ------------------ | ---------------- |
| **主要功能** | 用户和活动管理     | 内容和系统监控   |
| **数据展示** | 用户列表、活动列表 | 文章、媒体、日志 |
| **可视化**   | 统计卡片           | 图表分析         |
| **重点**     | 业务管理           | 内容和运维       |

## 开发建议

### 1. 添加图表

安装依赖：

```bash
pnpm add @ant-design/plots
```

使用图表组件：

```typescript
import { Line, Pie, Column } from '@ant-design/plots';
```

### 2. 文件上传

使用 Ant Design Upload 组件：

```typescript
import { Upload } from 'antd';

<Upload action="/api/upload">
  <Button icon={<UploadOutlined />}>Upload</Button>
</Upload>
```

### 3. 富文本编辑器

可以集成编辑器用于文章编辑：

```bash
pnpm add @ant-design/pro-editor
```

### 4. 添加权限控制

使用 Umi 的 access 插件：

```typescript
// src/access.ts
export default function access(initialState: any) {
  return {
    canViewLogs: initialState.role === 'admin',
    canEditContent: ['admin', 'editor'].includes(initialState.role),
  };
}
```

## 部署

### 构建

```bash
pnpm build
```

### Nginx 配置示例

```nginx
server {
  listen 80;
  server_name admin2.example.com;

  root /path/to/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://backend:3000;
  }
}
```

## 环境变量

创建 `.env` 文件：

```env
# API 地址
API_BASE_URL=https://api.example.com

# 上传配置
MAX_UPLOAD_SIZE=50

# 其他配置
PORT=8001
```

## 性能优化

### 1. 按需加载

UmiJS 已经支持自动代码分割。

### 2. 图片优化

使用 WebP 格式和懒加载：

```typescript
<Image
  src={url}
  placeholder={<Spin />}
  loading="lazy"
/>
```

### 3. 列表虚拟化

对于长列表，使用虚拟滚动：

```bash
pnpm add react-virtualized
```

## 常见问题

### 1. 图表不显示

确保安装了图表库：

```bash
pnpm add @ant-design/plots
```

### 2. 内存占用过高

启用生产模式的优化：

```bash
NODE_ENV=production pnpm build
```

### 3. 日志查询慢

添加索引和分页：

```typescript
pagination={{
  pageSize: 50,
  showSizeChanger: true,
}}
```

## 更多资源

- [UmiJS 文档](https://umijs.org/)
- [Ant Design Pro 文档](https://pro.ant.design/)
- [Ant Design Charts](https://charts.ant.design/)
