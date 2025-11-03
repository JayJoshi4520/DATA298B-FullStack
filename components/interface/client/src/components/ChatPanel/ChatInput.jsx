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
          <textarea
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
        <small className="text-white mt-1 d-block">
          Currently in <strong>{mode}</strong> mode
        </small>
      </form>
    </div>
  );
}
