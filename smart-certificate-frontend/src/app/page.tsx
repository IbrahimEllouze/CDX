'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic'

const IssueCertificate = dynamic(() => import('../components/IssueCertificate'), {
  ssr: false,
})

const VerifyCertificate = dynamic(() => import('../components/VerifyCertificate'), {
  ssr: false,
})

export default function Home() {
  const [activeTab, setActiveTab] = useState('issue');

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Smart Certificate Platform
            </h1>

            <div className="flex mb-6">
              <button
                className={`flex-1 py-2 px-4 text-center ${
                  activeTab === 'issue'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                } rounded-l-lg transition duration-200`}
                onClick={() => setActiveTab('issue')}
              >
                Issue Certificate
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center ${
                  activeTab === 'verify'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                } rounded-r-lg transition duration-200`}
                onClick={() => setActiveTab('verify')}
              >
                Verify Certificate
              </button>
            </div>

            <div className="mt-6">
              {activeTab === 'issue' ? <IssueCertificate /> : <VerifyCertificate />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}