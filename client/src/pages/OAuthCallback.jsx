import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const error = searchParams.get('error');
    
    if (error) {
      navigate('/login?error=' + error);
      return;
    }
    
    if (token && role) {
      // Login the user
      login(token, role, name, email);
      
      // Redirect based on role
      if (role === 'admin') {
        navigate('/dashboard');
      } else if (role === 'freelancer') {
        navigate('/dashboard/freelancers');
      } else {
        navigate('/dashboard/clients');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Processing Authentication</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    </div>
  );
}