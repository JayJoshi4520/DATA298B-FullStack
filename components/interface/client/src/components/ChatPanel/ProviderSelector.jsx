import { useState, useEffect } from "react";
import { Dropdown, Badge, Button, Modal } from "react-bootstrap";

export function ProviderSelector() {
  const [providers, setProviders] = useState({});
  const [currentProvider, setCurrentProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/providers");
      const data = await response.json();
      setProviders(data.providers || {});
      setCurrentProvider(data.current);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    }
  };

  const switchProvider = async (providerName) => {
    setSwitching(true);
    try {
      const response = await fetch("/api/providers/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerName }),
      });

      if (response.ok) {
        setCurrentProvider(providerName);
        console.log(`Switched to ${providerName}`);
      } else {
        console.error("Failed to switch provider");
      }
    } catch (error) {
      console.error("Error switching provider:", error);
    } finally {
      setSwitching(false);
    }
  };

  const getProviderBadgeColor = (providerName) => {
    const colors = {
      "qwen-coder": "info",
      "codellama": "success",
      "mistral": "warning",
      "deepseek-coder": "primary",
      openai: "success",
      anthropic: "primary",
      vertexai: "warning",
      ollama: "info",
    };
    return colors[providerName] || "secondary";
  };

  const getProviderDisplayName = (providerName, info) => {
    // Use displayName or name from API response
    if (info?.displayName) return info.displayName;
    if (info?.name) return info.name;
    return providerName;
  };

  const availableProviders = Object.keys(providers);

  // Always show if we have any providers
  if (availableProviders.length === 0) return null;

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle
          variant="outline-secondary"
          size="sm"
          disabled={switching}
        >
          {switching ? "🔄" : "🤖"} {getProviderDisplayName(currentProvider, providers[currentProvider]) || "No Provider"}
          {currentProvider && providers[currentProvider]?.model && (
            <Badge bg={getProviderBadgeColor(currentProvider)} className="ms-1">
              {providers[currentProvider]?.model?.split("/").pop()}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Header>Available Providers</Dropdown.Header>
          {availableProviders.map((providerName) => (
            <Dropdown.Item
              key={providerName}
              active={currentProvider === providerName}
              onClick={() => switchProvider(providerName)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>{getProviderDisplayName(providerName, providers[providerName])}</span>
                <Badge
                  bg={getProviderBadgeColor(providerName)}
                  className="ms-2"
                >
                  {providers[providerName]?.model}
                </Badge>
              </div>
            </Dropdown.Item>
          ))}
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => setShowModal(true)}>
            ⚙️ Provider Settings
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="provider-modal">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderBottom: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <Modal.Title style={{ color: 'white' }}>🤖 LLM Provider Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
          <div className="provider-info">
            {Object.entries(providers).map(([name, info]) => (
              <div 
                key={name} 
                className="provider-card mb-3 p-3 rounded"
                style={{
                  background: currentProvider === name 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: currentProvider === name 
                    ? '2px solid rgba(139, 92, 246, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 style={{ color: 'white', margin: 0 }}>
                    {getProviderDisplayName(name, info)}
                  </h5>
                  <Badge bg={currentProvider === name ? "success" : getProviderBadgeColor(name)}>
                    {currentProvider === name ? "✓ Active" : "Available"}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <div className="mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    <strong>Model:</strong> <code style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>{info.model || 'Not specified'}</code>
                  </div>
                  <div className="mb-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    <strong>Base URL:</strong> <span style={{ wordBreak: 'break-all' }}>{info.baseURL || 'Not specified'}</span>
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    <strong>Tools Support:</strong> {info.supportsTools ? "✅ Yes" : "❌ No"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderTop: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
