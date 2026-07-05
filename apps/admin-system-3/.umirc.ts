import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  define: {
    'process.env.API_BASE_URL': process.env.API_BASE_URL,
    'process.env.WEB3_CHAIN_ID': process.env.WEB3_CHAIN_ID,
    'process.env.WEB3_RPC_URL': process.env.WEB3_RPC_URL,
    'process.env.WEB3_CHAIN_NAME': process.env.WEB3_CHAIN_NAME,
    'process.env.WEB3_EXPLORER_URL': process.env.WEB3_EXPLORER_URL,
  },
  routes: [
    { path: '/login', component: '@/pages/Login', layout: false },
    {
      path: '/',
      component: '@/layouts/BasicLayout',
      wrappers: ['@/components/PrivateRoute'],
      routes: [
        { path: '/', redirect: '/dashboard' },
        { path: '/dashboard', component: '@/pages/Dashboard' },
        { path: '/users', component: '@/pages/Users' },
      ],
    },
  ],
  fastRefresh: {},
  webpack5: {},
  dynamicImport: {
    loading: '@/components/PageLoading',
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  antd: {},
  dva: {
    hmr: true,
  },
  layout: false,
  title: 'Admin System 3',
});
