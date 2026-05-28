import { useState, useEffect } from 'react';
import axios from '../api/axios';
import TenderCard from '../components/TenderCard';
import Navbar from '../components/Navbar';
import { Car, FileCheck, Users, TrendingUp, Filter } from 'lucide-react';

const Home = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, listed: 0, docs: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/tenders');
        setTenders(res.data);
        
        const totalDocs = res.data.reduce((acc, t) => acc + t.media_count, 0);
        setStats({ 
          active: res.data.length, 
          listed: res.data.length, // Assuming listed same as active for now
          docs: totalDocs 
        });
      } catch (err) {
        console.error('Error fetching tenders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      {/* Hero Section */}
      <header className="relative py-24 md:py-32 px-6 text-center overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] dark:bg-accent/10" />
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
          />
        </div>

        <div className="relative z-10 fade-in">
          <h1 className="text-5xl md:text-7xl font-syne font-bold mb-6 tracking-tight text-text-primary">
            Official Vehicle <br />
            <span className="text-accent">Tender Portal</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-[540px] mx-auto mb-12 leading-relaxed">
            Premium access to verified government and corporate vehicle auctions. 
            Transparent bidding, secure documentation, professional support.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button onClick={() => document.getElementById('tenders-grid').scrollIntoView({ behavior: 'smooth' })} className="btn-primary px-10 py-4 text-lg">
              Browse Tenders
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="bg-surface border border-border rounded-card p-10 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center shadow-soft dark:shadow-none">
          <StatBlock icon={<TrendingUp size={20} />} label="Total Active" value={stats.active} />
          <StatBlock icon={<Car size={20} />} label="Total Listed" value={stats.listed} />
          <StatBlock icon={<FileCheck size={20} />} label="Documents" value={stats.docs} />
          <StatBlock icon={<Users size={20} />} label="Verified" value="100%" />
        </div>
      </section>

      {/* Tender Grid */}
      <main id="tenders-grid" className="max-w-7xl mx-auto px-6 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="fade-in">
            <h2 className="text-3xl md:text-4xl font-syne font-bold mb-4 text-text-primary">
              Available Tenders
            </h2>
            <div className="w-20 h-1.5 bg-accent rounded-full" />
          </div>
          <div className="flex gap-4 w-full md:w-auto fade-in">
            <div className="relative flex-grow md:flex-grow-0">
              <select className="input-field w-full md:w-48 appearance-none pr-10">
                <option>Newest First</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {tenders.map((tender, index) => (
              <div key={tender.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <TenderCard tender={tender} />
              </div>
            ))}
            {tenders.length === 0 && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-card">
                <Car className="mx-auto text-text-muted mb-4 opacity-20" size={64} />
                <h3 className="text-xl font-bold text-text-primary mb-2">No Tenders Found</h3>
                <p className="text-text-muted">There are currently no open tenders available. Please check back later.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const StatBlock = ({ icon, label, value }) => (
  <div className="space-y-3">
    <div className="flex justify-center text-accent mb-1">{icon}</div>
    <div className="text-3xl md:text-4xl font-syne font-bold text-accent tracking-tight">{value}</div>
    <div className="text-[11px] md:text-xs font-bold text-text-muted uppercase tracking-[0.2em]">{label}</div>
  </div>
);

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="bg-surface2 h-48 rounded-lg mb-6" />
    <div className="h-4 bg-surface2 rounded w-1/4 mb-4" />
    <div className="h-6 bg-surface2 rounded w-3/4 mb-6" />
    <div className="flex gap-4 mb-6">
      <div className="h-4 bg-surface2 rounded w-1/4" />
      <div className="h-4 bg-surface2 rounded w-1/4" />
    </div>
    <div className="h-8 bg-surface2 rounded w-1/2 mb-6" />
    <div className="h-px bg-border w-full mb-4" />
    <div className="flex justify-between">
      <div className="h-4 bg-surface2 rounded w-1/3" />
      <div className="h-4 bg-surface2 rounded w-1/4" />
    </div>
  </div>
);

export default Home;
