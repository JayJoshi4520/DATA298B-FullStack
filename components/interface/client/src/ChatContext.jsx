import { createContext, useContext, useState, useCallback, useRef } from "react";

const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("ask");
  const [availableTools, setAvailableTools] = useState([]);
  const [progressEvents, setProgressEvents] = useState([]);
  const [insights, setInsights] = useState([]); 
  const [agentActivity, setAgentActivity] = useState([]); 
  const [activeAgent, setActiveAgent] = useState(null); 
  const sseRef = useRef(null);

  const stopStream = useCallback(() => {
    try { sseRef.current?.close?.(); } catch {}
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
        const url = `/api/adk/stream?task=${encodeURIComponent(userMessage)}`;
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
          } catch {}
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
          } catch {}
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
          } catch {}
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
          } catch {}
        });
        ev.addEventListener("log", (e) => {
          setProgressEvents((p) => [...p, { type: "log", data: JSON.parse(e.data) }]);
        });
        ev.addEventListener("error", (e) => {
          try {
            const d = JSON.parse(e.data);
            setProgressEvents((p) => [...p, { type: "error", data: d }]);
          } catch {}
        });
        ev.addEventListener("pipeline.complete", (e) => {
          try {
            const d = JSON.parse(e.data);
            setActiveAgent(null);
            setProgressEvents((p) => [...p, { type: "pipeline.complete", data: d }]);
          } catch {}
        });
        ev.addEventListener("complete", (e) => {
          try {
            const d = JSON.parse(e.data);
            const outputs = Array.isArray(d.outputs) ? d.outputs : [];
            const combined = outputs.join("\n\n");
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
        { id: Date.now() + 1, role: "assistant", content: `❌ **Error**: ${error.message}` , timestamp: new Date(), provider: "error" },
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

  return (
    <ChatContext.Provider
      value={{
        messages,
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
