import { NavLink, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { signOutUser } from "../redux/user/userSlice";
import { LogOut, TrendingUp, UserCircle } from "lucide-react";

import {
  contentSection,
  dashboardSection,
  financialSection,
  managementSection,
  settingsSection,
} from "../constants";
import { useEffect } from "react";
import axios from "axios";

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const allowedModule = currentUser?.accessibleModules || [];

  const handleNavClick = () => onClose?.();

  const handleSignOut = () => {
    dispatch(signOutUser());
    navigate("/signin");
  };

  const getRoleLabel = (type: string) => {
    switch (type) {
      case "owner":
        return "Agency Owner";
      case "creator":
        return "Creator";
      case "employee":
        return currentUser?.accountType
          ? currentUser.accountType.charAt(0).toUpperCase() +
              currentUser.accountType.slice(1)
          : "Employee";
      default:
        return type;
    }
  };

  const renderSection = (title: string, sectionItems: any[]) => {
    const filteredItems = sectionItems.filter((item) =>
      allowedModule.includes(item.relation)
    );

    if (filteredItems.length === 0) return null;

    return (
      <div>
        <p className="text-xs font-semibold text-slate-400 tracking-wider mb-4">
          {title}
        </p>
        <ul className="space-y-1">
          {filteredItems.map((item) => (
            <li key={item.relation}>
              <NavLink
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-150 ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50 font-medium shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const checkSubscriptionExpiration = () => {
    const start = new Date(currentUser.subscriptionStart);
    const expiry = new Date(currentUser.subscriptionExpiry);

    if (!isNaN(start) && !isNaN(expiry)) {
      const now = new Date();

      if (now > expiry) {
        // console.log("🔴 Subscription is expired");
      } else {
        const timeDiff = expiry.getTime() - now.getTime();
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

        // console.log(
        //   `🟢 Subscription is active. Time remaining: ${days}d ${hours}h ${minutes}m`
        // );
      }
    } else {
      console.log("❌ Invalid subscription dates.");
    }
  };

  const checkTokenExpiration = async () => {
    const token = await currentUser?.token;
    try {
      await axios.post(
        `${URL}/api/user/confirm-token`,
        { token },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
    } catch (error: any) {
      if (
        error.response.data.message ===
        "Invalid or expired token. Please log in again."
      ) {
        console.log("🔴 Token has expired");
        dispatch(signOutUser());
        navigate("/sign");
      }
    }
  };
  useEffect(() => {
    if (currentUser) {
      // Call immediately on mount
      checkTokenExpiration();
      checkSubscriptionExpiration();

      const interval = setInterval(() => {
        checkTokenExpiration();
        checkSubscriptionExpiration();
      }, 30000); // 30 seconds

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [currentUser, navigate]);

  return (
    <>
      {/* Existing Sidebar */}
      <div className="hidden md:flex w-72 h-full bg-white shadow-lg flex-col">
        <div className="px-6 py-8 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              OFMBase
            </span>
          </div>
        </div>
        {/* User Info */}
        {currentUser && (
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {currentUser.email}
                </p>
                <p className="text-xs text-slate-500">
                  {getRoleLabel(currentUser.accountType)}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-10">
          {renderSection("OVERVIEW", dashboardSection)}
          {renderSection("MANAGEMENT", managementSection)}
          {renderSection("CONTENT", contentSection)}
          {renderSection("FINANCIAL", financialSection)}
          {renderSection("SETTINGS", settingsSection)}
        </nav>
        {/* Logout */}
        <div className="border-t border-slate-100 p-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>{" "}
      </div>

      {/* Bottom NavBar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-slate-200 z-50 overflow-x-auto">
        <div className="flex items-center justify-start space-x-6 px-4 py-2 overflow-x-auto scrollbar-hide">
          {[
            ...dashboardSection,
            ...managementSection,
            ...contentSection,
            ...financialSection,
            ...settingsSection,
          ]
            .filter((item) =>
              currentUser?.accessibleModules?.includes(item.relation)
            )
            .map((item) => (
              <NavLink
                key={item.relation}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center min-w-[60px] text-xs ${
                    isActive ? "text-indigo-600" : "text-slate-600"
                  }`
                }
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span>{item.name}</span>
              </NavLink>
            ))}

          {/* Logout Button - Mobile */}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center min-w-[60px] text-xs text-red-500"
          >
            <LogOut className="h-5 w-5 mb-1" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
