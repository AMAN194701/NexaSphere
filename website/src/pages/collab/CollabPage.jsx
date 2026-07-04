import React from 'react';

export default function CollabPage({ onBack }) {
  return (
    <div
      style={{
        padding: '3rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        color: 'var(--text)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-muted, #999)',
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
          }}
        >
          ← Back
        </button>
      </div>

      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '0.8rem',
            background: 'linear-gradient(135deg, #fff, #999)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Collaboration Space
        </h1>
        <p style={{ color: 'var(--text-muted, #888)', fontSize: '1.1rem' }}>
          Form teams, connect on projects, and build amazing solutions together.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '2rem',
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '2rem',
            transition: 'transform 0.2s',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>👥 Team Formation</h3>
          <p style={{ color: '#888', lineHeight: '1.6' }}>
            Find partners matching your skillset or search for projects looking for contributors.
          </p>
        </div>

        {/* Card 2 */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '2rem',
            transition: 'transform 0.2s',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>⚡ Real-time Workspace</h3>
          <p style={{ color: '#888', lineHeight: '1.6' }}>
            Launch shared editor instances with CRDT-backed real-time document syncing.
          </p>
        </div>

        {/* Card 3 */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '2rem',
            transition: 'transform 0.2s',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>🎨 Live Whiteboard</h3>
          <p style={{ color: '#888', lineHeight: '1.6' }}>
            Brainstorm visually with teams using our integrated, collaborative sketching canvases.
          </p>
        </div>
      </div>
    </div>
  );
}
