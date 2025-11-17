import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import AppRoute from "./AppRoute";
import MemoryDashboard from "./components/MemoryDashboard";
import MultiAgentPanel from "./components/MultiAgentPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<MemoryDashboard />} />
        <Route path="/multi-agent" element={<MultiAgentPanel />} />
        <Route path=":sectionId?" element={<AppRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
