import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
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
