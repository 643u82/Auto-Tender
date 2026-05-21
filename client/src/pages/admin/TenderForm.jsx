import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Video,
  Save,
  Trash2,
  AlertCircle,
  File,
  Car
} from 'lucide-react';

const TenderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    make: '', model: '', year: new Date().getFullYear(),
    mileage: '', color: '', transmission: 'Automatic',
    fuel: 'Petrol', condition: 'Excellent',
    price: '', currency: 'USD',
    tender_ref: '', deadline: '',
    status: 'draft', description: '', tags: ''
  });

  const [existingMedia, setExistingMedia] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchTender();
    } else {
      const year = new Date().getFullYear();
      const random = Math.floor(100 + Math.random() * 900);
      setFormData(prev => ({ ...prev, tender_ref: `TDR-${year}-${random}` }));
    }
  }, [id]);

  const fetchTender = async () => {
    try {
      const res = await axios.get(`/tenders/${id}`);
      const { media, ...data } = res.data;
      setFormData(data);
      setExistingMedia(media);
    } catch (err) {
      setError('Failed to fetch tender details');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const updatedFiles = files.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      id: Math.random().toString(36).substr(2, 9)
    }));
    setNewFiles(prev => [...prev, ...updatedFiles]);
  };

  const removeNewFile = (fileId) => {
    setNewFiles(prev => {
      const filtered = prev.filter(f => f.id !== fileId);
      const removed = prev.find(f => f.id === fileId);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const removeExistingMedia = async (mediaId) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await axios.delete(`/admin/media/${mediaId}`);
      setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
    } catch (err) {
      alert('Failed to delete media');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    newFiles.forEach(f => {
      submitData.append('files', f.file);
    });

    try {
      if (isEdit) {
        await axios.put(`/admin/tenders/${id}`, formData);
        if (newFiles.length > 0) {
          const mediaFormData = new FormData();
          newFiles.forEach(f => mediaFormData.append('files', f.file));
          await axios.post(`/admin/tenders/${id}/media`, mediaFormData);
        }
      } else {
        await axios.post('/admin/tenders', submitData);
      }
      navigate('/admin/tenders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save tender');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      
      <main className="flex-grow p-10 overflow-y-auto">
        <header className="flex items-center gap-6 mb-12 fade-in">
          <button onClick={() => navigate(-1)} className="p-3 bg-surface border border-border rounded-full hover:border-accent hover:text-accent transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-syne font-bold text-text-primary tracking-tight">
              {isEdit ? 'Update Vehicle' : 'New Tender Entry'}
            </h1>
            <p className="text-text-muted font-medium mt-1">
              {isEdit ? `Ref: ${formData.tender_ref}` : 'Initialize a new auction entry'}
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-10 bg-red/10 border border-red/20 text-red px-6 py-4 rounded-xl flex items-center gap-3 fade-in">
            <AlertCircle size={20} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-10">
            <section className="bg-surface border border-border rounded-card p-8 md:p-10 space-y-8 shadow-soft dark:shadow-none fade-in" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl font-syne font-bold text-text-primary border-b border-border pb-6 flex items-center gap-3">
                <Car className="text-accent" size={24} />
                Vehicle Specifications
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField label="Manufacturer / Make" name="make" required value={formData.make} onChange={handleInputChange} placeholder="e.g. Mercedes-Benz" />
                <FormField label="Model Name" name="model" required value={formData.model} onChange={handleInputChange} placeholder="e.g. G-Class" />
                <FormField label="Production Year" name="year" type="number" required value={formData.year} onChange={handleInputChange} />
                <FormField label="Current Mileage" name="mileage" value={formData.mileage} onChange={handleInputChange} placeholder="e.g. 12,500 KM" />
                <FormField label="Exterior Color" name="color" value={formData.color} onChange={handleInputChange} placeholder="e.g. Obsidian Black" />
                
                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Transmission</label>
                  <select name="transmission" className="input-field w-full py-3" value={formData.transmission} onChange={handleInputChange}>
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Fuel Type</label>
                  <select name="fuel" className="input-field w-full py-3" value={formData.fuel} onChange={handleInputChange}>
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Vehicle Condition</label>
                  <select name="condition" className="input-field w-full py-3" value={formData.condition} onChange={handleInputChange}>
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-surface border border-border rounded-card p-8 md:p-10 space-y-8 shadow-soft dark:shadow-none fade-in" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xl font-syne font-bold text-text-primary border-b border-border pb-6 flex items-center gap-3">
                <FileText className="text-accent" size={24} />
                Tender Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField label="Tender Reference" name="tender_ref" required value={formData.tender_ref} onChange={handleInputChange} />
                <FormField label="Auction Deadline" name="deadline" type="date" required value={formData.deadline} onChange={handleInputChange} />
                <FormField label="Starting Price" name="price" type="number" required value={formData.price} onChange={handleInputChange} />
                <FormField label="Currency" name="currency" value={formData.currency} onChange={handleInputChange} />
              </div>
              <FormField label="Tags (Comma Separated)" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g. luxury, suv, v8" />
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Full Description</label>
                <textarea 
                  name="description" 
                  rows="6" 
                  className="input-field w-full py-4 resize-none" 
                  value={formData.description} 
                  onChange={handleInputChange}
                  placeholder="Describe the vehicle's history, features, and any minor defects..."
                ></textarea>
              </div>
            </section>
          </div>

          {/* Right: Media & Actions */}
          <div className="space-y-10">
            <section className="bg-surface border border-border rounded-card p-8 md:p-10 sticky top-10 space-y-8 shadow-xl dark:shadow-none fade-in" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-xl font-syne font-bold text-text-primary border-b border-border pb-6">Lifecycle</h2>
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Visibility Status</label>
                <select name="status" className="input-field w-full py-3 font-bold" value={formData.status} onChange={handleInputChange}>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="open">Open (Publicly Visible)</option>
                  <option value="closed">Closed (Archive)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
                  <Upload size={16} className="text-accent" />
                  Media Management
                </h3>
                
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent hover:bg-accent/5 cursor-pointer transition-all group"
                >
                  <div className="p-3 bg-bg inline-block rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-text-muted group-hover:text-accent" size={24} />
                  </div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Select Files</p>
                  <p className="text-[10px] text-text-muted mt-2">Images, Videos or PDFs</p>
                  <input 
                    type="file" 
                    multiple 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*,video/*,application/pdf"
                  />
                </div>

                {/* File List */}
                <div className="mt-8 space-y-3">
                  {newFiles.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-bg border border-border rounded-xl group fade-in">
                      <div className="flex items-center gap-3 truncate">
                        {f.preview ? (
                          <img src={f.preview} className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-surface2 flex items-center justify-center rounded-lg text-accent"><File size={16} /></div>
                        )}
                        <span className="text-[11px] font-bold truncate max-w-[120px]">{f.file.name}</span>
                      </div>
                      <button type="button" onClick={() => removeNewFile(f.id)} className="p-1.5 hover:bg-red/10 text-text-muted hover:text-red rounded-lg transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {existingMedia.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-surface2 border border-border rounded-xl group fade-in">
                      <div className="flex items-center gap-3 truncate opacity-80">
                        {m.type === 'image' ? (
                          <img src={`/uploads/images/${m.filename}`} className="w-10 h-10 object-cover rounded-lg" />
                        ) : m.type === 'video' ? (
                          <div className="w-10 h-10 bg-bg flex items-center justify-center rounded-lg text-accent"><Video size={16} /></div>
                        ) : (
                          <div className="w-10 h-10 bg-bg flex items-center justify-center rounded-lg text-accent"><FileText size={16} /></div>
                        )}
                        <span className="text-[11px] font-bold truncate max-w-[120px]">{m.original_name}</span>
                      </div>
                      <button type="button" onClick={() => removeExistingMedia(m.id)} className="p-1.5 hover:bg-red/10 text-text-muted hover:text-red rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-border space-y-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full py-5 flex items-center justify-center gap-3 text-lg font-bold shadow-gold"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-bg/30 border-t-bg rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      {isEdit ? 'Update Entry' : 'Publish Auction'}
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/admin/tenders')}
                  className="btn-secondary w-full py-4 text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
};

const FormField = ({ label, ...props }) => (
  <div className="space-y-3">
    <label className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] ml-1">{label}</label>
    <input className="input-field w-full py-3" {...props} />
  </div>
);

export default TenderForm;
