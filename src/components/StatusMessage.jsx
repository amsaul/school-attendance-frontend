import React from 'react';

function StatusMessage({ success, message, onDone, onViewAttendance }) {
  return (
    <div className="text-center py-6 space-y-6">
      <div className="flex justify-center">
        {success ? (
          // Success Checklist Animation Base
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          // Error Icon Base
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className={`text-xl font-bold ${success ? 'text-green-700' : 'text-red-700'}`}>
          {success ? 'Verification Success' : 'Verification Failed'}
        </h2>
        <p className="text-slate-600 px-2 whitespace-pre-line text-sm">{message}</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onDone}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Done / Back
        </button>

        {onViewAttendance && (
          <button
            onClick={onViewAttendance}
            className="px-6 py-2 bg-linear-to-r from-red-900 to-green-700 hover:from-red-950 hover:to-green-800 text-white font-semibold rounded-lg transition-colors text-sm shadow-sm"
          >
            View Attendance List
          </button>
        )}
      </div>
    </div>
  );
}

export default StatusMessage;