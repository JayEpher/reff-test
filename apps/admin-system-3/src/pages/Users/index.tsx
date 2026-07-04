import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { userApi, UserListResponse } from '@/services/api';
import type { User } from '@puff/types';

const Users: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [data, setData] = useState<UserListResponse>({
    list: [
      {
        id: '1',
        username: '张三',
        email: 'zhangsan@example.com',
      },
      {
        id: '2',
        username: '李四',
        email: 'lisi@example.com',
      },
    ],
    total: 2,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await userApi.getUsers({ page, pageSize });
      setData(result);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('加载用户列表失败，使用模拟数据');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 ${record.username} 吗？`,
      onOk: async () => {
        try {
          setDeleteLoading(record.id);
          await userApi.deleteUser(record.id);
          message.success('删除成功');
          await fetchUsers();
        } catch (error) {
          console.error('Failed to delete user:', error);
          message.error('删除失败');
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">编辑</Button>
          <Button
            type="link"
            danger
            loading={deleteLoading === record.id}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>用户管理</h1>
      <Button type="primary" style={{ marginBottom: 16 }}>
        添加用户
      </Button>
      <Table
        columns={columns}
        dataSource={data.list}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total: data.total,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize);
          },
        }}
      />
    </div>
  );
};

export default Users;
