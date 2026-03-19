import React, { useEffect, useState, useContext, useCallback } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import FreelancerCard from '../../components/freelancer/FreelancerCard';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);
  const { token } = useContext(AuthContext);

  const fetchList = useCallback(() => {
    setIsLoading(true);
    api.get('/admin/freelancers', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setFreelancers(res.data);
      setIsLoading(false);
      setTimeout(() => setAnimateIn(true), 100);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [token]);

  useEffect(() => {
    fetchList();
    
    // Add 3D perspective to the entire page
    document.body.style.perspective = '1000px';
    document.body.style.backgroundColor = '#f0f5ff';
    
    return () => {
      document.body.style.perspective = 'none';
      document.body.style.backgroundColor = '';
    };
  }, [fetchList]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="transform transition-transform duration-500 ease-out hover:scale-105 hover:-rotate-1">
        <AdminSidebar />
      </div>
      <div className="flex-1 flex flex-col transform transition-all duration-500">
        <div className="shadow-lg z-10 transform hover:translate-y-1 transition-transform duration-300">
          <AdminNavbar />
        </div>
        <main className="p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-8 transform transition-all duration-500 hover:translate-x-2">
            <h1 className="text-3xl font-bold text-indigo-800 relative">
              Freelancer Verification
              <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transform transition-all duration-300 hover:w-full"></span>
            </h1>
            
            <button 
              onClick={fetchList}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:rotate-1 active:scale-95"
            >
              Refresh
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
          ) : (
            <div 
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transform transition-all duration-700 ease-out ${
                animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              {freelancers.length === 0 ? (
                <div className="col-span-full text-center p-10 bg-white rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-2xl">
                  <p className="text-xl text-gray-600">No freelancers available for verification</p>
                </div>
              ) : (
                freelancers.map((f, index) => (
                  <div
                    key={f._id}
                    className="transform transition-all duration-500 hover:scale-105 hover:rotate-1"
                    style={{ 
                      transitionDelay: `${index * 50}ms`,
                      animation: 'floatCard 3s ease-in-out infinite alternate'
                    }}
                  >
                    <FreelancerCard
                      freelancer={f}
                      onStatusChange={fetchList}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </main>
        
        {/* Footer with 3D effect */}
        <footer className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-4 text-center transform transition-all duration-500 hover:translate-y-1">
          <p className="text-sm">© 2025 Admin Dashboard • All Rights Reserved</p>
        </footer>
      </div>
      
      {/* Global style for animations */}
      <style jsx global>{`
        @keyframes floatCard {
          0% {
            transform: translateY(0) rotate(0);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
          100% {
            transform: translateY(-10px) rotate(1deg);
            box-shadow: 0 15px 25px rgba(0,0,0,0.15);
          }
        }
        
        .card-3d {
          transform-style: preserve-3d;
          transition: all 0.5s ease;
        }
        
        .card-3d:hover {
          transform: perspective(1000px) rotateX(5deg) rotateY(5deg);
        }
        
        /* Page transition effect */
        .page-enter {
          opacity: 0;
          transform: translateY(20px);
        }
        
        .page-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 500ms, transform 500ms;
        }
        
        .page-exit {
          opacity: 1;
          transform: translateY(0);
        }
        
        .page-exit-active {
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity 500ms, transform 500ms;
        }
      `}</style>
    </div>
  );
}