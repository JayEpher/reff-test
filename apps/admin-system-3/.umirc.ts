export default {
  npmClient: 'pnpm',

  // 路由配置
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      name: '仪表板',
      path: '/dashboard',
      component: './Dashboard',
      icon: 'DashboardOutlined',
    },
    {
      name: '用户管理',
      path: '/users',
      component: './Users',
      icon: 'UserOutlined',
    },
    {
      name: '内容管理',
      path: '/content',
      icon: 'FileTextOutlined',
      routes: [
        {
          name: '文章管理',
          path: '/content/articles',
          component: './Content/Articles',
        },
        {
          name: '媒体库',
          path: '/content/media',
          component: './Content/Media',
        },
      ],
    },
    {
      name: '系统设置',
      path: '/system',
      icon: 'SettingOutlined',
      routes: [
        {
          name: '系统配置',
          path: '/system/config',
          component: './System/Config',
        },
        {
          name: '操作日志',
          path: '/system/logs',
          component: './System/Logs',
        },
      ],
    },
  ],

  // Ant Design Pro 配置
  antd: {},

  // 请求配置
  request: {},

  // 启用 model 插件（layout 和 initialState 依赖它）
  model: {},

  // 初始状态
  initialState: {},

  // 布局配置
  layout: {
    title: 'Admin System 3',
    locale: false,
  },

  // 环境变量注入
  define: {
    'process.env.ENV': process.env.UMI_ENV || 'production',
    'process.env.API_BASE_URL': process.env.API_BASE_URL || '',
    'process.env.WEB3_CHAIN_ID': process.env.WEB3_CHAIN_ID || '',
    'process.env.WEB3_RPC_URL': process.env.WEB3_RPC_URL || '',
    'process.env.WEB3_CHAIN_NAME': process.env.WEB3_CHAIN_NAME || '',
    'process.env.WEB3_EXPLORER_URL': process.env.WEB3_EXPLORER_URL || '',
  },

  // TypeScript 配置
  clickToComponent: {},

  // 代理配置（开发环境）
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },

  // 构建配置
  outputPath: 'dist',
  hash: true,

  // 兼容性配置
  targets: {
    chrome: 100,
    edge: 100,
    firefox: 100,
    safari: 14,
  },
};
