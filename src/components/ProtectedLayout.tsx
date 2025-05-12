import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../src/redux/hooks"; // Adjust the path as needed

import Sidebar from "./Sidebar";

const ProtectedLayout: React.FC = () => {
  const { currentUser, loading } = useAppSelector((state) => state.user);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
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
