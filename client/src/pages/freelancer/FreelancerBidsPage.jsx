import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import FreelancerNavbar from '../../components/freelancer/FreelancerNavbar';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function FreelancerBidsPage() {
  const { token } = useContext(AuthContext);
  const socketRef = useRef();

  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [analytics, setAnalytics] = useState({
    count: 0,
    average: 0,
    status: { pending: 0, accepted: 0, rejected: 0 }
  });
  const [form, setForm] = useState({
    projectId: '',
    amount: '',
    message: ''
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Helper: recalc analytics from bids array
  const recalcAnalytics = useCallback(bidsArr => {
    const count = bidsArr.length;
    const sum = bidsArr.reduce((acc, b) => acc + b.amount, 0);
    const status = bidsArr.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    setAnalytics({
      count,
      average: count ? sum / count : 0,
      status: {
        pending: status.pending || 0,
        accepted: status.accepted || 0,
        rejected: status.rejected || 0
      }
    });
  }, []);

  // 1) Initialize socket.io-client
  useEffect(() => {
    const url = (process.env.REACT_APP_API_URL || 'http://localhost:5000')
      .replace(/\/api\/?$/, '');
    const socket = io(url);
    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  // 2) Listen for real-time bid updates
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onBidUpdated = updatedBid => {
      setBids(prev => {
        const next = prev.map(b => b._id === updatedBid._id ? updatedBid : b);
        recalcAnalytics(next);
        return next;
      });
    };

    socket.on('bidUpdated', onBidUpdated);
    return () => socket.off('bidUpdated', onBidUpdated);
  }, [recalcAnalytics]);

  // 3) Load projects & bids on mount
  useEffect(() => {
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    // First fetch all available projects
    api.get('/projects', headers)
      .then(res => {
        setProjects(res.data);
        // Then fetch freelancer's bids
        return api.get('/freelancer/bids', headers);
      })
      .then(res => {
        // Store the bids data
        const bidsData = res.data;
        setBids(bidsData);
        recalcAnalytics(bidsData);
        // Join socket rooms for each project with a bid
        bidsData.forEach(bid => {
          if (bid.projectId) {
            if (typeof bid.projectId === 'string') {
              socketRef.current.emit('joinProject', bid.projectId);
            } else if (bid.projectId._id) {
              socketRef.current.emit('joinProject', bid.projectId._id);
            }
          }
        });
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      });
  }, [token, recalcAnalytics]);

  // Form handlers
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const headers = { headers: { Authorization: `Bearer ${token}` } };

      if (editId) {
        await api.put(`/freelancer/bids/${editId}`, form, headers);
      } else {
        await api.post('/freelancer/bids', form, headers);
      }

      // Refresh bids after submission
      const { data: newBids } = await api.get('/freelancer/bids', headers);
      setBids(newBids);
      recalcAnalytics(newBids);

      // Reset form
      setForm({ projectId: '', amount: '', message: '' });
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = bid => {
    setEditId(bid._id);
    setForm({
      projectId: bid.projectId
        ? (typeof bid.projectId === 'object' ? bid.projectId._id : bid.projectId)
        : '',
      amount: bid.amount,
      message: bid.message
    });
    setError('');
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ projectId: '', amount: '', message: '' });
    setError('');
    setShowForm(false);
  };

  const handleDelete = async (bidId) => {
    if (!window.confirm('Are you sure you want to delete this bid?')) return;

    try {
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      await api.delete(`/freelancer/bids/${bidId}`, headers);

      // Remove bid from state
      const updatedBids = bids.filter(b => b._id !== bidId);
      setBids(updatedBids);
      recalcAnalytics(updatedBids);
    } catch (err) {
      setError('Failed to delete bid');
    }
  };

  const getStatusColor = status => {
    switch(status) {
      case 'pending': return 'from-yellow-500 to-amber-600';
      case 'accepted': return 'from-green-500 to-emerald-600';
      case 'rejected': return 'from-red-500 to-rose-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = status => {
    switch(status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <FreelancerNavbar />
      
      <div className="max-w-4xl mx-auto p-6 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            My Bids
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/30 transition-all"
          >
            {showForm ? 'Hide Form' : 'New Bid'}
          </motion.button>
        </motion.div>

        {/* Analytics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-700 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-300">Total Stats</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold mt-2">{analytics.count}</p>
            <p className="text-sm text-gray-400">Total Bids</p>
            <p className="text-xl font-semibold mt-4">${analytics.average.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Average Bid</p>
          </div>
          
          {Object.entries(analytics.status).map(([status, count]) => (
            <motion.div
              key={status}
              whileHover={{ 
                translateY: -8, 
                boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)` 
              }}
              className={`p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl transform transition-all duration-300 border border-gray-700 backdrop-blur-sm relative overflow-hidden`}
            >
              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-lg font-medium capitalize text-gray-300">{status}</h3>
                <span className="text-2xl">{getStatusIcon(status)}</span>
              </div>
              <p className="text-3xl font-bold mt-2 relative z-10">{count}</p>
              <p className="text-sm text-gray-400 relative z-10">Bids</p>
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${getStatusColor(status)} w-full opacity-70`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bid Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="space-y-4 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700 mb-8 backdrop-blur-sm">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700 text-red-200 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                <h2 className="text-xl font-bold text-gray-200">
                  {editId ? 'Update Your Bid' : 'Create New Bid'}
                </h2>

                <div>
                  <label className="block mb-2 text-gray-300">Project</label>
                  <select
                    name="projectId"
                    value={form.projectId}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={editId}
                  >
                    <option value="">— Select a project —</option>
                    {projects.map(proj => (
                      <option key={proj._id} value={proj._id}>
                        {proj.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-gray-300">Amount ($)</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full bg-gray-800 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-300">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 font-medium transition-all"
                  >
                    {loading ? 'Processing...' : (editId ? 'Update Bid' : 'Submit Bid')}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={cancelEdit}
                    className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-lg shadow-gray-700/20 font-medium transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bids List */}
        <div className="space-y-6">
          {bids.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-12 text-center text-gray-500 bg-gray-800/50 rounded-xl border border-gray-700"
            >
              <p className="text-xl">No bids submitted yet.</p>
              <p className="mt-2">Create your first bid to get started!</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 gap-6"
            >
              {bids.map((bid, index) => (
                <motion.div
                  key={bid._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ 
                    translateY: -5, 
                    boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)` 
                  }}
                  className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl transform transition-all duration-300 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${getStatusColor(bid.status)}`}></div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {bid.projectId && typeof bid.projectId === 'object' && bid.projectId.title
                          ? bid.projectId.title
                          : 'Unknown Project'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">Amount:</span>
                          <span className="text-lg font-bold text-green-400">${bid.amount}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(bid.status)} text-white`}>
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {bid.message && (
                        <div className="mt-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                          <p className="text-gray-300">{bid.message}</p>
                        </div>
                      )}
                    </div>
                    
                    {bid.status === 'pending' && (
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startEdit(bid)}
                          className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(bid._id)}
                          className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}