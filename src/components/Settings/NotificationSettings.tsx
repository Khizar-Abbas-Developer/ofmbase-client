import React, { useState } from 'react';

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive updates about your agency',
      enabled: false,
    },
    {
      id: 'payments',
      title: 'Payment Reminders',
      description: 'Get notified about upcoming payments',
      enabled: false,
    },
    {
      id: 'content',
      title: 'New Content Alerts',
      description: 'Notifications when creators upload new content',
      enabled: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setPreferences(preferences.map(pref =>
      pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
    ));
  };

  const handleSave = () => {
    // Handle saving notification preferences
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Notification Preferences</h2>

      <div className="space-y-6">
        {preferences.map(preference => (
          <div key={preference.id} className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-700">{preference.title}</h3>
              <p className="text-sm text-slate-500">{preference.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preference.enabled}
                onChange={() => handleToggle(preference.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="mt-6 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          Save Notification Settings
        </button>
      </div>
    </div>
  );
}

export default NotificationSettings;