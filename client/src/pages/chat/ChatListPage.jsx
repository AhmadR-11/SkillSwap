import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import ClientNavbar from '../../components/client/ClientNavbar';
import { MessageSquare, User, ChevronRight } from 'lucide-react';

export default function ChatListPage() {
  const { token } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      // 1) Load client projects
      const { data: projects } = await api.get('/client/projects', headers);

      // 2) For each project, load bids
      const map = {};
      await Promise.all(projects.map(async p => {
        const { data: bids } = await api.get(
          `/client/projects/${p._id}/bids`,
          headers
        );
        bids.forEach(bid => {
          const f = bid.freelancerId;
          if (f && !map[f._id]) {
            map[f._id] = f.name;
          }
        });
      }));

      setContacts(
        Object.entries(map).map(([id, name]) => ({ id, name }))
      );
      setIsLoading(false);
    };

    fetchContacts().catch(console.error);
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <ClientNavbar />
      <div className="max-w-2xl mx-auto p-6 pt-20">
        <div className="flex items-center mb-8 transform transition-all duration-500 hover:scale-105">
          <MessageSquare className="w-8 h-8 mr-3 text-purple-400" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Messages
          </h1>
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
          <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-lg border border-gray-700 transform transition-all duration-500 hover:shadow-purple-500/20">
            <div className="flex flex-col items-center justify-center text-center">
              <User className="w-16 h-16 mb-4 text-gray-500" />
              <p className="text-xl text-gray-400">No conversations yet.</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {contacts.map((c, index) => (
              <li key={c.id} className="transform transition-all duration-300 hover:translate-x-2 hover:scale-102"
                  style={{ 
                    opacity: 0, 
                    animation: `fadeIn 0.5s ease forwards ${index * 0.1}s` 
                  }}>
                <button
                  onClick={() => navigate(`/chat/${c.id}`)}
                  className="w-full text-left p-5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg hover:shadow-purple-500/20 hover:from-gray-700 hover:to-gray-800 border border-gray-700 flex items-center justify-between transform transition-all duration-300 group"
                  style={{ 
                    transform: 'perspective(1000px) rotateX(0deg)',
                    transformStyle: 'preserve-3d'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg)';
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-4 shadow-md">
                      <span className="text-white font-bold">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-medium text-lg text-gray-200">{c.name}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transform transition-transform group-hover:translate-x-1" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}