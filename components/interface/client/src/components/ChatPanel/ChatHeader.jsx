import { useState } from "react";
import { useChat } from "../../ChatContext";
import { ProviderSelector } from "./ProviderSelector";
import { Button, Dropdown, Badge } from "react-bootstrap";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { SessionSidebar } from "./SessionSidebar";

export function ChatHeader() {
  const { mode, setMode, availableTools, messages, sessionName, sessions, newSession } = useChat();
  const navigate = useNavigate();
  const [showSessionSidebar, setShowSessionSidebar] = useState(false);

  const switchToMultiAgent = () => {
    navigate('/multi-agent');
    toast.info('🎭 Switched to Multi-Agent Mode');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
    toast.info('📊 Navigating to Dashboard');
  };

  const exportConversation = (format) => {
    if (messages.length === 0) {
      toast.warning('No conversation to export');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let content = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      filename = `conversation-${timestamp}.json`;
    } else if (format === 'markdown') {
      content = messages.map(m => {
        const time = new Date(m.timestamp).toLocaleString();
        return `### ${m.role === 'user' ? '👤 You' : '🤖 Immortal'} - ${time}\n\n${m.content}\n\n---\n`;
      }).join('\n');
      filename = `conversation-${timestamp}.md`;
    } else if (format === 'txt') {
      content = messages.map(m => {
        const time = new Date(m.timestamp).toLocaleString();
        return `[${time}] ${m.role === 'user' ? 'You' : 'Immortal'}: ${m.content}\n\n`;
      }).join('');
      filename = `conversation-${timestamp}.txt`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`✅ Conversation exported as ${format.toUpperCase()}`);
  };

  const modeOptions = [
    {
      key: "agent",
      title: "Agent",
      description: "Full AI assistant with tool execution",
      icon: "🤖",
      color: "white",
    },
    {
      key: "chat",
      title: "Chat",
      description: "Pure conversation mode",
      icon: "💬",
      color: "white",
    },
    {
      key: "ask",
      title: "Ask",
      description: "AI with read-only tools",
      icon: "❓",
      color: "white",
    },
  ];

  const currentMode = modeOptions.find((m) => m.key === mode) || modeOptions[1];

  return (
    <div className="chat-header p-3 border-bottom">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h4 className="mb-0 me-3 neon-text">Immortal AI</h4>
          <Badge bg="secondary" className="me-2">{sessionName}</Badge>

          <div className="btn-group me-3">
            {modeOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`btn btn-sm text-white ${mode === option.key ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setMode(option.key)}
                title={option.description}
              >
                <span className="me-1">{option.icon}</span>
                {option.title}
              </button>
            ))}
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Session Controls */}
          <Button
            variant="outline-success"
            size="sm"
            onClick={newSession}
            title="Start new chat"
          >
            🆕 New Chat
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowSessionSidebar(!showSessionSidebar)}
            title="View chat history"
          >
            📚 Sessions {sessions.length > 0 && `(${sessions.length})`}
          </Button>

          <ProviderSelector />

          {/* Multi-Agent Integration Button */}
          <Button
            variant="outline-primary"
            size="sm"
            onClick={switchToMultiAgent}
            title="Switch to Multi-Agent Collaboration"
          >
            🎭 Multi-Agent
          </Button>

          {/* Dashboard Button */}
          <Button
            variant="outline-info"
            size="sm"
            onClick={goToDashboard}
            title="Go to Memory Dashboard"
          >
            📊 Dashboard
          </Button>

          {/* Export Conversation Dropdown */}
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="export-dropdown">
              📥 Export
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => exportConversation('json')}>
                📄 JSON Format
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportConversation('markdown')}>
                📝 Markdown Format
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportConversation('txt')}>
                📋 Plain Text
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <div className="mode-indicator">
            <small style={{ color: currentMode.color }}>
              <span className="me-1">{currentMode.icon}</span>
              {currentMode.title} Mode
            </small>
          </div>
        </div>
      </div>
      
      {/* Session Sidebar */}
      <SessionSidebar show={showSessionSidebar} onHide={() => setShowSessionSidebar(false)} />
    </div>
  );
}
