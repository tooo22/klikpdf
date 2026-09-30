import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const Toast = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-bounce">
      <AlertCircle size={20} />
      <span className="text-sm font-bold">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-red-700 rounded-lg">
        <X size={16} />
      </button>
    </div>
  );
};
