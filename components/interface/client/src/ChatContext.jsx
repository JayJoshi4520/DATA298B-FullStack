import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./contexts/AuthContext";

const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("ask");
  const [availableTools, setAvailableTools] = useState([]);
  const [progressEvents, setProgressEvents] = useState([]);
  const [insights, setInsights] = useState([]);
  const [agentActivity, setAgentActivity] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const sseRef = useRef(null);

  // Session management state
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionName, setSessionName] = useState("New Chat");
  const [projectPath, setProjectPath] = useState(null); // For ADK refinement
  const autoSaveTimeoutRef = useRef(null);

  // Load sessions from API on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      loadSessionsFromAPI();
    }
  }, [currentUser]);

  const loadSessionsFromAPI = async () => {
    if (!currentUser) return;

    try {
      // Pass the authenticated user's ID to get only their sessions
      const response = await fetch(`/api/memory/sessions?limit=50&userId=${currentUser.uid}`);
      const data = await response.json();
      const apiSessions = (data.sessions || []).map(s => ({
        id: s.id,
        name: s.metadata?.chatName || `Chat ${new Date(s.createdAt).toLocaleString()}`,
        messages: s.metadata?.messages || [],
        mode: s.metadata?.mode || 'ask',
        createdAt: s.createdAt,
        updatedAt: s.updatedAt || s.createdAt,
      }));
      setSessions(apiSessions);
    } catch (err) {
      console.error('Failed to load sessions from API:', err);
      // Fallback to localStorage
      const savedSessions = localStorage.getItem('chatSessions');
      if (savedSessions) {
        try {
          setSessions(JSON.parse(savedSessions));
        } catch (e) {
          console.error('Failed to load from localStorage:', e);
        }
      }
    }
  };

  // Auto-save current session when messages change
  useEffect(() => {
    if (messages.length === 0) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (debounce)
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveCurrentSession();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [messages]);

  const stopStream = useCallback(() => {
    try { sseRef.current?.close?.(); } catch { }
    sseRef.current = null;
  }, []);

  const sendMessage = useCallback(async (userMessage) => {
    const newMessage = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    if (mode === "ask") {
      setIsLoading(true);
      setProgressEvents([]);
      try {
        // Build conversation context from recent messages
        const recentMessages = messages.slice(-6); // Last 6 messages (3 turns of user + assistant)
        let taskWithContext = userMessage;

        if (recentMessages.length > 0) {
          const contextHistory = recentMessages
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n\n');

          taskWithContext = `Previous conversation:\n${contextHistory}\n\nCurrent request:\n${userMessage}`;
        }

        const url = `/api/adk/stream?task=${encodeURIComponent(taskWithContext)}`;
        const ev = new EventSource(url);
        sseRef.current = ev;

        ev.addEventListener("agent.start", (e) => {
          setProgressEvents((p) => [...p, { type: "agent.start", data: JSON.parse(e.data) }]);
        });
        ev.addEventListener("loop.ready", (e) => {
          setProgressEvents((p) => [...p, { type: "loop.ready", data: JSON.parse(e.data) }]);
        });
        ev.addEventListener("pipeline.ready", (e) => {
          setProgressEvents((p) => [...p, { type: "pipeline.ready", data: JSON.parse(e.data) }]);
        });
        ev.addEventListener("runner.start", (e) => {
          setProgressEvents((p) => [...p, { type: "runner.start", data: JSON.parse(e.data) }]);
        });
        ev.addEventListener("runner.event", (e) => {
          setProgressEvents((p) => [...p, { type: "runner.event", data: JSON.parse(e.data) }]);
        });
        ev.addEventListener("pipeline.start", (e) => {
          try {
            const d = JSON.parse(e.data);
            setAgentActivity([]);
            setProgressEvents((p) => [...p, { type: "pipeline.start", data: d }]);
          } catch { }
        });
        ev.addEventListener("agent.start", (e) => {
          try {
            const d = JSON.parse(e.data);
            setActiveAgent(d.agent);
            setAgentActivity((p) => [...p, {
              agent: d.agent,
              action: "started",
              description: d.description,
              timestamp: d.timestamp || new Date().toISOString()
            }]);
            setProgressEvents((p) => [...p, { type: "agent.start", data: d }]);
          } catch { }
        });
        ev.addEventListener("tool.use", (e) => {
          try {
            const d = JSON.parse(e.data);
            setAgentActivity((p) => [...p, {
              agent: d.agent,
              action: "using_tool",
              tool: d.tool,
              timestamp: d.timestamp || new Date().toISOString()
            }]);
            setProgressEvents((p) => [...p, { type: "tool.use", data: d }]);
          } catch { }
        });
        ev.addEventListener("agent.output", (e) => {
          try {
            const d = JSON.parse(e.data);
            // d: { agent, text, is_partial }
            setInsights((p) => [...p, d]);
            setAgentActivity((p) => [...p, {
              agent: d.agent,
              action: "output",
              text: d.text,
              is_partial: d.is_partial,
              timestamp: new Date().toISOString()
            }]);
            setProgressEvents((p) => [...p, { type: "agent.output", data: d }]);
          } catch { }
        });
        ev.addEventListener("log", (e) => {
          setProgressEvents((p) => [...p, { type: "log", data: JSON.parse(e.data) }]);
        });
        ev.addEventListener("error", (e) => {
          try {
            const d = JSON.parse(e.data);
            setProgressEvents((p) => [...p, { type: "error", data: d }]);
          } catch { }
        });
        ev.addEventListener("pipeline.complete", (e) => {
          try {
            const d = JSON.parse(e.data);
            setActiveAgent(null);
            setProgressEvents((p) => [...p, { type: "pipeline.complete", data: d }]);
          } catch { }
        });
        ev.addEventListener("complete", (e) => {
          try {
            const d = JSON.parse(e.data);
            const outputs = Array.isArray(d.outputs) ? d.outputs : [];
            const combined = outputs.join("\n\n");

            // Store project path for refinement
            if (d.projectPath) {
              setProjectPath(d.projectPath);
            }

            setMessages((prev) => [
              ...prev,
              { id: Date.now() + 1, role: "assistant", content: combined || "✅ ADK pipeline complete.", timestamp: new Date(), provider: "ADK" },
            ]);
          } finally {
            setActiveAgent(null);
            stopStream();
            setIsLoading(false);
          }
        });
      } catch (error) {
        stopStream();
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: `❌ **Error**: ${error.message}`, timestamp: new Date(), provider: "error" },
        ]);
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/adk/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const aiResponse = await response.json();
      const combinedOutput = Array.isArray(aiResponse.outputs)
        ? aiResponse.outputs.join("\n\n")
        : aiResponse.outputs || aiResponse.message || "✅ ADK pipeline complete.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: combinedOutput, timestamp: new Date(), provider: aiResponse.mode || "ADK" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: `❌ **Error**: ${error.message}`, timestamp: new Date(), provider: "error" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [mode, stopStream]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setProgressEvents([]);
    setInsights([]);
    setAgentActivity([]);
    setActiveAgent(null);
  }, []);

  const regenerateLastMessage = useCallback(() => {
    const userMessages = messages.filter((m) => m.role === "user");
    if (userMessages.length > 0) {
      const lastUser = userMessages[userMessages.length - 1];
      const msgs = messages.slice(0, -1);
      setMessages(msgs);
      sendMessage(lastUser.content);
    }
  }, [messages, sendMessage]);

  // Session management functions
  const saveCurrentSession = useCallback(async () => {
    if (messages.length === 0) return;

    try {
      // CRITICAL: Include userId from authenticated user
      const sessionData = {
        userId: currentUser?.uid,
        metadata: {
          chatName: sessionName,
          messages: messages,
          mode: mode,
          messageCount: messages.length,
          lastProject: projectPath ? {
            path: projectPath,
            createdAt: new Date().toISOString()
          } : undefined
        }
      };

      let savedSessionId = currentSessionId;

      if (currentSessionId) {
        // Update existing session
        await fetch(`/api/memory/sessions/${currentSessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        });
      } else {
        // Create new session
        const response = await fetch('/api/memory/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        });
        const data = await response.json();
        savedSessionId = data.id;
        setCurrentSessionId(savedSessionId);
      }

      // Reload sessions from API
      await loadSessionsFromAPI();

      // Also save to localStorage as backup
      const session = {
        id: savedSessionId,
        name: sessionName,
        messages: messages,
        mode: mode,
        createdAt: currentSessionId ? sessions.find(s => s.id === currentSessionId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      let updatedSessions;
      if (existingIndex >= 0) {
        updatedSessions = [...sessions];
        updatedSessions[existingIndex] = session;
      } else {
        updatedSessions = [session, ...sessions];
      }
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    } catch (err) {
      console.error('Failed to save session to API:', err);
      toast.error('❌ Failed to save session');
    }
  }, [messages, currentSessionId, sessionName, mode, sessions]);

  const loadSession = useCallback((session) => {
    setMessages(session.messages || []);
    setMode(session.mode || 'ask');
    setCurrentSessionId(session.id);
    setSessionName(session.name);
    toast.info(`📋 Loaded: ${session.name}`);
  }, []);

  const deleteSession = useCallback(async (sessionId) => {
    try {
      // Delete from API
      await fetch(`/api/memory/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      // Update local state
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));

      if (currentSessionId === sessionId) {
        setMessages([]);
        setCurrentSessionId(null);
        setSessionName('New Chat');
      }

      toast.success('✅ Session deleted');
    } catch (err) {
      console.error('Failed to delete session:', err);
      toast.error('❌ Failed to delete session');
    }
  }, [sessions, currentSessionId]);

  const newSession = useCallback(() => {
    if (messages.length > 0) {
      saveCurrentSession();
    }
    setMessages([]);
    setCurrentSessionId(null);
    setSessionName('New Chat');
    setAgentActivity([]);
    setInsights([]);
    toast.info('🆕 New chat started');
  }, [messages, saveCurrentSession]);

  const renameSession = useCallback(async (sessionId, newName) => {
    try {
      // Update session name in API
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        await fetch(`/api/memory/sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metadata: {
              ...session.metadata,
              chatName: newName,
              messages: session.messages,
              mode: session.mode,
            }
          })
        });
      }

      // Update local state
      const updatedSessions = sessions.map(s =>
        s.id === sessionId ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s
      );
      setSessions(updatedSessions);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));

      if (currentSessionId === sessionId) {
        setSessionName(newName);
      }
    } catch (err) {
      console.error('Failed to rename session:', err);
      toast.error('❌ Failed to rename session');
    }
  }, [sessions, currentSessionId]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        sendMessage,
        isLoading,
        clearMessages,
        regenerateLastMessage,
        mode,
        setMode,
        availableTools,
        progressEvents,
        insights,
        agentActivity,
        activeAgent,
        stopStream,
        // Session management
        sessions,
        currentSessionId,
        sessionName,
        setSessionName,
        saveCurrentSession,
        loadSession,
        deleteSession,
        newSession,
        renameSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
