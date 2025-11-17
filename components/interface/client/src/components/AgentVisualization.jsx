import { useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from 'react-bootstrap';

const AgentVisualization = ({ agentOutputs = [], plan = null }) => {
  // Convert agent outputs to nodes and edges
  const convertToNodes = () => {
    if (!agentOutputs || agentOutputs.length === 0) return [];

    const nodes = [];
    
    // Add orchestrator node
    nodes.push({
      id: 'orchestrator',
      type: 'input',
      data: { label: '🎭 Orchestrator' },
      position: { x: 250, y: 0 },
      style: { 
        background: '#6366f1', 
        color: 'white', 
        border: '1px solid #4f46e5',
        borderRadius: '10px',
        padding: '10px',
        fontWeight: 'bold'
      }
    });

    // Add agent nodes
    const agentIcons = {
      'Frontend Specialist': '🎨',
      'Backend Specialist': '⚙️',
      'DevOps Specialist': '🐳',
      'QA Specialist': '✅',
      'Database Specialist': '🗃️',
      'Security Specialist': '🔒'
    };

    agentOutputs.forEach((output, index) => {
      const icon = agentIcons[output.agentName] || '🤖';
      const xOffset = (index % 3) * 250;
      const yOffset = Math.floor(index / 3) * 150 + 150;

      nodes.push({
        id: `agent-${index}`,
        data: { 
          label: (
            <div>
              <div style={{ fontSize: '1.5em' }}>{icon}</div>
              <div style={{ fontSize: '0.9em' }}>{output.agentName}</div>
              <div style={{ fontSize: '0.7em', opacity: 0.8 }}>{output.executionTime}ms</div>
            </div>
          )
        },
        position: { x: xOffset + 100, y: yOffset },
        style: {
          background: '#10b981',
          color: 'white',
          border: '2px solid #059669',
          borderRadius: '10px',
          padding: '15px',
          textAlign: 'center',
          minWidth: '150px'
        }
      });
    });

    // Add summary node
    nodes.push({
      id: 'summary',
      type: 'output',
      data: { label: '📊 Final Summary' },
      position: { x: 250, y: (Math.ceil(agentOutputs.length / 3) * 150) + 200 },
      style: {
        background: '#f59e0b',
        color: 'white',
        border: '1px solid #d97706',
        borderRadius: '10px',
        padding: '10px',
        fontWeight: 'bold'
      }
    });

    return nodes;
  };

  const convertToEdges = () => {
    if (!agentOutputs || agentOutputs.length === 0) return [];

    const edges = [];
    
    // Connect orchestrator to all agents
    agentOutputs.forEach((output, index) => {
      edges.push({
        id: `orch-agent-${index}`,
        source: 'orchestrator',
        target: `agent-${index}`,
        animated: true,
        style: { stroke: '#6366f1' }
      });
    });

    // Connect all agents to summary
    agentOutputs.forEach((output, index) => {
      edges.push({
        id: `agent-summary-${index}`,
        source: `agent-${index}`,
        target: 'summary',
        animated: false,
        style: { stroke: '#10b981' }
      });
    });

    return edges;
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(convertToNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(convertToEdges());

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  if (!agentOutputs || agentOutputs.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center text-muted">
          <p>No agent data to visualize</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header className="bg-info text-white">
        <strong>📊 Agent Workflow Visualization</strong>
      </Card.Header>
      <Card.Body style={{ height: '600px', padding: 0 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'input': return '#6366f1';
                case 'output': return '#f59e0b';
                default: return '#10b981';
              }
            }}
          />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </Card.Body>
    </Card>
  );
};

export default AgentVisualization;