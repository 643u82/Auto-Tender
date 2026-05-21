import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Car, ArrowLeft, ShieldAlert, Mail, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
      navigate('/', { replace: true });
    } catch (err) {
      setError('Google signup failed. Please try again.');
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
              <UserPlus size={40} />
            </div>
            <h1 className="text-4xl font-syne font-bold mb-3 text-text-primary tracking-tight">Create Account</h1>
            <p className="text-text-muted font-medium">Join AutoTender to participate in vehicle auctions</p>
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

              {/* Google Signup Section */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Signup Failed')}
                    text="signup_with"
                    theme="filled_black"
                    shape="pill"
                    width="100%"
                  />
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-border w-full"></div>
                  <span className="bg-surface px-4 text-xs font-bold text-text-muted uppercase tracking-widest absolute">Or use email</span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                    <input name="name" type="text" required className="input-field w-full pl-12 py-3" value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                    <input name="email" type="email" required className="input-field w-full pl-12 py-3" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Username (Optional)</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                    <input name="username" type="text" className="input-field w-full pl-12 py-3" value={formData.username} onChange={handleInputChange} placeholder="johndoe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                    <input name="password" type="password" required className="input-field w-full pl-12 py-3" value={formData.password} onChange={handleInputChange} placeholder="••••••••" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                    <input name="confirmPassword" type="password" required className="input-field w-full pl-12 py-3" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm font-bold shadow-gold mt-4">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="text-center pt-4">
                <p className="text-sm text-text-muted">
                  Already have an account? <Link to="/login" className="text-accent font-bold hover:underline">Sign In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
