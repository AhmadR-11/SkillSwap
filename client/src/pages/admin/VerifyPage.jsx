import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const clientId       = searchParams.get('clientId');
  const initialCode    = searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [msg, setMsg]   = useState('');
  const [err, setErr]   = useState('');
  const navigate        = useNavigate();

  const handleVerify = async e => {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.post('/auth/client/verify', { clientId, code });
      setMsg(data.message);
      setTimeout(() => navigate('/'), 2000);
    } catch (e) {
      setErr(e.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleVerify}
            className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Verify Your Account
        </h2>
        {msg && <p className="text-green-600 mb-4">{msg}</p>}
        {err && <p className="text-red-500 mb-4">{err}</p>}

        <input
          type="text"
          placeholder="Verification Code"
          className="w-full mb-6 p-2 border rounded"
          value={code}
          onChange={e => setCode(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Verify
        </button>
      </form>
    </div>
  );
}
