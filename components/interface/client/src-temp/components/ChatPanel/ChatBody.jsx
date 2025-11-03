// import { useEffect, useRef } from "react";
// import { Spinner } from "react-bootstrap";
// import { useChat } from "../../ChatContext";
// import { MessageComponent } from "./MessageComponent";
// import { ToolCallComponent } from "./ToolCallComponent";

// export function ChatBody() {
//   const { messages, isLoading, mode } = useChat();
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   if (messages.length === 0) {
//     return (
//       <div className="chat-body-empty">
//         <div className="empty-state">
//           <div className="empty-icon">
//             {mode === "agent" && "🤖"}
//             {mode === "chat" && "💬"}
//             {mode === "ask" && "❓"}
//           </div>
//           <h5>Welcome to AI Development Assistant</h5>
//           <p className="text-muted">
//             {mode === "agent" &&
//               "I can help you build applications, write code, and manage your project files."}
//             {mode === "chat" &&
//               "Let's have a conversation! I can answer questions and provide guidance."}
//             {mode === "ask" &&
//               "I can read your files and provide insights, but I won't modify anything."}
//           </p>
//           <div className="example-prompts">
//             <small className="text-muted">Try asking:</small>
//             <div className="prompt-suggestions">
//               {mode === "agent" && (
//                 <>
//                   <div className="suggestion-pill">
//                     "Create a React calculator app"
//                   </div>
//                   <div className="suggestion-pill">
//                     "Set up a Node.js project"
//                   </div>
//                   <div className="suggestion-pill">
//                     "Fix the bug in my code"
//                   </div>
//                 </>
//               )}
//               {mode === "chat" && (
//                 <>
//                   <div className="suggestion-pill">
//                     "How do I use React hooks?"
//                   </div>
//                   <div className="suggestion-pill">"Explain async/await"</div>
//                   <div className="suggestion-pill">
//                     "Best practices for API design"
//                   </div>
//                 </>
//               )}
//               {mode === "ask" && (
//                 <>
//                   <div className="suggestion-pill">
//                     "Analyze my project structure"
//                   </div>
//                   <div className="suggestion-pill">
//                     "Review my package.json"
//                   </div>
//                   <div className="suggestion-pill">
//                     "Explain this code file"
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="chat-body">
//       <div className="messages-container">
//         {messages.map((message) => (
//           <div key={message.id} className="message-wrapper">
//             <MessageComponent message={message} />
//             {message.toolCalls &&
//               message.toolCalls.map((toolCall) => (
//                 <ToolCallComponent key={toolCall.id} toolCall={toolCall} />
//               ))}
//           </div>
//         ))}

//         {isLoading && (
//           <div className="message-wrapper">
//             <div className="message assistant">
//               <div className="message-avatar">🤖</div>
//               <div className="message-content">
//                 <Spinner size="sm" className="me-2" />
//                 <span className="text-muted">Thinking...</span>
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { useChat } from "../../ChatContext";
import { toast } from 'react-toastify';

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="typing-indicator-container mb-3 d-flex justify-content-start">
      <div className="typing-indicator p-3 rounded bg-light d-flex align-items-center gap-1">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
    </div>
  );
}

export function ChatBody() {
  const { messages, isLoading, mode, sendMessage } = useChat();
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [exampleSet, setExampleSet] = useState(0);

  // Example prompts with icons for each mode
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

  // Shuffle array helper
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

  // Refresh examples when mode changes or on manual refresh
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

  const handleScroll = (e) => {
    const element = e.target;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setShowScrollButton(!isNearBottom && messages.length > 3);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper function to get mode emoji
  const getModeEmoji = () => {
    console.log('Current mode:', mode);
    switch(mode) {
      case 'agent': return '🤖';
      case 'chat': return '💬';
      case 'ask': return '❓';
      default: return '🤖';
    }
  };

  if (messages.length === 0) {
    return (
        <div className="text-center p-4" style={{maxWidth: '650px'}}>
          <div 
            className="mb-3" 
            style={{ 
              fontSize: '5rem', 
              animation: 'float 3s ease-in-out infinite',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.target.style.animation = 'wave 0.5s ease';
              setTimeout(() => {
                e.target.style.animation = 'float 3s ease-in-out infinite';
              }, 500);
            }}
          >
            {getModeEmoji()}
          </div>
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
    );
  }

  return (
    <main 
      ref={chatBodyRef}
      className="chat-body flex-grow-1 position-relative" 
      style={{ overflowY: "auto" }}
      onScroll={handleScroll}
      role="main"
      aria-label="Chat conversation"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="p-3">
        {messages.map((message) => {
          const MessageWithCopy = () => {
            const [copied, setCopied] = useState(false);
            const [reaction, setReaction] = useState(null);
            
            const handleCopy = () => {
              navigator.clipboard.writeText(message.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              toast.success('📋 Message copied to clipboard!', {
                position: 'top-right',
                autoClose: 2000
              });
            };

            return (
              <article
                className={`mb-3 d-flex ${message.role === "user" ? "justify-content-end" : "justify-content-start"}`}
                role="article"
                aria-label={`Message from ${message.role === "user" ? "you" : "assistant"}`}
              >
                <div
                  className="p-3 rounded position-relative"
                  style={{ 
                    maxWidth: "70%",
                    background: message.role === "user" 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.95)',
                    color: message.role === "user" ? 'white' : '#1a1a1a',
                    backdropFilter: 'blur(20px)',
                    border: message.role === "user" 
                      ? '1px solid rgba(255, 255, 255, 0.3)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: message.role === "user"
                      ? '0 8px 20px rgba(102, 126, 234, 0.4)'
                      : '0 8px 20px rgba(0, 0, 0, 0.15)',
                    fontWeight: 400,
                    lineHeight: '1.6'
                  }}
                >
                  <div className="d-flex align-items-center mb-2" style={{
                    borderBottom: message.role === "user" 
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                    paddingBottom: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    <span className="me-2" style={{ fontSize: '1.25rem' }}>
                      {message.role === "user" ? "👤" : "🤖"}
                    </span>
                    <strong style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: message.role === "user" ? 'rgba(255, 255, 255, 0.95)' : '#2d3748'
                    }}>
                      {message.role === "user" ? "You" : "Assistant"}
                    </strong>
                    <small className="ms-auto" style={{
                      opacity: 0.7,
                      fontSize: '0.75rem',
                      color: message.role === "user" ? 'rgba(255, 255, 255, 0.8)' : '#718096'
                    }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </small>
                  </div>
                  <div style={{ 
                    whiteSpace: "pre-wrap",
                    fontSize: '0.95rem',
                    color: message.role === "user" ? 'rgba(255, 255, 255, 0.98)' : '#2d3748',
                    lineHeight: '1.7'
                  }}>{message.content}</div>
                  
                  {/* Copy Button */}
                  <button
                    onClick={handleCopy}
                    aria-label="Copy message to clipboard"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: message.role === 'user'
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'rgba(0, 0, 0, 0.08)',
                      backdropFilter: 'blur(10px)',
                      border: message.role === 'user'
                        ? '1px solid rgba(255, 255, 255, 0.4)'
                        : '1px solid rgba(0, 0, 0, 0.15)',
                      borderRadius: '8px',
                      padding: '0.35rem 0.6rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      color: message.role === 'user' ? 'white' : '#2d3748',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      opacity: 0.8
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '0.8';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>

                  {/* Message Reactions - Only for assistant messages */}
                  {message.role === 'assistant' && (
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}>
                      {/* Regenerate Button - Only for last assistant message */}
                      {messages[messages.length - 1]?.id === message.id && (
                        <button
                          onClick={() => {
                            const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
                            if (lastUserMessage) {
                              sendMessage(lastUserMessage.content);
                              toast.info('🔄 Regenerating response...', { autoClose: 2000 });
                            }
                          }}
                          aria-label="Regenerate assistant response"
                          style={{
                            background: 'rgba(102, 126, 234, 0.15)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '12px',
                            padding: '0.35rem 0.9rem',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            color: '#667eea',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(102, 126, 234, 0.25)';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(102, 126, 234, 0.15)';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          <span>🔄</span>
                          <span>Regenerate</span>
                        </button>
                      )}
                      
                      {['👍', '👎', '❤️', '🎉'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setReaction(reaction === emoji ? null : emoji)}
                          aria-label={`React with ${emoji}`}
                          aria-pressed={reaction === emoji}
                          style={{
                            background: reaction === emoji 
                              ? 'rgba(102, 126, 234, 0.2)'
                              : 'rgba(0, 0, 0, 0.05)',
                            border: reaction === emoji
                              ? '2px solid #667eea'
                              : '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '12px',
                            padding: '0.35rem 0.7rem',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: reaction === emoji ? 'scale(1.1)' : 'scale(1)'
                          }}
                          onMouseEnter={(e) => {
                            if (reaction !== emoji) {
                              e.target.style.background = 'rgba(0, 0, 0, 0.08)';
                              e.target.style.transform = 'scale(1.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (reaction !== emoji) {
                              e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                              e.target.style.transform = 'scale(1)';
                            }
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          };
          
          return <MessageWithCopy key={message.id} />;
        })}

        {isLoading && <div role="status" aria-live="polite" aria-label="Assistant is typing"><TypingIndicator /></div>}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          aria-label="Scroll to bottom of conversation"
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            fontSize: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.5)',
            transition: 'all 0.3s ease',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.5)';
          }}
          title="Scroll to bottom"
        >
          ↓
        </button>
      )}
    </main>
  );
}
