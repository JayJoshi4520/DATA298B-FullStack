import { createContext, useContext, useState, useCallback } from "react";

const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("chat");
  const [availableTools] = useState([
    "create_file",
    "edit_file",
    "read_file",
    "delete_file",
    "execute_command",
    "list_files",
    "get_file_tree",
    "search_files",
  ]);

  const sendMessage = useCallback(
    async (userMessage) => {
      const newMessage = {
        id: Date.now(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            history: messages.slice(-10),
            mode: mode,
            availableTools: getToolsForMode(mode),
            options: {
              temperature: mode === "chat" ? 0.7 : 0.1,
              maxTokens: mode === "agent" ? 4000 : 3000,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const aiResponse = await response.json();

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: aiResponse.message,
            timestamp: new Date(),
            toolCalls: aiResponse.toolCalls || [],
            thinking: aiResponse.thinking,
            provider: aiResponse.provider,
            model: aiResponse.model,
            usage: aiResponse.usage,
            processingTime: aiResponse.processingTime,
          },
        ]);
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: `❌ **Error**: ${error.message}\n\nPlease check your LLM provider configuration and try again.`,
            timestamp: new Date(),
            provider: "error",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, mode],
  );

  const getToolsForMode = (currentMode) => {
    switch (currentMode) {
      case "agent":
        return availableTools;
      case "ask":
        return availableTools.filter((tool) =>
          ["read_file", "list_files", "get_file_tree", "search_files"].includes(
            tool,
          ),
        );
      case "chat":
      default:
        return [];
    }
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

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
        mode,
        setMode,
        availableTools,
        getToolsForMode,
        clearMessages,
        regenerateLastMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
