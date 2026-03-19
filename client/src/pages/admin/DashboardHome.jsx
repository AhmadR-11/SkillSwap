// src/pages/admin/DashboardHome.jsx
import React, { useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion } from 'framer-motion';

export default function DashboardHome() {
  // Add subtle background animation effect
  useEffect(() => {
    // Create a subtle background animation effect
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      document.documentElement.style.setProperty('--mouse-x', x.toString());
      document.documentElement.style.setProperty('--mouse-y', y.toString());
    };
    
    // Add gradient movement based on mouse position
    window.addEventListener('mousemove', handleMouseMove);
    
    // Initialize 3D text effect
    const initTextEffect = () => {
      const title = document.querySelector('.dashboard-title');
      if (title) {
        title.style.textShadow = '0 2px 5px rgba(0,0,0,0.2)';
        title.style.transition = 'text-shadow 0.3s ease, transform 0.3s ease';
      }
    };
    
    // Apply 3D hover effect to panel
    const initPanelEffect = () => {
      const panel = document.querySelector('.dashboard-panel');
      if (panel) {
        const onMouseMove = (e) => {
          const rect = panel.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const xRotation = ((y - rect.height / 2) / rect.height) * -8;
          const yRotation = ((x - rect.width / 2) / rect.width) * 8;
          
          panel.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale3d(1.02, 1.02, 1.02)`;
        };
        const onMouseLeave = () => {
          panel.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        };
        
        panel.addEventListener('mousemove', onMouseMove);
        panel.addEventListener('mouseleave', onMouseLeave);
        
        // cleanup closures
        panel._cleanup = () => {
          panel.removeEventListener('mousemove', onMouseMove);
          panel.removeEventListener('mouseleave', onMouseLeave);
        };
      }
    };
    
    // Run initialization after a brief delay to ensure DOM elements are ready
    const timer = setTimeout(() => {
      initTextEffect();
      initPanelEffect();
    }, 100);
    
    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
      const panel = document.querySelector('.dashboard-panel');
      if (panel && panel._cleanup) {
        panel._cleanup();
      }
    };
  }, []);

  // Animation variants
  const sidebarVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  };
  const navbarVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 120, damping: 20, delay: 0.2 } 
    }
  };
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.4 } 
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-30 filter blur-3xl -translate-y-1/2 translate-x-1/2"
          style={{
            transform: 'translate(calc(var(--mouse-x, 0.5) * 20px), calc(var(--mouse-y, 0.5) * -20px))'
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full opacity-20 filter blur-3xl translate-y-1/2 -translate-x-1/2"
          style={{
            transform: 'translate(calc(var(--mouse-x, 0.5) * -20px), calc(var(--mouse-y, 0.5) * 20px))'
          }}
        />
      </div>
      
      {/* Sidebar */}
      <motion.div initial="hidden" animate="visible" variants={sidebarVariants} className="z-10">
        <AdminSidebar />
      </motion.div>
      
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <motion.div initial="hidden" animate="visible" variants={navbarVariants} className="z-10">
          <AdminNavbar />
        </motion.div>
        
        {/* Main content */}
        <motion.main initial="hidden" animate="visible" variants={contentVariants} className="p-6">
          <h1
            className="text-3xl font-semibold mb-4 dashboard-title transform transition-all duration-300 hover:scale-105 hover:text-indigo-700"
          >
            Admin Dashboard
          </h1>
          
          {/* Panel with 3D hover effect */}
          <motion.div
            className="dashboard-panel bg-white p-8 rounded-xl shadow-xl border border-gray-100 transition-all duration-300"
            whileHover={{
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
            }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 text-lg"
            >
              Welcome to SkillSwap Admin Panel. Use the sidebar to manage the platform.
            </motion.p>
            
            {/* Quick links */}
            <motion.div
              className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {['Users', 'Courses', 'Analytics', 'Settings'].map((item, i) => (
                <motion.div
                  key={i}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center cursor-pointer transition-all"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: '#EEF2FF',
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    borderColor: '#C7D2FE',
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="font-medium text-gray-700">{item}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}
