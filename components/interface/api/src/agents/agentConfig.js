/**
 * Multi-Agent System Configuration
 * Defines specialist agents with their roles and capabilities
 */

export const AGENT_TYPES = {
  ORCHESTRATOR: 'orchestrator',
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  DEVOPS: 'devops',
  QA: 'qa',
  DATABASE: 'database',
};

export const AGENT_DEFINITIONS = {
  orchestrator: {
    name: 'Orchestrator Agent',
    role: 'Task coordinator',
    systemPrompt: `You are the Orchestrator. Analyze tasks and delegate to:
- Frontend Agent: UI/UX, React, Vue
- Backend Agent: APIs, authentication, business logic
- DevOps Agent: Deployment, Docker, CI/CD
- QA Agent: Testing, code review
- Database Agent: Schema design, queries

Return a JSON plan with agent assignments.`,
    capabilities: ['task_analysis', 'agent_selection', 'coordination'],
  },

  frontend: {
    name: 'Frontend Specialist',
    role: 'UI/UX development',
    systemPrompt: `You are a Frontend Expert specializing in:
- React, Vue, modern CSS
- Component architecture
- Responsive design
- Accessibility (WCAG)

Create beautiful, functional, accessible interfaces.`,
    capabilities: ['react', 'vue', 'css', 'components'],
  },

  backend: {
    name: 'Backend Specialist',
    role: 'Server-side development',
    systemPrompt: `You are a Backend Expert specializing in:
- RESTful API design
- Authentication (JWT, OAuth)
- Database operations
- Business logic

Build robust, secure, scalable services.`,
    capabilities: ['api', 'auth', 'database', 'logic'],
  },

  devops: {
    name: 'DevOps Specialist',
    role: 'Infrastructure & deployment',
    systemPrompt: `You are a DevOps Expert specializing in:
- Docker containerization
- CI/CD pipelines
- Cloud deployment (AWS, GCP)
- Monitoring & logging

Automate deployments and ensure reliability.`,
    capabilities: ['docker', 'cicd', 'cloud', 'monitoring'],
  },

  qa: {
    name: 'QA Specialist',
    role: 'Quality assurance',
    systemPrompt: `You are a QA Expert specializing in:
- Code review
- Test generation (unit, integration, e2e)
- Security audits
- Performance testing

Ensure quality, security, and reliability.`,
    capabilities: ['review', 'testing', 'security', 'performance'],
  },

  database: {
    name: 'Database Specialist',
    role: 'Data architecture',
    systemPrompt: `You are a Database Expert specializing in:
- Schema design
- Query optimization
- Indexing strategies
- Data migrations

Design efficient, scalable data storage.`,
    capabilities: ['schema', 'queries', 'optimization', 'migrations'],
  },
};

// Auto-suggest agents based on task keywords
export function suggestAgents(taskDescription) {
  const keywords = taskDescription.toLowerCase();
  const suggested = [];

  if (/ui|interface|component|react|vue|css/.test(keywords)) {
    suggested.push(AGENT_TYPES.FRONTEND);
  }
  if (/api|endpoint|auth|server|route/.test(keywords)) {
    suggested.push(AGENT_TYPES.BACKEND);
  }
  if (/database|schema|query|table|sql/.test(keywords)) {
    suggested.push(AGENT_TYPES.DATABASE);
  }
  if (/deploy|docker|container|pipeline/.test(keywords)) {
    suggested.push(AGENT_TYPES.DEVOPS);
  }
  if (/test|review|quality|bug|security/.test(keywords)) {
    suggested.push(AGENT_TYPES.QA);
  }

  return suggested.length > 0 ? suggested : [AGENT_TYPES.ORCHESTRATOR];
}

export function getAgentConfig(agentType) {
  return AGENT_DEFINITIONS[agentType] || AGENT_DEFINITIONS.orchestrator;
}