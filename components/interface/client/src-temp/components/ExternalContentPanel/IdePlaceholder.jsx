import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import "./IdePlaceholder.scss";
import { useActivePanel } from "../../AppRoute";

export function IdePlaceholder({ onLaunch }) {
  const [isLoading, setIsLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);
  const { activePanel } = useActivePanel();

  useEffect(() => {
    // Load recent projects from localStorage
    const stored = localStorage.getItem('recentProjects');
    if (stored) {
      try {
        const projects = JSON.parse(stored);
        setRecentProjects(projects.slice(0, 5)); // Keep only last 5
      } catch (e) {
        console.error('Failed to load recent projects', e);
      }
    }
  }, []);

  const addRecentProject = (projectName, url = 'http://localhost:8085') => {
    const newProject = {
      name: projectName,
      url,
      timestamp: Date.now(),
      id: Date.now()
    };
    
    const updated = [newProject, ...recentProjects.filter(p => p.name !== projectName)].slice(0, 5);
    setRecentProjects(updated);
    localStorage.setItem('recentProjects', JSON.stringify(updated));
  };

  const handleLaunch = () => {
    setIsLoading(true);
    onLaunch();
    addRecentProject('Workspace');
    // Reset loading after 2 seconds (VS Code should be loaded by then)
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleProjectClick = (project) => {
    setIsLoading(true);
    onLaunch();
    addRecentProject(project.name, project.url);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const removeProject = (projectId, e) => {
    e.stopPropagation();
    const updated = recentProjects.filter(p => p.id !== projectId);
    setRecentProjects(updated);
    localStorage.setItem('recentProjects', JSON.stringify(updated));
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };
  return (
    <div className="vscode-placeholder" id="vscode-placeholder" role="region" aria-label="VS Code workspace launcher">
      <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        style={{
          animation: isLoading ? 'spin 2s linear infinite' : 'float 3s ease-in-out infinite',
          cursor: 'default',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.animation = 'wave 0.5s ease';
            setTimeout(() => {
              e.target.style.animation = 'float 3s ease-in-out infinite';
            }, 500);
          }
        }}
      >
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"></path>
      </svg>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <h2 style={{
        fontWeight: activePanel === 'right' ? 700 : 600,
        fontSize: activePanel === 'right' ? '1.75rem' : '1.45rem',
        marginBottom: '0.75rem',
        letterSpacing: '-0.5px',
        color: activePanel === 'right' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.65)',
        transition: 'all 0.3s ease'
      }}>VS Code Environment</h2>
      
      <p style={{
        fontSize: '0.95rem',
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: '2rem',
        fontWeight: 400
      }} role="status" aria-live="polite">{isLoading ? 'Loading VS Code workspace...' : 'Choose how you want to work with your code'}</p>
      
      {isLoading && (
        <div style={{
          margin: '1rem auto',
          width: '200px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '50%',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            animation: 'progressBar 1.5s ease-in-out infinite'
          }} />
          <style>{`
            @keyframes progressBar {
              0% { left: -50%; }
              100% { left: 100%; }
            }
          `}</style>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <button
            onClick={handleLaunch}
            disabled={isLoading}
            aria-label="Load VS Code editor in current window"
            aria-busy={isLoading}
            style={{
              background: isLoading 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '12px',
              padding: '1.15rem 1.75rem',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              width: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
            onFocus={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.1)';
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.1)';
            }}
          >
            <span style={{fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              {isLoading ? '⏳ Loading...' : '💻 Load VS Code here'}
            </span>
            {!isLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                animation: 'shimmer 3s ease-in-out infinite',
                pointerEvents: 'none'
              }} />
            )}
          </button>
          <small style={{
            display: 'block',
            textAlign: 'center',
            marginTop: '0.5rem',
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: '0.8rem',
            fontWeight: 400,
            fontStyle: 'italic'
          }}>Embed your workspace inline for split-screen development</small>
        </div>

        <div style={{ position: 'relative', width: '100%' }}>
          <button
            onClick={() => window.open('http://localhost:8085', '_blank')}
            aria-label="Open VS Code in new browser tab"
            style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(15px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span style={{fontSize: '1.05rem'}}>↗️ Open in new tab</span>
          </button>
          <small style={{
            display: 'block',
            textAlign: 'center',
            marginTop: '0.5rem',
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: '0.8rem',
            fontWeight: 400,
            fontStyle: 'italic'
          }}>Launch fullscreen editor in separate window</small>
        </div>
      </div>

      {/* Recent Projects Section */}
      {recentProjects.length > 0 && (
        <section style={{
          marginTop: '2.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '500px',
          margin: '2.5rem auto 0'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '1rem',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }} id="recent-projects-heading">
            <span>🕒</span>
            <span>Recent Projects</span>
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }} role="list" aria-labelledby="recent-projects-heading">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project)}
                role="listitem"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <span style={{ fontSize: '1.25rem' }}>📁</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      marginBottom: '0.15rem'
                    }}>
                      {project.name}
                    </div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.75rem',
                      fontWeight: 400
                    }}>
                      {getTimeAgo(project.timestamp)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => removeProject(project.id, e)}
                  aria-label={`Remove ${project.name} from recent projects`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '0.35rem 0.6rem',
                    color: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 100, 100, 0.3)';
                    e.target.style.borderColor = 'rgba(255, 100, 100, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
