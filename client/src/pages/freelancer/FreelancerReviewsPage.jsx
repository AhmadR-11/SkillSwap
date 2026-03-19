import React, { useState, useEffect, useContext, Suspense } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import FreelancerNavbar from '../../components/freelancer/FreelancerNavbar';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars, /*Text3D*/ Float, Environment } from '@react-three/drei';

// 3D Star Rating Component
const StarRating3D = ({ rating }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <Environment preset="city" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <group>
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[(i - 2) * 1.2, 0, 0]}>
              <torusGeometry args={[0.5, 0.2, 16, 32]} />
              <meshStandardMaterial 
                color={i < rating ? "#FFD700" : "#444444"} 
                metalness={0.9}
                roughness={0.2}
                emissive={i < rating ? "#FFD700" : "#222222"}
                emissiveIntensity={i < rating ? 0.5 : 0.1}
              />
            </mesh>
          ))}
        </group>
      </Float>
    </Canvas>
  );
};

export default function FreelancerReviewsPage() {
  const { token, userId } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [show3D, setShow3D] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        const res = await api.get(`/freelancer/${userId}/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReviews(res.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [token, userId]);

  // compute average and stats
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
  
  // Calculate rating distribution
  const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
  reviews.forEach(r => {
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
  });
  
  // Get percentage for each rating
  const ratingPercentages = {};
  Object.keys(ratingCounts).forEach(rating => {
    ratingPercentages[rating] = (ratingCounts[rating] / (reviews.length || 1)) * 100;
  });

  // filter reviews
  const filtered = filter === 'all'
    ? reviews
    : reviews.filter(r => String(r.rating) === filter);

  // Determine star color based on rating
  const getStarColor = (rating) => {
    if (rating >= 4.5) return 'text-yellow-400';
    if (rating >= 3.5) return 'text-yellow-500';
    if (rating >= 2.5) return 'text-yellow-600';
    if (rating >= 1.5) return 'text-yellow-700';
    return 'text-yellow-800';
  };
  
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg 
        key={i} 
        className={`w-5 h-5 ${i < rating ? getStarColor(rating) : 'text-gray-700'}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100">
      <FreelancerNavbar />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-gray-700 pb-6 mb-8"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              My Reviews
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShow3D(!show3D)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
            >
              {show3D ? '2D View' : '3D View'}
            </motion.button>
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-4xl font-bold mr-2">
                  {avgRating.toFixed(1)}
                </span>
                <div className="flex mt-1">
                  {renderStars(Math.round(avgRating))}
                </div>
              </div>
              <span className="text-gray-400 text-sm">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Rating Distribution */}
            <div className="ml-8 flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center">
                  <span className="text-sm text-gray-400 w-6">{rating}</span>
                  <div className="ml-2 flex items-center">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 ml-2">
                    <motion.div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${ratingPercentages[rating]}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  <span className="ml-2 text-sm text-gray-400 w-10">{Math.round(ratingPercentages[rating])}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.header>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-gradient-to-r from-red-900 to-red-800 text-red-100 rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-t-transparent border-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* 3D View */}
            {show3D && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-64 w-full rounded-xl overflow-hidden shadow-2xl mb-8 bg-gray-800"
              >
                <Suspense fallback={<div className="h-full flex items-center justify-center">Loading 3D View...</div>}>
                  <StarRating3D rating={Math.round(avgRating)} />
                </Suspense>
              </motion.div>
            )}

            {/* Filters */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {['all', '5', '4', '3', '2', '1'].map(opt => (
                <motion.button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    filter === opt
                      ? opt === 'all' 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg' 
                        : `bg-gradient-to-r from-yellow-${parseInt(opt) * 100} to-yellow-${parseInt(opt) * 100 + 200} text-white shadow-lg`
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {opt === 'all' ? 'All' : (
                    <div className="flex items-center">
                      <span>{opt}</span>
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Reviews List */}
            {filtered.length === 0 ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-center py-10"
              >
                No reviews to show.
              </motion.p>
            ) : (
              <motion.ul 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <AnimatePresence>
                  {filtered.map(r => (
                    <motion.li 
                      key={r._id} 
                      variants={itemVariants}
                      layout
                      className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <div className="flex items-center mb-1">
                            <div className="flex">
                              {renderStars(r.rating)}
                            </div>
                            <span className="font-bold ml-2 text-white">{r.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-300 font-medium">
                            from <span className="text-indigo-400">{r.clientId.name}</span>
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                          {format(parseISO(r.timestamp), 'PPP')}
                        </div>
                      </div>
                      
                      <motion.div 
                        className={`mb-4 ${expandedReview === r._id ? '' : 'line-clamp-3'}`}
                        animate={{ height: expandedReview === r._id ? 'auto' : 'auto' }}
                      >
                        <p className="text-gray-200 leading-relaxed">{r.comment}</p>
                      </motion.div>
                      
                      {r.comment.length > 150 && (
                        <motion.button
                          onClick={() => setExpandedReview(expandedReview === r._id ? null : r._id)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="text-sm text-indigo-400 hover:text-indigo-300 mb-4"
                        >
                          {expandedReview === r._id ? 'Show less' : 'Read more'}
                        </motion.button>
                      )}
                      
                      {r.response && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-gray-900 bg-opacity-50 rounded-lg border-l-4 border-indigo-500 mt-4"
                        >
                          <p className="font-medium text-gray-300 mb-1">Your response:</p>
                          <p className="text-gray-300">{r.response}</p>
                          <div className="text-xs text-gray-500 mt-2">
                            {format(parseISO(r.responseAt), 'PPP p')}
                          </div>
                        </motion.div>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}