import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function formatTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(record) {
  const clockInStatus = record.clockInStatus || record.status || 'within_school';
  const clockOutStatus = record.clockOutStatus || null;

  if (record.clockOutTime) {
    return `In ${clockInStatus === 'within_school' ? 'within school' : 'outside school'} • Out ${clockOutStatus === 'within_school' ? 'within school' : 'outside school'}`;
  }

  return `In ${clockInStatus === 'within_school' ? 'within school' : 'outside school'}`;
}

function AttendanceList({ onBack }) {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await axios.get(`${API_BASE_URL}/attendance/details`, {
          params: {
            search: searchTerm || undefined,
            date: dateFilter || undefined,
          },
        });

        setRecords(response.data.records || []);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Unable to load attendance records.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [searchTerm, dateFilter]);

  const sortedRecords = useMemo(() => {
    const copy = [...records];

    copy.sort((a, b) => {
      if (sortBy === 'date') {
        return String(a.date || '').localeCompare(String(b.date || ''));
      }

      if (sortBy === 'name') {
        return String(a.staffName || '').localeCompare(String(b.staffName || ''));
      }

      if (sortBy === 'status') {
        return String(a.status || '').localeCompare(String(b.status || ''));
      }

      return 0;
    });

    return copy;
  }, [records, sortBy]);

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-red-900">Attendance overview</p>
        <h2 className="text-2xl font-bold text-slate-800">Staff attendance list</h2>
        <p className="text-sm text-slate-500">Search by staff name, filter by day, and review each mark-in/out record in one table.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-slate-600">
            Search staff name
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Type a name"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none ring-0 focus:border-green-500"
            />
          </label>

          <label className="text-sm text-slate-600">
            Filter by day
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none ring-0 focus:border-green-500"
            />
          </label>

          <label className="text-sm text-slate-600">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-green-500"
            >
              <option value="date">Day</option>
              <option value="name">Staff name</option>
              <option value="status">Status</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-red-100 px-3 py-1 text-red-800">Maroon theme</span>
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">Green accent</span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">Grey table</span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading attendance records…</div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
      ) : sortedRecords.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No attendance records match your search.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Day</th>
                  <th className="px-4 py-3 text-left font-semibold">Staff</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Clock In</th>
                  <th className="px-4 py-3 text-left font-semibold">Clock Out</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-600">
                {sortedRecords.map((record) => (
                  <tr key={record._id || `${record.staffName}-${record.date}-${record.clockInTime}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{record.date || 'Unknown date'}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{record.staffName}</td>
                    <td className="px-4 py-3 capitalize">{record.category || '—'}</td>
                    <td className="px-4 py-3">{formatTime(record.clockInTime)}</td>
                    <td className="px-4 py-3">{formatTime(record.clockOutTime)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${record.status === 'within_school' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {getStatusLabel(record)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
      >
        Back to attendance form
      </button>
    </div>
  );
}

export default AttendanceList;
