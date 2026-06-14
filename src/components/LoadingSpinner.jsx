import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500 animate-pulse">
        Acquiring your accurate GPS location...
      </p>
    </div>
  );
}

export default LoadingSpinner;