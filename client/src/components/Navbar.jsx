import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Car, LayoutDashboard, LogOut, User, Menu, X, Sun, Moon, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Browse', path: '/' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 h-[64px] bg-bg/80 backdrop-blur-md border-b border-border px-6 md:px-12 flex justify-between items-center transition-colors duration-300">
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-accent">
        <Car size={32} />
        <span className="font-syne">AutoTender</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map(link => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`font-medium transition-colors hover:text-accent relative py-1 ${
              isActive(link.path) ? 'text-accent' : 'text-text-primary'
            }`}
          >
            {link.label}
            {isActive(link.path) && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />
            )}
          </Link>
        ))}

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-surface transition-colors text-text-primary"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="h-6 w-px bg-border" />

        {user ? (
          <div className="flex items-center gap-6">
            {isAdmin() && (
              <Link 
                to="/admin" 
                className={`flex items-center gap-2 font-medium transition-colors hover:text-accent ${
                  isActive('/admin') ? 'text-accent' : 'text-text-primary'
                }`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            )}
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-accent" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <User size={18} />
                </div>
              )}
              <span className="text-sm font-bold text-text-primary hidden lg:inline">{user.name || user.username}</span>
            </div>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 font-medium text-red hover:opacity-80 transition-all"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="font-medium text-text-primary hover:text-accent transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
            >
              <UserPlus size={16} />
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Toggle & Theme Toggle */}
      <div className="flex md:hidden items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-surface transition-colors text-text-primary"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-text-primary"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-[64px] left-0 w-full bg-surface border-b border-border p-6 md:hidden flex flex-col gap-6 fade-in shadow-xl">
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path} 
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg font-medium ${isActive(link.path) ? 'text-accent' : 'text-text-primary'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px w-full bg-border" />
          {user ? (
            <>
              {isAdmin() && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium text-text-primary"
                >
                  <LayoutDashboard size={24} />
                  <span>Dashboard</span>
                </Link>
              )}
              <div className="flex items-center gap-3">
                {user.picture && <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />}
                <span className="text-lg font-medium text-text-primary">{user.name || user.username}</span>
              </div>
              <button 
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="flex items-center gap-3 text-lg font-medium text-red"
              >
                <LogOut size={24} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 text-lg font-medium text-text-primary"
              >
                <User size={24} />
                <span>Sign In</span>
              </Link>
              <Link 
                to="/signup" 
                onClick={() => setIsMenuOpen(false)}
                className="btn-primary py-3 px-6 text-center"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
