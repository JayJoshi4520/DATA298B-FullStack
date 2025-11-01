import { useState } from "react";
import { Card, Button, Badge, Collapse } from "react-bootstrap";

export function ToolCallComponent({ toolCall }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getToolIcon = (toolName) => {
    switch (toolName) {
      case "create_file":
        return "📄";
      case "edit_file":
        return "✏️";
      case "read_file":
        return "👁️";
      case "delete_file":
        return "🗑️";
      case "execute_command":
        return "⚡";
      case "list_files":
        return "📁";
      default:
        return "🔧";
    }
  };

  return (
    <Card className="tool-call-card mb-2">
      <Card.Header
        className="d-flex justify-content-between align-items-center"
        style={{ cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="d-flex align-items-center">
          <span className="me-2">{getToolIcon(toolCall.tool)}</span>
          <span className="tool-name">{toolCall.tool}</span>
          <Badge bg={getStatusColor(toolCall.status)} className="ms-2">
            {toolCall.status}
          </Badge>
        </div>
        <Button variant="link" size="sm" className="expand-btn">
          {expanded ? "▼" : "▶"}
        </Button>
      </Card.Header>

      <Collapse in={expanded}>
        <Card.Body>
          <div className="tool-details">
            <h6>Parameters:</h6>
            <pre className="tool-params">
              {JSON.stringify(toolCall.parameters, null, 2)}
            </pre>

            {toolCall.result && (
              <>
                <h6>Result:</h6>
                <pre className="tool-result">
                  {typeof toolCall.result === "string"
                    ? toolCall.result
                    : JSON.stringify(toolCall.result, null, 2)}
                </pre>
              </>
            )}

            {toolCall.error && (
              <>
                <h6>Error:</h6>
                <pre className="tool-error text-danger">{toolCall.error}</pre>
              </>
            )}
          </div>
        </Card.Body>
      </Collapse>
    </Card>
  );
}
