import React, { useContext } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider, AuthContext } from './context/AuthContext';

// Admin pages
import LoginPage       from './pages/admin/LoginPage';
import SignupPage      from './pages/admin/SignupPage';
import VerifyPage      from './pages/admin/VerifyPage';
import DashboardHome   from './pages/admin/DashboardHome';
import DashboardPage   from './pages/admin/DashboardPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminNotificationTemplatesPage from './pages/admin/AdminNotificationTemplatesPage';
import AdminNotificationSettingsPage  from './pages/admin/AdminNotificationSettingsPage';

// Freelancer pages
import FreelancerProfilePage    from './pages/freelancer/FreelancerProfilePage';
import FreelancerBidsPage       from './pages/freelancer/FreelancerBidsPage';
import FreelancerProjectsPage   from './pages/freelancer/FreelancerProjectsPage';
import FreelancerReviewsPage    from './pages/freelancer/FreelancerReviewsPage';
import FreelancerTimelinePage   from './pages/freelancer/FreelancerTimelinePage';

// Client pages
import ClientDashboardPage          from './pages/client/ClientDashboardPage';
import ClientFreelancerSearchPage   from './pages/client/ClientFreelancerSearchPage';
import ClientProjectsPage           from './pages/client/ClientProjectsPage';
import AnalyticsDashboardPage       from './pages/client/AnalyticsDashboardPage';

// Chat pages
import FreelancerChatListPage from './pages/chat/FreelancerChatListPage';
import ChatListPage           from './pages/chat/ChatListPage';
import ChatPage               from './pages/chat/ChatPage';

import OAuthCallback from './pages/OAuthCallback';


function PrivateRoute({ children, requiredRole }) {
  const { token, role } = useContext(AuthContext);
  if (!token) return <Navigate to="/" replace />;
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(role)) return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* public */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />

          {/* admin */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute requiredRole="admin">
                <DashboardHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/freelancers"
            element={
              <PrivateRoute requiredRole="admin">
                <DashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminAnalyticsPage />
              </PrivateRoute>
            }
          />

          {/* redirect bare /admin/notifications */}
          <Route
            path="/admin/notifications"
            element={<Navigate to="/admin/notifications/templates" replace />}
          />

          <Route
            path="/admin/notifications/templates"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminNotificationTemplatesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/notifications/settings"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminNotificationSettingsPage />
              </PrivateRoute>
            }
          />

          {/* freelancer */}
          <Route
            path="/freelancer/profile"
            element={
              <PrivateRoute requiredRole="freelancer">
                <FreelancerProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/projects"
            element={
              <PrivateRoute requiredRole="freelancer">
                <FreelancerProjectsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/bids"
            element={
              <PrivateRoute requiredRole="freelancer">
                <FreelancerBidsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/messages"
            element={
              <PrivateRoute requiredRole="freelancer">
                <FreelancerChatListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/reviews"
            element={
              <PrivateRoute requiredRole="freelancer">
                <FreelancerReviewsPage />
              </PrivateRoute>
            }
          />

          {/* Project Timeline for freelancers */}
          <Route
            path="/freelancer/project-timeline/:projectId"
            element={
              <PrivateRoute requiredRole="freelancer">
                <FreelancerTimelinePage />
              </PrivateRoute>
            }
          />

          {/* client */}
          <Route
            path="/client/dashboard"
            element={
              <PrivateRoute requiredRole="client">
                <ClientDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/client/search"
            element={
              <PrivateRoute requiredRole="client">
                <ClientFreelancerSearchPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/client/projects"
            element={
              <PrivateRoute requiredRole="client">
                <ClientProjectsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/client/analytics"
            element={
              <PrivateRoute requiredRole="client">
                <AnalyticsDashboardPage />
              </PrivateRoute>
            }
          />

          {/* chat - accessible to both clients and freelancers */}
          <Route
            path="/messages"
            element={
              <PrivateRoute requiredRole={['client', 'freelancer']}>
                <ChatListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/:otherId"
            element={
              <PrivateRoute requiredRole={['client', 'freelancer']}>
                <ChatPage />
              </PrivateRoute>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
