// import { ChatHeader } from "./ChatHeader";
// import { ChatBody } from "./ChatBody";
// import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatBody } from "./ChatBody";
import { ChatInput } from "./ChatInput";
import "./ChatPanel.scss";

export function ChatPanel() {
  return (
    <div className="d-flex flex-column h-100 chat-panel">
      <ChatHeader />
      <ChatBody />
      <ChatInput />
    </div>
  );
}
