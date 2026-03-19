import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef
} from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import ClientNavbar from '../../components/client/ClientNavbar';
import { format, parseISO } from 'date-fns';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientProjectsPage() {
  const { token } = useContext(AuthContext);
  const socketRef = useRef();

  const [projects, setProjects] = useState([]);
  const [openProject, setOpenProject] = useState(null);
  const [bidsByProject, setBidsByProject] = useState({});
  const [reviewModal, setReviewModal] = useState({ open: false, project: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    deadline: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  const statusColors = {
    open: 'bg-gradient-to-r from-green-500 to-green-600',
    'in-progress': 'bg-gradient-to-r from-blue-500 to-blue-600',
    completed: 'bg-gradient-to-r from-gray-500 to-gray-600',
    cancelled: 'bg-gradient-to-r from-red-500 to-red-600'
  };

  // Animation variants
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const formVariants = {
    hidden: { 
      y: -50, 
      opacity: 0,
      scale: 0.9,
      rotateX: -15
    },
    visible: { 
      y: 0, 
      opacity: 1,
      // scale: a1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        duration: 0.5
      }
    },
    exit: {
      y: -50,
      opacity: 0,
      scale: 0.9,
      rotateX: -15,
      transition: { duration: 0.3 }
    }
  };

  // Socket.io setup
  useEffect(() => {
    const url = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    const socket = io(url);
    socketRef.current = socket;

    socket.on('bidCreated', bid => {
      setBidsByProject(prev => {
        const projectBids = [...(prev[bid.projectId] || [])];
        return { ...prev, [bid.projectId]: [...projectBids, bid] };
      });
    });

    socket.on('bidUpdated', bid => {
      setBidsByProject(prev => {
        const projectBids = prev[bid.projectId]?.map(b => 
          b._id === bid._id ? bid : b
        ) || [];
        return { ...prev, [bid.projectId]: projectBids };
      });
    });

    // Join project rooms for real-time updates
    projects.forEach(project => {
      socket.emit('joinRoom', `project_${project._id}`);
    });

    return () => {
      projects.forEach(project => {
        socket.emit('leaveRoom', `project_${project._id}`);
      });
      socket.disconnect();
    };
  }, [projects]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/client/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data.map(p => ({ ...p, status: p.status || 'open' })));
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const loadBids = async (projectId) => {
    if (openProject === projectId) {
      setOpenProject(null);
      return;
    }
    try {
      const res = await api.get(`/client/projects/${projectId}/bids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBidsByProject(prev => ({ ...prev, [projectId]: res.data }));
      setOpenProject(projectId);
      
      // Join the project's socket room
      socketRef.current?.emit('joinRoom', `project_${projectId}`);
    } catch (err) {
      console.error('Failed to load bids:', err);
    }
  };

  const handleBidDecision = async (bidId, decision) => {
    setLoading(true);
    try {
      const response = await api.patch(
        `/client/bids/${bidId}/decision`,
        { decision: decision === 'accept' ? 'accepted' : 'rejected' },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // Update local state
      if (openProject) {
        setBidsByProject(prev => {
          const updatedBids = prev[openProject].map(bid =>
            bid._id === bidId ? response.data : bid
          );
          return { ...prev, [openProject]: updatedBids };
        });

        // If a bid was accepted, update project status
        if (decision === 'accept') {
          setProjects(prev =>
            prev.map(p =>
              p._id === openProject
                ? { ...p, status: 'in-progress' }
                : p
            )
          );
        }
      }

      // Emit socket event for real-time updates
      socketRef.current?.emit('bidDecision', {
        bidId,
        projectId: openProject,
        decision: decision === 'accept' ? 'accepted' : 'rejected'
      });

    } catch (err) {
      console.error('Failed to update bid:', err);
      setError(err.response?.data?.message || 'Failed to update bid status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const { title, description, requirements, deadline } = form;
    if (!title || !description || !requirements || !deadline) {
      setError('All fields are required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/client/projects/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post(
          '/client/projects',
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setForm({ title: '', description: '', requirements: '', deadline: '' });
      setEditingId(null);
      setFormVisible(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const startEdit = p => {
    setEditingId(p._id);
    setForm({
      title: p.title,
      description: p.description,
      requirements: p.requirements,
      deadline: p.deadline.slice(0, 10)
    });
    setFormVisible(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/client/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const openReviewModal = (project) => {
    setReviewModal({ open: true, project });
    setReviewForm({ rating: 5, comment: '' });
    setReviewError('');
  };

  const closeReviewModal = () => {
    setReviewModal({ open: false, project: null });
    setReviewError('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await api.post('/reviews', {
        projectId: reviewModal.project._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProjects(prev => 
        prev.map(p => 
          p._id === reviewModal.project._id 
            ? { ...p, reviewed: true }
            : p
        )
      );
      closeReviewModal();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const toggleForm = () => {
    setFormVisible(!formVisible);
    if (!formVisible) {
      setEditingId(null);
      setForm({ title: '', description: '', requirements: '', deadline: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900">
      <ClientNavbar />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-indigo-200">My Projects</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleForm}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl flex items-center space-x-2"
          >
            <span>{formVisible ? 'Hide Form' : editingId ? 'Edit Project' : 'Create Project'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${formVisible ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {formVisible && (
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="perspective-1000"
            >
              <div className="bg-white rounded-xl shadow-2xl p-6 border border-indigo-100 transform-gpu">
                <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                  {editingId ? 'Edit Project' : 'Post New Project'}
                </h2>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 border-l-4 border-red-500"
                  >
                    {error}
                  </motion.div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="group relative">
                    <input
                      name="title"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="Project Title"
                      className="w-full border-b-2 border-indigo-200 p-3 rounded-lg bg-indigo-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                      required
                    />
                    <span className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </div>
                  
                  <div className="group relative">
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Project Description"
                      className="w-full border-b-2 border-indigo-200 p-3 rounded-lg bg-indigo-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 min-h-24"
                      required
                    />
                    <span className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </div>
                  
                  <div className="group relative">
                    <textarea
                      name="requirements"
                      value={form.requirements}
                      onChange={e => setForm({ ...form, requirements: e.target.value })}
                      placeholder="Project Requirements"
                      className="w-full border-b-2 border-indigo-200 p-3 rounded-lg bg-indigo-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 min-h-24"
                      required
                    />
                    <span className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </div>
                  
                  <div className="group relative">
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={form.deadline}
                      onChange={e => setForm({ ...form, deadline: e.target.value })}
                      className="w-full border-b-2 border-indigo-200 p-3 rounded-lg bg-indigo-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                      required
                    />
                    <span className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={toggleForm}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {editingId ? 'Update Project' : 'Post Project'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {projects.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-xl shadow-lg text-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg text-gray-600">You have no projects. Create one to get started!</p>
            </motion.div>
          ) : (
            projects.map(p => (
              <motion.div 
                key={p._id} 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform-gpu hover:shadow-xl transition-all duration-300 perspective-1000"
                style={{
                  transformStyle: "preserve-3d"
                }}
                whileHover={{ translateY: -5 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20"></div>
                  <div className="relative p-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-indigo-800">{p.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                          statusColors[p.status] || 'bg-gray-600'
                        } shadow-sm`}
                      >
                        {(p.status || 'open').replace('-', ' ')}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-gray-700">{p.description}</p>
                      <p className="italic text-indigo-600 font-medium mt-2">
                        <span className="text-indigo-400">Requirements:</span> {p.requirements}
                      </p>
                      <p className="text-sm text-indigo-800 bg-indigo-50 inline-block px-3 py-1 rounded-full mt-2">
                        <span className="font-medium">Deadline:</span> {format(parseISO(p.deadline), 'PPP')}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startEdit(p)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(p._id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => loadBids(p._id)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{openProject === p._id ? 'Hide Bids' : 'View Bids'}</span>
                      </motion.button>
                      
                      {p.status === 'completed' && !p.reviewed && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openReviewModal(p)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span>Review</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bids Section */}
                <AnimatePresence>
                  {openProject === p._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-gradient-to-b from-indigo-50 to-white border-t border-indigo-100">
                        <h4 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Project Bids
                        </h4>
                        
                        {!bidsByProject[p._id] || bidsByProject[p._id].length === 0 ? (
                          <div className="text-center py-6 bg-white rounded-lg shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-600">No bids received yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {bidsByProject[p._id].map((bid, index) => (
                              <motion.div 
                                key={bid._id} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ 
                                  opacity: 1, 
                                  y: 0,
                                  transition: { delay: index * 0.1 }
                                }}
                                className="bg-white rounded-lg shadow-md p-4 border border-indigo-100 transform hover:scale-[1.01] transition-all duration-300"
                              >
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {bid.freelancerId.name.charAt(0)}
                                      </div>
                                      <h5 className="font-medium text-indigo-800">{bid.freelancerId.name}</h5>
                                    </div>
                                    <p className="flex items-center text-green-600 font-medium mb-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1V8" />
                                      </svg>
                                      <span>${bid.amount}</span>
                                    </p>
                                    
                                    <div className="mb-2">
                                      <span className="text-sm text-gray-500">Status:</span>
                                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                        bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                        bid.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {bid.status}
                                      </span>
                                    </div>
                                    
                                    {bid.freelancerId.portfolio && bid.freelancerId.portfolio[0] && (
                                      <a
                                        href={bid.freelancerId.portfolio[0]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300 flex items-center mt-2"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        View Portfolio
                                      </a>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                                      "{bid.message}"
                                    </p>
                                    
                                    {p.status === 'open' && bid.status === 'pending' && (
                                      <div className="mt-4 flex space-x-2">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleBidDecision(bid._id, 'accept')}
                                          disabled={loading}
                                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          Accept
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleBidDecision(bid._id, 'reject')}
                                          disabled={loading}
                                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                          Reject
                                        </motion.button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Review Modal */}
        <AnimatePresence>
          {reviewModal.open && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-filter backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="bg-white p-6 rounded-xl shadow-2xl w-96 max-w-md border border-indigo-100"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-indigo-800">
                    Leave a Review
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeReviewModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                
                <p className="text-indigo-600 mb-4 text-sm">
                  Project: <span className="font-medium">{reviewModal.project.title}</span>
                </p>
                
                {reviewError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500"
                  >
                    {reviewError}
                  </motion.div>
                )}
                
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium text-indigo-800">Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setReviewForm({
                            ...reviewForm,
                            rating: star
                          })}
                          className="focus:outline-none"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-8 w-8 ${
                              star <= reviewForm.rating 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                            } transition-colors duration-200`} 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-indigo-800">Your Comment</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({
                        ...reviewForm,
                        comment: e.target.value
                      })}
                      className="w-full border-2 border-indigo-200 p-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 min-h-24"
                      placeholder="Share your experience working on this project..."
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={closeReviewModal}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Submit Review
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}