import { useState, useEffect } from 'react';
import { Card, Container, Form, Button, Alert, Badge, Accordion, Spinner, Modal, Tab, Tabs, ButtonGroup, ListGroup, ProgressBar, Dropdown } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import yaml from 'js-yaml';
import AgentVisualization from './AgentVisualization';
import AgentPerformanceDashboard from './AgentPerformanceDashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router';

// File Tree Component
const FileTreeView = ({ files }) => {
  const buildTree = (entries) => {
    const tree = {};
    entries.forEach(entry => {
      const parts = entry.path.split('/');
      let current = tree;
      parts.forEach((part, idx) => {
        if (!current[part]) {
          current[part] = idx === parts.length - 1 ? { __file: true, ...entry } : {};
        }
        current = current[part];
      });
    });
    return tree;
  };

  const renderTree = (node, name = '', level = 0) => {
    if (node.__file) {
      return (
        <div key={name} style={{ paddingLeft: `${level * 20}px`, padding: '4px 0' }}>
          <span style={{ color: '#0d6efd' }}>📄</span> {name}
          <span style={{ color: '#6c757d', fontSize: '0.85em', marginLeft: '8px' }}>
            {node.size ? `(${(node.size / 1024).toFixed(1)}KB)` : ''}
          </span>
        </div>
      );
    }

    const children = Object.keys(node).filter(k => k !== '__file');
    return (
      <div key={name}>
        {name && (
          <div style={{ paddingLeft: `${level * 20}px`, padding: '4px 0', fontWeight: 'bold' }}>
            <span style={{ color: '#ffc107' }}>📁</span> {name}
          </div>
        )}
        {children.map(child => renderTree(node[child], child, level + 1))}
      </div>
    );
  };

  const tree = buildTree(files);
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.9em', maxHeight: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
      {renderTree(tree)}
    </div>
  );
};

const MultiAgentPanel = () => {
  const navigate = useNavigate();

  // State for task and mode
  const [task, setTask] = useState('');
  const [mode, setMode] = useState('multi');
  const [executeWithADK, setExecuteWithADK] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [executionProgress, setExecutionProgress] = useState(null);
  const [generatedFiles, setGeneratedFiles] = useState([]);

  // New state for features
  const [templates, setTemplates] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentApproval, setCurrentApproval] = useState(null);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const [streamEvents, setStreamEvents] = useState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState('json');
  const [gitStatus, setGitStatus] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [agentConversation, setAgentConversation] = useState([]);
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [showApprovalNotification, setShowApprovalNotification] = useState(false);
  const [recommendedWorkflows, setRecommendedWorkflows] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

  // Load templates and workflows on mount
  useEffect(() => {
    loadTemplates();
    loadWorkflows();
  }, []);

  // Poll for pending approvals
  useEffect(() => {
    const pollApprovals = async () => {
      try {
        const response = await fetch('/api/approvals/pending?userId=default-user');
        const data = await response.json();
        if (data.approvals && data.approvals.length > 0) {
          setPendingApprovals(data.approvals);
          setShowApprovalNotification(true);
        } else {
          setPendingApprovals([]);
          setShowApprovalNotification(false);
        }
      } catch (err) {
        console.error('Failed to poll approvals:', err);
      }
    };

    const interval = setInterval(pollApprovals, 5000);
    pollApprovals();

    return () => clearInterval(interval);
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates?isPublic=true');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    }
  };

  const useTemplate = (template) => {
    setTask(template.taskTemplate);
    setSelectedTemplate(template);
    setShowTemplateModal(false);
    fetch(`/api/templates/${template.id}/use`, { method: 'POST' });
  };

  const loadWorkflow = async (workflow) => {
    setTask(workflow.task);
    setMode(workflow.mode);
    setSelectedWorkflow(workflow);
    setShowWorkflowModal(false);
    setCurrentWorkflowId(workflow.id);
    try {
      const response = await fetch(`/api/workflows/${workflow.id}`);
      const data = await response.json();
      if (data.result) setResult(data.result);
    } catch (err) {
      console.error('Failed to load workflow details:', err);
    }
  };

  const saveWorkflow = async () => {
    if (!workflowName || !task) {
      alert('Please provide a workflow name and task');
      return;
    }
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workflowName, description: workflowDescription, userId: 'default-user', mode, task })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentWorkflowId(data.id);
        setShowSaveModal(false);
        setWorkflowName('');
        setWorkflowDescription('');
        loadWorkflows();
        alert('Workflow saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
      alert('Failed to save workflow');
    }
  };

  const exportWorkflow = async (workflowId, format = 'json') => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-${workflowId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export workflow:', err);
      alert('Failed to export workflow');
    }
  };

  const importWorkflow = async () => {
    if (!importData) {
      alert('Please provide data to import');
      return;
    }
    try {
      const response = await fetch('/api/workflows/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: importData, format: importFormat, userId: 'default-user' })
      });
      const data = await response.json();
      if (data.success) {
        setShowImportModal(false);
        setImportData('');
        loadWorkflows();
        alert('Workflow imported successfully!');
      }
    } catch (err) {
      console.error('Failed to import workflow:', err);
      alert('Failed to import workflow: ' + err.message);
    }
  };

  const checkGitStatus = async () => {
    try {
      const response = await fetch('/api/git/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath: '/home/coder/project' })
      });
      const data = await response.json();
      setGitStatus(data);
    } catch (err) {
      console.error('Failed to check git status:', err);
    }
  };

  const commitToGit = async (message) => {
    try {
      const response = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message || 'Auto-commit from Multi-Agent workflow', projectPath: '/home/coder/project' })
      });
      const data = await response.json();
      if (data.success) {
        alert('Changes committed to Git!');
        checkGitStatus();
      }
    } catch (err) {
      console.error('Failed to commit:', err);
      alert('Failed to commit changes');
    }
  };

  const runTests = async (testCommand = 'npm test') => {
    try {
      const response = await fetch('/api/test/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: currentWorkflowId, testCommand, projectPath: '/home/coder/project' })
      });
      const data = await response.json();
      setTestResults(data);
    } catch (err) {
      console.error('Failed to run tests:', err);
      alert('Failed to run tests');
    }
  };

  const seedDatabase = async () => {
    try {
      const response = await fetch('/api/seed-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Database seeded! ${data.count} templates added.`);
        loadTemplates(); // Reload templates
      }
    } catch (err) {
      console.error('Failed to seed database:', err);
      alert('Failed to seed database');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setGeneratedFiles([]);

    try {
      // Track execution progress
      if (executeWithADK) {
        setExecutionProgress('🎭 Phase 1: Multi-Agent Planning...');
      }

      const response = await fetch('/api/multi-agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          mode,
          context: { executeWithADK }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);

        // Build agent conversation log
        if (data.plan && data.result?.agentOutputs) {
          const conversation = [
            { agent: 'Orchestrator', message: `Analyzed task. Complexity: ${data.plan.complexity}. Assigning to ${data.agentsUsed?.length || 0} agents.`, timestamp: new Date() },
            ...data.result.agentOutputs.map((output, i) => ({
              agent: output.agentName,
              message: `Completed: ${output.task.substring(0, 100)}${output.task.length > 100 ? '...' : ''}`,
              timestamp: new Date(Date.now() + i * 1000),
              executionTime: output.executionTime
            })),
            { agent: 'Orchestrator', message: `All agents completed. Total execution time: ${data.executionTime}ms`, timestamp: new Date(Date.now() + data.result.agentOutputs.length * 1000) }
          ];
          setAgentConversation(conversation);
        }

        // Auto-save workflow after successful execution
        if (autoSaveEnabled && mode === 'multi' && data.plan) {
          try {
            const autoSaveName = `${task.substring(0, 50)}${task.length > 50 ? '...' : ''} (${new Date().toLocaleString()})`;

            const saveResponse = await fetch('/api/workflows', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: autoSaveName,
                description: 'Auto-saved workflow',
                userId: 'default-user',
                mode,
                task
              })
            });

            const saveData = await saveResponse.json();
            if (saveData.success) {
              setCurrentWorkflowId(saveData.id);

              // Update with execution results
              await fetch(`/api/workflows/${saveData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  status: 'completed',
                  result: data,
                  executionTime: data.executionTime,
                  agentOutputs: data.result?.agentOutputs
                })
              });

              console.log('✅ Workflow auto-saved:', saveData.id);
            }
          } catch (autoSaveErr) {
            console.error('Auto-save failed:', autoSaveErr);
          }
        }

        // If files were created, fetch the file list
        if (data.mode === 'multi-agent-with-execution') {
          setExecutionProgress('📂 Phase 3: Loading generated files...');
          try {
            const filesResponse = await fetch('/api/generate');
            const filesData = await filesResponse.json();
            setGeneratedFiles(filesData.entries || []);
          } catch (err) {
            console.error('Failed to fetch files:', err);
          }
        }

        setExecutionProgress(null);
      } else {
        setError(data.error || 'Request failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setExecutionProgress(null);
    }
  };

  const exampleTasks = [
    'Build a user authentication system with JWT',
    'Create a React dashboard with charts and analytics',
    'Set up CI/CD pipeline with Docker and GitHub Actions',
    'Design a database schema for an e-commerce platform',
  ];

  return (
    <Container className="mt-4 mb-5" style={{ maxWidth: '1200px', height: 'auto', overflowY: 'auto' }}>
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold" style={{
          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(139, 92, 246, 0.3)'
        }}>
          🎭 Multi-Agent Collaboration System
        </h2>
        <p className="lead text-light opacity-75">Harness the power of specialist AI agents working together</p>
      </div>

      {/* Feature Toolbar */}
      <Card className="mb-4 border-0" style={{
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <Card.Body className="p-4">
          <div className="d-flex flex-wrap gap-3 justify-content-center align-items-center">
            <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => setShowTemplateModal(true)} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>library_books</span> Templates
            </Button>

            <Button variant="success" className="d-flex align-items-center gap-2" onClick={() => setShowWorkflowModal(true)} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>folder_open</span> Load
            </Button>

            <Button variant="info" className="d-flex align-items-center gap-2 text-white" onClick={() => setShowSaveModal(true)} disabled={!task} style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', border: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>save</span> Save
            </Button>

            <div className="vr bg-secondary opacity-25 mx-2"></div>

            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle variant="dark" className="d-flex align-items-center gap-2" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>build</span> Tools
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-lg border-0" style={{ background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(12px)' }}>
                <Dropdown.Item onClick={() => setShowImportModal(true)} className="text-light hover-bg-primary">
                  <span className="material-symbols-outlined me-2 align-middle">upload</span> Import Workflow
                </Dropdown.Item>
                <Dropdown.Item onClick={checkGitStatus} className="text-light hover-bg-primary">
                  <span className="material-symbols-outlined me-2 align-middle">source</span> Git Status
                </Dropdown.Item>
                <Dropdown.Item onClick={seedDatabase} className="text-light hover-bg-primary">
                  <span className="material-symbols-outlined me-2 align-middle">database</span> Seed Database
                </Dropdown.Item>
                <Dropdown.Divider className="border-secondary opacity-25" />
                <Dropdown.Item onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)} className="text-light hover-bg-primary">
                  <span className="material-symbols-outlined me-2 align-middle">monitoring</span> Analytics
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {currentWorkflowId && (
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>download</span> Export
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow-lg border-0" style={{ background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(12px)' }}>
                  <Dropdown.Item onClick={() => exportWorkflow(currentWorkflowId, 'json')} className="text-light">JSON Format</Dropdown.Item>
                  <Dropdown.Item onClick={() => exportWorkflow(currentWorkflowId, 'yaml')} className="text-light">YAML Format</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {gitStatus?.hasChanges && (
              <Button variant="success" size="sm" onClick={() => commitToGit()}>Commit Changes</Button>
            )}

            <Button variant="danger" className="d-flex align-items-center gap-2" onClick={() => runTests()} disabled={!currentWorkflowId} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>science</span> Test
            </Button>
          </div>
          {gitStatus && (
            <Alert variant={gitStatus.hasChanges ? 'warning' : 'success'} className="mt-3 mb-0" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: gitStatus.hasChanges ? '#fbbf24' : '#34d399' }}>
              <small><strong>Git Status:</strong> {gitStatus.hasChanges ? `${gitStatus.changes.length} uncommitted change(s)` : 'Working directory clean'}</small>
            </Alert>
          )}
          {testResults && (
            <Alert variant={testResults.success ? 'success' : 'danger'} className="mt-3 mb-0">
              <small><strong>Tests:</strong> {testResults.status} ({testResults.duration}ms)</small>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Task Input Card */}
      <Card className="mb-4 border-0" style={{
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <Card.Header className="border-bottom border-secondary border-opacity-25 bg-transparent py-3">
          <strong className="text-light d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_note</span> Task Input
          </strong>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="text-light opacity-75">Development Task</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe your development task..."
                required
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  color: '#f8fafc',
                  resize: 'none'
                }}
                className="shadow-none focus-ring"
              />
              <Form.Text className="text-muted">
                The orchestrator will analyze and assign to specialist agents.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-light opacity-75">Execution Mode</Form.Label>
              <div className="d-flex gap-4">
                <Form.Check
                  inline
                  type="radio"
                  label={<span className="text-light">🎭 Multi-Agent</span>}
                  value="multi"
                  checked={mode === 'multi'}
                  onChange={(e) => setMode(e.target.value)}
                  id="mode-multi"
                />
                <Form.Check
                  inline
                  type="radio"
                  label={<span className="text-light">🤖 Single Agent</span>}
                  value="single"
                  checked={mode === 'single'}
                  onChange={(e) => setMode(e.target.value)}
                  id="mode-single"
                />
              </div>
            </Form.Group>

            {mode === 'multi' && (
              <div className="p-3 rounded mb-4" style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label={<span className="text-light">📦 Execute with ADK (Create actual files in workspace)</span>}
                    checked={executeWithADK}
                    onChange={(e) => setExecuteWithADK(e.target.checked)}
                    id="execute-adk"
                  />
                  <Form.Text className="text-muted d-block ms-4">
                    {executeWithADK
                      ? '⚠️ Will create files in /generate folder after planning'
                      : 'Only show plan and code snippets (no files created)'}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-0">
                  <Form.Check
                    type="checkbox"
                    label={<span className="text-light">💾 Auto-save workflow after execution</span>}
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    id="auto-save"
                  />
                  <Form.Text className="text-muted d-block ms-4">
                    {autoSaveEnabled
                      ? '✅ Workflows will be automatically saved to history'
                      : 'Manual save only'}
                  </Form.Text>
                </Form.Group>
              </div>
            )}

            <div className="mb-4">
              <small className="text-muted d-block mb-2">Quick examples:</small>
              <div className="d-flex flex-wrap gap-2">
                {exampleTasks.map((example, i) => (
                  <Button
                    key={i}
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setTask(example)}
                    style={{ borderColor: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1' }}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-100 py-3 fw-bold" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', border: 'none', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              {loading ? '⏳ Processing...' : '🚀 Execute Task'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="border-0 shadow-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>
          <strong>⚠️ Error:</strong> {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="text-center mt-4 border-0" style={{ background: 'transparent' }}>
          <Card.Body>
            <div className="mb-4">
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            </div>
            <h5 className="text-light">Processing Your Task</h5>
            <p className="text-muted">
              {executionProgress || (
                mode === 'multi'
                  ? 'Orchestrator is coordinating specialist agents...'
                  : 'Agent is processing your request...'
              )}
            </p>
            {executeWithADK && (
              <div className="mt-4 d-flex justify-content-center align-items-center gap-3">
                <Badge bg={executionProgress?.includes('Phase 1') ? 'primary' : 'secondary'} className="p-2 px-3 rounded-pill">
                  Phase 1: Planning
                </Badge>
                <span className="text-muted">→</span>
                <Badge bg={executionProgress?.includes('Phase 2') ? 'primary' : executionProgress?.includes('Phase 3') ? 'success' : 'secondary'} className="p-2 px-3 rounded-pill">
                  Phase 2: Execution
                </Badge>
                <span className="text-muted">→</span>
                <Badge bg={executionProgress?.includes('Phase 3') ? 'primary' : 'secondary'} className="p-2 px-3 rounded-pill">
                  Phase 3: Generation
                </Badge>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ADK Execution Result */}
      {result && result.mode === 'multi-agent-with-execution' && (
        <>
          <Alert variant="success" className="mb-4 border-0 shadow-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>
            <Alert.Heading className="d-flex align-items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span> Files Created Successfully!
            </Alert.Heading>
            <p>{result.message}</p>
            <div className="d-flex gap-2 mt-3 flex-wrap">
              <Button
                variant="primary"
                size="sm"
                href="/workshop"
                target="_blank"
                className="d-flex align-items-center gap-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>folder</span> View Files
              </Button>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => {
                  window.open('/api/generate', '_blank');
                }}
                className="d-flex align-items-center gap-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>api</span> Browse API
              </Button>
            </div>
          </Alert>

          {/* File Tree Display */}
          {generatedFiles.length > 0 && (
            <Card className="mb-4 border-0" style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <Card.Header className="bg-transparent border-bottom border-secondary border-opacity-25 py-3">
                <strong className="text-info d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined">folder_zip</span> Generated Project Structure ({generatedFiles.length} files)
                </strong>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="p-3" style={{ background: 'rgba(15, 23, 42, 0.3)' }}>
                  <FileTreeView files={generatedFiles} />
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Results Display */}
      {result && mode === 'multi' && result.plan && (
        <Card className="shadow-lg mb-4 border-0" style={{
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}>
          <Card.Header className="bg-transparent border-bottom border-secondary border-opacity-25 py-3 d-flex justify-content-between align-items-center">
            <strong className="text-success d-flex align-items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span> Task Completed
            </strong>
            <Badge bg="light" text="dark" className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill">
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>timer</span> {result.executionTime}ms
            </Badge>
          </Card.Header>
          <Card.Body className="p-4" style={{ maxHeight: 'none', overflowY: 'visible' }}>
            {/* Agent Conversation Log */}
            {agentConversation.length > 0 && (
              <div className="mb-5">
                <h5 className="text-light mb-3 d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-primary">forum</span> Agent Collaboration Timeline
                </h5>
                <div className="p-4 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  {agentConversation.map((msg, i) => (
                    <div key={i} className="d-flex align-items-start mb-4">
                      <div className="me-3 d-flex flex-column align-items-center" style={{ minWidth: '120px' }}>
                        <Badge
                          bg={msg.agent === 'Orchestrator' ? 'primary' : 'secondary'}
                          className="w-100 py-2 mb-1"
                          style={{ background: msg.agent === 'Orchestrator' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(71, 85, 105, 0.8)' }}
                        >
                          {msg.agent}
                        </Badge>
                        {msg.executionTime && (
                          <div className="text-muted small font-monospace">
                            {msg.executionTime}ms
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1 position-relative">
                        <div className="p-3 rounded-3 position-relative" style={{
                          background: msg.agent === 'Orchestrator' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.6)',
                          border: `1px solid ${msg.agent === 'Orchestrator' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.1)'}`
                        }}>
                          <div className="text-light opacity-90">{msg.message}</div>
                        </div>
                        <small className="text-muted mt-1 d-block text-end">
                          {msg.timestamp.toLocaleTimeString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execution Plan */}
            <div className="mb-5">
              <h5 className="text-light mb-3 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-info">assignment</span> Execution Plan
              </h5>
              <Card className="border-0" style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <Card.Body className="text-light">
                  <div className="mb-3">
                    <strong className="text-info d-block mb-2">Analysis</strong>
                    <p className="opacity-75">{result.plan.analysis}</p>
                  </div>
                  <div className="d-flex gap-4">
                    <div>
                      <strong className="text-info d-block mb-2">Complexity</strong>
                      <Badge bg="info" className="px-3 py-2 rounded-pill">{result.plan.complexity}</Badge>
                    </div>
                    <div>
                      <strong className="text-info d-block mb-2">Agents Involved</strong>
                      <div className="d-flex gap-2">
                        {result.agentsUsed.map((a, i) => (
                          <Badge key={i} bg="primary" className="px-3 py-2 rounded-pill" style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd' }}>{a}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            {/* Agent Outputs */}
            <div className="mb-5">
              <h5 className="text-light mb-3 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-warning">output</span> Agent Outputs
              </h5>
              <Accordion className="custom-accordion">
                {result.result.agentOutputs.map((output, i) => (
                  <Accordion.Item key={i} eventKey={i.toString()} className="mb-3 border-0 bg-transparent">
                    <Accordion.Header>
                      <div className="d-flex align-items-center gap-3 w-100">
                        <strong>{output.agentName}</strong>
                        <Badge bg="info" className="ms-auto me-3">{output.executionTime}ms</Badge>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="p-0 mt-2">
                      <div className="p-3 rounded-bottom" style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                        <p className="mb-3 text-light"><strong className="text-info">Task:</strong> {output.task}</p>
                        <div style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                          <SyntaxHighlighter language="markdown" style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: '8px', fontSize: '0.85em', background: '#0f172a' }}>
                            {output.output}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>

            {/* Final Summary */}
            <div className="mb-4">
              <h5 className="text-light mb-3 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-success">summarize</span> Final Summary
              </h5>
              <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <SyntaxHighlighter language="markdown" style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: '8px', fontSize: '0.85em', background: '#0f172a' }}>
                  {result.result.summary}
                </SyntaxHighlighter>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Agent Visualization */}
      {result && result.result && result.result.agentOutputs && (
        <AgentVisualization agentOutputs={result.result.agentOutputs} plan={result.plan} />
      )}

      {/* Agent Performance Dashboard */}
      {showPerformanceDashboard && (
        <AgentPerformanceDashboard />
      )}

      {/* Template Library Modal */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>📚 Template Library</Modal.Title></Modal.Header>
        <Modal.Body>
          {templates.length === 0 ? (
            <Alert variant="info">No templates available yet.</Alert>
          ) : (
            <ListGroup>
              {templates.map(template => (
                <ListGroup.Item key={template.id} action onClick={() => useTemplate(template)}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6>{template.name}</h6>
                      <small className="text-muted">{template.description}</small>
                      <div className="mt-1">
                        {template.category && <Badge bg="secondary" className="me-1">{template.category}</Badge>}
                        <Badge bg="info">Used {template.usageCount} times</Badge>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>

      {/* Load Workflow Modal */}
      <Modal show={showWorkflowModal} onHide={() => setShowWorkflowModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>💾 Load Workflow</Modal.Title></Modal.Header>
        <Modal.Body>
          {workflows.length === 0 ? (
            <Alert variant="info">No saved workflows yet.</Alert>
          ) : (
            <ListGroup>
              {workflows.map(workflow => (
                <ListGroup.Item key={workflow.id} action onClick={() => loadWorkflow(workflow)}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6>{workflow.name}</h6>
                      <small className="text-muted">{workflow.description}</small>
                      <div className="mt-1">
                        <Badge bg="primary" className="me-1">{workflow.mode}</Badge>
                        <Badge bg={workflow.status === 'completed' ? 'success' : 'secondary'}>{workflow.status}</Badge>
                        {workflow.executionTime && <Badge bg="info" className="ms-1">{workflow.executionTime}ms</Badge>}
                      </div>
                      <small className="text-muted d-block mt-1">Created: {new Date(workflow.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>

      {/* Save Workflow Modal */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton><Modal.Title>💾 Save Workflow</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Workflow Name *</Form.Label>
              <Form.Control type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="Enter workflow name" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={workflowDescription} onChange={(e) => setWorkflowDescription(e.target.value)} placeholder="Optional description" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveWorkflow}>Save Workflow</Button>
        </Modal.Footer>
      </Modal>

      {/* Import Workflow Modal */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>📤 Import Workflow</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Format</Form.Label>
              <div>
                <Form.Check inline type="radio" label="JSON" value="json" checked={importFormat === 'json'} onChange={(e) => setImportFormat(e.target.value)} />
                <Form.Check inline type="radio" label="YAML" value="yaml" checked={importFormat === 'yaml'} onChange={(e) => setImportFormat(e.target.value)} />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Workflow Data</Form.Label>
              <Form.Control as="textarea" rows={10} value={importData} onChange={(e) => setImportData(e.target.value)} placeholder={`Paste your ${importFormat.toUpperCase()} workflow data here...`} style={{ fontFamily: 'monospace', fontSize: '0.9em' }} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={importWorkflow}>Import Workflow</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MultiAgentPanel;