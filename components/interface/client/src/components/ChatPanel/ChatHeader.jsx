import { useChat } from "../../ChatContext";
import { Badge, Dropdown, ButtonGroup } from "react-bootstrap";

export function ChatHeader() {
  const { mode, setMode, sessionName, messages, exportConversation } = useChat();

  const modeOptions = [
    {
      key: "agent",
      title: "Agent",
      description: "Full AI assistant with tool execution",
      icon: "🤖",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    },
    {
      key: "chat",
      title: "Chat",
      description: "Pure conversation mode",
      icon: "💬",
      gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
    },
    {
      key: "ask",
      title: "Ask",
      description: "AI with read-only tools",
      icon: "❓",
      gradient: "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
    },
  ];

  return (
    <div className="chat-header" style={{
      padding: '0.75rem 1.5rem',
      paddingLeft: '4rem', // Space for sidebar toggle button when collapsed
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
      flexShrink: 0,
    }}>
      <div className="d-flex justify-content-between align-items-center">
        {/* Brand */}
        <div className="d-flex align-items-center gap-2">
          <h4 className="mb-0" style={{
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            fontSize: '1.25rem',
            whiteSpace: 'nowrap',
          }}>Immortal AI</h4>
        </div>

        {/* Mode Selector */}
        <div className="d-flex align-items-center gap-2">
          {modeOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setMode(option.key)}
              title={option.description}
              style={{
                background: mode === option.key ? option.gradient : 'rgba(255, 255, 255, 0.1)',
                border: mode === option.key ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '0.4rem 1rem',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: mode === option.key ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            >
              <span>{option.icon}</span>
              {option.title}
            </button>
          ))}

          {/* Export Dropdown */}
          {messages && messages.length > 0 && (
            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle
                variant="link"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: 'none',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.85rem',
                }}
                title="Export conversation"
              >
                📥
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" style={{
                background: 'rgba(30, 27, 75, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}>
                <Dropdown.Item 
                  onClick={() => exportConversation('json')}
                  style={{ color: 'white' }}
                >
                  📄 Export as JSON
                </Dropdown.Item>
                <Dropdown.Item 
                  onClick={() => exportConversation('markdown')}
                  style={{ color: 'white' }}
                >
                  📝 Export as Markdown
                </Dropdown.Item>
                <Dropdown.Item 
                  onClick={() => exportConversation('text')}
                  style={{ color: 'white' }}
                >
                  📃 Export as Text
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
}
