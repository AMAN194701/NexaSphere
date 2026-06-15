import React, { useState } from "react";
import apiClient from "../../api/apiClient";

const CertificateVerifyPage = () => {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiClient.get(
        `/certificates/verify/${certificateId}`
      );
      setResult(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Verify Certificate
        </h1>
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <label
            htmlFor="certificateId"
            className="text-sm font-medium text-gray-700"
          >
            Certificate ID
          </label>
          <input
            id="certificateId"
            type="text"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="Enter certificate ID"
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !certificateId.trim()}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm"
          >
            {error}
          </div>
        )}

        {result && (
          <div
            role="status"
            className="mt-4 p-3 bg-green-100 text-green-800 rounded text-sm"
          >
            <p className="font-semibold">Certificate Verified ✓</p>
            {result.name && <p>Name: {result.name}</p>}
            {result.course && <p>Course: {result.course}</p>}
            {result.issuedAt && (
              <p>Issued At: {new Date(result.issuedAt).toLocaleDateString()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerifyPage;
