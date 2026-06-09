import React from 'react';

const STAGING_URL = 'https://fassfrontstage.pods.icicleai.tapis.io/';
const PROD_URL = 'https://feast.pods.icicleai.tapis.io/';

const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-10 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">FASS</h1>
        <p className="text-gray-600 mb-8">
          Food Access Simulation System
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={PROD_URL}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Franklin County
          </a>
          <a
            href={STAGING_URL}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Brown County
          </a>
        </div>
      </div>
    </div>
  );
};

export default Landing;
