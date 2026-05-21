import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';
import { 
  Trophy, 
  Activity, 
  Archive, 
  FileEdit,
  FileText,
  ExternalLink,
  Car
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    draft: 0,
    docs: 0
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/admin/tenders');
        const tenders = res.data;
        
        setStats({
          total: tenders.length,
          open: tenders.filter(t => t.status === 'open').length,
          closed: tenders.filter(t => t.status === 'closed').length,
          draft: tenders.filter(t => t.status === 'draft').length,
          docs: tenders.reduce((acc, t) => acc + t.media_count, 0)
        });

        setRecent(tenders.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      
      <main className="flex-grow p-10 overflow-y-auto">
        <header className="mb-12 fade-in">
          <h1 className="text-4xl font-syne font-bold mb-3 text-text-primary tracking-tight">System Overview</h1>
          <p className="text-text-muted font-medium">Manage and monitor your vehicle tender inventory.</p>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 fade-in">
          <StatCard icon={<Trophy size={20} />} label="Total Active" value={stats.open} color="success" />
          <StatCard icon={<Car size={20} />} label="Total Listed" value={stats.total} color="accent" />
          <StatCard icon={<FileText size={20} />} label="Documents" value={stats.docs} color="accent" />
          <StatCard icon={<Archive size={20} />} label="Closed" value={stats.closed} color="red" />
        </section>

        {/* Recent Tenders Table */}
        <section className="bg-surface border border-border rounded-card overflow-hidden shadow-soft dark:shadow-none fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="p-8 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-xl font-syne font-bold text-text-primary">Recent Tenders</h2>
              <p className="text-xs text-text-muted mt-1 font-medium uppercase tracking-wider">Latest 5 activities</p>
            </div>
            <Link to="/admin/tenders" className="btn-secondary text-xs flex items-center gap-2">
              Manage All <ExternalLink size={14} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface2/50 text-text-muted text-[11px] font-bold uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Reference</th>
                  <th className="px-8 py-5">Vehicle Details</th>
                  <th className="px-8 py-5 text-right">Starting Price</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map(t => (
                  <tr key={t.id} className="hover:bg-surface2/30 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="font-mono text-xs font-bold bg-surface2 px-2 py-1 rounded border border-border">
                        {t.tender_ref}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-text-primary">{t.make} {t.model}</div>
                      <div className="text-xs text-text-muted mt-1 font-medium">{t.year} • {t.transmission}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="text-accent font-bold">{t.currency} {t.price.toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'open' ? 'bg-green/10 text-green' : 
                        t.status === 'closed' ? 'bg-red/10 text-red' : 
                        'bg-text-muted/10 text-text-muted'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link to={`/admin/tenders/${t.id}/edit`} className="text-text-muted hover:text-accent font-bold text-xs transition-colors">
                        Edit Entry
                      </Link>
                    </td>
                  </tr>
                ))}
                {!loading && recent.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center text-text-muted italic">
                      No tenders recorded in the system yet.
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

const StatCard = ({ icon, label, value, color }) => {
  const colorStyles = {
    accent: "text-accent border-accent/10 bg-accent/5",
    success: "text-green border-green/10 bg-green/5",
    red: "text-red border-red/10 bg-red/5",
  };

  return (
    <div className={`p-8 border rounded-card space-y-4 transition-all hover:translate-y-[-2px] ${colorStyles[color] || colorStyles.accent}`}>
      <div className="flex justify-between items-start">
        <div className="p-2 rounded-lg bg-surface">{icon}</div>
        <div className="text-3xl font-syne font-bold tracking-tight">{value}</div>
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">{label}</div>
    </div>
  );
};

export default Dashboard;
