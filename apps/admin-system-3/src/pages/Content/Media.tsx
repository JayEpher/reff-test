import { PageContainer } from '@ant-design/pro-components';
import { Card, Upload, Button, Image } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';

export default function Media() {
  return (
    <PageContainer title="媒体库">
      <Card title="上传媒体文件" style={{ marginBottom: 16 }}>
        <Upload
          action="/api/upload"
          listType="picture-card"
          maxCount={10}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        </Upload>
      </Card>

      <Card title="媒体文件列表">
        <Image.PreviewGroup>
          <Image
            width={200}
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          />
          <Image
            width={200}
            src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg"
          />
        </Image.PreviewGroup>
      </Card>
    </PageContainer>
  );
}
