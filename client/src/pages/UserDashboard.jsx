import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Car, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await axios.get('/payments/my');
        setPurchases(res.data);
      } catch (err) {
        console.error('Error fetching purchases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 pt-10 animate-pulse text-center pt-20">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-32">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 pt-12 fade-in">
        <header className="mb-10 border-b border-border pb-6">
          <h1 className="text-3xl font-syne font-bold text-text-primary mb-2">My Dashboard</h1>
          <p className="text-text-muted">Welcome back, {user?.name || user?.username}. Manage your tender purchases here.</p>
        </header>

        <section>
          <h2 className="text-xl font-syne font-bold text-text-primary mb-6 flex items-center gap-2">
            <FileText className="text-accent" />
            My Purchases
          </h2>
          
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <div className="bg-surface border border-border rounded-card p-10 text-center text-text-muted">
                You have not made any purchases yet.
              </div>
            ) : (
              purchases.map(purchase => (
                <div key={purchase.id} className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-6 shadow-soft dark:shadow-none hover:border-accent/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded">
                        {purchase.payment_type}
                      </span>
                      <span className="text-sm font-mono text-text-muted">Ref: {purchase.transaction_ref}</span>
                    </div>
                    
                    {purchase.tender_id ? (
                      <h3 className="text-lg font-bold text-text-primary mb-1">
                        <Link to={`/tender/${purchase.tender_id}`} className="hover:text-accent transition-colors">
                          {purchase.make} {purchase.model} ({purchase.tender_ref})
                        </Link>
                      </h3>
                    ) : (
                      <h3 className="text-lg font-bold text-text-primary mb-1">Subscription Payment</h3>
                    )}
                    
                    <p className="text-sm text-text-muted">Date: {new Date(purchase.created_at).toLocaleDateString()}</p>
                    
                    {purchase.status === 'rejected' && purchase.admin_note && (
                      <div className="mt-3 text-sm text-red bg-red/10 p-3 rounded border border-red/20 inline-block">
                        <span className="font-bold">Reason:</span> {purchase.admin_note}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      purchase.status === 'approved' ? 'bg-green/10 text-green' : 
                      purchase.status === 'rejected' ? 'bg-red/10 text-red' : 
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {purchase.status === 'approved' ? <CheckCircle size={14} /> : 
                       purchase.status === 'rejected' ? <XCircle size={14} /> : 
                       <Clock size={14} />}
                      {purchase.status}
                    </span>
                    
                    {purchase.status === 'approved' && purchase.tender_id && (
                      <Link to={`/tender/${purchase.tender_id}`} className="btn-primary py-2 px-6 text-sm">
                        View Documents
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
