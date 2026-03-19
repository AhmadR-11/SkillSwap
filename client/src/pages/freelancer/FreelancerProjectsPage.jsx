import React, { useState, useEffect, useContext, useCallback, Suspense } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import FreelancerNavbar from '../../components/freelancer/FreelancerNavbar';
import ProjectTimeline from '../../components/freelancer/ProjectTimelinePage';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, /*Text*/ } from '@react-three/drei';

// 3D Components
const ProjectCard3D = ({ position, status, onClick }) => {
  const colors = {
    open: '#10b981',
    'in-progress': '#3b82f6',
    completed: '#4b5563',
    cancelled: '#ef4444'
  };

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh position={position} onClick={onClick}>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshStandardMaterial 
          color={colors[status]} 
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
};

const Scene = ({ projects, openModal }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <Environment preset="city" />
      
      {projects.slice(0, 5).map((project, i) => (
        <ProjectCard3D 
          key={project._id}
          position={[(i % 3) * 2 - 2, Math.floor(i / 3) * -2 + 1, 0]}
          status={project.status}
          onClick={() => openModal(project)}
        />
      ))}
      
      <OrbitControls 
        enableZoom={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
};

export default function FreelancerProjectsPage() {
  const { token } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [view3D, setView3D] = useState(false);

  // Manage modal state
  const [selectedProj, setSelectedProj] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const statusLabels = {
    open: 'Open',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  const statusOptions = ['all', ...Object.keys(statusLabels)];

  // Status color mapping
  const statusColors = {
    open: 'from-green-500 to-green-700',
    'in-progress': 'from-blue-500 to-blue-700',
    completed: 'from-gray-500 to-gray-700',
    cancelled: 'from-red-500 to-red-700'
  };

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/freelancer/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filtering
  const filtered = filter === 'all'
    ? projects
    : projects.filter(p => p.status === filter);

  // Open manage modal
  const openModal = proj => {
    setSelectedProj(proj);
    setModalStatus(proj.status);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedProj(null);
  };

  // Save status change
  const handleSaveStatus = async () => {
    if (!selectedProj || modalStatus === selectedProj.status) {
      return closeModal();
    }
    if (modalStatus === 'cancelled') {
      if (!window.confirm('Are you sure you want to cancel this project?')) {
        return;
      }
    }

    setSaving(true);
    try {
      const res = await api.patch(
        `/freelancer/projects/${selectedProj._id}`,
        { status: modalStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(ps => ps.map(p => p._id === res.data._id ? res.data : p));
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100">
      <FreelancerNavbar />

      {/* Main content */}
      <div className={modalOpen ? 'filter blur-sm transition-all duration-300' : 'transition-all duration-300'}>
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              My Projects
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView3D(!view3D)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
            >
              {view3D ? '2D View' : '3D View'}
            </motion.button>
          </motion.div>

          {/* Status Filter */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {statusOptions.map(s => (
              <motion.button
                key={s}
                onClick={() => setFilter(s)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  filter === s
                    ? s === 'all' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg' 
                      : `bg-gradient-to-r ${statusColors[s]} text-white shadow-lg`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {s === 'all' ? 'All' : statusLabels[s]}
              </motion.button>
            ))}
          </motion.div>

          {/* 3D View */}
          {view3D && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-96 w-full rounded-xl overflow-hidden shadow-2xl mb-8 bg-gray-800"
            >
              <Suspense fallback={<div className="h-full flex items-center justify-center">Loading 3D View...</div>}>
                <Scene projects={filtered} openModal={openModal} />
              </Suspense>
            </motion.div>
          )}

          {/* Projects Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence>
              {filtered.map(p => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${statusColors[p.status]}`}></div>
                  <div className="p-6 flex flex-col h-full">
                    <h2 className="text-2xl font-bold mb-2 text-white">{p.title}</h2>
                    <p className="text-gray-300 flex-1">{p.description}</p>
                    <p className="italic text-gray-400 mt-4">
                      Requirements: {p.requirements}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-gray-400">
                        Deadline: {format(parseISO(p.deadline), 'PPP')}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 text-sm rounded-full ${
                          p.status === 'open'
                            ? 'bg-gradient-to-r from-green-500 to-green-700'
                            : p.status === 'in-progress'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-700'
                              : p.status === 'completed'
                                ? 'bg-gradient-to-r from-gray-500 to-gray-700'
                                : 'bg-gradient-to-r from-red-500 to-red-700'
                        }`}
                      >
                        {statusLabels[p.status]}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openModal(p)}
                      className="mt-6 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                    >
                      Manage
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Manage Modal */}
      <AnimatePresence>
        {modalOpen && selectedProj && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] border border-gray-700"
            >
              <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Manage "{selectedProj.title}"
              </h3>

              {/* Status Section */}
              <section className="mb-6">
                <label className="block mb-2 font-medium text-gray-300">
                  Current Status: <span className="text-white font-bold">{statusLabels[modalStatus]}</span>
                </label>
                <select
                  value={modalStatus}
                  onChange={e => setModalStatus(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg mb-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={['completed','cancelled'].includes(selectedProj.status)}
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveStatus}
                  disabled={saving || ['completed','cancelled'].includes(selectedProj.status)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : 'Save Status'}
                </motion.button>
              </section>

              <hr className="border-gray-700 my-6" />

              {/* Embedded Timeline */}
              <section>
                <h4 className="text-xl font-bold mb-4 text-gray-200">Project Timeline</h4>
                <div className="rounded-lg overflow-hidden bg-gray-800 p-4">
                  <ProjectTimeline projectId={selectedProj._id} token={token} />
                </div>
              </section>

              {/* Close */}
              <div className="text-right mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={closeModal}
                  className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}