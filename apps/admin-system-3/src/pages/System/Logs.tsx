import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';

interface LogType {
  id: number;
  user: string;
  action: string;
  ip: string;
  status: string;
  createdAt: string;
}

const columns: ProColumns<LogType>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    search: false,
  },
  {
    title: '用户',
    dataIndex: 'user',
  },
  {
    title: '操作',
    dataIndex: 'action',
  },
  {
    title: 'IP 地址',
    dataIndex: 'ip',
    search: false,
  },
  {
    title: '状态',
    dataIndex: 'status',
    valueEnum: {
      success: { text: '成功', status: 'Success' },
      failed: { text: '失败', status: 'Error' },
    },
  },
  {
    title: '时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    search: false,
  },
];

export default function Logs() {
  return (
    <ProTable<LogType>
      columns={columns}
      request={async () => {
        return {
          data: [
            {
              id: 1,
              user: 'admin',
              action: '登录系统',
              ip: '192.168.1.1',
              status: 'success',
              createdAt: '2024-01-01 10:00:00',
            },
            {
              id: 2,
              user: 'admin',
              action: '修改配置',
              ip: '192.168.1.1',
              status: 'success',
              createdAt: '2024-01-01 10:05:00',
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
        pageSize: 20,
      }}
      dateFormatter="string"
      headerTitle="操作日志"
    />
  );
}
