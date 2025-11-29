import { useEffect, useRef, useState } from "react";
import { useChat } from "../../ChatContext";
import { MessageComponent } from "./MessageComponent";
import { Badge, Card, ProgressBar, Button } from "react-bootstrap";
import { ThinkingIndicator } from "./LoadingSkeleton";

// Agent Progress Panel Component
function AgentProgressPanel() {
  const { agentActivity, activeAgent, isLoading, stopStream, pipelineProgress, tokenUsage } = useChat();
  const [displayedActivities, setDisplayedActivities] = useState([]);

  useEffect(() => {
    // Keep only the last 10 activities for display
    setDisplayedActivities(agentActivity.slice(-10));
  }, [agentActivity]);

  if (!isLoading && agentActivity.length === 0) {
    return null;
  }

  const getAgentIcon = (agentName) => {
    const icons = {
      BusinessAnalystAgent: "🤖",
      BusinessAnalyst: "🤖",
      CodeWriterAgent: "✍️",
      CodeWriter: "✍️",
      CodeReviewerAgent: "🔍",
      CodeReviewer: "🔍",
      CodeRefactorerAgent: "🔧",
      CodeRefactorer: "🔧",
      FileSaverAgent: "💾",
      FileSaver: "💾",
      CodeExecutorAgent: "▶️",
      TestingAgent: "🧪",
      Testing: "🧪",
      ProjectExecutorAgent: "🚀",
      SyntaxValidatorAgent: "✅",
    };
    // Try exact match first
    if (icons[agentName]) return icons[agentName];
    // Try partial match
    const name = agentName || '';
    for (const [key, icon] of Object.entries(icons)) {
      if (name.includes(key.replace('Agent', ''))) return icon;
    }
    return "🤖";
  };

  const getToolIcon = (toolName) => {
    const icons = {
      write_file: "📝",
      read_file: "📖",
      list_directory: "📂",
      create_directory: "📁",
      delete_file: "🗑️",
      execute_code: "⚡",
      filesystem_tool: "📁",
      search: "🔍",
    };
    const name = (toolName || '').toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (name.includes(key)) return icon;
    }
    return "🛠️";
  };

  const formatToolName = (toolName) => {
    if (!toolName || toolName === 'unknown_tool') return 'Filesystem Operation';
    return toolName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const formatAgentName = (name) => {
    return name.replace(/Agent$/, "").replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <Card className="mb-3" style={{
      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(168, 85, 247, 0.15) 100%)",
      border: "1px solid rgba(99, 102, 241, 0.4)",
      borderRadius: "20px",
      boxShadow: "0 8px 32px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
    }}>
      <Card.Body className="p-4">
        {/* Header with Stop Button */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            }}>
              🤖
            </div>
            <div>
              <h5 className="mb-0" style={{ color: "rgba(255, 255, 255, 0.98)", fontWeight: 700, fontSize: '1.1rem' }}>
                ADK Agents Working
              </h5>
              <small style={{ color: 'rgba(255, 255, 255, 0.6)' }}>AI agents collaborating on your request</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {activeAgent && (
              <Badge style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                border: 'none',
                fontSize: "0.85rem", 
                padding: "0.5rem 1rem",
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '0.8rem', height: '0.8rem' }}></span>
                {getAgentIcon(activeAgent)} {formatAgentName(activeAgent)}
              </Badge>
            )}
            {isLoading && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => stopStream()}
                style={{
                  borderRadius: '20px',
                  padding: '0.4rem 1rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                ⏹️ Stop
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {pipelineProgress.current === 0 
                  ? '🚀 Starting pipeline...' 
                  : `Step ${pipelineProgress.current} of ${pipelineProgress.total}`}
              </small>
              <small style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                {pipelineProgress.percentage}%
              </small>
            </div>
            <ProgressBar
              now={pipelineProgress.percentage || 5}
              variant="info"
              animated
              style={{
                height: '8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
          </div>
        )}

        {/* Token Usage (shown after completion) */}
        {!isLoading && tokenUsage.total > 0 && (
          <div className="mb-3 p-2" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            fontSize: '0.8rem',
          }}>
            <div className="d-flex justify-content-between" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <span>📊 Tokens: {tokenUsage.total.toLocaleString()}</span>
              <span>💰 Est. Cost: ${tokenUsage.estimatedCost}</span>
            </div>
          </div>
        )}

        {/* Agent Conversation View */}
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {displayedActivities.map((activity, idx) => {
            const prevActivity = displayedActivities[idx - 1];
            const isNewAgent = !prevActivity || prevActivity.agent !== activity.agent;
            
            return (
              <div
                key={idx}
                className={`d-flex align-items-start mb-2 p-2 ${isNewAgent ? 'mt-3' : ''}`}
                style={{
                  background: activity.action === "output" 
                    ? "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)"
                    : "rgba(255, 255, 255, 0.03)",
                  borderRadius: "12px",
                  borderLeft: activity.action === "started" 
                    ? "3px solid #10b981" 
                    : activity.action === "using_tool"
                    ? "3px solid #f59e0b"
                    : "3px solid #6366f1",
                  transition: "all 0.3s ease",
                  animation: idx === displayedActivities.length - 1 ? "fadeIn 0.3s ease" : "none",
                }}
              >
                {/* Agent Avatar */}
                <div 
                  className="me-3" 
                  style={{ 
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: activity.action === "started"
                      ? "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)"
                      : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  {getAgentIcon(activity.agent)}
                </div>
                
                <div className="flex-grow-1">
                  {/* Agent Name & Timestamp */}
                  <div className="d-flex align-items-center mb-1">
                    <strong style={{ 
                      color: "rgba(255, 255, 255, 0.95)", 
                      fontSize: "0.9rem",
                      background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>
                      {formatAgentName(activity.agent)}
                    </strong>
                    <Badge 
                      bg={activity.action === "started" ? "success" : activity.action === "using_tool" ? "warning" : "primary"}
                      className="ms-2"
                      style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem" }}
                    >
                      {activity.action === "started" ? "Starting" : activity.action === "using_tool" ? "Tool" : "Output"}
                    </Badge>
                    <small className="ms-auto" style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.7rem" }}>
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </small>
                  </div>
                  
                  {/* Activity Content */}
                  <div style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "0.85rem" }}>
                    {activity.action === "started" && (
                      <div className="d-flex align-items-center">
                        <span className="me-2">👋</span>
                        <span style={{ fontStyle: "italic" }}>
                          "I'm taking over from here. Let me {activity.description || 'work on this'}..."
                        </span>
                      </div>
                    )}
                    {activity.action === "using_tool" && (
                      <div className="d-flex align-items-center flex-wrap gap-1">
                        <span>{getToolIcon(activity.tool)}</span>
                        <span style={{ fontStyle: "italic" }}>
                          "Using <Badge bg="info" style={{ fontSize: "0.75rem" }}>{formatToolName(activity.tool)}</Badge> to process the code..."
                        </span>
                      </div>
                    )}
                    {activity.action === "output" && (
                      <div>
                        <span className="me-1">💬</span>
                        {activity.text && (
                          <div
                            className="mt-2 p-2"
                            style={{
                              background: "rgba(0, 0, 0, 0.2)",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                              color: "rgba(255, 255, 255, 0.8)",
                              maxHeight: "80px",
                              overflowY: "auto",
                              fontFamily: "monospace",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {activity.text.length > 200 
                              ? activity.text.substring(0, 200) + "..." 
                              : activity.text}
                            {activity.is_partial && <span className="ms-1 text-info">⏳</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Typing Indicator */}
        {isLoading && (
          <div className="d-flex align-items-center mt-3 p-2" style={{
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
          }}>
            <div className="d-flex align-items-center gap-1 me-2">
              <div className="typing-dot" style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#6366f1",
                animation: "pulse 1s infinite",
              }}></div>
              <div className="typing-dot" style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#8b5cf6",
                animation: "pulse 1s infinite 0.2s",
              }}></div>
              <div className="typing-dot" style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#a78bfa",
                animation: "pulse 1s infinite 0.4s",
              }}></div>
            </div>
            <small style={{ color: "rgba(255, 255, 255, 0.7)", fontStyle: "italic" }}>
              Agents are collaborating...
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export function ChatBody() {
   const { messages, isLoading, mode, sendMessage, agentActivity } = useChat();
  const chatBodyRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [exampleSet, setExampleSet] = useState(0);
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

    const examplePrompts = {
    agent: [
      { text: "Create a React todo app", icon: "⚛️" },
      { text: "Build a REST API with Express", icon: "🚀" },
      { text: "Set up a Python Flask server", icon: "🐍" },
      { text: "Generate a NestJS API", icon: "🦁" },
      { text: "Build with TypeORM database", icon: "🗄️" },
      { text: "Create a Vue.js dashboard", icon: "💚" },
    ],
    chat: [
      { text: "Explain React hooks", icon: "⚛️" },
      { text: "Best practices for REST APIs", icon: "📋" },
      { text: "How does async/await work?", icon: "⏱️" },
      { text: "Difference between SQL and NoSQL", icon: "🗃️" },
      { text: "Explain JWT authentication", icon: "🔐" },
      { text: "What is Docker containerization?", icon: "🐳" },
    ],
    ask: [
      { text: "Analyze my project structure", icon: "📁" },
      { text: "Review package.json", icon: "📦" },
      { text: "Explain this codebase", icon: "💡" },
      { text: "Find security vulnerabilities", icon: "🔒" },
      { text: "Check code quality issues", icon: "✅" },
      { text: "Review API endpoints", icon: "🔌" },
    ]
  };


  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };


  // Initialize with shuffled agent examples - MUST have values on first render
  const [displayedExamples, setDisplayedExamples] = useState(() => {
    const shuffled = shuffleArray(examplePrompts.agent);
    const initial = shuffled.slice(0, 3);
    console.log('🎲 Initial examples loaded:', initial);
    return initial;
  });

  useEffect(() => {
    const examples = examplePrompts[mode] || examplePrompts.agent;
    const shuffled = shuffleArray(examples);
    const newExamples = shuffled.slice(0, 3);
    console.log(`🔄 Examples updated for mode: ${mode}`, newExamples);
    setDisplayedExamples(newExamples);
  }, [mode, exampleSet]);

  useEffect(() => {
    // Scroll within the chat body container only, not the entire page
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = messages.filter(msg => 
      msg.content.toLowerCase().includes(query)
    );
    setSearchResults(results);
  }, [searchQuery, messages]);

  const filteredMessages = searchQuery.trim() ? searchResults : messages;

  if (messages.length === 0) {
    return (
      <div className="chat-body flex-grow-1 d-flex align-items-center justify-content-center" aria-label="Empty chat conversation">
        <div className="text-center p-4" style={{maxWidth: '650px'}}>
          <h2 style={{
            color: 'rgba(255, 255, 255, 0.98)', 
            fontWeight: 800, 
            marginBottom: '0.5rem', 
            fontSize: '2rem',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
          }}>Welcome to AI Development Assistant</h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)', 
            marginBottom: '0.35rem', 
            fontSize: '1rem',
            fontWeight: 400
          }}>
            {mode === "agent" &&
              "I can help you build applications, write code, and manage your project files."}
            {mode === "chat" &&
              "Let's have a conversation! I can answer questions and provide guidance."}
            {mode === "ask" &&
              "I can read your files and provide insights, but I won't modify anything."}
          </p>
          <small style={{
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '0.85rem', 
            marginBottom: '1.25rem', 
            marginTop: '1rem',
            display: 'block',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>Try these examples</small>
          
          <button
            onClick={() => setExampleSet(prev => prev + 1)}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '0.35rem 0.9rem',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.25)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🔄 Shuffle examples
          </button>
          
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center', maxWidth: '650px'}}>
            {displayedExamples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(example.text)}
                aria-label={`Send example message: ${example.text}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '16px',
                  padding: '0.75rem 1.5rem',
                  color: 'rgba(255, 255, 255, 0.98)',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  minHeight: '44px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.target.style.transform = 'translateY(-3px) scale(1.02)';
                  e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
              >
                <span style={{ fontSize: '1.1rem', marginRight: '0.4rem' }}>{example.icon}</span>
                {example.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={chatBodyRef}
      className="chat-body" 
      style={{ 
        flex: 1, 
        overflowY: 'auto', 
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Search Bar */}
      {messages.length > 0 && (
        <div className="p-3 pb-2" style={{ 
          position: 'sticky', 
          top: 0, 
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(49, 46, 129, 0.95) 100%)',
          backdropFilter: 'blur(12px)', 
          zIndex: 10,
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text" style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRight: 'none',
              color: 'rgba(255, 255, 255, 0.8)',
            }}>🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search in conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                background: 'rgba(139, 92, 246, 0.1)', 
                color: 'white', 
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderLeft: 'none',
              }}
            />
            {searchQuery && (
              <button 
                className="btn" 
                onClick={() => setSearchQuery('')}
                title="Clear search"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'white',
                }}
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <small className="text-muted mt-1 d-block">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </small>
          )}
        </div>
      )}
      
      <div className="p-3">
        {filteredMessages.length === 0 && searchQuery ? (
          <div className="text-center text-muted py-4">
            <p>🔍 No messages found matching "{searchQuery}"</p>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSearchQuery('')}>
              Clear search
            </button>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} className="message-wrapper">
              <MessageComponent message={message} searchQuery={searchQuery} />
            </div>
          ))
        )}

        {/* Loading indicators */}
        {isLoading && (
          agentActivity.length > 0 ? (
            <AgentProgressPanel />
          ) : (
            <ThinkingIndicator />
          )
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
