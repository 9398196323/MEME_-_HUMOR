import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded bg-slate-900 border border-slate-700 text-slate-100 text-xs font-medium shadow-lg tracking-wide">
      {message}
    </div>
  );
};
