import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import type { Activity } from '@puff/types';
import type { ProColumns } from '@ant-design/pro-components';
import { validateActivity } from '@puff/business-logic';
import { formatDate } from '@puff/utils';

// Mock data
const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Halloween Event',
    type: 'halloween',
    startTime: '2024-10-01T00:00:00Z',
    endTime: '2024-10-31T23:59:59Z',
  },
  {
    id: '2',
    name: 'Team Competition',
    type: 'team',
    startTime: '2024-11-01T00:00:00Z',
    endTime: '2024-11-30T23:59:59Z',
  },
  {
    id: '3',
    name: 'Daily Check-in',
    type: 'checkin',
    startTime: '2024-01-01T00:00:00Z',
    endTime: '2024-12-31T23:59:59Z',
  },
  {
    id: '4',
    name: 'Mini Game Challenge',
    type: 'mini-game',
    startTime: '2024-07-01T00:00:00Z',
    endTime: '2024-07-31T23:59:59Z',
  },
];

export default function ActivityListPage() {
  const navigate = useNavigate();

  const columns: ProColumns<Activity>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Activity Name',
      dataIndex: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type) => (
        <Tag color="blue" style={{ textTransform: 'capitalize' }}>
          {type as string}
        </Tag>
      ),
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      render: (time) => formatDate(new Date(time as string)),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      render: (time) => formatDate(new Date(time as string)),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const isActive = validateActivity(record.startTime, record.endTime);
        return <Tag color={isActive ? 'green' : 'gray'}>{isActive ? 'Active' : 'Inactive'}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">
            Edit
          </Button>
          <Button type="link" size="small">
            View
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
      <ProTable<Activity>
        columns={columns}
        dataSource={mockActivities}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => navigate('/activities/create')}
          >
            Create Activity
          </Button>,
        ]}
        pagination={{
          pageSize: 10,
        }}
      />
    </PageContainer>
  );
}
