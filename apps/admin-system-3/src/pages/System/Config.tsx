import { PageContainer, ProForm, ProFormText, ProFormSwitch } from '@ant-design/pro-components';
import { Card, message } from 'antd';
import config from '@/config/env';

export default function Config() {
  return (
    <PageContainer title="系统配置">
      <Card>
        <ProForm
          onFinish={async (values) => {
            console.log('提交的值:', values);
            message.success('保存成功！');
            return true;
          }}
          submitter={{
            searchConfig: {
              submitText: '保存配置',
            },
          }}
        >
          <ProFormText
            name="siteName"
            label="站点名称"
            placeholder="请输入站点名称"
            initialValue="Admin System 3"
            rules={[{ required: true }]}
          />

          <ProFormText
            name="apiUrl"
            label="API 地址"
            placeholder="请输入 API 地址"
            initialValue={config.apiBaseUrl}
            rules={[{ required: true }]}
          />

          <ProFormText
            name="web3RpcUrl"
            label="Web3 RPC URL"
            placeholder="请输入 RPC URL"
            initialValue={config.web3.rpcUrl}
          />

          <ProFormText
            name="web3ChainId"
            label="Chain ID"
            placeholder="请输入 Chain ID"
            initialValue={config.web3.chainId.toString()}
          />

          <ProFormSwitch
            name="maintenance"
            label="维护模式"
            initialValue={false}
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
}
