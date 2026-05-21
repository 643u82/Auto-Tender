import { Link } from 'react-router-dom';
import { Calendar, FileText, Gauge, Fuel, Clock } from 'lucide-react';

const TenderCard = ({ tender }) => {
  const coverImage = tender.cover_image 
    ? `/uploads/images/${tender.cover_image}` 
    : null;

  const statusColors = {
    open: 'bg-green/10 text-green',
    closed: 'bg-red/10 text-red',
    draft: 'bg-text-muted/10 text-text-muted',
  };

  return (
    <Link 
      to={`/tender/${tender.id}`} 
      className="card group flex flex-col h-full hover:shadow-gold dark:hover:border-accent hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-[200px] rounded-lg overflow-hidden mb-5 bg-surface2">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={`${tender.make} ${tender.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted/30">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">No Image</span>
          </div>
        )}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[tender.status]}`}>
          {tender.status}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow space-y-3 px-1">
        <div className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
          {tender.make}
        </div>
        <h3 className="text-lg font-syne font-bold text-text-primary leading-tight group-hover:text-accent transition-colors">
          {tender.model}
        </h3>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-text-muted">
          <span className="flex items-center gap-1.5"><Calendar size={13} className="text-accent" /> {tender.year}</span>
          <span className="flex items-center gap-1.5"><Gauge size={13} className="text-accent" /> {tender.mileage}</span>
          <span className="flex items-center gap-1.5"><Fuel size={13} className="text-accent" /> {tender.fuel}</span>
        </div>

        <div className="pt-4">
          <div className="text-2xl font-syne font-bold text-accent tracking-tighter">
            <span className="text-sm mr-1">{tender.currency}</span>
            {tender.price.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-text-muted">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-red" />
          <span className="text-red">{new Date(tender.deadline).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText size={12} className="text-accent" />
          <span>{tender.media_count} Docs</span>
        </div>
      </div>
    </Link>
  );
};

export default TenderCard;
