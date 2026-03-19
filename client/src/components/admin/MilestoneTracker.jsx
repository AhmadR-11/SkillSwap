import React from 'react';

export default function MilestoneTracker({ milestones }) {
  return (
    <ul className="space-y-2">
      {milestones.map((m, i) => (
        <li key={i} className="flex items-center">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              m.done ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {m.title}
        </li>
      ))}
    </ul>
  );
}
