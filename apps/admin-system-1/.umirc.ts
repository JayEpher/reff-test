import { defineConfig } from '@umijs/max';

export default defineConfig({
  mfsu: false,
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'Puff Admin System 1',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: 'Dashboard',
      path: '/home',
      component: './Home',
      icon: 'DashboardOutlined',
    },
    {
      name: 'User Management',
      path: '/users',
      component: './Users',
      icon: 'UserOutlined',
    },
    {
      name: 'Activity Management',
      path: '/activities',
      icon: 'RocketOutlined',
      routes: [
        {
          name: 'Activity List',
          path: '/activities/list',
          component: './Activities/List',
        },
        {
          name: 'Create Activity',
          path: '/activities/create',
          component: './Activities/Create',
        },
      ],
    },
    {
      name: 'Settings',
      path: '/settings',
      component: './Settings',
      icon: 'SettingOutlined',
    },
  ],
  npmClient: 'pnpm',
});
