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

import { useEffect, useRef } from "react";
import { useChat } from "../../ChatContext";

export function ChatBody() {
  const { messages, isLoading, mode } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat-body flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div style={{ fontSize: "4rem" }}>
            {mode === "agent" && "🤖"}
            {mode === "chat" && "💬"}
            {mode === "ask" && "❓"}
          </div>
          <h5 className="mt-3">Welcome to AI Development Assistant</h5>
          <p className="text-muted">
            {mode === "agent" &&
              "I can help you build applications, write code, and manage your project files."}
            {mode === "chat" &&
              "Let's have a conversation! I can answer questions and provide guidance."}
            {mode === "ask" &&
              "I can read your files and provide insights, but I won't modify anything."}
          </p>
          <small className="text-muted">Try asking me something!</small>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-body flex-grow-1" style={{ overflowY: "auto" }}>
      <div className="p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 d-flex ${message.role === "user" ? "justify-content-end" : "justify-content-start"}`}
          >
            <div
              className={`p-3 rounded ${message.role === "user" ? "bg-primary text-white" : "bg-secondary"}`}
              style={{ maxWidth: "70%" }}
            >
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">
                  {message.role === "user" ? "👤" : "🤖"}
                </span>
                <strong>{message.role === "user" ? "You" : "Immortal"}</strong>
                <small className="ms-auto text-white">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </small>
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="mb-3 d-flex justify-content-start">
            <div className="p-3 rounded bg-secondary text-white">
              <span className="me-2">🤖</span>
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
