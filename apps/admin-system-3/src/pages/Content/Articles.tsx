import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';

interface ArticleType {
  id: number;
  title: string;
  author: string;
  status: string;
  views: number;
  createdAt: string;
}

const columns: ProColumns<ArticleType>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    search: false,
  },
  {
    title: '标题',
    dataIndex: 'title',
    copyable: true,
  },
  {
    title: '作者',
    dataIndex: 'author',
  },
  {
    title: '状态',
    dataIndex: 'status',
    valueEnum: {
      published: { text: '已发布', status: 'Success' },
      draft: { text: '草稿', status: 'Default' },
    },
  },
  {
    title: '浏览量',
    dataIndex: 'views',
    search: false,
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
      <a key="view">查看</a>,
      <a key="delete" style={{ color: 'red' }}>删除</a>,
    ],
  },
];

export default function Articles() {
  return (
    <ProTable<ArticleType>
      columns={columns}
      request={async () => {
        return {
          data: [
            {
              id: 1,
              title: '第一篇文章',
              author: 'Admin',
              status: 'published',
              views: 1280,
              createdAt: '2024-01-01 10:00:00',
            },
          ],
          success: true,
          total: 1,
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
      headerTitle="文章列表"
      toolBarRender={() => [
        <Button key="button" icon={<PlusOutlined />} type="primary">
          新建文章
        </Button>,
      ]}
    />
  );
}
