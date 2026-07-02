import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'Puff Admin System 2',
  },
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      component: './Dashboard',
      icon: 'DashboardOutlined',
    },
    {
      name: 'Content Management',
      path: '/content',
      icon: 'FileTextOutlined',
      routes: [
        {
          name: 'Articles',
          path: '/content/articles',
          component: './Content/Articles',
        },
        {
          name: 'Media',
          path: '/content/media',
          component: './Content/Media',
        },
      ],
    },
    {
      name: 'Reports',
      path: '/reports',
      component: './Reports',
      icon: 'BarChartOutlined',
    },
    {
      name: 'System',
      path: '/system',
      icon: 'ToolOutlined',
      routes: [
        {
          name: 'Logs',
          path: '/system/logs',
          component: './System/Logs',
        },
        {
          name: 'Config',
          path: '/system/config',
          component: './System/Config',
        },
      ],
    },
  ],
  npmClient: 'pnpm',
});
