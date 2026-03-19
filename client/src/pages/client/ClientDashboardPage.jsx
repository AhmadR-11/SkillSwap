// client/src/pages/ClientDashboardPage.jsx
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import ClientNavbar from '../../components/client/ClientNavbar';
import { AuthContext } from '../../context/AuthContext';

export default function ClientDashboardPage() {
  const { userName } = useContext(AuthContext);
  
  // Sample data for demonstration (would come from API in real app)
  const [stats] = useState({
    activeProjects: 3,
    completedProjects: 12,
    totalSpent: 2450,
    savedTutors: 8
  });
  
  const [recentActivity] = useState([
    { id: 1, type: 'message', title: 'New message from David Miller', time: '10 minutes ago', status: 'unread' },
    { id: 2, type: 'project', title: 'Math Tutoring project completed', time: '2 hours ago', status: '' },
    { id: 3, type: 'payment', title: 'Invoice #INV-287 paid', time: 'Yesterday', status: '' },
    { id: 4, type: 'review', title: 'Review requested for Physics project', time: '2 days ago', status: 'pending' }
  ]);
  
  const [upcomingSessions] = useState([
    { id: 101, title: 'Advanced Calculus', tutor: 'Sarah Johnson', date: 'Today', time: '4:00 PM', duration: '1 hour' },
    { id: 102, title: 'Python Programming', tutor: 'Michael Chen', date: 'Tomorrow', time: '10:00 AM', duration: '2 hours' }
  ]);

  return (
    <>
      <ClientNavbar />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 text-gray-100 pb-16">
        <div className="max-w-7xl mx-auto px-6 pt-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h1 className="text-5xl font-bold text-gray-200 mb-2">Client Dashboard</h1>
              <p className="text-xl text-gray-300">
                Welcome, <span className="font-semibold text-indigo-300">{userName || 'Ahmad Raza'}!</span>
              </p>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="mt-6 md:mt-0 flex space-x-3">
              <button className="flex items-center px-4 py-2 bg-indigo-600/80 rounded-md hover:bg-indigo-500 transition-all duration-300">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                New Project
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-700/80 rounded-md hover:bg-gray-600 transition-all duration-300">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                </svg>
                Filter Activity
              </button>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 flex flex-col items-center">
              <span className="text-indigo-400 text-sm uppercase tracking-wider mb-1">Active Projects</span>
              <span className="text-2xl font-bold text-white">{stats.activeProjects}</span>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 flex flex-col items-center">
              <span className="text-indigo-400 text-sm uppercase tracking-wider mb-1">Completed</span>
              <span className="text-2xl font-bold text-white">{stats.completedProjects}</span>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 flex flex-col items-center">
              <span className="text-indigo-400 text-sm uppercase tracking-wider mb-1">Total Spent</span>
              <span className="text-2xl font-bold text-white">${stats.totalSpent}</span>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 flex flex-col items-center">
              <span className="text-indigo-400 text-sm uppercase tracking-wider mb-1">Saved Tutors</span>
              <span className="text-2xl font-bold text-white">{stats.savedTutors}</span>
            </div>
          </div>
          
          {/* Main Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Find Tutors Tile */}
            <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/10 group">
              <h2 className="text-2xl font-semibold mb-3 text-white group-hover:text-indigo-300 transition-colors duration-300">Find Tutors</h2>
              <p className="flex-1 text-gray-300 mb-6 text-lg">
                Search and filter freelancers (tutors) based on your criteria.
              </p>
              <Link
                to="/client/search"
                className="inline-block px-6 py-2.5 bg-blue-600/80 text-white rounded-md hover:bg-blue-500 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/30"
              >
                Go to Search
              </Link>
            </div>

            {/* My Projects Tile */}
            <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/10 group">
              <h2 className="text-2xl font-semibold mb-3 text-white group-hover:text-indigo-300 transition-colors duration-300">My Projects</h2>
              <p className="flex-1 text-gray-300 mb-6 text-lg">
                Post new projects or manage your existing ones.
              </p>
              <Link
                to="/client/projects"
                className="inline-block px-6 py-2.5 bg-blue-600/80 text-white rounded-md hover:bg-blue-500 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/30"
              >
                Manage Projects
              </Link>
            </div>

            {/* Messages Tile */}
            <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/10 group">
              <h2 className="text-2xl font-semibold mb-3 text-white group-hover:text-indigo-300 transition-colors duration-300">Messages</h2>
              <p className="flex-1 text-gray-300 mb-6 text-lg">
                View and respond to messages from your tutors and contacts.
              </p>
              <Link
                to="/messages"
                className="inline-block px-6 py-2.5 bg-blue-600/80 text-white rounded-md hover:bg-blue-500 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/30"
              >
                Open Messages
              </Link>
            </div>

            {/* Analytics Tile */}
            <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/10 group">
              <h2 className="text-2xl font-semibold mb-3 text-white group-hover:text-indigo-300 transition-colors duration-300">Analytics</h2>
              <p className="flex-1 text-gray-300 mb-6 text-lg">
                Track your project metrics, spending, and tutor performance.
              </p>
              <Link
                to="/client/analytics"
                className="inline-block px-6 py-2.5 bg-blue-600/80 text-white rounded-md hover:bg-blue-500 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/30"
              >
                View Analytics
              </Link>
            </div>
          </div>

          {/* Additional Sections in 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity Feed */}
            <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-lg">
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-700/50">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="p-4 hover:bg-gray-700/20 transition-colors duration-200 flex items-start">
                    {/* Activity icon */}
                    <div className={`rounded-full p-2 mr-4 ${
                      activity.type === 'message' ? 'bg-blue-500/20 text-blue-400' : 
                      activity.type === 'project' ? 'bg-green-500/20 text-green-400' : 
                      activity.type === 'payment' ? 'bg-purple-500/20 text-purple-400' : 
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {activity.type === 'message' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                        </svg>
                      )}
                      {activity.type === 'project' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                      )}
                      {activity.type === 'payment' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      )}
                      {activity.type === 'review' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                        </svg>
                      )}
                    </div>
                    {/* Activity content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-200">{activity.title}</h3>
                        {activity.status === 'unread' && (
                          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">New</span>
                        )}
                        {activity.status === 'pending' && (
                          <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">Action Needed</span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-700/50">
                <Link to="/client/activity" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center">
                  View All Activity
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Column - Upcoming Sessions & Resources */}
            <div className="space-y-8">
              {/* Upcoming Sessions */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-lg">
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
                </div>
                <div className="divide-y divide-gray-700/50">
                  {upcomingSessions.map(session => (
                    <div key={session.id} className="p-4 hover:bg-gray-700/20 transition-colors duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-200">{session.title}</h3>
                        <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">{session.duration}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-1">with {session.tutor}</p>
                      <div className="flex items-center text-gray-300 text-sm">
                        <svg className="w-4 h-4 mr-1 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {session.date} · {session.time}
                      </div>
                    </div>
                  ))}
                </div>
                {upcomingSessions.length > 0 && (
                  <div className="p-4 border-t border-gray-700/50">
                    <Link to="/calendar" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center">
                      View Full Calendar
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                )}
                {upcomingSessions.length === 0 && (
                  <div className="p-6 text-center text-gray-400">
                    No upcoming sessions scheduled
                  </div>
                )}
              </div>
              
              {/* Quick Resources */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-xl font-semibold text-white">Resources</h2>
                </div>
                <div className="divide-y divide-gray-700/50">
                  <Link to="/help/getting-started" className="p-4 hover:bg-gray-700/20 transition-colors duration-200 flex items-center">
                    <div className="bg-purple-500/20 text-purple-400 rounded-full p-2 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <span className="text-gray-300">Getting Started Guide</span>
                  </Link>
                  <Link to="/help/faq" className="p-4 hover:bg-gray-700/20 transition-colors duration-200 flex items-center">
                    <div className="bg-green-500/20 text-green-400 rounded-full p-2 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <span className="text-gray-300">Frequently Asked Questions</span>
                  </Link>
                  <Link to="/help/contact" className="p-4 hover:bg-gray-700/20 transition-colors duration-200 flex items-center">
                    <div className="bg-blue-500/20 text-blue-400 rounded-full p-2 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <span className="text-gray-300">Contact Support</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}