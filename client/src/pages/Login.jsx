import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Car, ArrowLeft, ShieldAlert, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/auth/login', { identifier, password });
      login(res.data.token, res.data.user);
      
      // Redirect based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/auth/google', { idToken: credentialResponse.credential });
      login(res.data.token, res.data.user);
      
      if (res.data.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      <div className="flex items-center justify-center pt-20 pb-32 px-6">
        <div className="w-full max-w-md fade-in">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-full bg-accent/10 text-accent mb-6">
              <Car size={40} />
            </div>
            <h1 className="text-4xl font-syne font-bold mb-3 text-text-primary tracking-tight">Welcome Back</h1>
            <p className="text-text-muted font-medium">Sign in to your account to continue</p>
          </div>

          <div className="bg-surface border border-border p-8 md:p-10 rounded-card shadow-xl dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />

            <div className="space-y-8">
              {error && (
                <div className="flex items-start gap-3 bg-red/10 border border-red/20 text-red px-4 py-4 rounded-xl text-sm fade-in">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Google Login Section */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Login Failed')}
                    useOneTap
                    theme="filled_black"
                    shape="pill"
                    width="100%"
                  />
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-border w-full"></div>
                  <span className="bg-surface px-4 text-xs font-bold text-text-muted uppercase tracking-widest absolute">Or use credentials</span>
                </div>
              </div>

              {/* Unified Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">
                    Email or Username
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      className="input-field w-full pl-12 py-3.5"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="john@example.com or admin"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={20} />
                    <input 
                      type="password" 
                      required
                      className="input-field w-full pl-12 py-3.5"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full py-4 text-sm font-bold shadow-gold disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? 'Processing...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center pt-4">
                <p className="text-sm text-text-muted">
                  Don't have an account? <Link to="/signup" className="text-accent font-bold hover:underline">Sign Up</Link>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-accent transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Public Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
