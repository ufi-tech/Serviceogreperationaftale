import React from 'react';

const Aftaleoverblik: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Aftaleoverblik</h2>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Biloplysninger</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Bilmærke</p>
              <p className="mt-1">-</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="mt-1">-</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Første registreringsdato</p>
              <p className="mt-1">-</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kørte km</p>
              <p className="mt-1">-</p>
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aftaledetaljer</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Aftaletype:</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between">
              <span>Km/år:</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between">
              <span>Løbetid:</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Prisoverslag</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Månedlig ydelse:</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between">
              <span>I alt for perioden:</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Tilbage
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Fortsæt til kundedata
          </button>
        </div>
      </div>
    </div>
  );
};

export default Aftaleoverblik;
