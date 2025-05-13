import { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import PermissionsSettings from './PermissionsSettings';
import BillingSettings from './BillingSettings';
import NotificationSettings from './NotificationSettings';

type SettingsTab = 'profile' | 'permissions' | 'billing' | 'notifications';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Account Settings</h1>

      <div className="bg-slate-50 rounded-t-2xl">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
              activeTab === 'billing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Billing
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Notifications
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-b-2xl p-6">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'permissions' && <PermissionsSettings />}
        {activeTab === 'billing' && <BillingSettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
      </div>
    </div>
  );
};

export default Settings;