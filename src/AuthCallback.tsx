import { useEffect } from 'react';
import { Setting } from './utils';
import { Spin } from 'antd';

const AuthCallback = () => {
  useEffect(() => {
    Setting.CasdoorSDK.exchangeForAccessToken().then((res) => {
      Setting.setToken(res.access_token);
      Setting.goToLink('/');
    });
  }, []);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Spin
        spinning
        tip={'登录中...'}
      ></Spin>
    </div>
  );
};

export default AuthCallback;
