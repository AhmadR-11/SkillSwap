import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import ClientNavbar from '../../components/client/ClientNavbar';
import TutorCard from '../../components/client/TutorCard';
import { Search, Book, Award } from 'lucide-react';

export default function ClientFreelancerSearchPage() {
  const { token } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    name: '', skills: '', level: ''
  });
  const [tutors, setTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch whenever filters change
  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.skills) params.append('skills', filters.skills);
      if (filters.level) params.append('level', filters.level);

      try {
        const res = await api.get(`/freelancers?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTutors(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    fetch();
  }, [filters, token]);

  const handleChange = e =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900">
      <ClientNavbar />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto p-6 pt-10"
      >
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 10
          }}
          className="text-3xl font-bold mb-8 text-center text-indigo-200 relative"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Find Expert Tutors
          </span>
          <motion.div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "6rem" }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.h1>

        {/* 3D Filters Card */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-6 shadow-xl rounded-xl mb-8 relative overflow-hidden transform perspective-1000"
          style={{
            transformStyle: "preserve-3d",
            boxShadow: "0 10px 30px -5px rgba(76, 29, 149, 0.1), 0 10px 10px -5px rgba(76, 29, 149, 0.04)"
          }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 rounded-full blur-2xl" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.02, translateZ: "10px" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
              <div className="relative bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                <label className="flex items-center text-indigo-700 font-medium mb-2">
                  <Search className="w-4 h-4 mr-2" /> Name
                </label>
                <input
                  name="name"
                  value={filters.name}
                  onChange={handleChange}
                  placeholder="Search by name"
                  className="w-full border border-indigo-100 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none"
                />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, translateZ: "10px" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
              <div className="relative bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                <label className="flex items-center text-indigo-700 font-medium mb-2">
                  <Book className="w-4 h-4 mr-2" /> Skills
                </label>
                <input
                  name="skills"
                  value={filters.skills}
                  onChange={handleChange}
                  placeholder="e.g. React,UI/UX"
                  className="w-full border border-indigo-100 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none"
                />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, translateZ: "10px" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
              <div className="relative bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                <label className="flex items-center text-indigo-700 font-medium mb-2">
                  <Award className="w-4 h-4 mr-2" /> Verification Level
                </label>
                <select
                  name="level"
                  value={filters.level}
                  onChange={handleChange}
                  className="w-full border border-indigo-100 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all duration-300 outline-none appearance-none"
                  style={{ 
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236366f1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem"
                  }}
                >
                  <option value="">All Levels</option>
                  <option value="Basic">Basic</option>
                  <option value="Verified">Verified</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
              }}
              className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
            />
          </div>
        ) : tutors.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl shadow-lg"
          >
            <div className="w-20 h-20 mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-indigo-500" />
            </div>
            <p className="text-lg text-center text-gray-600">No tutors found matching your criteria.</p>
            <p className="text-center text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {tutors.map(t => (
              <motion.div key={t._id} variants={itemVariants}>
                <TutorCard tutor={t} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}