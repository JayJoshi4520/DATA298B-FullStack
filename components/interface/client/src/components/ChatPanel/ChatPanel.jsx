// import { ChatHeader } from "./ChatHeader";
// import { ChatBody } from "./ChatBody";
// import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatBody } from "./ChatBody";
import { ChatInput } from "./ChatInput";
import "./ChatPanel.scss";

export function ChatPanel() {
  return (
    <div className="chat-panel" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      flex: 1,
      overflow: 'hidden'
    }}>
      <ChatHeader />
      <ChatBody />
      <ChatInput />
    </div>
  );
}
