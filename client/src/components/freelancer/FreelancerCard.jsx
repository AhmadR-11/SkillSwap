import React, { useState, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

export default function FreelancerCard({ freelancer, onStatusChange }) {
  const { token } = useContext(AuthContext);
  const [level, setLevel] = useState(freelancer.verificationLevel);
  const [verifying, setVerifying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Approve / Reject handler
  const handleVerify = async (approved) => {
    setVerifying(true);
    try {
      await api.patch(
        `/admin/freelancers/${freelancer._id}/verify`,
        { approved, level },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onStatusChange();
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  // Compute base URL (strip trailing /api)
  const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
    .replace(/\/api\/?$/, '');
    
  const calcSkillColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-800', 
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800', 
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800'
    ];
    return colors[index % colors.length];
  };

  return (
    <div 
      className={`relative bg-white rounded-xl p-6 flex flex-col transition-all duration-300 
        ${isHovered ? 'shadow-xl translate-y-0 border-blue-200 border-2' : 'shadow-md translate-y-1 border border-gray-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle top gradient effect */}
      <div className="absolute top-0 left-0 right-0 h-20 rounded-t-xl bg-gradient-to-b from-blue-50 to-transparent -z-10"></div>
      
      {/* Card Content with 3D depth effects */}
      <div className="relative z-10">
        {/* Freelancer Name */}
        <h2 className={`text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 transition-all duration-300 
          ${isHovered ? 'translate-y-0 scale-105' : ''}`}>
          {freelancer.name}  
        </h2>
        
        {/* Skills as pills */}
        <div className={`mb-4 transition-all duration-300 ${isHovered ? 'translate-y-0' : ''}`}>
          <strong className="text-gray-700 block mb-2">Skills:</strong>
          <div className="flex flex-wrap gap-2">
            {freelancer.skills.map((skill, index) => (
              <span 
                key={index} 
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${calcSkillColor(index)} 
                  ${isHovered ? 'shadow-sm' : ''}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        {/* Status with custom styling */}
        <div className="mb-4 flex items-center">
          <strong className="text-gray-700 mr-2">Status:</strong>
          {freelancer.verified ? (
            <span className={`px-3 py-1 inline-flex items-center bg-green-100 text-green-800 rounded-full transition-all duration-300 
              ${isHovered ? 'shadow-sm' : ''}`}>
              <span className={`w-2 h-2 bg-green-600 rounded-full mr-2 ${isHovered ? 'animate-pulse' : ''}`}></span>
              Verified
            </span>
          ) : (
            <span className={`px-3 py-1 inline-flex items-center bg-amber-100 text-amber-800 rounded-full transition-all duration-300 
              ${isHovered ? 'shadow-sm' : ''}`}>
              <span className={`w-2 h-2 bg-amber-500 rounded-full mr-2 ${isHovered ? 'animate-pulse' : ''}`}></span>
              Pending
            </span>
          )}
        </div>
        
        {/* Documents section with enhanced styling */}
        {freelancer.docs.length > 0 && (
          <div className={`mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 transition-all duration-300 
            ${isHovered ? 'shadow-sm translate-y-0' : ''}`}>
            <h3 className="font-medium text-blue-700 mb-2">Uploaded Documents</h3>
            <div className="space-y-2">
              {freelancer.docs.map((docPath, i) => {
                const url = `${baseURL}${docPath}`;
                const fileName = docPath.split('/').pop();
                return (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 hover:bg-blue-100 rounded-md transition-colors group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-600 group-hover:text-blue-800 transition-colors">
                      {fileName}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Verification Level with custom select */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Verification Level</label>
          <div className="relative">
            <select
              className={`w-full py-2 px-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none 
                ${isHovered ? 'shadow-sm' : ''}`}
              value={level}
              onChange={e => setLevel(e.target.value)}
            >
              <option value="Basic">Basic</option>
              <option value="Verified">Verified</option>
              <option value="Premium">Premium</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Approve / Reject buttons with subtle 3D effect */}
        {!freelancer.verified && (
          <div className="flex space-x-4 mt-auto">
            <button
              onClick={() => handleVerify(true)}
              disabled={verifying}
              className={`relative flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium overflow-hidden transition-all duration-300
                ${isHovered ? 'shadow-lg translate-y-0' : 'shadow translate-y-0.5'}`}
            >
              <span className="relative z-10 flex items-center justify-center">
                {verifying ? 'Approving…' : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Approve
                  </>
                )}
              </span>
              <span className="absolute inset-0">
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full hover:translate-x-0 transition-transform duration-700"></span>
              </span>
            </button>
            <button
              onClick={() => handleVerify(false)}
              disabled={verifying}
              className={`relative flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-medium overflow-hidden transition-all duration-300
                ${isHovered ? 'shadow-lg translate-y-0' : 'shadow translate-y-0.5'}`}
            >
              <span className="relative z-10 flex items-center justify-center">
                {verifying ? 'Rejecting…' : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Reject
                  </>
                )}
              </span>
              <span className="absolute inset-0">
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full hover:translate-x-0 transition-transform duration-700"></span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Subtle bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-xl bg-gradient-to-t from-blue-50/50 to-transparent -z-10"></div>
    </div>
  );
}