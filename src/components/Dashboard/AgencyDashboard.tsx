import React from 'react';
import { useAuthStore } from '../../lib/store';
import { Users, DollarSign, TrendingUp, Bell, Search } from 'lucide-react';

const AgencyDashboard = () => {
  const { profile } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {profile?.name || 'Agency Owner'}!
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening today.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4 lg:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              Send Email
            </button>
            <button className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
              Test
            </button>
            <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-150 relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-medium text-slate-500">Active Creators</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-medium text-slate-500">Monthly Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">$0</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-medium text-slate-500">Monthly Growth</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">0%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <p className="text-center text-slate-500 py-4">No recent activity</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Tasks</h2>
          <p className="text-center text-slate-500 py-4">No upcoming tasks</p>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;