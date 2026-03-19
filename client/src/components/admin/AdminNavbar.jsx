import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AdminNavbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 
      ${scrolled 
        ? 'bg-white text-blue-600 shadow-lg' 
        : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'} 
      transition-all duration-500 ease-in-out`}
      style={{
        transform: scrolled ? 'translateY(0)' : 'translateY(0)',
        boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none'
      }}
    >
      <div className="flex items-center">
        <div className="flex items-center space-x-2" 
             style={{ 
               transform: scrolled ? 'scale(0.95)' : 'scale(1)',
               transition: 'transform 0.5s ease' 
             }}>
          <svg xmlns="http://www.w3.org/2000/svg" 
               className={`h-7 w-7 ${scrolled ? 'text-blue-600' : 'text-blue-300'}`}
               style={{ 
                 transition: 'color 0.5s ease, transform 0.5s ease',
                 transform: scrolled ? 'rotate(0deg)' : 'rotate(5deg)' 
               }}
               fill="none" 
               viewBox="0 0 24 24" 
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h1 className={`text-xl font-bold tracking-tight
            ${scrolled ? 'text-blue-600' : 'text-white'}`}
            style={{ transition: 'color 0.5s ease' }}>
            SkillSwap Admin
          </h1>
        </div>
      </div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        <button
          onClick={handleLogout}
          className={`group relative px-5 py-2 rounded-lg overflow-hidden font-medium 
          ${scrolled 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-white text-blue-600 hover:bg-gray-100'}`}
          style={{
            transition: 'all 0.3s ease',
            transform: 'perspective(500px) rotateX(0deg)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'perspective(500px) rotateX(5deg)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'perspective(500px) rotateX(0deg)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <span className="absolute right-0 top-0 w-12 h-full bg-white opacity-10 transform translate-x-12 skew-x-12 group-hover:translate-x-40"
                style={{ transition: 'transform 0.7s ease' }}></span>
          <div className="flex items-center space-x-2">
            <span>Logout</span>
            <svg xmlns="http://www.w3.org/2000/svg" 
                 className="h-4 w-4" 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 stroke="currentColor"
                 style={{ 
                   transition: 'transform 0.3s ease',
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = 'translateX(3px)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = 'translateX(0)';
                 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </button>
      </div>
      
      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className={`p-2 rounded-full ${scrolled ? 'text-blue-600' : 'text-white'} focus:outline-none`}
          style={{
            transition: 'transform 0.3s ease',
            transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)'
          }}
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`fixed inset-0 bg-blue-800 z-40`}
        style={{
          backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
          opacity: mobileMenuOpen ? '0.98' : '0',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.5s ease, opacity 0.5s ease',
          display: mobileMenuOpen ? 'block' : 'block',
          pointerEvents: mobileMenuOpen ? 'auto' : 'none'
        }}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <div className="flex items-center space-x-3"
               style={{
                 animation: mobileMenuOpen ? 'pulse 2s infinite' : 'none'
               }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-3xl font-bold text-white">SkillSwap Admin</h2>
          </div>
          
          <div className="w-32 h-1 bg-white opacity-20 rounded-full"></div>
          
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium flex items-center space-x-2"
            style={{
              transition: 'all 0.3s ease',
              transform: 'perspective(500px) rotateX(0deg)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'perspective(500px) rotateX(5deg) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(500px) rotateX(0deg) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span>Logout</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          
          <button
            onClick={toggleMobileMenu}
            className="absolute top-6 right-6 p-2 rounded-full text-white"
            style={{
              transition: 'transform 0.3s ease, background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Add these style tags for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </nav>
  );
}