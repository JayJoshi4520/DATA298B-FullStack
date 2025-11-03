import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button, Badge } from "react-bootstrap";
import { useState } from "react";
import remarkGfm from "remark-gfm";

export function MessageComponent({ message }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProviderBadgeColor = (provider) => {
    const colors = {
      openai: "success",
      anthropic: "primary",
      gemini: "warning",
      ollama: "info",
      mock: "secondary",
    };
    return colors[provider] || "secondary";
  };

  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">
        {message.role === "user" ? "👤" : "🤖"}
      </div>

      <div className="message-content">
        <div className="message-header">
          <div className="d-flex align-items-center">
            <span className="message-role me-2">
              {message.role === "user" ? "You" : "Immortal"}
            </span>
            {message.provider && message.role === "assistant" && (
              <Badge bg={getProviderBadgeColor(message.provider)} size="sm">
                {message.provider}
                {message.model && ` (${message.model.split("/").pop()})`}
              </Badge>
            )}
          </div>
        </div>

        {message.thinking && (
          <div className="thinking-process mb-2 p-2 bg-light rounded">
            <small className="text-muted">
              <em>💭 {message.thinking}</em>
            </small>
          </div>
        )}

        <div className="message-text">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                return !inline && match ? (
                  <div className="code-block-wrapper">
                    <div className="code-header">
                      <span className="language">{match[1]}</span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => copyToClipboard(codeString)}
                        className="copy-btn"
                      >
                        {copied ? "✅ Copied" : "📋 Copy"}
                      </Button>
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              table({ children }) {
                return (
                  <div className="table-responsive">
                    <table className="table table-striped table-sm">
                      {children}
                    </table>
                  </div>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {message.usage && message.role === "assistant" && (
          <div className="message-footer mt-2">
            <small className="text-muted">
              🔢 Tokens: {message.usage.total_tokens || 0}
              {message.processingTime && ` • ⏱️ ${message.processingTime}ms`}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
