import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AttendanceList from './AttendanceList';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://schoolattendancebackend.onrender.com/api';

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

  // State for clock‑out flow
  const [todayRecord, setTodayRecord] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch today's attendance for a given staff name
  const fetchTodayRecord = async (staffName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/today`, {
        params: { staffName },
      });
      return response.data.record || null;
    } catch (err) {
      // If no record or error, treat as not clocked in
      if (err.response?.status === 404) return null;
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your full registered name.');
      return;
    }
    setError('');
    setStatusMessage('');

    setIsLoading(true);
    try {
      const record = await fetchTodayRecord(trimmedName);
      setTodayRecord(record);

      if (record && !record.clockOutTime) {
        // Clocked in → ask for confirmation to clock out
        setShowConfirm(true);
      } else {
        // Not clocked in → directly clock in
        await onSubmit(trimmedName, 'clockIn');
        setStatusMessage('✅ Clocked in successfully!');
        setName('');
      }
    } catch (err) {
      setError('Unable to check attendance status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmClockOut = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    try {
      await onSubmit(todayRecord.staffName, 'clockOut', todayRecord._id);
      setStatusMessage('✅ Clocked out successfully!');
      setName('');
      setTodayRecord(null);
    } catch (err) {
      setError('Clock out failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClockOut = () => {
    setShowConfirm(false);
    setTodayRecord(null);
  };

  // Navigation logic
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

  const openAttendanceList = () => navigateTo(ROUTE_LIST, 'LIST');
  const openClockForm = () => navigateTo(ROUTE_FORM, 'FORM');

  // If view is LIST, render AttendanceList
  if (viewState === 'LIST') {
    return <AttendanceList onBack={openClockForm} />;
  }

  // Default: render the clock form
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-3 text-center mb-6 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <h1 className="text-2xl text-left font-bold text-slate-800">WCLA</h1>
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
            disabled={isLoading}
          />
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          {statusMessage && <p className="mt-2 text-xs text-green-600">{statusMessage}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-green-700 hover:bg-green-500 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-transform text-lg disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Checking...' : 'Clock In/Out'}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4 px-4">
          By submitting, this device will securely send your current location details to confirm your attendance status.
        </p>
      </form>

      {/* Confirmation Modal for Clock Out */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800">Confirm Clock Out</h3>
            <p className="mt-2 text-sm text-slate-600">
              Do you really want to clock out?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelClockOut}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClockOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Yes, clock out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClockForm;