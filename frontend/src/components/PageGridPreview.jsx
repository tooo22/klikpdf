import React from 'react';
import { RotateCw, Trash2, File } from 'lucide-react';

export const PageGridPreview = ({ files, onRotate, onDelete }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6">
      {files.map((fileObj, idx) => (
        <div key={idx} className="bg-white dark:bg-[#1E1E22] rounded-xl border border-gray-200 dark:border-[#27272A] shadow-md p-4 relative group flex flex-col items-center transition-colors">
          <div className="w-full h-40 bg-gray-100 dark:bg-[#161619] rounded-lg flex items-center justify-center mb-3 relative overflow-hidden border border-gray-200 dark:border-[#2E2E33]">
            <File size={48} className="text-gray-400 dark:text-gray-500" />
            <span className="absolute bottom-2 right-2 bg-gray-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
              #{idx + 1}
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate w-full text-center">
            {fileObj.name || `File ${idx + 1}`}
          </p>

          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onRotate && (
              <button 
                onClick={() => onRotate(idx)}
                className="bg-white dark:bg-[#27272A] p-1.5 rounded-full shadow border border-gray-200 dark:border-[#3F3F46] hover:bg-gray-100 dark:hover:bg-[#3F3F46] text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                <RotateCw size={14} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(idx)}
                className="bg-red-50 dark:bg-red-950/50 p-1.5 rounded-full shadow border border-red-200 dark:border-red-900 text-[#E5322D] hover:bg-red-100 dark:hover:bg-red-900/80 cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
