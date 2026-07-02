import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Image, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';

interface Media {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: string;
  url: string;
  uploadedAt: string;
}

const mockMedia: Media[] = [
  {
    id: '1',
    name: 'banner.jpg',
    type: 'image',
    size: '2.3 MB',
    url: 'https://via.placeholder.com/150',
    uploadedAt: '2024-06-20',
  },
  {
    id: '2',
    name: 'tutorial.mp4',
    type: 'video',
    size: '45.6 MB',
    url: '',
    uploadedAt: '2024-06-21',
  },
  {
    id: '3',
    name: 'guide.pdf',
    type: 'document',
    size: '1.2 MB',
    url: '',
    uploadedAt: '2024-06-22',
  },
];

export default function MediaPage() {
  const columns: ProColumns<Media>[] = [
    {
      title: 'Preview',
      dataIndex: 'url',
      width: 100,
      render: (url, record) =>
        record.type === 'image' ? (
          <Image width={60} src={url as string} />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {record.type === 'video' ? '🎥' : '📄'}
          </div>
        ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type) => {
        const colorMap = {
          image: 'blue',
          video: 'green',
          document: 'orange',
        };
        return (
          <Tag color={colorMap[type as keyof typeof colorMap]}>
            {(type as string).toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Size',
      dataIndex: 'size',
    },
    {
      title: 'Uploaded At',
      dataIndex: 'uploadedAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" size="small">
            Download
          </Button>
          <Button type="link" size="small">
            Copy URL
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
      <ProTable<Media>
        columns={columns}
        dataSource={mockMedia}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} type="primary">
            Upload Media
          </Button>,
        ]}
        pagination={{
          pageSize: 10,
        }}
      />
    </PageContainer>
  );
}
