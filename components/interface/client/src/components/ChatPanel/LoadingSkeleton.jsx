import './LoadingSkeleton.scss';

// Message skeleton for loading states
export function MessageSkeleton({ isUser = false }) {
  return (
    <div className={`message-skeleton ${isUser ? 'user' : 'assistant'}`}>
      <div className="skeleton-avatar pulse" />
      <div className="skeleton-content">
        <div className="skeleton-header">
          <div className="skeleton-name pulse" />
          <div className="skeleton-time pulse" />
        </div>
        <div className="skeleton-text">
          <div className="skeleton-line pulse" style={{ width: '90%' }} />
          <div className="skeleton-line pulse" style={{ width: '75%' }} />
          <div className="skeleton-line pulse" style={{ width: '85%' }} />
        </div>
      </div>
    </div>
  );
}

// Multiple message skeletons
export function ChatLoadingSkeleton({ count = 3 }) {
  return (
    <div className="chat-loading-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} isUser={i % 2 === 0} />
      ))}
    </div>
  );
}

// Inline loading indicator
export function ThinkingIndicator() {
  return (
    <div className="thinking-indicator">
      <div className="thinking-avatar">🤖</div>
      <div className="thinking-content">
        <div className="thinking-dots">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
        <span className="thinking-text">Thinking...</span>
      </div>
    </div>
  );
}

export default { MessageSkeleton, ChatLoadingSkeleton, ThinkingIndicator };
