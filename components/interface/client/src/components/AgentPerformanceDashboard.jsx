import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AgentPerformanceDashboard = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Fetch workflows with agent outputs
      const response = await fetch('/api/workflows?status=completed&limit=100');
      const data = await response.json();
      const workflows = data.workflows || [];

      // Calculate metrics
      const metrics = calculateMetrics(workflows);
      setPerformanceData(metrics);
    } catch (err) {
      console.error('Failed to load performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (workflows) => {
    const agentStats = {};
    const dailyStats = {};

    workflows.forEach(workflow => {
      if (!workflow.result?.agentOutputs) return;

      const date = new Date(workflow.createdAt).toLocaleDateString();
      if (!dailyStats[date]) dailyStats[date] = { date, totalTime: 0, count: 0 };

      workflow.result.agentOutputs.forEach(output => {
        const agentName = output.agentName;
        
        if (!agentStats[agentName]) {
          agentStats[agentName] = {
            name: agentName,
            totalTime: 0,
            count: 0,
            successCount: 0,
            avgTime: 0
          };
        }

        agentStats[agentName].count++;
        agentStats[agentName].totalTime += output.executionTime || 0;
        agentStats[agentName].successCount++;
        
        dailyStats[date].totalTime += output.executionTime || 0;
        dailyStats[date].count++;
      });
    });

    // Calculate averages
    Object.keys(agentStats).forEach(agent => {
      agentStats[agent].avgTime = Math.round(agentStats[agent].totalTime / agentStats[agent].count);
      agentStats[agent].successRate = Math.round((agentStats[agent].successCount / agentStats[agent].count) * 100);
    });

    // Convert to arrays for charts
    const agentArray = Object.values(agentStats).sort((a, b) => b.count - a.count);
    const dailyArray = Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-14);

    dailyArray.forEach(day => {
      day.avgTime = Math.round(day.totalTime / day.count);
    });

    return {
      agents: agentArray,
      daily: dailyArray,
      totalWorkflows: workflows.length,
      totalAgentRuns: agentArray.reduce((sum, a) => sum + a.count, 0),
      avgWorkflowTime: workflows.reduce((sum, w) => sum + (w.executionTime || 0), 0) / (workflows.length || 1)
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading performance data...</p>
        </Card.Body>
      </Card>
    );
  }

  if (!performanceData || performanceData.agents.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Header className="bg-info text-white">
          <strong>📊 Agent Performance Dashboard</strong>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            No performance data available yet. Execute some workflows to see metrics!
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  const topPerformer = performanceData.agents.reduce((prev, current) => 
    (prev.avgTime < current.avgTime) ? prev : current
  );

  const mostUsed = performanceData.agents[0];

  return (
    <div className="mb-4">
      <Card className="mb-4">
        <Card.Header className="bg-info text-white">
          <strong>📊 Agent Performance Dashboard</strong>
          <Badge bg="light" text="dark" className="ms-2">
            {performanceData.totalWorkflows} workflows analyzed
          </Badge>
        </Card.Header>
        <Card.Body>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">Total Agent Runs</h6>
                  <h3 className="text-primary">{performanceData.totalAgentRuns}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">Avg Workflow Time</h6>
                  <h3 className="text-success">{Math.round(performanceData.avgWorkflowTime)}ms</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">⚡ Fastest Agent</h6>
                  <h3 className="text-warning" style={{ fontSize: '1.2rem' }}>{topPerformer.name}</h3>
                  <small className="text-muted">{topPerformer.avgTime}ms avg</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">🔥 Most Used</h6>
                  <h3 className="text-danger" style={{ fontSize: '1.2rem' }}>{mostUsed.name}</h3>
                  <small className="text-muted">{mostUsed.count} runs</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row 1 */}
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>⚡ Average Execution Time by Agent</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData.agents}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="avgTime" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>📈 Agent Usage Distribution</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={performanceData.agents}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.name}: ${entry.count}`}
                      >
                        {performanceData.agents.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row 2 */}
          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header>📊 Performance Trend (Last 14 Days)</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'Avg Time (ms)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="avgTime" stroke="#8884d8" strokeWidth={2} name="Avg Execution Time" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Agent Details Table */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>🏆 Agent Performance Leaderboard</Card.Header>
                <Card.Body>
                  <Table striped hover responsive>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Agent</th>
                        <th>Total Runs</th>
                        <th>Avg Time</th>
                        <th>Total Time</th>
                        <th>Success Rate</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData.agents
                        .sort((a, b) => a.avgTime - b.avgTime)
                        .map((agent, index) => (
                        <tr key={agent.name}>
                          <td>
                            {index === 0 && '🥇 '}
                            {index === 1 && '🥈 '}
                            {index === 2 && '🥉 '}
                            {index + 1}
                          </td>
                          <td><strong>{agent.name}</strong></td>
                          <td><Badge bg="primary">{agent.count}</Badge></td>
                          <td><Badge bg="info">{agent.avgTime}ms</Badge></td>
                          <td>{agent.totalTime.toLocaleString()}ms</td>
                          <td>
                            <Badge bg={agent.successRate === 100 ? 'success' : 'warning'}>
                              {agent.successRate}%
                            </Badge>
                          </td>
                          <td>
                            {agent.avgTime < 2000 && <Badge bg="success">⚡ Fast</Badge>}
                            {agent.avgTime >= 2000 && agent.avgTime < 5000 && <Badge bg="warning">⏱️ Normal</Badge>}
                            {agent.avgTime >= 5000 && <Badge bg="danger">🐌 Slow</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AgentPerformanceDashboard;