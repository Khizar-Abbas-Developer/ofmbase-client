import { useState, useRef, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { useAppSelector } from "../redux/hooks";

const NotificationComponent = ({ data }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications } = useAppSelector((state) => state.notifications);
  const dropdownRef = useRef(null);
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-150 relative"
        >
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-xl border border-slate-200 z-50">
            <div className="p-4 font-semibold border-b border-slate-100">
              {notifications && notifications.length > 0
                ? "Notifications"
                : "No Notifications"}
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {notifications &&
                notifications.length > 0 &&
                notifications.map((n: any) => (
                  <li
                    key={n._id}
                    className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {n.message}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationComponent;
