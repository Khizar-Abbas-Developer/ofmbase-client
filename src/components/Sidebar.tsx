import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { 
  Users, 
  UserCircle, 
  CheckCircle, 
  Image, 
  TrendingUp,
  Camera,
  DollarSign,
  Key,
  Settings,
  LogOut,
  TrendingUp as Logo
} from 'lucide-react';

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const { profile, signOut } = useAuthStore();

  const getNavItems = () => {
    // Creator view
    if (profile?.type === 'creator') {
      return [
        { section: 'CONTENT', items: [
          { name: 'Costumes', icon: Camera, path: '/costumes' },
          { name: 'Content Requests', icon: Image, path: '/library' }
        ]}
      ];
    }

    // Employee view
    if (profile?.type === 'employee' && profile.permissions) {
      const items = [];
      const managementItems = [];
      const contentItems = [];
      const financialItems = [];
      const settingsItems = [];

      // Add items based on permissions
      if (profile.permissions.includes('dashboard')) {
        items.push({ section: 'OVERVIEW', items: [
          { name: 'Dashboard', icon: TrendingUp, path: '/' }
        ]});
      }

      // Management items
      if (profile.permissions.includes('creators')) {
        managementItems.push({ name: 'Creators', icon: Users, path: '/creators' });
      }
      if (profile.permissions.includes('employees')) {
        managementItems.push({ name: 'Employees', icon: UserCircle, path: '/employees' });
      }
      if (profile.permissions.includes('tasks')) {
        managementItems.push({ name: 'Tasks', icon: CheckCircle, path: '/tasks' });
      }
      if (managementItems.length > 0) {
        items.push({ section: 'MANAGEMENT', items: managementItems });
      }

      // Content items
      if (profile.permissions.includes('library')) {
        contentItems.push({ name: 'Library', icon: Image, path: '/library' });
      }
      if (profile.permissions.includes('marketing')) {
        contentItems.push({ name: 'Marketing', icon: TrendingUp, path: '/marketing' });
      }
      if (profile.permissions.includes('costumes')) {
        contentItems.push({ name: 'Costumes', icon: Camera, path: '/costumes' });
      }
      if (contentItems.length > 0) {
        items.push({ section: 'CONTENT', items: contentItems });
      }

      // Financial items
      if (profile.permissions.includes('financials')) {
        items.push({ section: 'FINANCIAL', items: [
          { name: 'Financials', icon: DollarSign, path: '/financials' }
        ]});
      }

      // Settings items
      if (profile.permissions.includes('credentials')) {
        settingsItems.push({ name: 'Credentials', icon: Key, path: '/credentials' });
      }
      if (profile.permissions.includes('settings')) {
        settingsItems.push({ name: 'Settings', icon: Settings, path: '/settings' });
      }
      if (settingsItems.length > 0) {
        items.push({ section: 'SETTINGS', items: settingsItems });
      }

      return items;
    }

    // Agency view (default)
    return [
      { section: 'OVERVIEW', items: [
        { name: 'Dashboard', icon: TrendingUp, path: '/' }
      ]},
      { section: 'MANAGEMENT', items: [
        { name: 'Creators', icon: Users, path: '/creators' },
        { name: 'Employees', icon: UserCircle, path: '/employees' },
        { name: 'Tasks', icon: CheckCircle, path: '/tasks' }
      ]},
      { section: 'CONTENT', items: [
        { name: 'Library', icon: Image, path: '/library' },
        { name: 'Marketing', icon: TrendingUp, path: '/marketing' },
        { name: 'Costumes', icon: Camera, path: '/costumes' }
      ]},
      { section: 'FINANCIAL', items: [
        { name: 'Financials', icon: DollarSign, path: '/financials' }
      ]},
      { section: 'SETTINGS', items: [
        { name: 'Credentials', icon: Key, path: '/credentials' },
        { name: 'Settings', icon: Settings, path: '/settings' }
      ]}
    ];
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const getRoleLabel = (type: string) => {
    switch (type) {
      case 'agency':
        return 'Agency Owner';
      case 'creator':
        return 'Creator';
      case 'employee':
        return profile?.role ? `${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}` : 'Employee';
      default:
        return type;
    }
  };

  return (
    <div className="w-72 h-full bg-white shadow-lg flex flex-col">
      <div className="px-6 py-8 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Logo className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
            OFMBase
          </span>
        </div>
      </div>
      
      {profile && (
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{profile.email}</p>
              <p className="text-xs text-slate-500">{getRoleLabel(profile.type)}</p>
            </div>
          </div>
        </div>
      )}
      
      <nav className="flex-1 overflow-y-auto p-6 space-y-10">
        {getNavItems().map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold text-slate-400 tracking-wider mb-4">{section.section}</p>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-150 ${
                        isActive
                          ? 'text-indigo-600 bg-indigo-50 font-medium shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <item.icon className={`h-5 w-5 mr-3 transition-colors duration-150`} />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <button 
          onClick={handleSignOut}
          className="flex items-center px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-xl w-full transition-colors duration-150"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;