import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Col, Row, Progress } from 'antd';
import { config } from '@puff/config';

const { Statistic, Divider } = StatisticCard;

export default function DashboardPage() {
  return (
    <PageContainer>
      <ProCard title={`Welcome to ${config.appName} Admin System 2`} style={{ marginBottom: 16 }}>
        <p>Content management and system monitoring dashboard.</p>
      </ProCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <StatisticCard
            statistic={{
              title: 'Total Articles',
              value: 342,
              description: <Statistic title="Published" value="298" />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatisticCard
            statistic={{
              title: 'Media Files',
              value: 1567,
              suffix: 'files',
              description: <Statistic title="Storage" value="12.5GB" />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatisticCard
            statistic={{
              title: 'Page Views',
              value: 45678,
              description: <Statistic title="Today" value="3456" trend="up" />,
            }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <ProCard title="System Performance" headerBordered>
            <div style={{ marginBottom: 16 }}>
              <p>CPU Usage</p>
              <Progress percent={45} status="active" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <p>Memory Usage</p>
              <Progress percent={68} status="active" />
            </div>
            <div>
              <p>Disk Usage</p>
              <Progress percent={32} status="active" />
            </div>
          </ProCard>
        </Col>
        <Col xs={24} md={12}>
          <ProCard title="Recent Updates" headerBordered>
            <p>• New article published: "Getting Started Guide"</p>
            <p>• Media uploaded: 15 new images</p>
            <p>• System backup completed</p>
            <p>• Security update installed</p>
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard title="Traffic Overview" headerBordered>
            <StatisticCard.Group>
              <StatisticCard
                statistic={{
                  title: 'Desktop',
                  value: '62%',
                }}
              />
              <Divider type="vertical" />
              <StatisticCard
                statistic={{
                  title: 'Mobile',
                  value: '32%',
                }}
              />
              <Divider type="vertical" />
              <StatisticCard
                statistic={{
                  title: 'Tablet',
                  value: '6%',
                }}
              />
            </StatisticCard.Group>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
}
