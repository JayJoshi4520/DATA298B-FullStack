import { useState, useEffect, useRef } from "react";
import { useChat } from "../../ChatContext";
import { Badge, ProgressBar, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

export function ChatInput() {
  const [input, setInput] = useState("");
  const { sendMessage, isLoading, mode } = useChat();
  const [contextFiles, setContextFiles] = useState([]);
  const [contextSize, setContextSize] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const maxContextSize = 8000; // tokens

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        toast.success('🎤 Voice input captured');
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error(`❌ Voice input error: ${event.error}`);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Fetch context files (simulated - you can connect to real API)
  useEffect(() => {
    const fetchContext = async () => {
      try {
        // Simulated context - in real app, fetch from /api/context
        const mockFiles = [
          { name: 'App.jsx', size: 250 },
          { name: 'ChatPanel.jsx', size: 180 },
          { name: 'MultiAgentPanel.jsx', size: 450 },
        ];
        setContextFiles(mockFiles);
        setContextSize(mockFiles.reduce((sum, f) => sum + f.size, 0));
      } catch (err) {
        console.error('Failed to fetch context:', err);
      }
    };

    if (mode === 'agent' || mode === 'ask') {
      fetchContext();
    } else {
      setContextFiles([]);
      setContextSize(0);
    }
  }, [mode]);

  const toggleVoiceInput = () => {
    if (!recognition) {
      toast.error('❌ Voice input not supported in this browser');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
      toast.info('🎤 Listening...');
    }
  };

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
      {/* Context Awareness Indicator */}
      {(mode === 'agent' || mode === 'ask') && contextFiles.length > 0 && (
        <div className="mb-2 p-2" style={{ 
          background: 'rgba(99, 102, 241, 0.1)', 
          borderRadius: '8px',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '0.85em', color: 'rgba(255, 255, 255, 0.8)' }}>
                📁 <strong>{contextFiles.length}</strong> files in context
              </span>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Context includes files the AI can see and reference</Tooltip>}
              >
                <span style={{ cursor: 'help', fontSize: '0.85em' }}>ℹ️</span>
              </OverlayTrigger>
            </div>
            <span style={{ fontSize: '0.75em', color: 'rgba(255, 255, 255, 0.6)' }}>
              {contextSize} / {maxContextSize} tokens
            </span>
          </div>
          
          {/* Context Size Progress Bar */}
          <ProgressBar 
            now={(contextSize / maxContextSize) * 100} 
            variant={contextSize > maxContextSize * 0.8 ? 'warning' : 'info'}
            style={{ height: '4px', marginBottom: '8px' }}
          />
          
          {/* File Badges */}
          <div className="d-flex flex-wrap gap-1">
            {contextFiles.map((file, idx) => (
              <Badge 
                key={idx} 
                bg="primary" 
                style={{ 
                  fontSize: '0.7em',
                  padding: '4px 8px',
                  background: 'rgba(99, 102, 241, 0.3)',
                  border: '1px solid rgba(99, 102, 241, 0.5)'
                }}
              >
                📄 {file.name}
                <span style={{ opacity: 0.6, marginLeft: '4px' }}>({file.size}t)</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {/* Voice Input Button */}
          {recognition && (
            <Button
              variant={isRecording ? 'danger' : 'outline-secondary'}
              onClick={toggleVoiceInput}
              disabled={isLoading}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            >
              {isRecording ? '🔴' : '🎤'}
            </Button>
          )}
          
          <textarea
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={getPlaceholder()}
            disabled={isLoading}
            rows={2}
            style={{ resize: 'none' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? "⏳" : "🚀 Send"}
          </button>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <small className="text-white">
            Currently in <strong>{mode}</strong> mode
            {input.length > 0 && ` • ${input.length} characters`}
          </small>
          <small className="text-muted">
            {recognition && '🎤 Voice input available'}
            {!recognition && 'Press Enter to send'}
          </small>
        </div>
      </form>
    </div>
  );
}
