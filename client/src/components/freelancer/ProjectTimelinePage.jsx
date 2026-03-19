import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const ProjectTimelinePage = ({ projectId }) => {
  const [progress, setProgress] = useState(0);
  const [timeTracked, setTimeTracked] = useState(0);
  const [milestones, setMilestones] = useState([]);

  const fetchTimeline = useCallback(async () => {
    try {
      const res = await axios.get(`/api/freelancer/project-timeline/${projectId}`);
      setProgress(res.data.progress || 0);
      setTimeTracked(res.data.timeTracked || 0);
      setMilestones(res.data.milestones || []);
    } catch (err) {
      console.error("Failed to fetch timeline", err);
    }
  }, [projectId]);

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/freelancer/project-timeline/${projectId}`, {
        progress,
        timeTracked,
        milestones
      });
      fetchTimeline();
    } catch (err) {
      console.error("Failed to update timeline", err);
    }
  };

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return (
    <div className="container mt-4">
      <h2>Project Timeline</h2>

      <div className="mb-3">
        <label>Progress: {progress}%</label>
        <input
          type="range"
          className="form-range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
        />
      </div>

      <div className="mb-3">
        <label>Time Tracked (hours)</label>
        <input
          type="number"
          className="form-control"
          value={timeTracked}
          onChange={(e) => setTimeTracked(Number(e.target.value))}
        />
      </div>

      <h4>Milestones</h4>
      {milestones.map((milestone, idx) => (
        <div key={idx} className="card mb-2 p-2">
          <input
            type="text"
            placeholder="Title"
            className="form-control mb-1"
            value={milestone.title}
            onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
          />
          <select
            className="form-select mb-1"
            value={milestone.status}
            onChange={(e) => handleMilestoneChange(idx, 'status', e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="date"
            className="form-control"
            value={milestone.dueDate?.substring(0, 10)}
            onChange={(e) => handleMilestoneChange(idx, 'dueDate', e.target.value)}
          />
        </div>
      ))}

      <button className="btn btn-success mt-3" onClick={handleUpdate}>
        Save Timeline
      </button>
    </div>
  );
};

export default ProjectTimelinePage;