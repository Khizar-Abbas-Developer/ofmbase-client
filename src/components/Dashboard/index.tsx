import React from 'react';
import { useAuthStore } from '../../lib/store';
import CreatorDashboard from './CreatorDashboard';
import AgencyDashboard from './AgencyDashboard';

const Dashboard = () => {
  const { profile } = useAuthStore();

  // If user is a creator, show creator dashboard
  if (profile?.type === 'creator') {
    return <CreatorDashboard />;
  }

  // Otherwise show agency dashboard
  return <AgencyDashboard />;
};

export default Dashboard;