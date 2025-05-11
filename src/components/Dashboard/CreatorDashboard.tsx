import React from 'react';
import { useAuthStore } from '../../lib/store';
import { Camera, FileText } from 'lucide-react';

const CreatorDashboard = () => {
  const { profile } = useAuthStore();

  const upcomingCostumes = [
    {
      id: '1',
      subname: 'John D.',
      costumenumber: 'first',
      dueDate: '2025-05-01',
      status: 'pending'
    },
    {
      id: '2',
      subname: 'Sarah M.',
      costumenumber: 'second',
      dueDate: '2025-05-03',
      status: 'pending'
    }
  ];

  const upcomingContent = [
    {
      id: '1',
      title: 'Instagram Post',
      dueDate: '2025-05-02',
      status: 'pending'
    },
    {
      id: '2',
      title: 'TikTok Video',
      dueDate: '2025-05-04',
      status: 'pending'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {profile?.name || 'Creator'}!</h1>
        <p className="text-slate-500 mt-1">Here's what's coming up next.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Costumes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Camera className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Costumes</h2>
          </div>
          
          <div className="space-y-4">
            {upcomingCostumes.map(costume => (
              <div key={costume.id} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-800">{costume.subname}</h3>
                  <span className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-full">
                    {costume.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">Costume #{costume.costumenumber}</p>
                <p className="text-sm text-slate-500 mt-1">Due: {new Date(costume.dueDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Content Requests</h2>
          </div>
          
          <div className="space-y-4">
            {upcomingContent.map(content => (
              <div key={content.id} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-800">{content.title}</h3>
                  <span className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-full">
                    {content.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Due: {new Date(content.dueDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;