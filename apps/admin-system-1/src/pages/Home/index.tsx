import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import { config } from '@puff/config';

const { Statistic } = StatisticCard;

export default function HomePage() {
  return (
    <PageContainer>
      <ProCard title={`Welcome to ${config.appName} Admin System 1`} style={{ marginBottom: 16 }}>
        <p>This is the main admin dashboard for managing users, activities, and system settings.</p>
      </ProCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: 'Total Users',
              value: 2458,
              description: <Statistic title="Week growth" value="12%" trend="up" />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: 'Active Activities',
              value: 8,
              description: <Statistic title="Month growth" value="2" trend="up" />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: 'Daily Active Users',
              value: 1289,
              description: <Statistic title="Day growth" value="8%" trend="up" />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: 'Revenue',
              value: 98750,
              prefix: '$',
              description: <Statistic title="Week growth" value="16%" trend="up" />,
            }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard title="Recent Activities" headerBordered>
            <p>Latest activity logs and user interactions will be displayed here.</p>
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <ProCard title="System Status" headerBordered>
            <p>✅ All systems operational</p>
            <p>✅ Database: Connected</p>
            <p>✅ API: Healthy</p>
          </ProCard>
        </Col>
        <Col xs={24} md={12}>
          <ProCard title="Quick Actions" headerBordered>
            <p>• Create new activity</p>
            <p>• Manage users</p>
            <p>• View reports</p>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
}
