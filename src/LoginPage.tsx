import { useState } from 'react'
import { Button, Card, Checkbox, Flex, Form, Input, Layout, message, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'

interface LoginValues {
  username: string
  password: string
  remember: boolean
}

// Stand-in for a real auth request; replace with a call to your backend.
function fakeLogin({ username, password }: LoginValues) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') resolve()
      else reject(new Error('Invalid username or password'))
    }, 800)
  })
}

function LoginPage() {
  const [messageApi, contextHolder] = message.useMessage()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginValues) => {
    setLoading(true)
    try {
      await fakeLogin(values)
      messageApi.success(`Welcome back, ${values.username}!`)
    } catch (err) {
      messageApi.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Flex justify="center" align="center" style={{ flex: 1, padding: 16 }}>
        <Card style={{ width: '100%', maxWidth: 400 }}>
          <Flex vertical align="center" style={{ marginBottom: 24 }}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Sign in
            </Typography.Title>
            <Typography.Text type="secondary">Welcome back to antd-app</Typography.Text>
          </Flex>
          <Form<LoginValues>
            name="login"
            size="large"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            disabled={loading}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item>
              <Flex justify="space-between" align="center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Typography.Link href="#">Forgot password?</Typography.Link>
              </Flex>
            </Form.Item>
            <Form.Item style={{ marginBottom: 12 }}>
              <Button block type="primary" htmlType="submit" loading={loading}>
                Log in
              </Button>
            </Form.Item>
          </Form>
          <Typography.Text type="secondary">
            Don't have an account? <Typography.Link href="#">Register now</Typography.Link>
          </Typography.Text>
        </Card>
      </Flex>
    </Layout>
  )
}

export default LoginPage
