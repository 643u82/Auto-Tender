import { useState } from 'react';
import { Car } from 'lucide-react';

const ImageGallery = ({ images }) => {
  const [activeImage, setActiveImage] = useState(images[0]?.filename || null);

  return (
    <section className="space-y-4">
      <div className="relative aspect-[16/9] md:h-[380px] rounded-card overflow-hidden bg-surface border border-border group transition-all duration-300">
        {activeImage ? (
          <img 
            key={activeImage}
            src={`/uploads/images/${activeImage}`} 
            className="w-full h-full object-cover fade-in" 
            alt="Vehicle preview"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted opacity-20">
            <Car size={80} />
            <span className="mt-4 font-medium uppercase tracking-widest text-xs">No Image Available</span>
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map(img => (
            <button 
              key={img.id}
              onClick={() => setActiveImage(img.filename)}
              className={`flex-shrink-0 w-[72px] h-[56px] rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                activeImage === img.filename 
                  ? 'border-accent ring-2 ring-accent/20 scale-105' 
                  : 'border-border opacity-60 hover:opacity-100 hover:border-accent/50'
              }`}
            >
              <img src={img.filename.startsWith("http") ? img.filename : `/uploads/images/${img.filename}`} className="w-full h-full object-cover" alt="Thumbnail" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ImageGallery;
