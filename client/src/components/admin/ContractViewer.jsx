import React from 'react';

export default function ContractViewer({ contract }) {
  return (
    <div className="border p-4 rounded mb-4">
      <h3 className="font-semibold mb-2">Contract Terms</h3>
      <p>{contract.terms}</p>
      {/* future: show signatures, versions, hash */}
    </div>
  );
}
