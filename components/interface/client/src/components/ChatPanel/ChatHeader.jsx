import { useState } from "react";
import { useChat } from "../../ChatContext";
import { ProviderSelector } from "./ProviderSelector";

export function ChatHeader() {
  const { mode, setMode, availableTools } = useChat();

  const modeOptions = [
    {
      key: "agent",
      title: "Agent",
      description: "Full AI assistant with tool execution",
      icon: "🤖",
      color: "#10b981",
    },
    {
      key: "chat",
      title: "Chat",
      description: "Pure conversation mode",
      icon: "💬",
      color: "#3b82f6",
    },
    {
      key: "ask",
      title: "Ask",
      description: "AI with read-only tools",
      icon: "❓",
      color: "#8b5cf6",
    },
  ];

  const currentMode = modeOptions.find((m) => m.key === mode) || modeOptions[1];

  return (
    <div className="chat-header p-3 border-bottom bg-light">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h4 className="mb-0 me-3">AI Development Assistant</h4>

          <div className="btn-group me-3">
            {modeOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`btn btn-sm ${mode === option.key ? "btn-primary" : "btn-outline-primary"}`}
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
          <ProviderSelector />

          <small className="text-muted">
            Tools: {availableTools?.length || 0}
          </small>

          <div className="mode-indicator">
            <small style={{ color: currentMode.color }}>
              <span className="me-1">{currentMode.icon}</span>
              {currentMode.title} Mode
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
