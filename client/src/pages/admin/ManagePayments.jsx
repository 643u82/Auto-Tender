import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/payments');
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/payments/${id}/status`, { status });
      fetchPayments();
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Failed to update status');
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      
      <main className="flex-grow p-10 overflow-y-auto">
        <header className="mb-12 fade-in">
          <h1 className="text-4xl font-syne font-bold mb-3 text-text-primary tracking-tight flex items-center gap-4">
            <CreditCard size={36} className="text-accent" />
            Manage Payments
          </h1>
          <p className="text-text-muted font-medium">Verify Telebirr transactions and unlock documents.</p>
        </header>

        <section className="bg-surface border border-border rounded-card overflow-hidden shadow-soft dark:shadow-none fade-in">
          <div className="p-8 border-b border-border flex justify-between items-center bg-surface2/30">
            <h2 className="text-xl font-syne font-bold text-text-primary">Payment Requests</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface2/50 text-text-muted text-[11px] font-bold uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5">Type / Ref</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                  <th className="px-8 py-5 text-center">Txn ID</th>
                  <th className="px-8 py-5 text-center">Date</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-surface2/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-text-primary">{p.email}</div>
                      <div className="text-xs text-text-muted mt-1">{p.username || 'No Username'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold uppercase text-[10px] tracking-wider text-accent mb-1 bg-accent/10 inline-block px-2 py-0.5 rounded">
                        {p.payment_type}
                      </div>
                      {p.tender_ref && <div className="text-xs text-text-muted font-mono">{p.tender_ref}</div>}
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-text-primary">
                      {p.amount} ETB
                    </td>
                    <td className="px-8 py-6 text-center font-mono font-bold tracking-widest text-text-muted">
                      {p.transaction_ref}
                    </td>
                    <td className="px-8 py-6 text-center text-xs text-text-muted">
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        p.status === 'approved' ? 'bg-green/10 text-green' : 
                        p.status === 'rejected' ? 'bg-red/10 text-red' : 
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {p.status === 'approved' ? <CheckCircle size={12} /> : 
                         p.status === 'rejected' ? <XCircle size={12} /> : 
                         <Clock size={12} />}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {p.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(p.id, 'approved')}
                            className="bg-green/10 text-green hover:bg-green hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(p.id, 'rejected')}
                            className="bg-red/10 text-red hover:bg-red hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && payments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-8 py-16 text-center text-text-muted italic">
                      No payment requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ManagePayments;
