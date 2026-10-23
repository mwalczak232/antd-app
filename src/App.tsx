import { Button, Card, Flex, Layout, Typography } from 'antd'
import { SmileOutlined } from '@ant-design/icons'

const { Header, Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Typography.Title level={4} style={{ color: '#fff', margin: '16px 0' }}>
          antd-app
        </Typography.Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Flex justify="center">
          <Card title="Hello, Ant Design" style={{ maxWidth: 480, width: '100%' }}>
            <Typography.Paragraph>
              Edit <code>src/App.tsx</code> to get started.
            </Typography.Paragraph>
            <Button type="primary" icon={<SmileOutlined />}>
              Primary button
            </Button>
          </Card>
        </Flex>
      </Content>
    </Layout>
  )
}

export default App
