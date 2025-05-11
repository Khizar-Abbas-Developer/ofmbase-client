import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './lib/store';

// Layouts
import AuthLayout from './components/Auth/AuthLayout';
import ProtectedLayout from './components/ProtectedLayout';

// Auth Pages
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';

// Protected Pages
import Dashboard from './components/Dashboard';
import Creators from './components/Creators';
import Employees from './components/Employees';
import Tasks from './components/Tasks';
import Library from './components/Library';
import Marketing from './components/Marketing';
import Costumes from './components/Costumes';
import Financials from './components/Financials';
import Credentials from './components/Credentials';
import Settings from './components/Settings';

function App() {
  const loadProfile = useAuthStore(state => state.loadProfile);
  const { profile } = useAuthStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          {/* Redirect creators from root to costumes */}
          <Route 
            path="/" 
            element={
              profile?.type === 'creator' 
                ? <Navigate to="/costumes" replace /> 
                : <Dashboard />
            } 
          />
          <Route path="/creators" element={<Creators />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/library" element={<Library />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/costumes" element={<Costumes />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;