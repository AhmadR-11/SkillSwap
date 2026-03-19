import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminNotificationSettingsPage() {
  const { token } = useContext(AuthContext);
  const [prefs, setPrefs] = useState({ email: false, sms: false });
  const [msg, setMsg] = useState('');

  // Load preferences when token changes
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/notifications/preferences', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPrefs(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [token]);  // no missing deps

  const save = async () => {
    try {
      await api.patch('/notifications/preferences', prefs, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('Saved');
    } catch {
      setMsg('Error');
    }
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="p-6 flex-1">
        <h1 className="text-2xl font-semibold mb-4">
          Notification Settings
        </h1>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={prefs.email}
              onChange={e =>
                setPrefs(p => ({ ...p, email: e.target.checked }))
              }
            />
            <span>Email Notifications</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={prefs.sms}
              onChange={e =>
                setPrefs(p => ({ ...p, sms: e.target.checked }))
              }
            />
            <span>SMS Notifications</span>
          </label>
          <button
            onClick={save}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save Preferences
          </button>
          {msg && <p className="text-green-600">{msg}</p>}
        </div>
      </main>
    </div>
  );
}
