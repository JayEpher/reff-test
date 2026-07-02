import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormText,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { message, Divider } from 'antd';
import { config } from '@puff/config';

export default function SettingsPage() {
  const handleSubmit = async (values: any) => {
    console.log('Settings updated:', values);
    message.success('Settings saved successfully!');
  };

  return (
    <PageContainer>
      <ProCard title="System Settings">
        <ProForm
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: 'Save Settings',
            },
          }}
          initialValues={{
            appName: config.appName,
            apiBaseUrl: config.apiBaseUrl,
            enableNotifications: true,
            enableAnalytics: true,
          }}
        >
          <Divider>General Settings</Divider>

          <ProFormText
            name="appName"
            label="Application Name"
            placeholder="Enter application name"
            rules={[{ required: true }]}
          />

          <ProFormText
            name="apiBaseUrl"
            label="API Base URL"
            placeholder="Enter API base URL"
            rules={[{ required: true, type: 'url' }]}
          />

          <Divider>Feature Flags</Divider>

          <ProFormSwitch
            name="enableNotifications"
            label="Enable Notifications"
            tooltip="Turn on/off push notifications"
          />

          <ProFormSwitch
            name="enableAnalytics"
            label="Enable Analytics"
            tooltip="Turn on/off analytics tracking"
          />

          <ProFormSwitch
            name="maintenanceMode"
            label="Maintenance Mode"
            tooltip="Enable maintenance mode to restrict access"
          />

          <Divider>Email Settings</Divider>

          <ProFormText name="smtpHost" label="SMTP Host" placeholder="smtp.example.com" />

          <ProFormText name="smtpPort" label="SMTP Port" placeholder="587" />

          <ProFormText
            name="emailFrom"
            label="From Email"
            placeholder="noreply@example.com"
            rules={[{ type: 'email' }]}
          />
        </ProForm>
      </ProCard>
    </PageContainer>
  );
}
