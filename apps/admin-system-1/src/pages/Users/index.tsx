import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { User } from '@puff/types';
import type { ProColumns } from '@ant-design/pro-components';

// Mock data
const mockUsers: User[] = [
  { id: '1', username: 'alice', email: 'alice@example.com' },
  { id: '2', username: 'bob', email: 'bob@example.com' },
  { id: '3', username: 'charlie', email: 'charlie@example.com' },
  { id: '4', username: 'diana', email: 'diana@example.com' },
  { id: '5', username: 'edward', email: 'edward@example.com' },
];

export default function UsersPage() {
  const columns: ProColumns<User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      copyable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      copyable: true,
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="green">Active</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">
            Edit
          </Button>
          <Button type="link" size="small" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<User>
        columns={columns}
        dataSource={mockUsers}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} type="primary">
            Add User
          </Button>,
        ]}
        pagination={{
          pageSize: 10,
        }}
      />
    </PageContainer>
  );
}
