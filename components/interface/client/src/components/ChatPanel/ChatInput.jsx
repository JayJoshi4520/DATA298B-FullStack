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

export function ChatInput() {
  const [input, setInput] = useState("");
  const { sendMessage, isLoading, mode } = useChat();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const getPlaceholder = () => {
    switch (mode) {
      case "agent":
        return "Ask me to create, modify, or analyze your code...";
      case "chat":
        return "Ask me anything about development...";
      case "ask":
        return "Ask me to read and analyze your files...";
      default:
        return "Type your message...";
    }
  };

  return (
    <div className="chat-input border-top p-3">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? "⏳" : "Send"}
          </button>
        </div>
        <small className="text-muted mt-1 d-block">
          Currently in <strong>{mode}</strong> mode
        </small>
      </form>
    </div>
  );
}
