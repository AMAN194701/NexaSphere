import React, { useState, useEffect } from 'react';
import { getPinnedPrompts, togglePinPrompt } from '../../lib/promptStore';
import './PinnedChats.css';

const PinnedChats = ({
  onSelectPrompt,
  workspace = 'default',
  historyVersion = 0,
  onHistoryChange,
}) => {
  const [pinnedPrompts, setPinnedPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPinnedPrompts = async () => {
    setLoading(true);
    setError(null);
  const [loadError, setLoadError] = useState('');

  const loadPinnedPrompts = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const pinned = await getPinnedPrompts(workspace, { throwOnError: true });
      setPinnedPrompts(pinned);
    } catch (err) {
    } catch (error) {
      setPinnedPrompts([]);
      setLoadError('Pinned conversations could not be loaded.');
      if (import.meta.env.DEV) {
        console.error('[PinnedChats] Error loading pinned prompts:', err.message);
      }
      setError('Failed to load pinned chats. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPinnedPrompts();
  }, [workspace, historyVersion]);
  }, [workspace]);

  const handleUnpin = async (e, id) => {
    e.stopPropagation();
    await togglePinPrompt(id);
    if (onHistoryChange) {
      onHistoryChange();
    } else {
      loadPinnedPrompts();
    }
  };

  const handleSelectPrompt = (prompt) => {
    onSelectPrompt(prompt);
  };

  if (error) {
    return (
      <div className="pinned-chats-container">
        <div className="pinned-header">
          <h4>📌 Pinned Conversations</h4>
        </div>
        <div className="pinned-error" style={{ color: '#ef4444', padding: '12px 16px', fontSize: '0.9rem' }}>
          {error}
  if (loading) {
    return null;
  }

  if (loadError) {
    return (
      <div className="pinned-chats-container" role="status" aria-live="polite">
        <div className="pinned-header">
          <h4>📌 Pinned Conversations</h4>
        </div>
        <div style={{ padding: '12px 16px', color: 'var(--text-secondary, #666)' }}>
          {loadError}
        </div>
      </div>
    );
  }

  if (pinnedPrompts.length === 0) {
    return null;
  }

  return (
    <div className="pinned-chats-container">
      <div className="pinned-header">
        <h4>📌 Pinned Conversations</h4>
        <span className="pin-count">{pinnedPrompts.length}</span>
      </div>

      <div className="pinned-list">
        {pinnedPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className="pinned-item"
            role="button"
            tabIndex={0}
            onClick={() => handleSelectPrompt(prompt)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectPrompt(prompt);
              }
            }}
          >
            <div className="pinned-content">
              <p className="pinned-text">{prompt.userPrompt.substring(0, 45)}...</p>
              <span className="pinned-icon">📌</span>
            </div>
            <button className="unpin-btn" title="Unpin" aria-label="Unpin conversation" onClick={(e) => handleUnpin(e, prompt.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedChats;
