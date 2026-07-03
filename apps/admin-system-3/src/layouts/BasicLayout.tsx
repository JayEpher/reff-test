import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { Link, history } from 'umi';
import { DashboardOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '@/providers/AuthProvider';
import type { MenuProps } from 'antd';
import './BasicLayout.less';

const { Header, Sider, Content } = Layout;

const BasicLayout: React.FC = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { user, logout } = useAuth();
  const pathname = history.location.pathname;

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">仪表盘</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">用户管理</Link>,
    },
  ];

  const handleLogout = async () => {
    await logout();
    history.push('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">Admin System 3</div>
        <Menu
          theme="dark"
          selectedKeys={[pathname]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>后台管理系统</h2>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.username || '用户'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
