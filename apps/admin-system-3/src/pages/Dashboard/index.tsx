import { Card, Col, Row, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import config from '@/config/env';

export default function Dashboard() {
  return (
    <PageContainer
      title="仪表板"
      subTitle={`环境: ${config.env}`}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={11280}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={9300}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单数"
              value={1280}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="收入"
              value={128000}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Web3 配置信息" style={{ marginTop: 16 }}>
        <p><strong>Chain ID:</strong> {config.web3.chainId}</p>
        <p><strong>Chain Name:</strong> {config.web3.chainName}</p>
        <p><strong>RPC URL:</strong> {config.web3.rpcUrl}</p>
        <p><strong>Explorer:</strong> <a href={config.web3.explorerUrl} target="_blank" rel="noopener noreferrer">{config.web3.explorerUrl}</a></p>
      </Card>
    </PageContainer>
  );
}
