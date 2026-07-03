import React, { useState } from 'react';
import { Table, Button, Space, message, Modal, Spin } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { userApi } from '@/services/api';
import type { User } from '@puff/types';

const Users: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => userApi.getUsers({ page, pageSize }),
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 ${record.username} 吗？`,
      onOk: () => deleteMutation.mutate(record.id),
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
            loading={deleteMutation.isPending && deleteMutation.variables === record.id}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const mockData: User[] = [
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
  ];

  const userList = data?.list || mockData;
  const total = data?.total || mockData.length;

  return (
    <div>
      <h1>用户管理</h1>
      <Button type="primary" style={{ marginBottom: 16 }}>
        添加用户
      </Button>
      <Table
        columns={columns}
        dataSource={userList}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
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
