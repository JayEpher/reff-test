import {
  PageContainer,
  ProForm,
  ProFormText,
  ProFormDateRangePicker,
  ProFormSelect,
} from '@ant-design/pro-components';
import { message } from 'antd';
import { useNavigate } from '@umijs/max';

export default function CreateActivityPage() {
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    console.log('Form values:', values);
    message.success('Activity created successfully!');
    setTimeout(() => {
      navigate('/activities/list');
    }, 1000);
  };

  return (
    <PageContainer>
      <ProForm
        onFinish={handleSubmit}
        submitter={{
          searchConfig: {
            submitText: 'Create Activity',
          },
          resetButtonProps: {
            onClick: () => navigate('/activities/list'),
          },
        }}
      >
        <ProFormText
          name="name"
          label="Activity Name"
          placeholder="Enter activity name"
          rules={[{ required: true, message: 'Please enter activity name' }]}
        />

        <ProFormSelect
          name="type"
          label="Activity Type"
          placeholder="Select activity type"
          options={[
            { label: 'Halloween', value: 'halloween' },
            { label: 'Team', value: 'team' },
            { label: 'Check-in', value: 'checkin' },
            { label: 'Mini Game', value: 'mini-game' },
          ]}
          rules={[{ required: true, message: 'Please select activity type' }]}
        />

        <ProFormDateRangePicker
          name="timeRange"
          label="Time Range"
          rules={[{ required: true, message: 'Please select time range' }]}
        />

        <ProFormText
          name="description"
          label="Description"
          placeholder="Enter activity description"
        />
      </ProForm>
    </PageContainer>
  );
}
