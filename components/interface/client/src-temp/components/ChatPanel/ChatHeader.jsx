import { useState, useEffect } from "react";
import { useChat } from "../../ChatContext";
import { ProviderSelector } from "./ProviderSelector";
import { useActivePanel } from "../../AppRoute";

export function ChatHeader() {
  const { mode, setMode, clearMessages, messages } = useChat();
  const { activePanel } = useActivePanel();
  const [emojiAnimate, setEmojiAnimate] = useState(false);

  // Periodic emoji animation every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiAnimate(true);
      setTimeout(() => setEmojiAnimate(false), 600);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const exportChat = (format = 'txt') => {
    if (messages.length === 0) return;
    
    let content, filename, type;
    
    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      filename = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
      type = 'application/json';
    } else {
      content = messages.map(m => 
        `${m.role === 'user' ? 'You' : 'Assistant'} (${new Date(m.timestamp).toLocaleString()}):\n${m.content}\n\n`
      ).join('---\n\n');
      filename = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
      type = 'text/plain';
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const modeOptions = [
    {
      key: "agent",
      title: "Agent",
      description: "Full AI coding mode with file access and modifications",
      icon: "🤖",
      accentColor: "#3b82f6", // Blue
      gradientStart: "#5a9cf8",
      gradientEnd: "#3b82f6"
    },
    {
      key: "chat",
      title: "Chat",
      description: "Chat only - no file operations, just conversation",
      icon: "💬",
      accentColor: "#8b5cf6", // Purple
      gradientStart: "#a78bfa",
      gradientEnd: "#8b5cf6"
    },
    {
      key: "ask",
      title: "Ask",
      description: "Read-only mode - can analyze but not modify files",
      icon: "❓",
      accentColor: "#ec4899", // Pink/Magenta
      gradientStart: "#f472b6",
      gradientEnd: "#ec4899"
    },
  ];

  const currentMode = modeOptions.find((m) => m.key === mode) || modeOptions[1];

  return (
    <header className="chat-header p-3 border-bottom bg-light" style={{borderRadius: '12px 12px 0 0'}} role="banner">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h4 className="mb-0 me-3" style={{
            color: activePanel === 'left' ? '#1a1a1a' : 'rgba(26, 26, 26, 0.6)', 
            fontWeight: activePanel === 'left' ? 700 : 600, 
            fontSize: activePanel === 'left' ? '1.375rem' : '1.15rem',
            textShadow: activePanel === 'left' ? '0 2px 8px rgba(255, 255, 255, 0.5)' : 'none', 
            letterSpacing: '-0.5px',
            transition: 'all 0.3s ease'
          }}>AI Development Assistant</h4>

          <div style={{
            display: 'inline-flex',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '0.25rem',
            gap: '0.25rem',
            marginRight: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
          }} role="group" aria-label="AI mode selection">
            {modeOptions.map((option, idx) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setMode(option.key)}
                title={option.description}
                aria-label={`${option.title} mode: ${option.description}`}
                aria-pressed={mode === option.key}
                style={{
                  background: mode === option.key 
                    ? `linear-gradient(135deg, ${option.gradientStart} 0%, ${option.gradientEnd} 100%)`
                    : 'transparent',
                  color: mode === option.key ? '#ffffff' : '#2d3748',
                  textShadow: mode === option.key ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: mode === option.key ? `0 2px 8px ${option.accentColor}66, 0 0 0 2px ${option.accentColor}33` : 'none',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  transform: mode === option.key ? 'scale(1)' : 'scale(0.97)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (mode !== option.key) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== option.key) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span 
                  className="me-1"
                  style={{
                    display: 'inline-block',
                    animation: (mode === option.key && emojiAnimate) ? 'emojiWave 0.6s ease-in-out' : 'none'
                  }}
                >{option.icon}</span>
                {option.title}
              </button>
            ))}
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Export Chat Button */}
          {messages.length > 0 && (
            <div className="btn-group btn-group-sm">
              <button
                onClick={() => exportChat('txt')}
                className="btn btn-sm"
                title="Export as TXT"
                aria-label="Export chat as text file"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  color: '#2d3748',
                  borderRadius: '10px 0 0 10px',
                  padding: '0.4rem 0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                📥 Export
              </button>
              <button
                onClick={() => exportChat('json')}
                className="btn btn-sm"
                title="Export as JSON"
                aria-label="Export chat as JSON file"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  borderLeft: 'none',
                  color: '#2d3748',
                  borderRadius: '0 10px 10px 0',
                  padding: '0.4rem 0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                JSON
              </button>
            </div>
          )}

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="btn btn-sm"
              title="Clear conversation"
              aria-label="Clear all messages from conversation"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                color: '#2d3748',
                borderRadius: '10px',
                padding: '0.4rem 0.9rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.4)';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              🗑️ Clear
            </button>
          )}

          <ProviderSelector />

          <style>{`
            @keyframes emojiWave {
              0% { transform: rotate(0deg); }
              10% { transform: rotate(14deg); }
              20% { transform: rotate(-8deg); }
              30% { transform: rotate(14deg); }
              40% { transform: rotate(-4deg); }
              50% { transform: rotate(10deg); }
              60% { transform: rotate(0deg); }
              100% { transform: rotate(0deg); }
            }
          `}</style>

          <div className="mode-indicator" role="status" aria-live="polite" style={{
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <small style={{ color: '#2d3748', fontWeight: 700, fontSize: '0.85rem' }}>
              <span className="me-1">{currentMode.icon}</span>
              {currentMode.title} Mode
            </small>
          </div>
        </div>
      </div>
    </header>
  );
}
