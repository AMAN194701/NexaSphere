import React, { useState, useRef, useEffect } from 'react';
import '../styles/chatbot.css';
import PromptHistorySidebar from '../components/history/PromptHistorySidebar';
import SearchBar from '../components/history/SearchBar';
import PinnedChats from '../components/history/PinnedChats';
import { savePrompt } from '../lib/promptStore';
import { initializeWorkspaces } from '../lib/workspaceService';
import { buildUrl, getAiApiBase } from '../utils/runtimeConfig';

const CHAT_WINDOW_ID = 'nexa-chat-window';
const CHAT_HISTORY_SIDEBAR_ID = 'nexa-chat-history-sidebar';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Nexa-Intelligence Online. How can I assist your journey?' },
  ]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('default');
  const scrollRef = useRef(null);

  // Initialize workspaces on mount
  useEffect(() => {
    initializeWorkspaces();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Auto-save last prompt-response pair when new bot message arrives
  useEffect(() => {
    if (messages.length >= 2) {
      const lastBotMsg = [...messages].reverse().find((m) => m.role === 'bot');
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');

      if (lastBotMsg && lastUserMsg) {
        const lastBotIndex = messages.indexOf(lastBotMsg);
        const lastUserIndex = messages.indexOf(lastUserMsg);

        // Only save if the bot message is more recent than the last saved one
        if (lastBotIndex > lastUserIndex) {
          savePrompt(lastUserMsg.text, lastBotMsg.text, currentWorkspace).catch((err) => {
            console.error('Error saving prompt:', err);
          });
        }
      }
    }
  }, [messages, currentWorkspace]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsSending(true);

    const aiChatUrl = buildUrl(getAiApiBase(), '/ai/chat');

    if (!aiChatUrl) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'Nexa-AI is offline right now. The AI service URL is not configured for this deployment.',
        },
      ]);
      setIsSending(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch(aiChatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI chat request failed with status ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text:
            data.reply ||
            'Nexa-AI received the request, but the reply came back empty. Please try again.',
        },
      ]);
    } catch (e) {
      console.error('AI chat request failed', e);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'Nexa-AI: Core link unavailable right now. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectPrompt = (prompt) => {
    setMessages([
      { role: 'bot', text: 'Nexa-Intelligence Online. How can I assist your journey?' },
      { role: 'user', text: prompt.userPrompt },
      { role: 'bot', text: prompt.botResponse },
    ]);
    setShowSidebar(false);
  };

  return (
    <div className="ns-chatbot-wrapper">
      {!isOpen ? (
        <button
          className="chat-trigger-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open Nexa AI chat"
          aria-expanded={isOpen}
          aria-controls={CHAT_WINDOW_ID}
        >
          <div className="pulse-ring"></div>
          💬
        </button>
      ) : (
        <div className="chat-window-glass" id={CHAT_WINDOW_ID}>
          <PromptHistorySidebar
            id={CHAT_HISTORY_SIDEBAR_ID}
            isOpen={showSidebar}
            onSelectPrompt={handleSelectPrompt}
            currentWorkspace={currentWorkspace}
          />

          <div className={`chat-main ${showSidebar ? 'sidebar-open' : ''}`}>
            <div className="chat-header">
              <button
                className="history-toggle-btn"
                onClick={() => setShowSidebar(!showSidebar)}
                title="Toggle History"
                aria-label="Toggle conversation history"
                aria-expanded={showSidebar}
                aria-controls={CHAT_HISTORY_SIDEBAR_ID}
              >
                📋
              </button>
              <div className="header-status">
                <span className="status-dot"></span>
                <span>NEXA-AI</span>
              </div>
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close Nexa AI chat"
              >
                ×
              </button>
            </div>

            <div className="chat-content">
              <PinnedChats onSelectPrompt={handleSelectPrompt} workspace={currentWorkspace} />

              <SearchBar onSelectPrompt={handleSelectPrompt} workspace={currentWorkspace} />

              <div className="chat-messages" ref={scrollRef}>
                {messages.map((m, i) => (
                  <div key={i} className={`msg-bubble ${m.role}`}>
                    {m.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-input-container">
              <select
                value={currentWorkspace}
                onChange={(e) => setCurrentWorkspace(e.target.value)}
                className="workspace-selector-inline"
              >
                <option value="default">General</option>
                <option value="coding">Coding & Debug</option>
                <option value="research">Research</option>
              </select>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isSending ? 'Transmitting...' : 'Query system...'}
                disabled={isSending}
              />
              <button onClick={handleSend} className="send-btn" disabled={isSending}>
                {isSending ? '...' : '🚀'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
