import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormText,
  ProFormDigit,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { message, Divider } from 'antd';

export default function ConfigPage() {
  const handleSubmit = async (values: any) => {
    console.log('Config updated:', values);
    message.success('Configuration saved successfully!');
  };

  return (
    <PageContainer>
      <ProCard title="System Configuration">
        <ProForm
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: 'Save Configuration',
            },
          }}
          initialValues={{
            maxUploadSize: 50,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            enableCaching: true,
            enableCompression: true,
            enableLogging: true,
          }}
        >
          <Divider>Upload Settings</Divider>

          <ProFormDigit
            name="maxUploadSize"
            label="Max Upload Size (MB)"
            min={1}
            max={500}
            fieldProps={{ precision: 0 }}
          />

          <Divider>Security Settings</Divider>

          <ProFormDigit
            name="sessionTimeout"
            label="Session Timeout (minutes)"
            min={5}
            max={120}
            fieldProps={{ precision: 0 }}
          />

          <ProFormDigit
            name="maxLoginAttempts"
            label="Max Login Attempts"
            min={3}
            max={10}
            fieldProps={{ precision: 0 }}
          />

          <Divider>Performance Settings</Divider>

          <ProFormSwitch
            name="enableCaching"
            label="Enable Caching"
            tooltip="Cache frequently accessed data"
          />

          <ProFormSwitch
            name="enableCompression"
            label="Enable Compression"
            tooltip="Compress HTTP responses"
          />

          <Divider>Monitoring Settings</Divider>

          <ProFormSwitch
            name="enableLogging"
            label="Enable Logging"
            tooltip="Log system activities"
          />

          <ProFormText name="logLevel" label="Log Level" placeholder="info, warning, error" />
        </ProForm>
      </ProCard>
    </PageContainer>
  );
}
