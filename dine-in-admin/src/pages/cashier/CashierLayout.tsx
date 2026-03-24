import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function CashierLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { to: '/cashier', label: 'New Order', icon: '🛒', end: true },
    { to: '/cashier/orders', label: 'Orders', icon: '📋' },
    { to: '/cashier/availability', label: 'Availability', icon: '✅' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-indigo-600">🍽️ POS</span>
          <nav className="flex items-center gap-1 ml-4">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-sm text-gray-700 font-medium">{user?.displayName || 'Cashier'}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
