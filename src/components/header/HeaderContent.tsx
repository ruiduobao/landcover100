import { useState } from 'react';
import { Flex, Typography, Space, Button } from 'antd';
import logo from '../../assets/imgs/logo.png';
import { GithubOutlined, LoginOutlined, LogoutOutlined, QuestionOutlined } from '@ant-design/icons';
import './style.less';
import { Setting } from '../../utils';

const { Title } = Typography;
const title = '遥感产品数据云';
// const title = '';
const HeaderContent = () => {
  const [isLoged, setIsLoged] = useState(Setting.isLoggedIn());

  return (
    <Flex
      justify="space-between"
      align="center"
      className="header-content"
    >
      <div className="title-block">
        <img src={logo} />
        <Title level={2}>{title}</Title>
      </div>
      <Space>
        {isLoged ? (
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={() => {
              Setting.logout();
              Setting.goToLink('/');
              setIsLoged(false);
            }}
          >
            登出
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => {
              Setting.CasdoorSDK.signin_redirect();
            }}
          >
            登录
          </Button>
        )}
        <Button icon={<QuestionOutlined />}>使用须知</Button>
        <Button icon={<GithubOutlined />} />
      </Space>
    </Flex>
  );
};
export default HeaderContent;
