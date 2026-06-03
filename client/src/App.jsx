import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import TenderDetail from './pages/TenderDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageTenders from './pages/admin/ManageTenders';
import TenderForm from './pages/admin/TenderForm';
import ManagePayments from './pages/admin/ManagePayments';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/tender/:id" element={<TenderDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/tenders" element={
              <ProtectedRoute adminOnly={true}>
                <ManageTenders />
              </ProtectedRoute>
            } />
            <Route path="/admin/tenders/new" element={
              <ProtectedRoute adminOnly={true}>
                <TenderForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/tenders/:id/edit" element={
              <ProtectedRoute adminOnly={true}>
                <TenderForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute adminOnly={true}>
                <ManagePayments />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
