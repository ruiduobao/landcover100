import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import AuthCallback from './AuthCallback';

const WrapApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/callback"
          element={<AuthCallback />}
        />
        <Route
          path="/"
          element={<App />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default WrapApp;
