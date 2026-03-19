import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';  // Changed this line

export default function useAuth() {
  const { login, logout } = useContext(AuthContext);

  async function signIn(role, email, password) {
    const ep = role === 'client'
      ? '/auth/client/login'
      : role === 'admin'
        ? '/auth/admin/login'
        : '/auth/freelancer/login';

    const { data } = await api.post(ep, { email, password });
    // data: { token, name, email }
    const decoded = jwtDecode(data.token);
    login(data.token, role, data.name, decoded.id);
    return data;
  }

  return { signIn, logout };
}