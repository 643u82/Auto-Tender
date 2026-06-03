import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  PlusCircle, 
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { label: 'Manage Tenders', icon: <Car size={20} />, path: '/admin/tenders' },
    { label: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payments' },
    { label: 'New Tender', icon: <PlusCircle size={20} />, path: '/admin/tenders/new' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-[220px] bg-surface border-r border-border h-screen sticky top-0 flex flex-col transition-colors duration-300">
      <div className="p-8 border-b border-border">
        <Link to="/" className="flex items-center gap-2 text-xl font-syne font-bold text-accent">
          <Car size={28} />
          <span>AutoTender</span>
        </Link>
        <div className="mt-2 text-[9px] uppercase tracking-[0.25em] text-text-muted font-bold">Admin System</div>
      </div>

      <nav className="flex-grow py-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all group relative ${
              isActive(item.path) 
                ? 'bg-accent/5 text-accent border-l-4 border-accent' 
                : 'text-text-muted hover:bg-surface2 hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={isActive(item.path) ? 'text-accent' : 'text-text-muted group-hover:text-accent transition-colors'}>
                {item.icon}
              </span>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </div>
          </Link>
        ))}

        <div className="pt-8 px-4">
          <div className="h-px bg-border w-full mb-8" />
          <Link to="/" className="flex items-center gap-3 text-text-muted hover:text-accent transition-colors group">
            <ExternalLink size={18} />
            <span className="text-sm font-bold">View Portal</span>
          </Link>
        </div>
      </nav>

      <div className="p-6 border-t border-border space-y-4">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-text-muted hover:bg-surface2 hover:text-text-primary transition-all"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="text-sm font-bold">Switch Theme</span>
        </button>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-text-muted hover:bg-red/10 hover:text-red transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
