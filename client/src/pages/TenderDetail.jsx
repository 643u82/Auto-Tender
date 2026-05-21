import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import Navbar from '../components/Navbar';
import ImageGallery from '../components/ImageGallery';
import { 
  Calendar, Gauge, Fuel, Shield, Download, 
  Video, FileText, ArrowLeft, Clock, MapPin, 
  ChevronLeft, ChevronRight, File, Car
} from 'lucide-react';

const TenderDetail = () => {
  const { id } = useParams();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTender = async () => {
      try {
        const res = await axios.get(`/tenders/${id}`);
        setTender(res.data);
      } catch (err) {
        console.error('Error fetching tender details:', err);
      } finally {
        setLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchTender();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-10 animate-pulse">
        <div className="h-6 bg-surface2 w-24 mb-10 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className="h-[380px] bg-surface2 rounded-card" />
            <div className="h-48 bg-surface2 rounded-card" />
          </div>
          <div className="h-96 bg-surface2 rounded-card" />
        </div>
      </div>
    </div>
  );

  if (!tender) return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
        <div className="bg-surface p-8 rounded-full mb-6">
          <Car size={64} className="text-text-muted opacity-20" />
        </div>
        <h1 className="text-3xl font-syne font-bold mb-4">Tender Not Found</h1>
        <p className="text-text-muted mb-8">The tender you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn-primary px-8">Return to Browse</Link>
      </div>
    </div>
  );

  const images = tender.media.filter(m => m.type === 'image');
  const videos = tender.media.filter(m => m.type === 'video');
  const docs = tender.media.filter(m => m.type === 'document');

  return (
    <div className="min-h-screen bg-bg pb-32">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-10 fade-in">
        <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-accent mb-8 group transition-colors">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Tenders</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <ImageGallery images={images} />

            {/* Car Specs Grid */}
            <section className="bg-surface border border-border rounded-card p-8 md:p-10 shadow-soft dark:shadow-none">
              <h2 className="text-2xl font-syne font-bold mb-8 text-text-primary">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                <SpecItem label="Make" value={tender.make} />
                <SpecItem label="Model" value={tender.model} />
                <SpecItem label="Year" value={tender.year} />
                <SpecItem label="Mileage" value={tender.mileage} />
                <SpecItem label="Fuel Type" value={tender.fuel} />
                <SpecItem label="Condition" value={tender.condition} />
                <SpecItem label="Transmission" value={tender.transmission} />
                <SpecItem label="Color" value={tender.color} />
                <SpecItem label="Reference" value={tender.tender_ref} />
              </div>
            </section>

            {/* Description */}
            <section className="space-y-6">
              <h2 className="text-2xl font-syne font-bold text-text-primary">Description</h2>
              <p className="text-text-muted leading-[1.8] text-lg whitespace-pre-wrap">{tender.description}</p>
            </section>

            {/* Video Section */}
            {videos.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-2xl font-syne font-bold text-text-primary flex items-center gap-3">
                  <Video className="text-accent" />
                  Vehicle Showcase
                </h2>
                <div className="grid gap-8">
                  {videos.map(vid => (
                    <div key={vid.id} className="aspect-video rounded-card overflow-hidden border border-border bg-black shadow-2xl">
                      <video controls className="w-full h-full">
                        <source src={`/uploads/videos/${vid.filename}`} />
                      </video>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Documents Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-syne font-bold text-text-primary flex items-center gap-3">
                <FileText className="text-accent" />
                Technical Documents
              </h2>
              <div className="grid gap-3">
                {docs.map(doc => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-5 rounded-xl bg-surface border border-border hover:border-accent transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-surface2 rounded-lg text-accent group-hover:scale-110 transition-transform">
                        <File size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary">{doc.original_name}</span>
                        <span className="text-xs text-text-muted uppercase tracking-wider">PDF Document</span>
                      </div>
                    </div>
                    <a 
                      href={`/uploads/docs/${doc.filename}`} 
                      download={doc.original_name}
                      className="btn-outline py-2 px-6 text-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
                {docs.length === 0 && (
                  <div className="p-10 text-center bg-surface border border-dashed border-border rounded-card text-text-muted italic">
                    No documents available for this tender.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="bg-surface border border-border rounded-card p-8 md:p-10 sticky top-28 space-y-8 shadow-xl dark:shadow-none">
              <div>
                <div className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] mb-3">Starting Price</div>
                <div className="text-5xl font-syne font-bold text-accent tracking-tighter">
                  <span className="text-2xl mr-1">{tender.currency}</span>
                  {tender.price.toLocaleString()}
                </div>
              </div>

              <div className="space-y-5 pt-8 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted flex items-center gap-2 font-medium">
                    <Calendar size={18} className="text-accent" /> 
                    Closing Date
                  </span>
                  <span className="font-bold text-red bg-red/10 px-3 py-1 rounded-full text-sm">
                    {new Date(tender.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted flex items-center gap-2 font-medium">
                    <Shield size={18} className="text-accent" /> 
                    Verification
                  </span>
                  <span className="font-bold text-green flex items-center gap-1 text-sm">
                    Verified Portal
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button className="btn-primary w-full py-5 text-lg shadow-gold transition-transform hover:-translate-y-1">
                  Express Interest
                </button>
                <p className="mt-4 text-center text-xs text-text-muted leading-relaxed">
                  By clicking, you will be contacted by an authorized tender officer within 24 hours.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const SpecItem = ({ label, value }) => (
  <div className="flex flex-col gap-2">
    <div className="text-[11px] font-bold text-text-muted uppercase tracking-[0.15em]">{label}</div>
    <div className="font-bold text-text-primary text-lg">{value}</div>
  </div>
);

export default TenderDetail;
