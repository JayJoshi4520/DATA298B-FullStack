import "./App.scss";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import AppRoute from "./AppRoute";
import MemoryDashboard from "./components/MemoryDashboard";
import MultiAgentPanel from "./components/MultiAgentPanel";
import MainLayout from "./components/Layout/MainLayout";
import { ChatContextProvider } from "./ChatContext";
import { TabContextProvider } from "./TabContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./components/Login";

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ChatContextProvider>
            <TabContextProvider>
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <PrivateRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/dashboard" element={<MemoryDashboard />} />
                      <Route path="/multi-agent" element={<MultiAgentPanel />} />
                      <Route path=":sectionId?" element={<AppRoute />} />
                    </Routes>
                  </MainLayout>
                </PrivateRoute>
              } />
            </Routes>
            </TabContextProvider>
          </ChatContextProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
