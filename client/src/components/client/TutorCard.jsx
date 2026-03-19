import React, { useState } from 'react';

export default function TutorCard({ tutor }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Function to generate random gradient colors for skills
  const getSkillGradient = (index) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-red-500'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
        rounded-xl p-6 flex flex-col h-full transform transition-all duration-500 ease-out
        ${isHovered ? 'scale-[1.02] shadow-2xl shadow-purple-500/20' : 'shadow-lg shadow-purple-500/10'}
        border border-gray-700 backdrop-blur-sm`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background elements */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-xl rounded-xl"></div>
      <div className={`absolute -z-10 top-0 right-0 w-32 h-32 bg-purple-600 rounded-full blur-3xl opacity-20 transition-all duration-700 ${isHovered ? 'scale-125' : 'scale-100'}`}></div>
      <div className={`absolute -z-10 bottom-0 left-0 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20 transition-all duration-700 ${isHovered ? 'scale-125' : 'scale-100'}`}></div>
      
      {/* Card content with 3D transform */}
      <div className={`relative z-10 transform transition-transform duration-500 ${isHovered ? 'translate-z-10' : ''}`}>
        {/* Tutor name with animated gradient */}
        <h2 
          className={`text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r 
            from-purple-400 to-blue-500 transition-all duration-500
            ${isHovered ? 'tracking-wider scale-105' : 'tracking-normal'}`}
        >
          {tutor.name}
        </h2>
        
        {/* Level with glowing effect */}
        <div className={`mb-4 transition-all duration-300 transform ${isHovered ? 'translate-y-0' : 'translate-y-1'}`}>
          <div className="flex items-center">
            <span className="text-gray-400 font-medium mr-2">Level:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600
              transition-all duration-300 text-white
              ${isHovered ? 'shadow-md shadow-violet-500/30' : ''}`}
            >
              {tutor.verificationLevel}
            </span>
          </div>
        </div>
        
        {/* Skills with custom styling */}
        <div className={`mb-6 transition-all duration-300 transform ${isHovered ? 'translate-y-0' : 'translate-y-1'}`}>
          <span className="text-gray-400 font-medium block mb-2">Skills:</span>
          <div className="flex flex-wrap gap-2">
            {tutor.skills.map((skill, index) => (
              <span 
                key={index} 
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                  bg-gradient-to-r ${getSkillGradient(index)} text-white
                  transition-all duration-300 transform 
                  ${isHovered ? `shadow-md shadow-${skill.length % 2 === 0 ? 'purple' : 'blue'}-500/30 scale-105 delay-${index * 100}` : 'scale-100'}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        {/* Portfolio link with hover animation */}
        {tutor.portfolio && tutor.portfolio.length > 0 && (
          <div className="mt-auto pt-4 border-t border-gray-700/50">
            <a
              href={tutor.portfolio[0]}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative inline-flex items-center px-4 py-2 overflow-hidden rounded-lg
                bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium
                transition-all duration-300 transform
                ${isHovered ? 'shadow-lg shadow-violet-500/30' : 'shadow shadow-violet-500/10'}`}
            >
              <span className="relative z-10 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Portfolio
              </span>
              <span className="absolute inset-0 overflow-hidden rounded-lg">
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
              </span>
            </a>
          </div>
        )}
      </div>
      
      {/* Animated glow on hover */}
      <div 
        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 via-transparent to-blue-600/20 opacity-0 transition-opacity duration-500 pointer-events-none
          ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      ></div>
    </div>
  );
}
