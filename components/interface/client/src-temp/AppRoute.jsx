import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { ToastContainer } from "react-toastify";
import { ChatPanel } from "./components/ChatPanel/ChatPanel";
import { ChatContextProvider } from "./ChatContext";
import { TabContextProvider, useTabs } from "./TabContext";
import { ExternalContentPanel } from "./components/ExternalContentPanel/ExternalContentPanel";
import { useState, createContext, useContext, useEffect } from "react";
import 'react-toastify/dist/ReactToastify.css';

// Context for active panel state
const ActivePanelContext = createContext({ activePanel: 'left', setActivePanel: () => {} });

export const useActivePanel = () => useContext(ActivePanelContext);

// Onboarding animation component
function OnboardingAnimation({ onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => onComplete(), 3200)
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: step === 3 ? 'fadeOut 0.5s ease-out forwards' : 'none'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          animation: 'bounce 1s ease-in-out infinite'
        }}>
          {step >= 0 && '🤖'}
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '1rem',
          opacity: step >= 1 ? 1 : 0,
          transform: step >= 1 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease-out'
        }}>
          AI Development Assistant
        </h1>
        <p style={{
          fontSize: '1.2rem',
          opacity: step >= 2 ? 1 : 0,
          transform: step >= 2 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease-out 0.2s'
        }}>
          Your intelligent coding companion
        </p>
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          opacity: step >= 2 ? 1 : 0,
          transition: 'opacity 0.5s ease-out 0.4s'
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'white',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`
            }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fadeOut {
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

// Connected indicator component
function ConnectedIndicator() {
  const { tabs } = useTabs();
  const isConnected = tabs.length > 0;
  
  if (!isConnected) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 100,
      pointerEvents: 'none'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>🤖</span>
        <div style={{
          display: 'flex',
          gap: '0.25rem'
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'white',
              animation: `flowDot 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }} />
          ))}
        </div>
        <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>💻</span>
      </div>
      <style>{`
        @keyframes flowDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default function AppRoute() {
  const [activePanel, setActivePanel] = useState('left');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && <OnboardingAnimation onComplete={handleOnboardingComplete} />}
      <ActivePanelContext.Provider value={{ activePanel, setActivePanel }}>
        <ChatContextProvider>
        <TabContextProvider>
          <PanelGroup direction="horizontal" autoSaveId="persistence">
            <Panel defaultSize={50} minSize={20} className="resizable-panel">
              <div 
                className="overflow-auto position-relative"
                onClick={() => setActivePanel('left')}
                style={{
                  filter: activePanel === 'left' ? 'none' : 'brightness(0.85)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  boxShadow: activePanel === 'left' 
                    ? '0 10px 40px rgba(102, 126, 234, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    : 'none',
                  zIndex: activePanel === 'left' ? 2 : 1,
                  transform: activePanel === 'left' ? 'scale(1.005)' : 'scale(1)'
                }}
              >
                {activePanel !== 'left' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.05)',
                    pointerEvents: 'none',
                    transition: 'opacity 0.3s ease',
                    zIndex: 1
                  }} />
                )}
                <ChatPanel />
              </div>
            </Panel>
            <PanelResizeHandle className="panel-resize-handle" style={{
              boxShadow: '0 0 20px rgba(102, 126, 234, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.1)',
              position: 'relative'
            }}>
              <ConnectedIndicator />
              <svg viewBox="0 0 24 24" data-direction="horizontal">
                <path
                  fill="currentColor"
                  d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"
                ></path>
              </svg>
            </PanelResizeHandle>
            <Panel
              defaultSize={50}
              minSize={20}
              className="resizable-panel d-flex"
            >
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  filter: activePanel === 'right' ? 'none' : 'brightness(0.85)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  boxShadow: activePanel === 'right' 
                    ? '0 10px 40px rgba(118, 75, 162, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    : 'none',
                  zIndex: activePanel === 'right' ? 2 : 1,
                  transform: activePanel === 'right' ? 'scale(1.005)' : 'scale(1)'
                }}
                onClick={() => setActivePanel('right')}
              >
                {activePanel !== 'right' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.05)',
                    pointerEvents: 'none',
                    transition: 'opacity 0.3s ease',
                    zIndex: 1
                  }} />
                )}
                <ExternalContentPanel />
              </div>
            </Panel>
          </PanelGroup>
        </TabContextProvider>
      </ChatContextProvider>
      </ActivePanelContext.Provider>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          fontSize: '0.9rem',
          fontWeight: 600
        }}
      />
    </>
  );
}
