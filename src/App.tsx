import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAppStore } from './store';
import { Sidebar } from './components/Sidebar';

// Pages
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { CreateVideoPage } from './pages/CreateVideo';
import { VideosPage } from './pages/Videos';
import { AvatarsPage } from './pages/Avatars';
import { SettingsPage } from './pages/Settings';

const ProtectedLayout = () => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#12121a',
            border: '1px solid #1e1e2e',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/create" element={<CreateVideoPage />} />
          <Route path="/dashboard/videos" element={<VideosPage />} />
          <Route path="/dashboard/avatars" element={<AvatarsPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
