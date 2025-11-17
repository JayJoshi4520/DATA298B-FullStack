import { useEffect, useRef, useState } from "react";
import { useChat } from "../../ChatContext";
import { MessageComponent } from "./MessageComponent";
import { Badge, Card } from "react-bootstrap";

// Agent Progress Panel Component
function AgentProgressPanel() {
  const { agentActivity, activeAgent, isLoading } = useChat();
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
      CodeWriterAgent: "✍️",
      CodeReviewerAgent: "🔍",
      CodeRefactorerAgent: "🔧",
      FileSaverAgent: "💾",
      CodeExecutorAgent: "▶️",
    };
    return icons[agentName] || "🤖";
  };

  const getToolIcon = (toolName) => {
    const icons = {
      write_file: "📝",
      read_file: "📖",
      list_directory: "📂",
      create_directory: "📁",
      delete_file: "🗑️",
      execute_code: "⚡",
    };
    return icons[toolName] || "🔧";
  };

  const formatAgentName = (name) => {
    return name.replace(/Agent$/, "").replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <Card className="mb-3" style={{
      background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
      border: "2px solid rgba(99, 102, 241, 0.5)",
      borderRadius: "16px",
      boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
      animation: "pulse 2s ease-in-out infinite"
    }}>
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <h5 className="mb-0 me-2" style={{ color: "rgba(255, 255, 255, 0.98)", fontWeight: 700 }}>
              🤖 ADK Agents Working
            </h5>
            {activeAgent && (
              <Badge bg="success" className="d-flex align-items-center gap-1" style={{ fontSize: "0.9rem", padding: "0.5rem 0.75rem" }}>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                {getAgentIcon(activeAgent)} {formatAgentName(activeAgent)}
              </Badge>
            )}
          </div>
          {isLoading && (
            <div className="spinner-border text-light" role="status" style={{ width: "1.5rem", height: "1.5rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
        </div>

        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {displayedActivities.map((activity, idx) => (
            <div
              key={idx}
              className="d-flex align-items-start mb-2 p-2"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                borderLeft: "3px solid rgba(99, 102, 241, 0.5)",
                transition: "all 0.3s ease",
              }}
            >
              <div className="me-2" style={{ fontSize: "1.2rem" }}>
                {getAgentIcon(activity.agent)}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-1">
                  <strong style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem" }}>
                    {formatAgentName(activity.agent)}
                  </strong>
                  <small className="ms-2" style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.75rem" }}>
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </small>
                </div>
                <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.85rem" }}>
                  {activity.action === "started" && (
                    <span>🟢 Started working</span>
                  )}
                  {activity.action === "using_tool" && (
                    <span>
                      {getToolIcon(activity.tool)} Using tool: <Badge bg="info" className="ms-1">{activity.tool}</Badge>
                    </span>
                  )}
                  {activity.action === "output" && (
                    <div>
                      <span>💬 Generated output</span>
                      {activity.text && (
                        <div
                          className="mt-1 p-2"
                          style={{
                            background: "rgba(0, 0, 0, 0.2)",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            color: "rgba(255, 255, 255, 0.7)",
                            maxHeight: "60px",
                            overflowY: "auto",
                          }}
                        >
                          {activity.text}
                          {activity.is_partial && <span className="ms-1">...</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center mt-2">
            <small style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              ⏳ Agents are working on your request...
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export function ChatBody() {
   const { messages, isLoading, mode, sendMessage } = useChat();
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div className="chat-body flex-grow-1" style={{ overflowY: "auto" }}>
      {/* Search Bar */}
      {messages.length > 0 && (
        <div className="p-3 pb-2 border-bottom" style={{ position: 'sticky', top: 0, background: 'rgba(13, 17, 23, 0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search in conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            />
            {searchQuery && (
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ❌
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

        {/* Agent Progress Panel - Shows real-time agent activity (replaces "Thinking...") */}
        {isLoading && <AgentProgressPanel />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
