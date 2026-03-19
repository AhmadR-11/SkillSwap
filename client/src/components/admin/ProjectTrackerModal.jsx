import React from 'react';

export default function ProjectTrackerModal({ isOpen, onClose, project }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 md:w-2/3">
        <h2 className="text-2xl mb-4">{project.title}</h2>
        {/* render status, milestones, chat link, etc */}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-300 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
