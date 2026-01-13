import { Routes, Route } from 'react-router-dom';
import { ThemeRegistry } from '@/lib/ThemeRegistry';
import { ApolloWrapper } from '@/lib/ApolloWrapper';
import { AuthProvider } from '@/lib/AuthContext';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import StatusPage from '@/pages/StatusPage';
import SharedPage from '@/pages/SharedPage';
import ViewUserPage from '@/pages/ViewUserPage';
import ViewUserStatusPage from '@/pages/ViewUserStatusPage';

function App() {
  return (
    <ApolloWrapper>
      <ThemeRegistry>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/shared" element={<SharedPage />} />
            <Route path="/view/:userId" element={<ViewUserPage />} />
            <Route path="/view/:userId/status" element={<ViewUserStatusPage />} />
          </Routes>
        </AuthProvider>
      </ThemeRegistry>
    </ApolloWrapper>
  );
}

export default App;
