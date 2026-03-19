import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FreelancerNavbar from '../../components/freelancer/FreelancerNavbar';
import ProjectTimeline from '../../components/freelancer/ProjectTimelinePage';

export default function FreelancerTimelinePage() {
  const { token } = useContext(AuthContext);
  const { projectId } = useParams();

  return (
    <>
      <FreelancerNavbar />
      <div className="max-w-3xl mx-auto p-6">
        <ProjectTimeline projectId={projectId} token={token} />
      </div>
    </>
  );
}
