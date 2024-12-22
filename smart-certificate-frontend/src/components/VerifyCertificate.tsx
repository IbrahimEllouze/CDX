'use client';
import { useState, FormEvent } from 'react';

interface VerificationResult {
    success: boolean;
    isValid: boolean;
    hash?: string;
    error?: string;
}

export default function VerifyCertificate() {
    const [loading, setLoading] = useState(false);
    const [certificateId, setCertificateId] = useState('');
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState('');

    const handleVerify = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setVerificationResult(null);
        
        try {
            // Make sure we're using the correct API URL
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/api/verify/${certificateId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to verify certificate');
            }

            const data: VerificationResult = await response.json();
            setVerificationResult(data);
            
        } catch (error) {
            console.error("Verification error:", error);
            setError(error instanceof Error ? error.message : 'An error occurred');
            setVerificationResult({
                success: false,
                isValid: false,
                error: error instanceof Error ? error.message : 'Verification failed'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Verify Certificate</h2>
            
            <form onSubmit={handleVerify} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Certificate ID
                    </label>
                    <input
                        type="text"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                        required
                        placeholder="Enter certificate ID (e.g., CERT2024001)"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : 'Verify Certificate'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {verificationResult && (
                <div className={`p-4 ${verificationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-md`}>
                    <p className={`text-lg font-medium ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                        {verificationResult.isValid
                            ? '✅ Certificate is valid'
                            : '❌ Certificate is invalid'}
                    </p>
                    {verificationResult.hash && (
                        <p className="mt-2 text-sm text-gray-600 break-all">
                            <strong>Hash:</strong> {verificationResult.hash}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}