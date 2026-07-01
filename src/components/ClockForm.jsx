import React, { useEffect, useState } from 'react';
import AttendanceList from './AttendanceList';

const ROUTE_LIST = '/attendance';
const ROUTE_FORM = '/';

const getViewForPath = (path) => {
  if (path === ROUTE_LIST || path.startsWith(`${ROUTE_LIST}/`)) return 'LIST';
  return 'FORM';
};

function ClockForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [viewState, setViewState] = useState(() => getViewForPath(window.location.pathname));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full registered name.');
      return;
    }
    setError('');
    onSubmit(name.trim());
  };

  useEffect(() => {
    const handlePopState = () => {
      setViewState(getViewForPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path, stateKey) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setViewState(stateKey);
  };

  const openAttendanceList = () => {
    navigateTo(ROUTE_LIST, 'LIST');
  };

  const openClockForm = () => {
    navigateTo(ROUTE_FORM, 'FORM');
  };

  // Condition 1: If the state is 'LIST', completely unmount the form and render your Daily List
  if (viewState === 'LIST') {
    return (
      <AttendanceList onBack={openClockForm} />
    );
  }

  // Condition 2: Default view state fallback ('FORM') - renders your entry gate terminal screen
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col gap-3 text-center mb-6 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h1 className="text-2xl text-center font-bold text-slate-800">WCLA</h1>
          <p className="text-sm text-center text-slate-500">Digital Attendance Terminal</p>
        </div>
        <button
          type="button"
          onClick={openAttendanceList}
          className="inline-flex items-center cursor-pointer justify-center rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          View Attendance List
        </button>
      </div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
          Your Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Saul Bosire"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 placeholder-slate-400 text-base"
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-green-700 hover:bg-green-500 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-transform text-lg"
      >
        Clock In/Out
      </button>

      <p className="text-center text-xs text-slate-400 mt-4 px-4">
        By submitting, this device will securely send your current location details to confirm your attendance status.
      </p>
    </form>
  );
}

export default ClockForm;