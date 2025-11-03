// import { useState, useRef } from "react";
// import { Button, Form, InputGroup } from "react-bootstrap";
// import { useChat } from "../../ChatContext";

// export function ChatInput() {
//   const [input, setInput] = useState("");
//   const [isMultiline, setIsMultiline] = useState(false);
//   const { sendMessage, isLoading, mode } = useChat();
//   const textareaRef = useRef(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || isLoading) return;

//     const message = input.trim();
//     setInput("");
//     await sendMessage(message);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit(e);
//     }
//   };

//   const toggleMultiline = () => {
//     setIsMultiline(!isMultiline);
//     setTimeout(() => textareaRef.current?.focus(), 100);
//   };

//   const getModeConfig = () => {
//     switch (mode) {
//       case "agent":
//         return {
//           placeholder: "Ask me to create, modify, or analyze your code...",
//           color: "#10b981",
//         };
//       case "chat":
//         return {
//           placeholder: "Ask me anything about development...",
//           color: "#3b82f6",
//         };
//       case "ask":
//         return {
//           placeholder: "Ask me to read and analyze your files...",
//           color: "#8b5cf6",
//         };
//       default:
//         return {
//           placeholder: "Type your message...",
//           color: "#6c757d",
//         };
//     }
//   };

//   const config = getModeConfig();

//   return (
//     <div className="chat-input">
//       <Form onSubmit={handleSubmit}>
//         <InputGroup>
//           <Form.Control
//             ref={textareaRef}
//             as={isMultiline ? "textarea" : "input"}
//             rows={isMultiline ? 4 : 1}
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder={config.placeholder}
//             disabled={isLoading}
//             style={{ borderColor: config.color + "40" }}
//           />

//           <Button
//             variant="link"
//             onClick={toggleMultiline}
//             className="multiline-toggle"
//             title={isMultiline ? "Single line" : "Multi line"}
//           >
//             {isMultiline ? "📝" : "📄"}
//           </Button>

//           <Button
//             type="submit"
//             disabled={!input.trim() || isLoading}
//             style={{
//               backgroundColor: config.color,
//               borderColor: config.color,
//             }}
//           >
//             {isLoading ? "⏳" : "Send"}
//           </Button>
//         </InputGroup>

//         <div className="input-footer">
//           <small className="text-muted">
//             Press Enter to send, Shift+Enter for new line
//           </small>
//         </div>
//       </Form>
//     </div>
//   );
// }

import { useState } from "react";
import { useChat } from "../../ChatContext";
import { useTabs } from "../../TabContext";

export function ChatInput() {
  const [input, setInput] = useState("");
  const { sendMessage, isLoading, mode } = useChat();
  const { tabs } = useTabs();
  const hasProject = tabs.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const getPlaceholder = () => {
    if (mode === "agent") {
      return hasProject 
        ? "Ask about a file, function, or tell me what to build..."
        : "Ask me to create, modify, or analyze your code...";
    } else if (mode === "chat") {
      return hasProject
        ? "Ask about your code or programming concepts..."
        : "Chat with me about programming concepts, debug issues...";
    } else {
      return hasProject
        ? "Ask me to explain a file, review code, or find issues..."
        : "Ask me to read and analyze your files...";
    }
  };

  const charCount = input.length;
  const maxChars = 4000;
  const isNearLimit = charCount > maxChars * 0.8;

  return (
    <div className="chat-input border-top p-3" role="complementary" aria-label="Message input area">
      <form onSubmit={handleSubmit} aria-label="Send message form">
        <div className="input-group position-relative">
          <input
            type="text"
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isLoading}
            maxLength={maxChars}
            aria-label={`Message input: ${getPlaceholder()}`}
            aria-describedby="input-help"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              } else if (e.key === 'Escape') {
                setInput('');
              }
            }}
          />
          <button
            type="submit"
            className="btn"
            disabled={!input.trim() || isLoading}
            aria-label={isLoading ? "Sending message" : "Send message"}
            aria-busy={isLoading}
            style={{
              background: (!input.trim() || isLoading) 
                ? 'rgba(102, 126, 234, 0.5)'
                : 'linear-gradient(135deg, #5a6fd8 0%, #6b4694 100%)',
              color: '#ffffff',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.5rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: (!input.trim() || isLoading) 
                ? 'none'
                : '0 4px 12px rgba(102, 126, 234, 0.4)',
              minWidth: '120px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isLoading) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (input.trim() && !isLoading) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                <span>Sending</span>
                <span style={{ display: 'inline-flex', gap: '0.2rem' }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: 'white',
                        display: 'inline-block',
                        animation: 'loadingDot 1.4s ease-in-out infinite',
                        animationDelay: `${i * 0.16}s`
                      }}
                    />
                  ))}
                </span>
              </span>
            ) : (
              "Send ➤"
            )}
            {isLoading && (
              <style>{`
                @keyframes loadingDot {
                  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
                  40% { transform: scale(1); opacity: 1; }
                }
              `}</style>
            )}
          </button>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2" id="input-help">
          <small style={{color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}} aria-label={`Current mode: ${mode}. Press Enter to send, Escape to clear`}>
            <strong>{mode}</strong> mode • 
            <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
              <kbd style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>⏎</kbd>
              Send
            </span>
            •
            <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
              <kbd style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>Esc</kbd>
              Clear
            </span>
          </small>
          {charCount > 0 && (
            <small 
              style={{
                color: isNearLimit ? '#ff6b6b' : 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem',
                fontWeight: isNearLimit ? 600 : 400
              }}
              role="status"
              aria-live="polite"
              aria-label={`${charCount} of ${maxChars} characters used${isNearLimit ? ', approaching limit' : ''}`}
            >
              {charCount} / {maxChars}
            </small>
          )}
        </div>
      </form>
    </div>
  );
}
