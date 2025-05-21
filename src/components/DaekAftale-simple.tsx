import React from 'react';

interface DaekAftaleProps {
  onChange?: (values: any) => void;
}

const DaekAftale: React.FC<DaekAftaleProps> = ({ onChange }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Dækaftale</h3>
      <p>Midlertidig version - bliver opdateret snart</p>
    </div>
  );
};

export default DaekAftale;
