import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Filter,
  Car,
  FileText,
  AlertCircle
} from 'lucide-react';

const ManageTenders = () => {
  const [tenders, setTenders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const res = await axios.get('/admin/tenders');
      setTenders(res.data);
    } catch (err) {
      console.error('Error fetching tenders:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'open' ? 'closed' : (currentStatus === 'closed' ? 'draft' : 'open');
    try {
      await axios.patch(`/admin/tenders/${id}/status`, { status: nextStatus });
      fetchTenders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteTender = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tender and all its media files? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`/admin/tenders/${id}`);
      fetchTenders();
    } catch (err) {
      alert('Failed to delete tender');
    }
  };

  const filteredTenders = tenders.filter(t => 
    t.make.toLowerCase().includes(search.toLowerCase()) || 
    t.model.toLowerCase().includes(search.toLowerCase()) ||
    t.tender_ref.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      
      <main className="flex-grow p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 fade-in">
          <div>
            <h1 className="text-4xl font-syne font-bold mb-3 text-text-primary tracking-tight">Inventory Management</h1>
            <p className="text-text-muted font-medium">Create, edit, and control the lifecycle of your car tenders.</p>
          </div>
          <Link to="/admin/tenders/new" className="btn-primary flex items-center gap-2 py-4 px-8 shadow-gold">
            <Plus size={20} />
            <span className="font-bold">Create New Tender</span>
          </Link>
        </header>

        {/* Search & Filters */}
        <section className="bg-surface border border-border rounded-card p-6 mb-10 flex flex-col md:flex-row gap-6 shadow-soft dark:shadow-none fade-in">
          <div className="relative flex-grow group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search by make, model or reference code..."
              className="input-field w-full pl-12 py-3 bg-bg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center gap-2 py-3 px-6">
            <Filter size={18} />
            <span className="font-bold text-sm">Advanced Filters</span>
          </button>
        </section>

        {/* Table Content */}
        <section className="bg-surface border border-border rounded-card overflow-hidden shadow-soft dark:shadow-none fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface2/50 text-text-muted text-[11px] font-bold uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Reference</th>
                  <th className="px-8 py-5">Vehicle Detail</th>
                  <th className="px-8 py-5 text-right">Price</th>
                  <th className="px-8 py-5">Deadline</th>
                  <th className="px-8 py-5 text-center">Media</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredTenders.map(t => (
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
                    <td className="px-8 py-6 font-medium text-text-primary">
                      {new Date(t.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-text-muted font-bold text-xs">
                        <FileText size={14} className="text-accent" />
                        {t.media_count}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => toggleStatus(t.id, t.status)}
                          className={`flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-colors ${
                            t.status === 'open' ? 'text-green' : 
                            t.status === 'closed' ? 'text-red' : 
                            'text-text-muted'
                          }`}
                        >
                          {t.status === 'open' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          <span className="w-12 text-left">{t.status}</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/tender/${t.id}`} 
                          className="p-2.5 bg-surface2 hover:bg-accent/20 text-text-muted hover:text-accent rounded-lg transition-all" 
                          title="View Live"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/admin/tenders/${t.id}/edit`} 
                          className="p-2.5 bg-surface2 hover:bg-accent/20 text-text-muted hover:text-accent rounded-lg transition-all" 
                          title="Edit Details"
                        >
                          <Edit3 size={18} />
                        </Link>
                        <button 
                          onClick={() => deleteTender(t.id)}
                          className="p-2.5 bg-surface2 hover:bg-red/20 text-text-muted hover:text-red rounded-lg transition-all" 
                          title="Delete Entry"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredTenders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 text-text-muted">
                        <AlertCircle size={48} className="opacity-20" />
                        <p className="font-bold text-lg">No matching tenders found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                      </div>
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

export default ManageTenders;
