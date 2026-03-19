import React, { useState, useEffect, useContext } from 'react';
import { useNavigate }      from 'react-router-dom';
import api                  from '../../utils/api';
import { AuthContext }      from '../../context/AuthContext';
import FreelancerNavbar     from '../../components/freelancer/FreelancerNavbar';
import { MessageSquare, User, ChevronRight, Briefcase } from 'lucide-react';

export default function FreelancerChatListPage() {
  const { token } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const headers = { headers: { Authorization: `Bearer ${token}` } };
        // Load all bids (populated with projectId.clientId.name)
        const { data: bids } = await api.get('/freelancer/bids', headers);

        console.log('Fetched bids:', bids);

        // Deduplicate client IDs
        const map = {};
        bids.forEach(bid => {
          // Check if projectId exists and is an object with clientId
          if (bid.projectId && typeof bid.projectId === 'object' && bid.projectId.clientId) {
            const client = bid.projectId.clientId;
            if (client && !map[client._id]) {
              map[client._id] = client.name;
              console.log('Added client to map:', client._id, client.name);
            }
          } else {
            console.log('Skipping bid due to missing or invalid projectId/clientId:', bid._id);
          }
        });

        const contactsList = Object.entries(map).map(([id, name]) => ({ id, name }));
        console.log('Final contacts list:', contactsList);

        setContacts(contactsList);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [token]);

  return (
    <>
    <FreelancerNavbar />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Navbar would be here in the actual implementation */}
      <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 shadow-md border-b border-gray-700 mb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
            <h2 className="text-xl text-gray-100 font-bold">Freelancer Dashboard</h2>
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center group transform transition-all duration-500 hover:scale-105">
            <MessageSquare className="w-8 h-8 mr-3 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Messages
            </h1>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold">F</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse flex space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-700"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 bg-opacity-50 p-8 rounded-xl shadow-lg border border-gray-700 transform transition-all duration-500">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <User className="w-16 h-16 mb-4 text-gray-500 relative z-10" />
              </div>
              <p className="text-xl text-gray-400">No conversations yet.</p>
              <p className="text-gray-500 mt-2">Your client messages will appear here</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {contacts.map((c, index) => (
              <li key={c.id} 
                  className="transform transition-all duration-300 hover:translate-x-2"
                  style={{ 
                    opacity: 0, 
                    animation: `fadeInUp 0.5s ease forwards ${index * 0.1}s` 
                  }}>
                <button
                  onClick={() => navigate(`/chat/${c.id}`)}
                  className="w-full text-left p-5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-blue-500/20 border border-gray-700 flex items-center justify-between transform transition-all duration-300 group"
                  style={{ 
                    transform: 'perspective(1000px) rotateX(0deg)',
                    transformStyle: 'preserve-3d'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg) translateZ(10px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(30, 64, 175, 0.1), 0 10px 10px -5px rgba(30, 64, 175, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) translateZ(0px)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4 shadow-md">
                      <span className="text-white font-bold">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-lg text-gray-200 block">{c.name}</span>
                      <span className="text-sm text-gray-400">Client</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-3 group-hover:animate-pulse"></div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Floating action button */}
      <div className="fixed bottom-6 right-6">
        <button 
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform transition-all duration-300 hover:scale-110"
          onClick={() => console.log('New message')}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
    </>
  );
}
