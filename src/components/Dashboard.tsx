import React from 'react';
import { useAuthStore } from '../lib/store';
import { Users, DollarSign, TrendingUp, Bell, Search, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend?: { value: string; positive: boolean } }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      {trend && (
        <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${trend.positive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
          {trend.value}
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <p className="text-2xl font-bold mt-2 text-slate-800">{value}</p>
  </div>
);

const ActivityItem = ({ icon: Icon, title, time }: { icon: any; title: string; time: string }) => (
  <div className="flex items-center p-3 rounded-xl bg-slate-50">
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
      <Icon className="h-5 w-5 text-blue-600" />
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <p className="text-xs text-slate-500">{time}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { profile } = useAuthStore();

  const stats = {
    activeCreators: { value: '0', trend: { value: '0%', positive: true } },
    monthlyRevenue: { value: '$0', trend: { value: '0%', positive: true } },
    monthlyGrowth: { value: '0%', trend: { value: '0%', positive: true } }
  };

  const recentActivity: { icon: any; title: string; time: string }[] = [];
  const upcomingTasks: { icon: any; title: string; time: string }[] = [];

  const getRoleLabel = (type: string) => {
    switch (type) {
      case 'agency':
        return 'Agency Owner';
      case 'creator':
        return 'Creator';
      case 'employee':
        return 'Employee';
      default:
        return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {getRoleLabel(profile?.type || '')}!
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening today.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-150 relative">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Active Creators"
          value={stats.activeCreators.value}
          icon={Users}
          trend={stats.activeCreators.trend}
        />
        <StatCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue.value}
          icon={DollarSign}
          trend={stats.monthlyRevenue.trend}
        />
        <StatCard
          title="Monthly Growth"
          value={stats.monthlyGrowth.value}
          icon={TrendingUp}
          trend={stats.monthlyGrowth.trend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <ActivityItem
                  key={index}
                  icon={activity.icon}
                  title={activity.title}
                  time={activity.time}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Tasks</h2>
          <div className="space-y-4">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task, index) => (
                <ActivityItem
                  key={index}
                  icon={task.icon}
                  title={task.title}
                  time={task.time}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No upcoming tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;