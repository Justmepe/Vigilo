import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import FormDashboard from '../components/FormDashboard';

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <FormDashboard user={user} onLogout={handleLogout} />
  );
}
