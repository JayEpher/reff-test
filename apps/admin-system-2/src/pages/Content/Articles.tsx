import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { formatDate } from '@puff/utils';

interface Article {
  id: string;
  title: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  views: number;
}

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Getting Started with Puff',
    author: 'Admin',
    status: 'published',
    createdAt: '2024-06-15T10:00:00Z',
    views: 1234,
  },
  {
    id: '2',
    title: 'Advanced Features Guide',
    author: 'Editor',
    status: 'published',
    createdAt: '2024-06-20T14:30:00Z',
    views: 856,
  },
  {
    id: '3',
    title: 'API Documentation',
    author: 'Tech Writer',
    status: 'draft',
    createdAt: '2024-06-25T09:15:00Z',
    views: 0,
  },
];

export default function ArticlesPage() {
  const columns: ProColumns<Article>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      width: 300,
    },
    {
      title: 'Author',
      dataIndex: 'author',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (status) => {
        const colorMap = {
          draft: 'default',
          published: 'green',
          archived: 'gray',
        };
        return (
          <Tag color={colorMap[status as keyof typeof colorMap]}>
            {(status as string).toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Views',
      dataIndex: 'views',
      width: 100,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      width: 150,
      render: (time) => formatDate(new Date(time as string)),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small">
            Edit
          </Button>
          <Button type="link" size="small">
            Preview
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
      <ProTable<Article>
        columns={columns}
        dataSource={mockArticles}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} type="primary">
            New Article
          </Button>,
        ]}
        pagination={{
          pageSize: 10,
        }}
      />
    </PageContainer>
  );
}
