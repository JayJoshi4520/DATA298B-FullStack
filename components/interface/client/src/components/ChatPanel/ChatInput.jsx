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

  // @ mention autocomplete state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFiles, setMentionFiles] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const textareaRef = useRef(null);

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

  // Fetch workspace files when @ is typed
  useEffect(() => {
    const fetchWorkspaceFiles = async () => {
      console.log('[@ Mention] Fetching files with query:', mentionQuery);
      try {
        const response = await fetch(`/api/workspace/files?query=${encodeURIComponent(mentionQuery)}&limit=20`);
        console.log('[@ Mention] Response status:', response.status);
        const data = await response.json();
        console.log('[@ Mention] Received files:', data.files?.length || 0, 'files');
        setMentionFiles(data.files || []);
        if (data.files && data.files.length === 0) {
          console.warn('[@ Mention] No files found in workspace. Check API and workspace path.');
        }
      } catch (err) {
        console.error('[@ Mention] Failed to fetch workspace files:', err);
        setMentionFiles([]);
      }
    };

    if (showMentionDropdown) {
      console.log('[@ Mention] Dropdown is shown, fetching files...');
      fetchWorkspaceFiles();
    }
  }, [mentionQuery, showMentionDropdown]);

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
        return "Ask me to create, modify, or analyze your code... (Type @ for files)";
      case "chat":
        return "Ask me anything about development... (Type @ for files)";
      case "ask":
        return "Ask me to read and analyze your files... (Type @ for files)";
      default:
        return "Type your message... (Type @ for files)";
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

          <div style={{ position: 'relative', flex: 1 }}>
            <textarea
              ref={textareaRef}
              className="form-control"
              value={input}
              onChange={(e) => {
                const value = e.target.value;
                const cursorPos = e.target.selectionStart;
                setInput(value);

                // Detect @ mention
                const textBeforeCursor = value.substring(0, cursorPos);
                const lastAtIndex = textBeforeCursor.lastIndexOf('@');

                if (lastAtIndex !== -1) {
                  const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
                  // Check if there's no space after @
                  if (!textAfterAt.includes(' ')) {
                    console.log('[@ Mention] Detected @ at position', lastAtIndex, 'query:', textAfterAt);
                    setShowMentionDropdown(true);
                    setMentionQuery(textAfterAt);
                    setMentionStartPos(lastAtIndex);
                    setSelectedMentionIndex(0);
                  } else {
                    setShowMentionDropdown(false);
                  }
                } else {
                  setShowMentionDropdown(false);
                }
              }}
              onKeyDown={(e) => {
                if (showMentionDropdown && mentionFiles.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedMentionIndex(prev =>
                      prev < mentionFiles.length - 1 ? prev + 1 : prev
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0);
                  } else if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    const selectedFile = mentionFiles[selectedMentionIndex];
                    if (selectedFile) {
                      const before = input.substring(0, mentionStartPos);
                      const after = input.substring(textareaRef.current.selectionStart);
                      const newInput = before + selectedFile.path + ' ' + after;
                      setInput(newInput);
                      setShowMentionDropdown(false);
                      // Set cursor position after inserted text
                      setTimeout(() => {
                        const newPos = (before + selectedFile.path + ' ').length;
                        textareaRef.current.setSelectionRange(newPos, newPos);
                        textareaRef.current.focus();
                      }, 0);
                    }
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowMentionDropdown(false);
                  }
                } else if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={getPlaceholder()}
              disabled={isLoading}
              rows={2}
              style={{ resize: 'none' }}
            />

            {/* @ Mention Dropdown */}
            {showMentionDropdown && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  background: 'rgba(30, 41, 59, 0.98)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)',
                  zIndex: 1000,
                }}
              >
                {mentionFiles.length > 0 ? (
                  mentionFiles.map((file, index) => (
                    <div
                      key={file.path}
                      onClick={() => {
                        const before = input.substring(0, mentionStartPos);
                        const after = input.substring(textareaRef.current.selectionStart);
                        const newInput = before + file.path + ' ' + after;
                        setInput(newInput);
                        setShowMentionDropdown(false);
                        textareaRef.current.focus();
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        background: index === selectedMentionIndex
                          ? 'rgba(99, 102, 241, 0.2)'
                          : 'transparent',
                        borderLeft: index === selectedMentionIndex
                          ? '3px solid #6366f1'
                          : '3px solid transparent',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onMouseEnter={() => setSelectedMentionIndex(index)}
                    >
                      <span style={{ fontSize: '1.2em' }}>
                        {file.type === 'directory' ? '📁' : '📄'}
                      </span>
                      <span style={{
                        color: index === selectedMentionIndex ? '#a5b4fc' : '#cbd5e1',
                        fontSize: '0.9em',
                      }}>
                        {file.path}
                      </span>
                      <Badge
                        bg="secondary"
                        style={{
                          fontSize: '0.7em',
                          marginLeft: 'auto',
                          opacity: 0.7,
                        }}
                      >
                        {file.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9em' }}>
                    {mentionQuery ? `No files matching "${mentionQuery}"` : 'Loading files...'}
                  </div>
                )}
              </div>
            )}
          </div>
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
            {showMentionDropdown && ` • @ mention active (${mentionFiles.length} files)`}
          </small>
          <small className="text-muted">
            {recognition && '🎤 Voice input available • '}
            Type @ for file picker • Press Enter to send
          </small>
        </div>
      </form>
    </div>
  );
}
