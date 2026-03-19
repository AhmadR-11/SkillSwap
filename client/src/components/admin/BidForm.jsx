import React from 'react';

export default function BidForm({ projectId, onSubmit }) {
  // you can wire up formik or react-hook-form later
  return (
    <form className="space-y-4">
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Your bid message"
      />
      <button 
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Submit Bid
      </button>
    </form>
  );
}
