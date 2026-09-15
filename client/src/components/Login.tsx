import React, { useState } from 'react';
import { Button, Input, Card, message } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      message.error('请输入用户名和密码');
      return;
    }

    setLoading(true);

    try {
      // 调用登录接口
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('登录请求响应状态:', response.status);
      console.log('登录请求响应 headers:', response.headers);
      
      const data = await response.json();
      console.log('登录请求响应数据:', data);

      if (data.token) {
        onLogin(data.token);
        message.success('登录成功');
      } else {
        message.error(data.msg || '登录失败：未返回 token');
      }
    } catch (error) {
      message.error('登录失败，请检查网络连接或服务器状态');
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, padding: '32px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#e6f7ff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 16px',
            fontSize: '40px',
            color: '#1890ff'
          }}>
            👤
          </div>
          <h2 style={{ margin: 0 }}>在线学习管理平台</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="large"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              size="large"
            />
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: '100%', height: 40, fontSize: '16px' }}
          >
            登录
          </Button>

          <div style={{ marginTop: 16, textAlign: 'center', color: '#666' }}>
            测试账号：admin / admin123
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;