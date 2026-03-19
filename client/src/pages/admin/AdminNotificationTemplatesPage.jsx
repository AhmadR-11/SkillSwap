import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminNotificationTemplatesPage() {
  const { token } = useContext(AuthContext);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    name: '',
    type: 'email',
    subject: '',
    body: ''
  });
  const [error, setError] = useState('');

  // Load templates when token changes
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/admin/notifications/templates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTemplates(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [token]);  // no missing deps

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/notifications/templates', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ name: '', type: 'email', subject: '', body: '' });
      // reload
      const res = await api.get('/admin/notifications/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="p-6 flex-1 space-y-6 overflow-auto">
        <h1 className="text-2xl font-semibold">Notification Templates</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded shadow space-y-3"
        >
          {error && <div className="text-red-600">{error}</div>}

          <input
            placeholder="Name"
            value={form.name}
            onChange={e =>
              setForm(f => ({ ...f, name: e.target.value }))
            }
            className="w-full border p-2 rounded"
          />

          <select
            value={form.type}
            onChange={e =>
              setForm(f => ({ ...f, type: e.target.value }))
            }
            className="w-full border p-2 rounded"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>

          {form.type === 'email' && (
            <input
              placeholder="Subject"
              value={form.subject}
              onChange={e =>
                setForm(f => ({ ...f, subject: e.target.value }))
              }
              className="w-full border p-2 rounded"
            />
          )}

          <textarea
            placeholder="Body (use {{key}} to interpolate)"
            value={form.body}
            onChange={e =>
              setForm(f => ({ ...f, body: e.target.value }))
            }
            className="w-full border p-2 rounded"
            rows={4}
          />

          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Save Template
          </button>
        </form>

        <ul className="space-y-2">
          {templates.map(t => (
            <li
              key={t._id}
              className="bg-white p-3 rounded shadow"
            >
              <strong>{t.name}</strong>{' '}
              <span className="text-sm text-gray-500">({t.type})</span>
              <p className="mt-1 text-gray-700">{t.body}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
