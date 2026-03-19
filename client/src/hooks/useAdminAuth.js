import { useContext } from 'react';
import { AdminContext } from '../context/adminContext';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

export default function useAdminAuth() {
  const { token, login, logout } = useContext(AdminContext);

  const signIn = async (email, password) => {
    const { data } = await api.post('/auth/admin/login', { email, password });
    login(data.token);
    return jwtDecode(data.token);
  };

  return { token, signIn, logout };
}