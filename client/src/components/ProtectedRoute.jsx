import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-6">
      <div className="relative">
        <Car size={48} className="text-accent animate-bounce" />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-accent/20 rounded-full blur-sm" />
      </div>
      <p className="font-syne font-bold text-accent uppercase tracking-[0.25em] text-xs">Authenticating</p>
    </div>
  );

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
