import React, { useState } from "react";
import apiClient from "../../api/apiClient";

const CertificateVerifyPage = () => {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

import { useEffect, useState } from 'react';
import { getApiBase } from '../../utils/runtimeConfig';
import { isSafari } from '../../utils/deviceDetection';
import apiClient from '../../utils/apiClient.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

    const controller = new AbortController();

    async function fetchVerification() {
      try {
        const base = getApiBase();
        // Use apiClient instead of raw fetch — provides Sentry error
        // tracking, offline IndexedDB cache fallback, and standardised
        // error handling via ApiError consistent with the rest of the codebase.
        const json = await apiClient(
          `${base}/api/public/certificates/verify/${encodeURIComponent(certificateId)}`,
          { signal: controller.signal }
        );
        setData(json);
        setMessage(json.message);
        setStatus(json.valid ? 'valid' : 'invalid');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setMessage(
          err.message && err.message !== 'Network error' && err.message !== 'Failed to fetch'
            ? err.message
            : 'Unable to reach the verification server. Please try again later.'
        );
        setStatus('error');
      }
    }

    fetchVerification();
    return () => controller.abort();
  }, [certificateId]);

  const cert = data?.certificate;
  const downloadUrl = cert
    ? `${getApiBase()}/api/public/certificates/${encodeURIComponent(cert.certificate_id)}/download`
    : null;
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!downloadUrl || !cert) return;
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const filename = `cert_${cert.certificate_id}.pdf`;
      const blobUrl = URL.createObjectURL(blob);

      if (isSafari()) {
        // Safari (iOS & macOS) ignores the `download` attribute on
        // cross-origin links, so open the blob in a new tab instead.
        const newTab = window.open(blobUrl, '_blank');
        if (!newTab) window.location.href = blobUrl;
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } else {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Certificate download failed:', err);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!downloadUrl || !cert) return;
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const filename = `cert_${cert.certificate_id}.pdf`;
      const blobUrl = URL.createObjectURL(blob);

      if (isSafari()) {
        // Safari (iOS & macOS) ignores the `download` attribute on
        // cross-origin links, so open the blob in a new tab instead.
        const newTab = window.open(blobUrl, '_blank');
        if (!newTab) window.location.href = blobUrl;
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } else {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Certificate download failed:', err);
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
            {message}
          </div>
        )}

        {/* Download button */}
        {status === 'valid' && cert && downloadUrl && (
          <div style={{ padding: '0 28px 28px', textAlign: 'center' }}>
            <a
              href={downloadUrl}
              onClick={handleDownload}
              aria-label={`Download certificate for ${cert.student_name}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #CC1111, #880000)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 28px',
                fontSize: '0.9rem',
                fontWeight: 700,
                textDecoration: 'none',
                cursor: 'pointer',
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(204,17,17,0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(204,17,17,0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(204,17,17,0.4)';
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Certificate
            </a>
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
