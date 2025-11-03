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
      openai: "success",
      anthropic: "primary",
      gemini: "warning",
      ollama: "info",
      custom1: "secondary",
      custom2: "secondary",
    };
    return colors[providerName] || "secondary";
  };

  const availableProviders = Object.keys(providers);

  if (availableProviders.length <= 1) return null;

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle
          variant="outline-secondary"
          size="sm"
          disabled={switching}
        >
          {switching ? "🔄" : "🤖"} {currentProvider || "No Provider"}
          {currentProvider && (
            <Badge bg={getProviderBadgeColor(currentProvider)} className="ms-1">
              {providers[currentProvider]?.model?.split("/").pop() ||
                currentProvider}
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
                <span>{providerName}</span>
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>LLM Provider Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="provider-info">
            {Object.entries(providers).map(([name, info]) => (
              <div key={name} className="provider-card mb-3 p-3 border rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>{name}</h5>
                  <Badge bg={getProviderBadgeColor(name)}>
                    {currentProvider === name ? "Active" : "Available"}
                  </Badge>
                </div>
                <small className="text-muted">Model: {info.model}</small>
                <br />
                <small className="text-muted">Base URL: {info.baseURL}</small>
                <br />
                <small className="text-muted">
                  Tools Support: {info.supportsTools ? "✅" : "❌"}
                </small>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
