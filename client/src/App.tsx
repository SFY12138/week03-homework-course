import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, ConfigProvider } from 'antd';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CourseManagement from './components/CourseManagement';
import StudentManagement from './components/StudentManagement';
import Summary from './components/Summary';
import './App.css';

const { Header, Sider, Content } = Layout;

// 导航组件
function Navigation({ setIsLoggedIn }: { setIsLoggedIn: (isLoggedIn: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const getMenuItemKey = (path: string) => {
    return path.replace('/', '');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#fff' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
          学习管理平台
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '16px' }}>管理员</span>
          <button
            onClick={handleLogout}
            style={{
              background: '#1890ff',
              color: '#fff',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            退出登录
          </button>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[getMenuItemKey(location.pathname)]}
            style={{ height: '100%', borderRight: 0 }}
            onSelect={(key) => navigate(`/${key.key}`)}
            items={[
              {
                key: 'dashboard',
                label: '工作台'
              },
              {
                key: 'courses',
                label: '课程管理'
              },
              {
                key: 'students',
                label: '学生管理'
              },
              {
                key: 'summary',
                label: '学习总结'
              }
            ]}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<CourseManagement />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

// 主应用组件
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 检查 localStorage 中的 token
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  return (
    <ConfigProvider>
      <Routes>
        {!isLoggedIn ? (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/*" element={<Navigation setIsLoggedIn={setIsLoggedIn} />} />
          </>
        )}
      </Routes>
    </ConfigProvider>
  );
}

// 包装 App 组件以使用 Router
function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;