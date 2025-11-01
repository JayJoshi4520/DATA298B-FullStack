import { createContext, useContext, useState, useCallback } from "react";

const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ==============================
  // 💬 Send Message to ADK Backend
  // ==============================
  const sendMessage = useCallback(async (userMessage) => {
    const newMessage = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      // ✅ Call the ADK endpoint instead of /api/chat
      const response = await fetch("/api/adk/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiResponse = await response.json();

      // ✅ Combine multiple outputs (ADK returns an array)
      const combinedOutput = Array.isArray(aiResponse.outputs)
        ? aiResponse.outputs.join("\n\n")
        : aiResponse.outputs || aiResponse.message || "✅ ADK pipeline complete.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: combinedOutput,
          timestamp: new Date(),
          provider: aiResponse.mode || "ADK",
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: `❌ **Error**: ${error.message}\n\nPlease check your ADK server configuration and try again.`,
          timestamp: new Date(),
          provider: "error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==============================
  // 🧹 Clear Messages
  // ==============================
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // ==============================
  // 🔁 Regenerate Last Message
  // ==============================
  const regenerateLastMessage = useCallback(() => {
    const userMessages = messages.filter((msg) => msg.role === "user");
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1];
      const messagesWithoutLastAssistant = messages.slice(0, -1);
      setMessages(messagesWithoutLastAssistant);
      sendMessage(lastUserMessage.content);
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
