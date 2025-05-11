import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import Sidebar from './Sidebar';

const ProtectedLayout: React.FC = () => {
  const { user, profile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;