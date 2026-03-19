import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const { pathname } = useLocation();

  // Memoize so its reference never changes
  const menuItems = useMemo(() => [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    },
    {
      path: "/admin/analytics",
      label: "Analytics",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    },
    {
      path: "/dashboard/freelancers",
      label: "Freelancers",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    },
    {
      path: "/admin/notifications/templates",
      label: "Notifications",
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    }
  ], []);

  // Include menuItems in deps to satisfy ESLint
  useEffect(() => {
    const active = menuItems.find(item =>
      pathname === item.path || pathname.startsWith(item.path + '/')
    );
    setActiveItem(active?.path || null);
  }, [pathname, menuItems]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <aside
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-blue-800 to-indigo-900 text-white min-h-screen flex flex-col shadow-xl relative z-30`}
      style={{
        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 0 25px rgba(30, 64, 175, 0.3)',
        backgroundImage: 'linear-gradient(180deg, #1e40af 0%, #312e81 100%)',
        overflow: 'hidden'
      }}
    >
      {/* 3D background patterns */}
      <div className="absolute inset-0 z-0" style={{ overflow: 'hidden' }}>
        <div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500 opacity-10"
          style={{
            filter: 'blur(40px)',
            animation: 'floatCircle1 15s infinite ease-in-out'
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full bg-indigo-600 opacity-10"
          style={{
            filter: 'blur(40px)',
            animation: 'floatCircle2 20s infinite ease-in-out',
            animationDelay: '2s'
          }}
        />
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-12 bg-blue-600 rounded-full p-1 z-40"
        style={{
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'perspective(100px) rotateY(-10deg) scale(1.1)';
          e.currentTarget.style.backgroundColor = '#2563eb';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'perspective(100px) rotateY(0deg) scale(1)';
          e.currentTarget.style.backgroundColor = '#3b82f6';
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-white"
          style={{
            transition: 'transform 0.5s ease',
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
          />
        </svg>
      </button>

      {/* Logo area */}
      <div
        className={`flex items-center justify-center h-20 ${isCollapsed ? 'px-2' : 'px-4'}`}
        style={{ position: 'relative', zIndex: 10 }}
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-300"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: 'pulse 3s infinite'
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span
            className={`font-bold text-lg whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
            style={{
              transition: 'opacity 0.5s ease, width 0.5s ease',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            SkillSwap
          </span>
        </div>
      </div>

      <div
        className="h-px mx-4 my-4"
        style={{ background: 'linear-gradient(to right, transparent, rgba(147,197,253,0.3), transparent)' }}
      />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2" style={{ position: 'relative', zIndex: 10 }}>
        {menuItems.map(item => {
          const isActive = activeItem === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={() => setActiveItem(item.path)}
              className={`group flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-start'
              } px-2 py-3 my-1 rounded-lg`}
              style={{
                color: isActive ? '#fff' : '#bfdbfe',
                background: isActive
                  ? 'linear-gradient(90deg, #3b82f6 0%, #4f46e5 100%)'
                  : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(59,130,246,0.4)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                transform: `translateX(${isActive ? '0.25rem' : '0'})`,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(59,130,246,0.2)';
                  e.currentTarget.style.transform = 'translateX(0.25rem)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.2)';
                } else {
                  e.currentTarget.style.transform = 'translateX(0.35rem) scale(1.02)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                } else {
                  e.currentTarget.style.transform = 'translateX(0.25rem) scale(1)';
                }
              }}
            >
              {isActive && (
                <div className="absolute inset-0 w-full h-full">
                  <div
                    className="absolute right-0 top-0 h-full w-24 bg-white opacity-10"
                    style={{
                      transform: 'skewX(-15deg) translateX(100%)',
                      animation: 'shine 3s infinite'
                    }}
                  />
                </div>
              )}

              <div
                className={`flex-shrink-0 ${isActive ? 'animate-pulse' : ''}`}
                style={{
                  position: 'relative',
                  zIndex: 5,
                  transform: `scale(${isActive ? 1.1 : 1})`,
                  transition: 'transform 0.3s ease'
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`}
                  style={{
                    color: isActive ? '#fff' : '#93c5fd',
                    transition: 'color 0.3s ease, transform 0.3s ease',
                    filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none'
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.2 : 1.8} d={item.icon} />
                </svg>
              </div>

              <span
                className={`ml-3 whitespace-nowrap ${
                  isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'
                }`}
                style={{
                  transition: 'opacity 0.3s ease',
                  fontWeight: isActive ? 500 : 400,
                  position: 'relative',
                  zIndex: 5
                }}
              >
                {item.label}
              </span>

              {isActive && !isCollapsed && (
                <span
                  className="absolute left-0 w-1 h-full bg-blue-300 rounded-r"
                  style={{
                    boxShadow: '0 0 8px rgba(147,197,253,0.6)',
                    animation: 'pulse 2s infinite'
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={`mt-auto mb-4 px-4 py-3 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
        style={{ transition: 'opacity 0.5s ease', position: 'relative', zIndex: 10 }}
      >
        <div
          className="h-px mb-4"
          style={{ background: 'linear-gradient(to right, transparent, rgba(147,197,253,0.3), transparent)' }}
        />
        <div className="text-xs text-blue-300 opacity-70 text-center">Admin Portal v1.0</div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        @keyframes shine {
          0% { transform: skewX(-15deg) translateX(-100%); }
          50%, 100% { transform: skewX(-15deg) translateX(200%); }
        }
        @keyframes floatCircle1 {
          0% { transform: translate(0,0) scale(1); }
          33% { transform: translate(20px,-30px) scale(1.2); }
          66% { transform: translate(-20px,20px) scale(0.8); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes floatCircle2 {
          0% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-30px,-20px) scale(1.3); }
          66% { transform: translate(30px,30px) scale(0.7); }
          100% { transform: translate(0,0) scale(1); }
        }
      `}</style>
    </aside>
  );
}
