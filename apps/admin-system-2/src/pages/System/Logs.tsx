import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';

interface Log {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

const mockLogs: Log[] = [
  {
    id: '1',
    timestamp: '2024-06-25 10:23:45',
    level: 'info',
    message: 'User logged in successfully',
    source: 'Auth Service',
  },
  {
    id: '2',
    timestamp: '2024-06-25 10:24:12',
    level: 'warning',
    message: 'Rate limit approaching for IP 192.168.1.100',
    source: 'API Gateway',
  },
  {
    id: '3',
    timestamp: '2024-06-25 10:25:03',
    level: 'error',
    message: 'Database connection timeout',
    source: 'Database Service',
  },
  {
    id: '4',
    timestamp: '2024-06-25 10:26:15',
    level: 'info',
    message: 'Cache cleared successfully',
    source: 'Cache Service',
  },
];

export default function LogsPage() {
  const columns: ProColumns<Log>[] = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      width: 180,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      width: 100,
      render: (level) => {
        const colorMap = {
          info: 'blue',
          warning: 'orange',
          error: 'red',
        };
        return (
          <Tag color={colorMap[level as keyof typeof colorMap]}>
            {(level as string).toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Source',
      dataIndex: 'source',
      width: 150,
    },
    {
      title: 'Message',
      dataIndex: 'message',
    },
  ];

  return (
    <PageContainer>
      <ProTable<Log>
        columns={columns}
        dataSource={mockLogs}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 20,
        }}
      />
    </PageContainer>
  );
}
