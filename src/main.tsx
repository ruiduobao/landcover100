import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App as AntdApp, ConfigProvider } from 'antd';
import './index.css';
import { theme } from './theme.ts';
import WrapApp from './WrapApp.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={theme}>
      <AntdApp>
        <WrapApp />
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
);
