import { useState } from 'react';
import { Offcanvas, ListGroup, Button, Badge, Form, ButtonGroup } from 'react-bootstrap';
import { useChat } from '../../ChatContext';

export function SessionSidebar({ show, onHide }) {
  const { sessions, loadSession, deleteSession, renameSession, currentSessionId } = useChat();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleRename = (sessionId) => {
    if (editName.trim()) {
      renameSession(sessionId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const startEdit = (session) => {
    setEditingId(session.id);
    setEditName(session.name);
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="start" style={{ width: '350px' }}>
      <Offcanvas.Header closeButton style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
        <Offcanvas.Title>📚 Chat Sessions</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body style={{ padding: 0 }}>
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-muted">
            <p>💭 No saved sessions yet</p>
            <small>Start chatting to create your first session!</small>
          </div>
        ) : (
          <ListGroup variant="flush">
            {sessions.map((session) => (
              <ListGroup.Item
                key={session.id}
                active={session.id === currentSessionId}
                className="d-flex flex-column"
                style={{ cursor: 'pointer', borderLeft: session.id === currentSessionId ? '3px solid #6366f1' : 'none' }}
              >
                {editingId === session.id ? (
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRename(session.id)}
                      autoFocus
                    />
                    <ButtonGroup size="sm" className="mt-2 w-100">
                      <Button variant="success" onClick={() => handleRename(session.id)}>✅ Save</Button>
                      <Button variant="secondary" onClick={() => setEditingId(null)}>❌ Cancel</Button>
                    </ButtonGroup>
                  </Form.Group>
                ) : (
                  <div onClick={() => loadSession(session)}>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong style={{ fontSize: '0.95em' }}>{session.name}</strong>
                      <Badge bg="info" style={{ fontSize: '0.7em' }}>
                        {session.messages?.length || 0} msgs
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted" style={{ fontSize: '0.75em' }}>
                        {new Date(session.updatedAt).toLocaleDateString()} {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                      <Badge bg="secondary" style={{ fontSize: '0.7em' }}>{session.mode}</Badge>
                    </div>
                  </div>
                )}
                
                {editingId !== session.id && (
                  <ButtonGroup size="sm" className="mt-2">
                    <Button
                      variant="outline-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(session);
                      }}
                      title="Rename"
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${session.name}"?`)) {
                          deleteSession(session.id);
                        }
                      }}
                      title="Delete"
                    >
                      🗑️
                    </Button>
                  </ButtonGroup>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}