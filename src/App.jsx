import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ClockForm from './components/ClockForm';
import StatusMessage from './components/StatusMessage';
import LoadingSpinner from './components/LoadingSpinner';
import AttendanceList from './components/AttendanceList';

// Base URL for your Node.js backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://schoolattendancebackend.onrender.com/api';
const ROUTE_LIST = '/attendance';
const ROUTE_FORM = '/';

const getViewForPath = (path) => {
  if (path === ROUTE_LIST || path.startsWith(`${ROUTE_LIST}/`)) return 'LIST';
  return 'FORM';
};

function App() {
  const [viewState, setViewState] = useState(() => getViewForPath(window.location.pathname));
  const [statusData, setStatusData] = useState({ success: false, message: '' });

  const handleAttendanceSubmit = async (fullName) => {
    setViewState('LOADING');

    // 1. Check if browser supports Geolocation
    if (!navigator.geolocation) {
      setStatusData({
        success: false,
        message: 'Geolocation is not supported by your browser.',
      });
      setViewState('STATUS');
      return;
    }

    // 2. Request GPS coordinates from the phone
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 3. Send payload to backend
          const response = await axios.post(`${API_BASE_URL}/attendance/scan`, {
            name: fullName,
            latitude,
            longitude,
          });

          const data = response.data;
          const clockInStatus = data.clockInStatus || data.status || 'within_school';
          const clockOutStatus = data.clockOutStatus || null;
          const statusLabel = data.action === 'clock-out'
            ? `Clocked in ${clockInStatus === 'within_school' ? 'within school' : 'outside school'} • Clocked out ${clockOutStatus === 'within_school' ? 'within school' : 'outside school'}`
            : `Clocked in ${clockInStatus === 'within_school' ? 'within school' : 'outside school'}`;
          const timeStr = data.action === 'clock-out' && data.clockOutTime
            ? `${new Date(data.clockOutTime).toLocaleTimeString()}`
            : data.clockInTime
            ? `${new Date(data.clockInTime).toLocaleTimeString()}`
            : '';

          if (data.status === 'outside_school') {
            setStatusData({
              success: false,
              message: `${statusLabel}\n${data.staffName} (${data.category})\nTime: ${timeStr}`,
            });
          } else {
            const actionText = data.action === 'clock-in'
              ? 'Successfully Clocked In!'
              : data.action === 'clock-out'
              ? 'Successfully Clocked Out!'
              : 'Attendance updated successfully!';

            setStatusData({
              success: true,
              message: `${actionText}\n${statusLabel}\n${data.staffName} (${data.category})\nTime: ${timeStr}`,
            });
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message 
            || error.message 
            || 'Failed to verify attendance. Please try again.';
          
          setStatusData({
            success: false,
            message: errorMsg,
          });
        } finally {
          setViewState('STATUS');
        }
      },
      (geoError) => {
        // Handle location permission denial or GPS timeout
        let errorMsg = 'Please enable location permissions to clock in/out.';
        if (geoError.code === 1) errorMsg = 'Location permission denied. Please enable it in settings.';
        if (geoError.code === 3) errorMsg = 'GPS timeout. Try moving closer to a window or open area.';
        
        setStatusData({ success: false, message: errorMsg });
        setViewState('STATUS');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    const handlePopState = () => {
      setViewState(getViewForPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const resetToForm = () => {
    navigateTo(ROUTE_FORM);
    setViewState('FORM');
    setStatusData({ success: false, message: '' });
  };

  const openAttendanceList = () => {
    navigateTo(ROUTE_LIST);
    setViewState('LIST');
  };

  return (
    <>
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 transition-all duration-300">
        {/* Header Block */}
        {/* <div className="flex flex-col gap-3 text-center mb-6 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <h1 className="text-2xl text-center font-bold text-slate-800">WCLA</h1>
            <p className="text-sm text-center text-slate-500">Digital Attendance Terminal</p>
          </div>
          {viewState !== 'LIST' && (
            <a
              type="link"
              onClick={openAttendanceList}
              className="inline-flex items-center cursor-pointer justify-center rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              View Attendance List
            </a>
          )}
        </div> */}

        {/* Dynamic Views */}
        {viewState === 'FORM' && (
          <ClockForm onSubmit={handleAttendanceSubmit} />
        )}
        
        {viewState === 'LOADING' && (
          <LoadingSpinner />
        )}
        
        {viewState === 'STATUS' && (
          <StatusMessage
            success={statusData.success}
            message={statusData.message}
            onDone={resetToForm}
            onViewAttendance={openAttendanceList}
          />
        )}

        {viewState === 'LIST' && (
          <AttendanceList onBack={resetToForm} />
        )}
      </div>
    </div>
    </>
  );
}

export default App;