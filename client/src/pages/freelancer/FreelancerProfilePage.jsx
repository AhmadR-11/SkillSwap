import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import FreelancerNavbar from '../../components/freelancer/FreelancerNavbar';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function FreelancerProfilePage() {
  const { token, userId } = useContext(AuthContext);

  // Profile states
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    skills: '',
    portfolio: '',
    docs: []
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('profile'); // 'profile' or 'reviews'

  useEffect(() => {
    // Fetch profile
    async function fetchProfile() {
      try {
        const res = await api.get('/freelancer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setForm({
          name: res.data.name || '',
          skills: (res.data.skills || []).join(', '),
          portfolio: (res.data.portfolio || []).join(', '),
          docs: res.data.docs || []
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load profile.');
      }
    }
    fetchProfile();

    // Fetch reviews
    api.get(`/freelancer/${userId}/reviews`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setReviews(res.data))
    .catch(console.error);
  }, [token, userId]);

  const completeness = () => {
    let total = 4, filled = 0;
    if (form.name.trim()) filled++;
    if (form.skills.trim()) filled++;
    if (form.portfolio.trim()) filled++;
    if (form.docs.length > 0 || files.length > 0) filled++;
    return Math.round((filled / total) * 100);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSaved(false);

    const data = new FormData();
    data.append('name', form.name);
    data.append('skills', form.skills);
    data.append('portfolio', form.portfolio);
    files.forEach(file => data.append('docs', file));

    try {
      const res = await api.put('/freelancer/profile', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile(res.data);
      setForm({
        name: res.data.name,
        skills: res.data.skills.join(', '),
        portfolio: res.data.portfolio.join(', '),
        docs: res.data.docs
      });
      setFiles([]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-purple-500 text-xl font-medium"
        >
          Loading your universe...
        </motion.div>
      </div>
    );
  }

  // Compute average rating
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

  // Filter reviews array
  const filtered = filter === 'all'
    ? reviews
    : reviews.filter(r => String(r.rating) === filter);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <FreelancerNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-6 pb-16 perspective-1000">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <motion.div 
              className="bg-gray-800 bg-opacity-70 backdrop-blur-lg p-1 rounded-xl flex shadow-2xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <button 
                onClick={() => setActiveSection('profile')}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeSection === 'profile' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Profile
              </button>
              <button 
                onClick={() => setActiveSection('reviews')}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeSection === 'reviews' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </button>
            </motion.div>
          </div>

          <div className="relative px-4">
            <AnimatePresence mode="wait">
              {activeSection === 'profile' ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10 p-8 backdrop-blur-xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.3)] border border-purple-500/20"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl transform -rotate-1 -z-10" />
                  
                  <div className="border-b border-gray-700 pb-4 mb-6">
                    <motion.h1 
                      className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      My Universe
                    </motion.h1>
                    <p className="text-gray-400">Shape your digital identity to attract stellar clients</p>
                    <div className="flex items-center mt-3 space-x-1">
                      <span className="text-gray-400">Rating:</span>
                      <span className="font-bold text-lg text-yellow-400">{avgRating.toFixed(1)}</span>
                      <span className="text-yellow-400">★</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-red-900/50 border-l-4 border-red-500 text-red-300 rounded-r"
                      >
                        {error}
                      </motion.div>
                    )}
                    {saved && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-green-900/50 border-l-4 border-green-500 text-green-300 rounded-r"
                      >
                        Profile saved successfully!
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Completeness */}
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-400">Profile completeness</span>
                      <span className="text-sm font-medium text-purple-400">{completeness()}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${completeness()}%` }}
                        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* Profile Form */}
                  <motion.form 
                    onSubmit={handleSubmit} 
                    className="space-y-6 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block mb-2 font-medium text-gray-300">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-gray-800/80 border border-gray-700 p-4 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300"
                        placeholder="John Doe"
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block mb-2 font-medium text-gray-300">Skills</label>
                      <input
                        type="text"
                        name="skills"
                        value={form.skills}
                        onChange={handleChange}
                        className="w-full bg-gray-800/80 border border-gray-700 p-4 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300"
                        placeholder="React, Node.js, UI/UX"
                      />
                      <p className="text-sm text-gray-500 mt-1">Separate with commas</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block mb-2 font-medium text-gray-300">Portfolio URLs</label>
                      <input
                        type="text"
                        name="portfolio"
                        value={form.portfolio}
                        onChange={handleChange}
                        className="w-full bg-gray-800/80 border border-gray-700 p-4 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300"
                        placeholder="https://github.com/yourname, https://yourportfolio.com"
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block mb-2 font-medium text-gray-300">Upload Documents</label>
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          onChange={handleFiles}
                          className="w-full bg-gray-800/80 border border-gray-700 p-4 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        />
                        <AnimatePresence>
                          {files.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -bottom-6 left-0 text-sm text-purple-400"
                            >
                              {files.length} file(s) selected
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-purple-500/20 transition-all duration-300"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Save Profile'}
                    </motion.button>
                  </motion.form>

                  {/* Show Uploaded Documents */}
                  <AnimatePresence>
                    {form.docs.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-8 border-t border-gray-700/50 pt-6"
                      >
                        <h2 className="text-lg font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Uploaded Documents</h2>
                        <ul className="space-y-2">
                          {form.docs.map((docUrl, index) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ x: 5 }}
                              className="flex items-center"
                            >
                              <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                                {docUrl.split('/').pop()}
                              </a>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.5 }}
                  className="p-8 backdrop-blur-xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.3)] border border-purple-500/20"
                >
                  <div className="border-b border-gray-700 pb-4 mb-6">
                    <motion.h2 
                      className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Client Reviews
                    </motion.h2>
                    <p className="text-gray-400">See what clients are saying about your work</p>
                  </div>
                  
                  {/* Rating Filters */}
                  <motion.div 
                    className="flex space-x-2 mb-6 overflow-x-auto pb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {['all','5','4','3','2','1'].map((opt, index) => (
                      <motion.button
                        key={opt}
                        onClick={() => setFilter(opt)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className={`px-4 py-2 rounded-full transition-all duration-300 ${
                          filter === opt
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-700/30'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {opt === 'all' ? 'All Reviews' : `${opt}★`}
                      </motion.button>
                    ))}
                  </motion.div>

                  {/* Reviews List */}
                  {filtered.length === 0 ? (
                    <motion.p 
                      className="text-gray-400 text-center py-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      No reviews to show for this filter.
                    </motion.p>
                  ) : (
                    <motion.ul 
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {filtered.map((review, idx) => (
                        <motion.li 
                          key={review._id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                          className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                {review.clientId.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium text-white">{review.clientId.name}</span>
                                  <div className="ml-3 flex">
                                    {[...Array(5)].map((_, i) => (
                                      <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-400">
                                  {format(parseISO(review.timestamp), 'PPP')}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="mb-4 text-gray-300">{review.comment}</p>

                          {/* Freelancer response */}
                          {review.response ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700"
                            >
                              <p className="font-medium text-purple-400 mb-1">Your response:</p>
                              <p className="text-gray-300">{review.response}</p>
                              <div className="text-xs text-gray-500 mt-2">
                                {format(parseISO(review.responseAt), 'PPP p')}
                              </div>
                            </motion.div>
                          ) : (
                            <ResponseForm
                              reviewId={review._id}
                              onRespond={updated =>
                                setReviews(rs =>
                                  rs.map(r => r._id === updated._id ? updated : r)
                                )
                              }
                            />
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Sub-component for responding to a review
function ResponseForm({ reviewId, onRespond }) {
  const { token } = useContext(AuthContext);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const res = await api.patch(
        `/reviews/${reviewId}/response`,
        { response: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRespond(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to respond');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="mt-3 space-y-3"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-800"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write your response..."
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="w-full bg-gray-800/70 border border-gray-700 p-3 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 resize-none min-h-24"
      />
      
      <motion.button
        onClick={handleSubmit}
        disabled={isSubmitting || !text.trim()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${
          isSubmitting || !text.trim()
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-700/20 hover:shadow-green-700/40'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
        ) : 'Send Response'}
      </motion.button>
    </motion.div>
  );
}