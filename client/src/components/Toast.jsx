import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'border-green text-green',
    error: 'border-red text-red',
    info: 'border-accent text-accent',
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-slide-up">
      <div className={`bg-surface border-l-4 shadow-2xl rounded-lg p-5 flex items-center gap-4 min-w-[320px] ${styles[type]}`}>
        <div className="shrink-0">{icons[type]}</div>
        <div className="flex-grow">
          <p className="text-sm font-bold text-text-primary tracking-tight">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-surface2 rounded-full transition-colors text-text-muted"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
