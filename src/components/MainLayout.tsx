import React from 'react';
import { Layout, Tabs, Typography } from 'antd';
import { UserOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname.includes('interviewer')) return '2';
    return '1';
  };

  const handleTabChange = (key: string) => {
    if (key === '1') {
      navigate('/interviewee');
    } else {
      navigate('/interviewer');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            Swipe AI Interviewer
          </Title>
          <div style={{ marginLeft: 'auto' }}>
            <Tabs
              activeKey={getActiveTab()}
              onChange={handleTabChange}
              items={[
                {
                  key: '1',
                  label: (
                    <span>
                      <UserOutlined />
                      Interviewee
                    </span>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <span>
                      <DashboardOutlined />
                      Interviewer
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Header>
      <Content style={{ padding: '24px' }}>
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayout;
