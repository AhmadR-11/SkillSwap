import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function ClientNavbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('');
  const [hoverLink, setHoverLink] = useState(null);
  const [currentPage, setCurrentPage] = useState('TutorFind');

  useEffect(() => {
    setActiveLink(location.pathname);
    
    // Set the current page name based on the location
    const currentPathSegment = location.pathname.split('/').pop();
    const formattedPage = currentPathSegment
      ? currentPathSegment.charAt(0).toUpperCase() + currentPathSegment.slice(1)
      : 'TutorFind';
    setCurrentPage(formattedPage);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define our navigation links
  const navLinks = [
    { to: "/client/dashboard", label: "Dashboard" },
    { to: "/client/search", label: "Find Tutors" },
    { to: "/client/projects", label: "My Projects" },
    { to: "/messages", label: "Messages" },
    { to: "/client/analytics", label: "Analytics" }
  ];

  return (
    <nav className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white shadow-xl">
      {/* Glow effect background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(130,58,180,0.2),rgba(0,0,0,0))]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand logo & dynamic name */}
        <div className="flex items-center group cursor-pointer" onClick={() => navigate('/client/dashboard')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mr-3 shadow-lg shadow-purple-500/30 flex items-center justify-center 
            transition-all duration-500 group-hover:shadow-purple-400/50 group-hover:scale-110">
            <span className="font-bold text-white text-lg transform translate-y-px">T</span>
          </div>
          <div className="overflow-hidden">
            <span className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 
              transition-all duration-300 group-hover:from-purple-200 group-hover:to-pink-200">
              {currentPage}
            </span>
          </div>
        </div>
        
        {/* Navigation Links with enhanced transitions */}
        <div className="hidden md:flex space-x-1 relative">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-3 py-2 rounded-lg transition-all duration-500 overflow-hidden
                ${activeLink === link.to ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}
              `}
              onMouseEnter={() => setHoverLink(link.to)}
              onMouseLeave={() => setHoverLink(null)}
            >
              <span className={`relative z-10 transition-transform duration-300 inline-block
                ${hoverLink === link.to ? 'translate-y-[-2px]' : ''}`}>
                {link.label}
              </span>
              
              {/* Active indicator with animated gradient */}
              {activeLink === link.to && (
                <>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x"></span>
                  <span className="absolute inset-0 bg-purple-600/10 rounded-lg"></span>
                </>
              )}
              
              {/* Enhanced hover effect */}
              <span 
                className={`absolute inset-0 bg-gradient-to-r from-purple-800/40 to-indigo-800/40 transform transition-all duration-500 rounded-lg ${
                  hoverLink === link.to 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-95'
                }`}
              ></span>
              
              {/* Subtle top border on hover */}
              <span 
                className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-pink-400/70 transition-all duration-500 ${
                  hoverLink === link.to ? 'w-1/2' : 'w-0'
                }`}
              ></span>
            </Link>
          ))}
          
          {/* Animated glowing dot */}
          <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-purple-400 blur-sm animate-pulse"></div>
        </div>
        
        {/* Mobile menu button with hover effect */}
        <div className="md:hidden">
          <button className="flex items-center px-3 py-2 text-pink-200 hover:text-white transition-colors duration-300
            rounded-lg hover:bg-purple-800/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        
        {/* User actions with enhanced transitions */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-2 h-2 absolute top-0 right-0 bg-pink-500 rounded-full animate-ping"></div>
            <button className="relative p-2 text-gray-200 hover:text-white rounded-full transition-all duration-300 
              hover:bg-purple-800/30 hover:shadow-inner hover:shadow-purple-500/20">
              <svg className="w-5 h-5 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-pink-600 px-4 py-1.5 rounded-md text-sm font-medium 
              shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transform transition-all duration-300 
              hover:scale-105 active:scale-95 hover:from-red-500 hover:to-pink-500"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu (Hidden by default) */}
      <div className="hidden md:hidden absolute inset-x-0 top-full z-20 bg-gray-900/95 backdrop-blur-sm">
        <div className="flex flex-col space-y-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-md transition-all duration-300 ${
                activeLink === link.to 
                  ? 'bg-purple-900/50 text-white' 
                  : 'text-gray-300 hover:bg-purple-800/30 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Enhanced background line accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-pulse"></div>
    </nav>
  );
}