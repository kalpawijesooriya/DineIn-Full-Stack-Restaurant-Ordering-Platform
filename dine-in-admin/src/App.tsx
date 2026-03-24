import { Routes, Route, NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Settings from '@/pages/Settings';
import Orders from '@/pages/Orders';
import Reports from '@/pages/Reports';
import Customizations from '@/pages/Customizations';
import Login from '@/pages/Login';
import CashierLayout from '@/pages/cashier/CashierLayout';
import CashierPOS from '@/pages/cashier/CashierPOS';
import CashierOrders from '@/pages/cashier/CashierOrders';
import CashierAvailability from '@/pages/cashier/CashierAvailability';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/products', label: 'Products', icon: '🍔' },
  { to: '/customizations', label: 'Customizations', icon: '🎛️' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
  { to: '/orders', label: 'Orders', icon: '📋' },
  { to: '/reports', label: 'Reports', icon: '📈' },
];

function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">🍽️ Dine-In Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Restaurant Manager</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">{user?.displayName}</p>
              <p className="text-xs text-gray-500">{user?.username}</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-400 transition-colors text-sm"
              title="Sign out"
            >
              ↪ Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function RequireAuth({ children, role }: { children: React.ReactNode; role?: 'admin' | 'cashier' }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'cashier' ? '/cashier' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function RoleRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'cashier') return <Navigate to="/cashier" replace />;

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customizations" element={<Customizations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route
        element={
          <RequireAuth role="cashier">
            <CashierLayout />
          </RequireAuth>
        }
      >
        <Route path="/cashier" element={<CashierPOS />} />
        <Route path="/cashier/orders" element={<CashierOrders />} />
        <Route path="/cashier/availability" element={<CashierAvailability />} />
      </Route>

      <Route
        index
        element={<RoleRedirect />}
      />

      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}
