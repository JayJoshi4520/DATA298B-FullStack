import { useState, useEffect } from 'react';
import { Card, Container, Form, Button, Alert, Badge, Accordion, Spinner, Modal, Tab, Tabs, ButtonGroup, ListGroup, ProgressBar } from 'react-bootstrap';
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
    <Container className="mt-4 mb-5" style={{maxWidth: '1200px', height: 'auto', overflowY: 'auto'}}>
      <div className="text-center mb-4">
        <h2>🎭 Multi-Agent Collaboration System</h2>
        <p className="text-muted">Harness the power of specialist AI agents working together</p>
      </div>

      {/* Feature Toolbar */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/')}>
              ⬅️ Back to Chat
            </Button>
            <Button variant="outline-info" size="sm" onClick={() => navigate('/dashboard')}>
              📊 Dashboard
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowTemplateModal(true)}>📚 Template Library</Button>
            <Button variant="success" size="sm" onClick={() => setShowWorkflowModal(true)}>💾 Load Workflow</Button>
            <Button variant="info" size="sm" onClick={() => setShowSaveModal(true)} disabled={!task}>💾 Save Workflow</Button>
            <Button variant="warning" size="sm" onClick={() => setShowImportModal(true)}>📤 Import Workflow</Button>
            {currentWorkflowId && (
              <>
                <Button variant="secondary" size="sm" onClick={() => exportWorkflow(currentWorkflowId, 'json')}>📥 Export JSON</Button>
                <Button variant="secondary" size="sm" onClick={() => exportWorkflow(currentWorkflowId, 'yaml')}>📥 Export YAML</Button>
              </>
            )}
            <Button variant="dark" size="sm" onClick={checkGitStatus}>🔄 Git Status</Button>
            {gitStatus?.hasChanges && (
              <Button variant="success" size="sm" onClick={() => commitToGit()}>✅ Commit Changes</Button>
            )}
            <Button variant="danger" size="sm" onClick={() => runTests()} disabled={!currentWorkflowId}>🧪 Run Tests</Button>
            <Button variant="outline-primary" size="sm" onClick={seedDatabase}>🌱 Seed Database</Button>
            <Button 
              variant={showPerformanceDashboard ? "primary" : "outline-secondary"} 
              size="sm" 
              onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
            >
              📊 {showPerformanceDashboard ? 'Hide' : 'Show'} Analytics
            </Button>
          </div>
          {gitStatus && (
            <Alert variant={gitStatus.hasChanges ? 'warning' : 'success'} className="mt-2 mb-0">
              <small><strong>Git:</strong> {gitStatus.hasChanges ? `${gitStatus.changes.length} uncommitted change(s)` : 'Working directory clean'}</small>
            </Alert>
          )}
          {testResults && (
            <Alert variant={testResults.success ? 'success' : 'danger'} className="mt-2 mb-0">
              <small><strong>Tests:</strong> {testResults.status} ({testResults.duration}ms)</small>
            </Alert>
          )}
        </Card.Body>
      </Card>
      
      {/* Task Input Card */}
      <Card className="mb-4 shadow">
        <Card.Header className="bg-primary text-white">
          <strong>📝 Task Input</strong>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Development Task</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe your development task..."
                required
              />
              <Form.Text className="text-muted">
                The orchestrator will analyze and assign to specialist agents.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Execution Mode</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="🎭 Multi-Agent"
                  value="multi"
                  checked={mode === 'multi'}
                  onChange={(e) => setMode(e.target.value)}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="🤖 Single Agent"
                  value="single"
                  checked={mode === 'single'}
                  onChange={(e) => setMode(e.target.value)}
                />
              </div>
            </Form.Group>

            {mode === 'multi' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="📦 Execute with ADK (Create actual files in workspace)"
                    checked={executeWithADK}
                    onChange={(e) => setExecuteWithADK(e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    {executeWithADK 
                      ? '⚠️ Will create files in /generate folder after planning'
                      : 'Only show plan and code snippets (no files created)'}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="💾 Auto-save workflow after execution"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    {autoSaveEnabled 
                      ? '✅ Workflows will be automatically saved to history'
                      : 'Manual save only'}
                  </Form.Text>
                </Form.Group>
              </>
            )}

            <div className="mb-3">
              <small className="text-muted d-block mb-2">Quick examples:</small>
              <div className="d-flex flex-wrap gap-2">
                {exampleTasks.map((example, i) => (
                  <Button
                    key={i}
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setTask(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg">
              {loading ? '⏳ Processing...' : '🚀 Execute Task'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <strong>⚠️ Error:</strong> {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="text-center mt-4">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>Processing Your Task</h5>
            <p className="text-muted">
              {executionProgress || (
                mode === 'multi' 
                  ? 'Orchestrator is coordinating specialist agents...'
                  : 'Agent is processing your request...'
              )}
            </p>
            {executeWithADK && (
              <div className="mt-3">
                <Badge bg={executionProgress?.includes('Phase 1') ? 'info' : 'success'}>
                  Phase 1: Multi-Agent Planning
                </Badge>
                <span className="mx-2">→</span>
                <Badge bg={executionProgress?.includes('Phase 2') ? 'info' : executionProgress?.includes('Phase 3') ? 'success' : 'secondary'}>
                  Phase 2: ADK Execution
                </Badge>
                <span className="mx-2">→</span>
                <Badge bg={executionProgress?.includes('Phase 3') ? 'info' : 'secondary'}>
                  Phase 3: File Creation
                </Badge>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ADK Execution Result */}
      {result && result.mode === 'multi-agent-with-execution' && (
        <>
          <Alert variant="success" className="mb-4">
            <Alert.Heading>✅ Files Created Successfully!</Alert.Heading>
            <p>{result.message}</p>
            <div className="d-flex gap-2 mt-3 flex-wrap">
              <Button 
                variant="primary" 
                size="sm"
                href="/workshop" 
                target="_blank"
              >
                📁 View Files in Browser
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => {
                  // Link to view generated artifacts
                  window.open('/api/generate', '_blank');
                }}
              >
                🗂️ Browse Artifacts API
              </Button>
            </div>
          </Alert>

          {/* File Tree Display */}
          {generatedFiles.length > 0 && (
            <Card className="mb-4">
              <Card.Header className="bg-info text-white">
                <strong>📂 Generated Project Structure ({generatedFiles.length} files)</strong>
              </Card.Header>
              <Card.Body>
                <FileTreeView files={generatedFiles} />
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Results Display */}
      {result && mode === 'multi' && result.plan && (
        <Card className="shadow mb-4">
          <Card.Header className="bg-success text-white">
            <strong>✅ Task Completed</strong>
            <Badge bg="light" text="dark" className="ms-2">
              {result.executionTime}ms
            </Badge>
          </Card.Header>
          <Card.Body style={{maxHeight: 'none', overflowY: 'visible'}}>
            {/* Agent Conversation Log */}
            {agentConversation.length > 0 && (
              <div className="mb-4">
                <h5>🗣️ Agent Collaboration Timeline</h5>
                <Card className="mb-3">
                  <Card.Body>
                    {agentConversation.map((msg, i) => (
                      <div key={i} className="d-flex align-items-start mb-3">
                        <div className="me-3" style={{ minWidth: '120px' }}>
                          <Badge 
                            bg={msg.agent === 'Orchestrator' ? 'primary' : 'secondary'}
                            className="w-100"
                          >
                            {msg.agent}
                          </Badge>
                          {msg.executionTime && (
                            <div className="text-muted" style={{ fontSize: '0.75em' }}>
                              {msg.executionTime}ms
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="bg-light p-2 rounded">
                            {msg.message}
                          </div>
                          <small className="text-muted">
                            {msg.timestamp.toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </div>
            )}

            {/* Execution Plan */}
            <div className="mb-4">
              <h5>📋 Execution Plan</h5>
              <Card className="mb-3" style={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6' }}>
                <Card.Body style={{ color: '#212529' }}>
                  <p className="mb-2"><strong>Analysis:</strong> {result.plan.analysis}</p>
                  <p className="mb-2"><strong>Complexity:</strong> <Badge bg="info">{result.plan.complexity}</Badge></p>
                  <p className="mb-0"><strong>Agents:</strong> {result.agentsUsed.map((a, i) => (
                    <Badge key={i} bg="primary" className="ms-1">{a}</Badge>
                  ))}</p>
                </Card.Body>
              </Card>
            </div>

            {/* Agent Outputs */}
            <div className="mb-4">
              <h5>🎯 Agent Outputs</h5>
              <Accordion className="mb-3">
              {result.result.agentOutputs.map((output, i) => (
                <Accordion.Item key={i} eventKey={i.toString()}>
                  <Accordion.Header>
                    <strong>{output.agentName}</strong>
                    <Badge bg="info" className="ms-2">{output.executionTime}ms</Badge>
                  </Accordion.Header>
                  <Accordion.Body>
                    <p className="mb-3"><strong>Task:</strong> {output.task}</p>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      <SyntaxHighlighter language="markdown" style={vscDarkPlus} customStyle={{ borderRadius: '8px', fontSize: '0.85em' }}>
                        {output.output}
                      </SyntaxHighlighter>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
              </Accordion>
            </div>

            {/* Final Summary */}
            <div className="mb-4">
              <h5>📊 Final Summary</h5>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <SyntaxHighlighter language="sql" style={vscDarkPlus} customStyle={{ borderRadius: '8px', fontSize: '0.85em' }}>
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