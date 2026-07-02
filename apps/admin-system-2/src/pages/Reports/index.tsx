import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Column } from '@ant-design/plots';
import { Row, Col } from 'antd';

export default function ReportsPage() {
  const data = [
    { month: 'Jan', value: 3000 },
    { month: 'Feb', value: 4200 },
    { month: 'Mar', value: 3800 },
    { month: 'Apr', value: 5100 },
    { month: 'May', value: 4900 },
    { month: 'Jun', value: 6200 },
  ];

  const config = {
    data,
    xField: 'month',
    yField: 'value',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      month: {
        alias: 'Month',
      },
      value: {
        alias: 'Views',
      },
    },
  };

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <ProCard title="Monthly Page Views" headerBordered>
            <Column {...config} />
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <ProCard title="User Engagement" headerBordered>
            <p>Average Session Duration: 5m 32s</p>
            <p>Bounce Rate: 34.5%</p>
            <p>Pages per Session: 3.8</p>
          </ProCard>
        </Col>
        <Col xs={24} md={12}>
          <ProCard title="Content Performance" headerBordered>
            <p>Top Article: "Getting Started Guide"</p>
            <p>Most Viewed Category: Tutorials</p>
            <p>Average Read Time: 4m 15s</p>
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard title="Traffic Sources" headerBordered>
            <p>Direct: 45%</p>
            <p>Search Engines: 35%</p>
            <p>Social Media: 15%</p>
            <p>Referrals: 5%</p>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
}
