import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function LoginPage() {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setErr(''); // Clear previous errors
    setIsLoading(true);
    
    try {
      // Ensure email and password are not empty
      if (!email.trim() || !password.trim()) {
        setErr('Please enter both email and password');
        return;
      }

      await signIn(role, email, password);
      
      // Handle navigation based on role
      switch(role) {
        case 'admin':
          navigate('/dashboard');
          break;
        case 'freelancer':
          navigate('/freelancer/profile');
          break;
        case 'client':
          navigate('/client/dashboard');
          break;
        default:
          setErr('Invalid role selected');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErr(
        error.response?.data?.message || 
        'Invalid credentials. Please try again.'
      );
    }
  };

  const calculateCardTransform = () => {
    const maxRotate = 3;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const rotateY = ((mousePosition.x - centerX) / centerX) * maxRotate;
    const rotateX = -((mousePosition.y - centerY) / centerY) * maxRotate;
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden">
      {/* Animated background elements - dark theme with cyber pattern */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Glowing elements */}
        <div className="absolute w-64 h-64 rounded-full bg-teal-500 opacity-5 blur-3xl animate-pulse top-1/4 left-1/4"></div>
        <div className="absolute w-96 h-96 rounded-full bg-indigo-700 opacity-5 blur-3xl animate-pulse bottom-0 right-1/4"></div>
        <div className="absolute w-80 h-80 rounded-full bg-purple-700 opacity-5 blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-64 h-64 rounded-full bg-blue-700 opacity-5 blur-3xl animate-pulse bottom-1/4 left-0"></div>
      </div>
      
      <div 
        className="relative z-10 p-3 rounded-2xl w-full max-w-md"
        style={{ 
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: calculateCardTransform(),
        }}
      >
        <div
          className="backdrop-blur-sm bg-gray-900/80 p-8 rounded-2xl shadow-2xl w-full border border-gray-800"
          style={{ 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              Welcome Back
            </h2>
            <p className="text-gray-400">Enter your credentials to access your account</p>
          </div>
          
          {err && (
            <div className="mb-6 p-3 bg-red-900/40 backdrop-blur-sm border border-red-700 rounded-lg">
              <p className="text-red-200 text-center">{err}</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="group">
              <label className="block mb-2 text-gray-400 font-medium transition-all group-hover:text-gray-300">Role</label>
              <div className="relative">
                <select
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 hover:bg-gray-750"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="admin" className="bg-gray-800 text-gray-200">Admin</option>
                  <option value="freelancer" className="bg-gray-800 text-gray-200">Freelancer</option>
                  <option value="client" className="bg-gray-800 text-gray-200">Client</option>
                </select>
              </div>
            </div>

            <div className="group">
              <label className="block mb-2 text-gray-400 font-medium transition-all group-hover:text-gray-300">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-4 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 hover:bg-gray-750"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <svg className="absolute top-1/2 left-4 transform -translate-y-1/2 w-5 h-5 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div className="group">
              <label className="block mb-2 text-gray-400 font-medium transition-all group-hover:text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full p-4 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 hover:bg-gray-750"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <svg className="absolute top-1/2 left-4 transform -translate-y-1/2 w-5 h-5 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button 
                  type="button" 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-400 hover:text-teal-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-4 px-4 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium hover:from-teal-600 hover:to-blue-700 transform hover:translate-y-px transition-all duration-300 relative overflow-hidden"
              >
                <span className={`flex items-center justify-center ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                  Sign In
                </span>
                {isLoading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-400">
                {(role === 'freelancer' || role === 'client') && (
                  <>
                    New {role}?{' '}
                    <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-medium transition-colors duration-300 border-b border-teal-700 hover:border-teal-500 pb-px cursor-pointer">
                      Create an account
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}