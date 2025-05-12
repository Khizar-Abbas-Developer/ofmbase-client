import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed

const AuthLayout: React.FC = () => {
  const { currentUser, loading } = useAppSelector((state) => state.user);
  console.log(currentUser);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
