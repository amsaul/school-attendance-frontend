import React, { useState } from 'react';

function ClockForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full registered name.');
      return;
    }
    setError('');
    onSubmit(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
          Your Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 text-base"
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-transform text-lg"
      >
        Clock In / Clock Out
      </button>

      <p className="text-center text-xs text-slate-400 mt-4 px-4">
        By submitting, this device will securely send your current location details to confirm your attendance status.
      </p>
    </form>
  );
}

export default ClockForm;