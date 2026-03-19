import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate }        from 'react-router-dom';
import api                          from '../../utils/api';
import { AuthContext }              from '../../context/AuthContext';
import GoogleLoginButton from '../../components/GoogleLoginButton';

export default function SignupPage() {
  const [role, setRole] = useState('admin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, /*setIsSubmitting*/] = useState(false);
  const [formAppear, setFormAppear] = useState(false);
  const navigate                = useNavigate();
  const { login }               = useContext(AuthContext);

  // Simulate navigation and API functions
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      let data;
      if (role === 'admin' || role === 'freelancer') {
        // existing logic
        const endpoint = role === 'admin'
          ? '/auth/admin/signup'
          : '/auth/freelancer/signup';
        ({ data } = await api.post(endpoint, { name, email, password }));
        // auto-login
        login(data.token, role);
        navigate(role === 'admin' ? '/dashboard' : '/dashboard/freelancers');
      } else {
        // client signup
        ({ data } = await api.post('/auth/client/signup', { name, email, phone, password }));
        // redirect to verification page with code
        navigate(`/verify?clientId=${data.clientId}&code=${data.verificationCode}`);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Sign-up failed');
    }
  };

  // Trigger entrance animation on component mount
  useEffect(() => {
    setFormAppear(true);
  }, []);

  // Role-based colors
  const getRoleColor = () => {
    switch(role) {
      case 'admin': return 'from-purple-600 to-indigo-700';
      case 'freelancer': return 'from-blue-500 to-teal-500';
      case 'client': return 'from-orange-500 to-pink-500';
      default: return 'from-purple-600 to-indigo-700';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className={`w-full max-w-md transform transition-all duration-700 ease-in-out ${formAppear ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getRoleColor()} p-6 transition-all duration-500 ease-in-out`}>
            <h2 className="text-2xl font-bold text-white text-center">Create Your Account</h2>
            <p className="text-white text-opacity-90 text-center mt-1">Join as {role === 'admin' ? 'an' : 'a'} {role}</p>
          </div>
          
          {/* Form */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm animate-pulse">
                {error}
              </div>
            )}
            
            {/* Role Selection */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Register as</label>
              <div className="flex rounded-md border border-gray-300 overflow-hidden">
                <button 
                  type="button" 
                  className={`flex-1 py-2 text-center transition-colors duration-300 ${role === 'admin' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setRole('admin')}
                >
                  Admin
                </button>
                <button 
                  type="button" 
                  className={`flex-1 py-2 text-center transition-colors duration-300 ${role === 'freelancer' ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setRole('freelancer')}
                >
                  Freelancer
                </button>
                <button 
                  type="button" 
                  className={`flex-1 py-2 text-center transition-colors duration-300 ${role === 'client' ? 'bg-pink-600 text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setRole('client')}
                >
                  Client
                </button>
              </div>
            </div>
            
            {/* Input Fields */}
            <div className="space-y-4">
              <div className="transition-all duration-300 transform hover:translate-x-1">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-all duration-300 focus:border-transparent"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="transition-all duration-300 transform hover:translate-x-1">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-all duration-300 focus:border-transparent"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {role === 'client' && (
                <div className="transition-all duration-300 transform hover:translate-x-1">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-all duration-300 focus:border-transparent"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="transition-all duration-300 transform hover:translate-x-1">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-all duration-300 focus:border-transparent"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md bg-gradient-to-r ${getRoleColor()} text-white font-medium transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSubmitting ? 'opacity-70' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  role === 'client' ? 'Sign Up & Verify' : 'Create Account'
                )}
              </button>
            </div>

            <div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-300"></div>
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-2 bg-white text-gray-500">Or</span>
  </div>
</div>

<GoogleLoginButton role={role} />
            
            {/* Login Link */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/" className={`font-medium transition-colors duration-300 ${
                  role === 'admin' ? 'text-indigo-600 hover:text-indigo-800' : 
                  role === 'freelancer' ? 'text-teal-600 hover:text-teal-800' : 
                  'text-pink-600 hover:text-pink-800'
                }`}>
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}