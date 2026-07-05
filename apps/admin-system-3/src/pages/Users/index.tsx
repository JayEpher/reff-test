import { ProTable } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';

interface UserType {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const columns: ProColumns<UserType>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    search: false,
  },
  {
    title: '用户名',
    dataIndex: 'name',
    copyable: true,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    copyable: true,
  },
  {
    title: '角色',
    dataIndex: 'role',
    valueEnum: {
      admin: { text: '管理员', status: 'Success' },
      user: { text: '普通用户', status: 'Default' },
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    valueEnum: {
      active: { text: '活跃', status: 'Success' },
      inactive: { text: '禁用', status: 'Error' },
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    search: false,
  },
  {
    title: '操作',
    valueType: 'option',
    render: () => [
      <a key="edit">编辑</a>,
      <a key="delete" style={{ color: 'red' }}>删除</a>,
    ],
  },
];

export default function Users() {
  return (
    <ProTable<UserType>
      columns={columns}
      request={async (params) => {
        // 模拟数据
        return {
          data: [
            {
              id: 1,
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin',
              status: 'active',
              createdAt: '2024-01-01 10:00:00',
            },
            {
              id: 2,
              name: 'Test User',
              email: 'test@example.com',
              role: 'user',
              status: 'active',
              createdAt: '2024-01-02 11:00:00',
            },
          ],
          success: true,
          total: 2,
        };
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      pagination={{
        pageSize: 10,
      }}
      dateFormatter="string"
      headerTitle="用户列表"
      toolBarRender={() => [
        <Button key="button" icon={<PlusOutlined />} type="primary">
          新建用户
        </Button>,
      ]}
    />
  );
}
