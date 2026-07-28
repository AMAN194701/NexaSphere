import React, { useState, useEffect } from 'react';
import { getAllPrompts, deletePrompt, togglePinPrompt } from '../../lib/promptStore';
import { getWorkspaces } from '../../lib/workspaceService';
import './PromptHistorySidebar.css';

const PromptHistorySidebar = ({
  isOpen,
  onSelectPrompt,
  currentWorkspace = 'default',
  historyVersion = 0,
  onHistoryChange,
}) => {
  const [prompts, setPrompts] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(currentWorkspace);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const workspaceList = getWorkspaces();
      setWorkspaces(workspaceList);

      const promptList = await getAllPrompts(selectedWorkspace);
      setPrompts(promptList);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[PromptHistorySidebar] Error loading history:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync selectedWorkspace when currentWorkspace prop changes
  useEffect(() => {
    setSelectedWorkspace(currentWorkspace);
  }, [currentWorkspace]);

  // Load data when selectedWorkspace, isOpen, or historyVersion changes
  useEffect(() => {
    loadData();
  }, [selectedWorkspace, isOpen, historyVersion]);

  const handleDeletePrompt = async (e, id) => {
    e.stopPropagation();
    setDeleteTarget(id);
  };

  const confirmDeletePrompt = async () => {
    if (!deleteTarget) return;
    await deletePrompt(deleteTarget);
    setDeleteTarget(null);
    if (onHistoryChange) {
      onHistoryChange();
    } else {
      loadData();
    }
  };

  const handlePinPrompt = async (e, id) => {
    e.stopPropagation();
    await togglePinPrompt(id);
    if (onHistoryChange) {
      onHistoryChange();
    } else {
      loadData();
    }
  };

  const handleSelectPrompt = (prompt) => {
    onSelectPrompt(prompt);
  };

  if (loading) return null;

  return (
    <div className={`prompt-history-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Prompt History</h3>
        <select value={selectedWorkspace} onChange={(e) => setSelectedWorkspace(e.target.value)}>
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>

      <div className="prompt-list">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="prompt-item"
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
            <div className="prompt-content">
              <p className="prompt-text">{prompt.userPrompt.substring(0, 50)}...</p>
            </div>
            <div className="prompt-actions">
              <button aria-label="Pin prompt" onClick={(e) => handlePinPrompt(e, prompt.id)}>
                📌
              </button>
              <button aria-label="Delete prompt" onClick={(e) => handleDeletePrompt(e, prompt.id)}>
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <div className="delete-confirm-overlay">
          <p>Delete this prompt?</p>
          <button aria-label="Interactive element" onClick={() => setDeleteTarget(null)}>
            Cancel
          </button>
          <button aria-label="Interactive element" onClick={confirmDeletePrompt}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptHistorySidebar;
