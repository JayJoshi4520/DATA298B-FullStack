import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import AppRoute from "./AppRoute";
import MemoryDashboard from "./components/MemoryDashboard";
import MultiAgentPanel from "./components/MultiAgentPanel";
import MainLayout from "./components/Layout/MainLayout";
import { ChatContextProvider } from "./ChatContext";
import { TabContextProvider } from "./TabContext";

function App() {
  return (
    <BrowserRouter>
      <ChatContextProvider>
        <TabContextProvider>
          <MainLayout>
            <Routes>
              <Route path="/dashboard" element={<MemoryDashboard />} />
              <Route path="/multi-agent" element={<MultiAgentPanel />} />
              <Route path=":sectionId?" element={<AppRoute />} />
            </Routes>
          </MainLayout>
        </TabContextProvider>
      </ChatContextProvider>
    </BrowserRouter>
  );
}

export default App;
