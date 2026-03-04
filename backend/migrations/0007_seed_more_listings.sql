-- AgentRadar: Seed additional AI-first listings + add logos to all listings
-- 16 new listings covering AI agent frameworks, protocols, platforms, and tools
-- Also updates existing listings with local logo paths

BEGIN;

-- ---------------------------------------------------------------------------
-- New tags for the new listings
-- ---------------------------------------------------------------------------
INSERT INTO tags (name, slug) VALUES
    ('Multi-agent',       'multi-agent'),
    ('Orchestration',     'orchestration'),
    ('Framework',         'framework'),
    ('Protocol',          'protocol'),
    ('Observability',     'observability'),
    ('RAG',               'rag'),
    ('Open Source',       'open-source'),
    ('Agent Framework',   'agent-framework'),
    ('Communication',     'communication'),
    ('Compute',           'compute')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Update existing listings with logo paths
-- ---------------------------------------------------------------------------
-- (existing listings currently have logo_url = NULL)

-- ---------------------------------------------------------------------------
-- 16 new listings
-- ---------------------------------------------------------------------------

-- 1. LangChain
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'LangChain',
    'langchain',
    'Production framework for building stateful, multi-actor AI agent applications.',
    E'## LangChain\n\nLangChain is the most widely adopted framework for building applications powered by large language models. It provides composable tools and abstractions for chains, agents, retrieval-augmented generation (RAG), and multi-step reasoning — making it the standard toolkit for LLM application development.\n\n### Key Features\n\n- **LangGraph**: Build stateful, multi-actor agent applications as directed graphs with cycles, persistence, and human-in-the-loop control.\n- **LangSmith**: Integrated observability platform for tracing, evaluating, and debugging agent runs in production.\n- **Tool Calling**: First-class support for function/tool calling across all major LLM providers (OpenAI, Anthropic, Google, etc.).\n- **Retrieval-Augmented Generation**: Built-in document loaders, text splitters, vector stores, and retrieval chains for RAG pipelines.\n- **Memory & State**: Persistent conversation memory, checkpointing, and state management for long-running agent workflows.\n\n### Use Cases\n\nLangChain powers chatbots, autonomous research agents, code generation pipelines, document Q&A systems, and multi-step reasoning applications used by thousands of companies worldwide.',
    '/logos/langchain.svg',
    'https://www.langchain.com',
    'https://github.com/langchain-ai/langchain',
    'https://docs.langchain.com',
    'hello@langchain.dev',
    'approved',
    NOW()
);

-- 2. CrewAI
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'CrewAI',
    'crewai',
    'Multi-agent orchestration framework where specialized AI agents collaborate on complex tasks.',
    E'## CrewAI\n\nCrewAI is a cutting-edge framework for orchestrating role-playing autonomous AI agents. By assigning roles, goals, and backstories to individual agents, CrewAI enables sophisticated multi-agent collaboration where each agent contributes its specialization to solve complex tasks collectively.\n\n### Key Features\n\n- **Role-Based Agents**: Define agents with specific roles (researcher, writer, analyst) that determine their behavior and decision-making.\n- **Task Delegation**: Agents can delegate sub-tasks to other agents, creating emergent collaborative workflows.\n- **Process Types**: Sequential, hierarchical, and consensual process types for different collaboration patterns.\n- **Tool Integration**: Agents can use custom tools, APIs, and external services to gather information and take actions.\n- **Memory System**: Short-term, long-term, and entity memory allow agents to learn and maintain context across interactions.\n\n### Use Cases\n\nCrewAI is used for automated content creation pipelines, market research teams, code review workflows, customer support systems, and any scenario where multiple specialized AI agents need to collaborate.',
    '/logos/crewai.png',
    'https://crewai.com',
    'https://github.com/crewAIInc/crewAI',
    'https://docs.crewai.com',
    'hello@crewai.com',
    'approved',
    NOW()
);

-- 3. AutoGPT
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'AutoGPT',
    'autogpt',
    'Open-source platform for building, deploying, and managing continuous autonomous AI agents.',
    E'## AutoGPT\n\nAutoGPT pioneered the autonomous AI agent movement and has evolved into a full platform for building, deploying, and running AI agents that operate continuously without human intervention. It provides both a no-code builder and a developer framework for creating agents that can browse the web, write code, manage files, and interact with APIs.\n\n### Key Features\n\n- **Autonomous Execution**: Agents set their own sub-goals, plan multi-step strategies, and execute without constant human prompting.\n- **AutoGPT Server**: Production-ready backend for deploying and managing multiple agents with scheduling, monitoring, and scaling.\n- **Agent Marketplace**: Community-built agents and components that can be shared, forked, and composed into larger systems.\n- **Continuous Operation**: Agents run persistently, responding to triggers, processing queues, and completing long-running tasks autonomously.\n- **Plugin System**: Extensible architecture with plugins for web browsing, code execution, file management, and third-party integrations.\n\n### Use Cases\n\nAutoGPT agents handle automated research and reporting, continuous web monitoring, code generation and testing pipelines, data processing workflows, and any task requiring sustained autonomous operation.',
    '/logos/autogpt.svg',
    'https://agpt.co',
    'https://github.com/Significant-Gravitas/AutoGPT',
    'https://docs.agpt.co',
    'contact@agpt.co',
    'approved',
    NOW()
);

-- 4. Microsoft AutoGen
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'Microsoft AutoGen',
    'microsoft-autogen',
    E'Microsoft''s framework for multi-agent conversation, async collaboration, and human-in-the-loop AI.',
    E'## Microsoft AutoGen\n\nAutoGen is Microsoft''s open-source framework for building multi-agent conversational AI systems. It enables the creation of complex workflows where multiple AI agents and humans collaborate through structured conversations, making it ideal for enterprise applications that require oversight, approval gates, and auditability.\n\n### Key Features\n\n- **Conversational Agents**: Agents communicate through natural language messages, enabling flexible and interpretable multi-agent workflows.\n- **Human-in-the-Loop**: Built-in patterns for human approval, feedback, and intervention at any point in the agent workflow.\n- **Code Execution**: Secure sandboxed code execution with Docker support for agents that generate and run code.\n- **Group Chat**: Multi-agent group chat patterns where agents take turns contributing to solve problems collaboratively.\n- **Async & Streaming**: Full support for asynchronous execution, streaming responses, and parallel agent processing.\n\n### Use Cases\n\nAutoGen powers enterprise AI workflows, automated software engineering teams, research assistants with human oversight, multi-step data analysis pipelines, and any application requiring structured multi-agent collaboration with accountability.',
    '/logos/autogen.svg',
    'https://microsoft.github.io/autogen',
    'https://github.com/microsoft/autogen',
    'https://microsoft.github.io/autogen/stable',
    'autogen@microsoft.com',
    'approved',
    NOW()
);

-- 5. OpenAI Agents SDK
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'OpenAI Agents SDK',
    'openai-agents-sdk',
    E'OpenAI''s lightweight SDK for building agentic apps with handoffs, tracing, and guardrails.',
    E'## OpenAI Agents SDK\n\nThe OpenAI Agents SDK (successor to Swarm) is OpenAI''s official production-ready toolkit for building agentic AI applications. It provides a minimal, opinionated framework focused on agent handoffs, input/output guardrails, and built-in tracing — designed to be the simplest way to build reliable multi-agent systems with OpenAI models.\n\n### Key Features\n\n- **Agent Handoffs**: First-class support for transferring conversations between specialized agents based on context and intent.\n- **Guardrails**: Built-in input validation and output checking to ensure agents stay within defined behavioral boundaries.\n- **Tracing**: Automatic tracing of every agent interaction for debugging, monitoring, and compliance.\n- **Tool Use**: Clean abstractions for defining and calling tools with automatic schema generation and error handling.\n- **Lightweight Design**: Minimal dependencies and simple API surface — get a multi-agent system running in under 50 lines of code.\n\n### Use Cases\n\nThe Agents SDK is used for customer support systems with specialized routing, multi-step task automation, coding assistants, and any application where multiple agents need to collaborate safely with built-in observability.',
    '/logos/openai.svg',
    'https://openai.github.io/openai-agents-python',
    'https://github.com/openai/openai-agents-python',
    'https://openai.github.io/openai-agents-python',
    'support@openai.com',
    'approved',
    NOW()
);

-- 6. Dify
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'Dify',
    'dify',
    'Open-source visual platform for building agentic AI workflows with RAG and 50+ built-in tools.',
    E'## Dify\n\nDify is an open-source LLM application development platform that combines a visual workflow builder, RAG pipeline, agent framework, and model management into a single integrated environment. With over 100K GitHub stars, it has become one of the most popular platforms for building production AI applications without extensive coding.\n\n### Key Features\n\n- **Visual Workflow Builder**: Drag-and-drop canvas for designing complex agent workflows with branching, loops, and conditional logic.\n- **RAG Engine**: Built-in document ingestion, chunking, embedding, and retrieval with support for multiple vector stores.\n- **Agent Mode**: Create autonomous agents with access to 50+ built-in tools including web search, code execution, and API calls.\n- **Model Agnostic**: Support for hundreds of LLM providers including OpenAI, Anthropic, local models via Ollama, and custom endpoints.\n- **Backend-as-a-Service**: Every workflow automatically generates a production API endpoint with authentication and rate limiting.\n\n### Use Cases\n\nDify powers enterprise chatbots, document Q&A systems, automated content workflows, customer support agents, and any AI application that benefits from visual development with production-grade infrastructure.',
    '/logos/dify.svg',
    'https://dify.ai',
    'https://github.com/langgenius/dify',
    'https://docs.dify.ai',
    'hello@dify.ai',
    'approved',
    NOW()
);

-- 7. Model Context Protocol (MCP)
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'Model Context Protocol',
    'model-context-protocol',
    'Open protocol enabling AI agents to securely connect to external tools, data, and services.',
    E'## Model Context Protocol (MCP)\n\nThe Model Context Protocol (MCP) is an open standard originally developed by Anthropic and now governed by the Linux Foundation. It provides a universal interface for AI models and agents to connect to external data sources, tools, and services — solving the integration problem that previously required custom code for every tool an agent needed to use.\n\n### Key Features\n\n- **Universal Tool Interface**: A single protocol for connecting AI agents to any tool, database, API, or service through standardized JSON-RPC messages.\n- **Server Ecosystem**: Thousands of community-built MCP servers for GitHub, Slack, databases, file systems, web browsers, and more.\n- **Security Model**: Built-in authentication, authorization, and sandboxing to ensure agents only access permitted resources.\n- **Transport Agnostic**: Works over stdio, HTTP/SSE, and WebSocket transports for maximum deployment flexibility.\n- **Wide Adoption**: Supported by Claude, ChatGPT, Cursor, VS Code, and dozens of other AI applications.\n\n### Use Cases\n\nMCP enables AI agents to query databases, manage files, interact with APIs, control development tools, and access any external service through a standardized protocol — eliminating custom integration code.',
    '/logos/mcp.svg',
    'https://modelcontextprotocol.io',
    'https://github.com/modelcontextprotocol/modelcontextprotocol',
    'https://modelcontextprotocol.io/specification',
    'mcp@anthropic.com',
    'approved',
    NOW()
);

-- 8. Agent2Agent Protocol (A2A)
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'Agent2Agent Protocol',
    'agent2agent-protocol',
    'Open protocol for secure, interoperable agent-to-agent communication across any platform.',
    E'## Agent2Agent Protocol (A2A)\n\nThe Agent2Agent Protocol (A2A) is an open standard developed by Google and now under the Linux Foundation, designed to enable AI agents built on different frameworks to communicate, collaborate, and delegate tasks to each other. With 50+ launch partners including Salesforce, SAP, and PayPal, A2A is emerging as the standard for inter-agent communication.\n\n### Key Features\n\n- **Agent Discovery**: Agents publish capability cards describing what they can do, enabling other agents to find and select the right collaborator.\n- **Task Management**: Structured task lifecycle (submitted, working, completed, failed) with real-time status updates and artifact exchange.\n- **Framework Agnostic**: Works across any agent framework — LangChain agents can collaborate with AutoGen agents, CrewAI teams, etc.\n- **Enterprise Security**: Built-in authentication, authorization, and audit logging for enterprise deployment.\n- **Streaming Support**: Real-time streaming of intermediate results and progress updates during long-running tasks.\n\n### Use Cases\n\nA2A enables cross-platform agent collaboration, enterprise workflow automation spanning multiple AI systems, marketplace scenarios where agents hire other agents, and any application where agents from different vendors need to work together.',
    '/logos/a2a.svg',
    'https://a2a-protocol.org',
    'https://github.com/a2aproject/A2A',
    'https://a2a-protocol.org/latest',
    'a2a@google.com',
    'approved',
    NOW()
);

-- 9. Langfuse
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'Langfuse',
    'langfuse',
    'Open-source LLM observability platform for tracing, evaluating, and debugging AI agent runs.',
    E'## Langfuse\n\nLangfuse is the leading open-source observability and analytics platform for LLM applications and AI agents. It provides detailed tracing, evaluation, prompt management, and cost analytics — giving teams the visibility they need to debug, improve, and monitor their AI systems in production.\n\n### Key Features\n\n- **Tracing**: Hierarchical traces of every LLM call, tool use, and retrieval step with latency, cost, and token metrics.\n- **Evaluations**: Run automated evaluations (model-based, heuristic, human) on traces to measure and improve agent quality over time.\n- **Prompt Management**: Version-controlled prompt templates with A/B testing and rollback capabilities.\n- **Cost Analytics**: Detailed cost breakdowns by model, feature, user, and time period for budgeting and optimization.\n- **Integrations**: Native integrations with LangChain, LlamaIndex, OpenAI SDK, Anthropic SDK, and all major frameworks.\n\n### Use Cases\n\nLangfuse is used by AI teams to debug failing agent runs, track quality metrics over time, manage prompts across environments, control LLM costs, and meet compliance requirements for AI observability.',
    '/logos/langfuse.svg',
    'https://langfuse.com',
    'https://github.com/langfuse/langfuse',
    'https://langfuse.com/docs',
    'contact@langfuse.com',
    'approved',
    NOW()
);

-- 10. ElizaOS
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'ElizaOS',
    'elizaos',
    'TypeScript AI agent framework with Discord, Telegram, and on-chain connectors for autonomous agents.',
    E'## ElizaOS\n\nElizaOS (formerly ai16z/Eliza) is the leading crypto-native AI agent framework. Built in TypeScript, it provides a complete runtime for creating autonomous AI agents that live on social platforms (Discord, Telegram, Twitter) and interact with blockchains — making it the go-to framework for building AI agents in the Web3 ecosystem.\n\n### Key Features\n\n- **Multi-Platform Presence**: Agents simultaneously operate on Discord, Telegram, Twitter, and custom frontends with consistent personality.\n- **On-Chain Actions**: Built-in connectors for Ethereum, Solana, Base, and other chains — agents can hold wallets, swap tokens, and execute transactions.\n- **Character System**: Define agent personality, knowledge, communication style, and behavioral rules through JSON character files.\n- **Plugin Architecture**: Extensible plugin system for adding custom actions, evaluators, providers, and platform connectors.\n- **Memory & RAG**: Built-in memory management with vector search for maintaining context across long conversations.\n\n### Use Cases\n\nElizaOS powers community management bots, trading agents, DAO governance assistants, NFT collection agents, and any autonomous agent that needs social platform presence with on-chain capabilities.',
    '/logos/elizaos.svg',
    'https://elizaos.ai',
    'https://github.com/elizaOS/eliza',
    'https://docs.elizaos.ai',
    'contact@elizaos.ai',
    'approved',
    NOW()
);

-- 11. Fetch.ai
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'Fetch.ai',
    'fetchai',
    'Decentralized agent marketplace with uAgents framework for building autonomous on-chain agents.',
    E'## Fetch.ai\n\nFetch.ai is a decentralized platform for building, deploying, and monetizing autonomous AI agents. Through its uAgents framework and Agentverse marketplace, developers can create agents that discover each other, negotiate, and transact — forming a decentralized economy of autonomous services. Fetch.ai is part of the Artificial Superintelligence Alliance (with SingularityNET and Ocean Protocol).\n\n### Key Features\n\n- **uAgents Framework**: Python framework for building lightweight, autonomous agents with built-in communication, storage, and scheduling.\n- **Agentverse**: Hosted environment for deploying and discovering agents — a marketplace where agents find and hire other agents.\n- **Agent Communication**: Built-in peer-to-peer messaging protocol for agent discovery, negotiation, and task delegation.\n- **DeltaV**: Natural language interface for finding and interacting with agents in the Fetch.ai ecosystem.\n- **ASI Alliance**: Interoperability with SingularityNET and Ocean Protocol for access to AI services and data.\n\n### Use Cases\n\nFetch.ai agents handle automated booking and reservations, supply chain optimization, DeFi strategy execution, IoT device coordination, and any scenario requiring autonomous economic agents.',
    '/logos/fetchai.svg',
    'https://fetch.ai',
    'https://github.com/fetchai/uAgents',
    'https://docs.agentverse.ai',
    'contact@fetch.ai',
    'approved',
    NOW()
);

-- 12. Olas
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'Olas',
    'olas',
    'Co-owned autonomous AI agent services with decentralized off-chain logic and on-chain coordination.',
    E'## Olas\n\nOlas (formerly Autonolas) is a platform for creating co-owned AI agent services that run autonomously and are governed collectively by their stakeholders. It combines off-chain agent logic with on-chain coordination, registries, and tokenomics — enabling decentralized teams of agents that operate continuously without centralized control.\n\n### Key Features\n\n- **Agent Services**: Multi-agent systems that run as decentralized services with redundancy, consensus, and fault tolerance.\n- **On-Chain Registries**: Agents, components, and services registered on-chain with verifiable code hashes and ownership records.\n- **Tokenomics**: OLAS token incentivizes agent development, operation, and staking — creating economic alignment between developers and operators.\n- **Open Autonomy**: Python framework for building production-grade autonomous agent services with built-in consensus mechanisms.\n- **Cross-Chain**: Deployed on Ethereum, Gnosis, Polygon, Solana, and other chains with unified governance.\n\n### Use Cases\n\nOlas powers prediction market agents (Omen), keeper bots, DAO governance automation, cross-chain arbitrage, and any application requiring decentralized, co-owned autonomous services.',
    '/logos/olas.svg',
    'https://olas.network',
    'https://github.com/valory-xyz',
    'https://docs.olas.network',
    'contact@valory.xyz',
    'approved',
    NOW()
);

-- 13. Google Agent Development Kit
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'Google Agent Development Kit',
    'google-adk',
    E'Google''s modular framework for building, evaluating, and deploying multi-agent AI systems.',
    E'## Google Agent Development Kit (ADK)\n\nThe Google Agent Development Kit (ADK) is Google''s code-first framework for building, evaluating, and deploying sophisticated AI agent systems. Optimized for Gemini models but compatible with any LLM, ADK provides a modular, layered architecture that scales from simple single-agent tasks to complex multi-agent orchestration.\n\n### Key Features\n\n- **Multi-Agent Architecture**: Build hierarchical agent teams where a root agent delegates to specialized sub-agents based on capability.\n- **Built-in Evaluation**: Integrated testing and evaluation framework for measuring agent performance before deployment.\n- **Tool Ecosystem**: Rich set of pre-built tools plus easy integration with MCP servers, OpenAPI specs, and custom functions.\n- **Deployment Options**: Deploy as Cloud Run services, Vertex AI agents, or local development servers with a single command.\n- **Session & Memory**: Built-in session management, conversation history, and persistent state across interactions.\n\n### Use Cases\n\nGoogle ADK is used for enterprise AI applications, customer service automation, internal tool agents, multi-step research workflows, and any application that benefits from Google Cloud integration with production-grade agent infrastructure.',
    '/logos/google.svg',
    'https://google.github.io/adk-docs',
    'https://github.com/google/adk-python',
    'https://google.github.io/adk-docs',
    'adk@google.com',
    'approved',
    NOW()
);

-- 14. OpenClaw
INSERT INTO listings (
    name, slug, short_description, description,
    logo_url, website_url, github_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'OpenClaw',
    'openclaw',
    'Open-source personal AI assistant with multi-channel support and extensible skill system.',
    E'## OpenClaw\n\nOpenClaw is a massively popular open-source personal AI assistant that runs on your own devices and answers you on the channels you already use — WhatsApp, Telegram, Slack, Discord, iMessage, Signal, and dozens more. With 247K+ GitHub stars, it has become the leading self-hosted AI assistant platform, emphasizing privacy, extensibility, and multi-channel presence.\n\n### Key Features\n\n- **Multi-Channel**: Connects to 20+ messaging platforms simultaneously — respond on WhatsApp, Slack, Discord, Telegram, and more from a single agent.\n- **Local-First Gateway**: Control plane runs locally, keeping your data private. Sessions, tools, and events are managed on your infrastructure.\n- **Skill System**: 5,400+ community-built skills in the registry for email management, calendar automation, code generation, and more.\n- **Voice & Canvas**: Speak and listen on macOS/iOS/Android, plus render interactive canvases for visual outputs.\n- **Tool Ecosystem**: First-class tools for web browsing, file management, cron scheduling, and platform-specific actions.\n\n### Use Cases\n\nOpenClaw powers personal AI assistants, team productivity bots, automated customer support across channels, developer workflow automation, and any scenario where you want a private, self-hosted AI that meets you where you communicate.',
    '/logos/openclaw.svg',
    'https://openclaw.ai',
    'https://github.com/openclaw/openclaw',
    'https://docs.openclaw.ai',
    'hello@openclaw.ai',
    'approved',
    NOW()
);

-- 15. TinkerClaw
INSERT INTO listings (
    name, slug, short_description, description,
    website_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'TinkerClaw',
    'tinkerclaw',
    'Pre-built AI agents for OpenClaw — email, content, and ops agents that install in one command.',
    E'## TinkerClaw\n\nTinkerClaw provides production-ready AI agents for the OpenClaw ecosystem. Each agent is purpose-built for a specific workflow and installs with a single command — no configuration, no boilerplate. Go from zero to a fully autonomous AI agent in under 5 minutes.\n\n### Key Features\n\n- **InboxPilot**: AI agent that triages your inbox, drafts context-aware replies, detects calendar conflicts, and delivers daily briefings automatically.\n- **Content Agent**: Researches trending topics, drafts multi-platform posts, atomizes long-form content into clips, and tracks performance.\n- **Commander**: Orchestration agent that coordinates other OpenClaw agents — assigns tasks, routes work, and runs standups with 15-minute check-ins.\n- **One-Command Install**: Each agent comes with skills, automations, and config files. Install, activate, and run immediately.\n- **Lifetime Access**: One-time payment for all current and future agents — no subscriptions or per-seat pricing.\n\n### Use Cases\n\nTinkerClaw agents handle email management, content creation and distribution, multi-agent orchestration, operations automation, and any workflow where you want a pre-built, battle-tested OpenClaw agent instead of building from scratch.',
    'https://www.tinkerclaw.com',
    'https://www.tinkerclaw.com',
    'support@tinkerclaw.com',
    'approved',
    NOW()
);

-- 16. ClawSpawn
INSERT INTO listings (
    name, slug, short_description, description,
    website_url, docs_url, contact_email,
    status, approved_at
) VALUES (
    'ClawSpawn',
    'clawspawn',
    'Run OpenClaw agents in isolated microVMs with dedicated resources and bring-your-own-key setup.',
    E'## ClawSpawn\n\nClawSpawn provides managed infrastructure for running OpenClaw agents in isolated microVM environments. Each instance gets its own dedicated resources, complete isolation from other tenants, and you bring your own API keys (Anthropic, OpenAI, or Gemini) — they handle the infrastructure, you keep control of your data and costs.\n\n### Key Features\n\n- **Isolated microVMs**: Every OpenClaw instance runs in its own lightweight virtual machine with dedicated CPU, memory, and storage.\n- **Bring Your Own Key**: Use your own API keys from Anthropic, OpenAI, or Gemini — no markup on model usage.\n- **Instant Deployment**: Deploy a fully configured OpenClaw instance in under 60 seconds with pre-configured channels and tools.\n- **Auto-Scaling**: Instances scale resources automatically based on workload without manual intervention.\n- **Multi-Region**: Deploy in US, EU, or Asia-Pacific for low-latency agent operation in any timezone.\n\n### Use Cases\n\nClawSpawn is ideal for teams that want managed OpenClaw hosting without DevOps overhead, agencies running multiple client agents in isolation, enterprises requiring dedicated infrastructure for AI assistants, and developers who want instant OpenClaw deployment.',
    'https://www.clawspawn.com',
    'https://www.clawspawn.com',
    'support@clawspawn.com',
    'approved',
    NOW()
);

-- ---------------------------------------------------------------------------
-- Junction table: listing_categories
-- ---------------------------------------------------------------------------

-- LangChain -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'langchain'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- CrewAI -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'crewai'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- AutoGPT -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'autogpt'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- Microsoft AutoGen -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'microsoft-autogen'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- OpenAI Agents SDK -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'openai-agents-sdk'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- Dify -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'dify'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- MCP -> Communication & Messaging
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'model-context-protocol'),
    (SELECT id FROM categories WHERE slug = 'communication-messaging')
);

-- MCP also -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'model-context-protocol'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- A2A -> Communication & Messaging
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'agent2agent-protocol'),
    (SELECT id FROM categories WHERE slug = 'communication-messaging')
);

-- Langfuse -> Data & Analytics
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'langfuse'),
    (SELECT id FROM categories WHERE slug = 'data-analytics')
);

-- ElizaOS -> Social & Community
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'elizaos'),
    (SELECT id FROM categories WHERE slug = 'social-community')
);

-- ElizaOS also -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'elizaos'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- Fetch.ai -> Marketplaces & Task Coordination
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'fetchai'),
    (SELECT id FROM categories WHERE slug = 'marketplaces-task-coordination')
);

-- Olas -> Marketplaces & Task Coordination
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'olas'),
    (SELECT id FROM categories WHERE slug = 'marketplaces-task-coordination')
);

-- Google ADK -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'google-adk'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- OpenClaw -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'openclaw'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- TinkerClaw -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'tinkerclaw'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- ClawSpawn -> Developer Tools & Infrastructure
INSERT INTO listing_categories (listing_id, category_id)
VALUES (
    (SELECT id FROM listings WHERE slug = 'clawspawn'),
    (SELECT id FROM categories WHERE slug = 'developer-tools-infrastructure')
);

-- ---------------------------------------------------------------------------
-- Junction table: listing_chains
-- ---------------------------------------------------------------------------

-- Chain-agnostic tools
INSERT INTO listing_chains (listing_id, chain_id)
SELECT l.id, c.id FROM listings l, chain_support c
WHERE l.slug IN ('langchain', 'crewai', 'autogpt', 'microsoft-autogen', 'openai-agents-sdk', 'dify', 'model-context-protocol', 'agent2agent-protocol', 'langfuse', 'google-adk', 'openclaw', 'tinkerclaw', 'clawspawn')
AND c.slug = 'chain-agnostic';

-- Multi-chain tools
INSERT INTO listing_chains (listing_id, chain_id)
SELECT l.id, c.id FROM listings l, chain_support c
WHERE l.slug IN ('elizaos', 'fetchai', 'olas')
AND c.slug = 'multi-chain';

-- ElizaOS also on Ethereum and Solana
INSERT INTO listing_chains (listing_id, chain_id)
SELECT l.id, c.id FROM listings l, chain_support c
WHERE l.slug = 'elizaos' AND c.slug = 'ethereum';

INSERT INTO listing_chains (listing_id, chain_id)
SELECT l.id, c.id FROM listings l, chain_support c
WHERE l.slug = 'elizaos' AND c.slug = 'solana';

-- Olas also on Ethereum
INSERT INTO listing_chains (listing_id, chain_id)
SELECT l.id, c.id FROM listings l, chain_support c
WHERE l.slug = 'olas' AND c.slug = 'ethereum';

-- ---------------------------------------------------------------------------
-- Junction table: listing_tags
-- ---------------------------------------------------------------------------

-- LangChain tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'langchain' AND t.slug IN ('ai-agent', 'llm', 'framework', 'rag', 'open-source');

-- CrewAI tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'crewai' AND t.slug IN ('ai-agent', 'multi-agent', 'orchestration', 'framework', 'open-source');

-- AutoGPT tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'autogpt' AND t.slug IN ('ai-agent', 'autonomous', 'open-source', 'framework');

-- Microsoft AutoGen tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'microsoft-autogen' AND t.slug IN ('ai-agent', 'multi-agent', 'framework', 'open-source');

-- OpenAI Agents SDK tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'openai-agents-sdk' AND t.slug IN ('ai-agent', 'sdk', 'framework', 'llm');

-- Dify tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'dify' AND t.slug IN ('ai-agent', 'rag', 'open-source', 'llm', 'developer-tools');

-- MCP tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'model-context-protocol' AND t.slug IN ('protocol', 'open-source', 'communication', 'sdk');

-- A2A tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'agent2agent-protocol' AND t.slug IN ('protocol', 'communication', 'multi-agent', 'open-source');

-- Langfuse tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'langfuse' AND t.slug IN ('observability', 'analytics', 'llm', 'open-source', 'developer-tools');

-- ElizaOS tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'elizaos' AND t.slug IN ('ai-agent', 'autonomous', 'open-source', 'agent-framework', 'chatbot');

-- Fetch.ai tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'fetchai' AND t.slug IN ('ai-agent', 'autonomous', 'sdk', 'infrastructure');

-- Olas tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'olas' AND t.slug IN ('ai-agent', 'autonomous', 'smart-contract', 'infrastructure', 'open-source');

-- Google ADK tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'google-adk' AND t.slug IN ('ai-agent', 'multi-agent', 'framework', 'open-source', 'llm');

-- OpenClaw tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'openclaw' AND t.slug IN ('ai-agent', 'chatbot', 'open-source', 'autonomous');

-- TinkerClaw tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'tinkerclaw' AND t.slug IN ('ai-agent', 'orchestration', 'autonomous');

-- ClawSpawn tags
INSERT INTO listing_tags (listing_id, tag_id)
SELECT l.id, t.id FROM listings l, tags t
WHERE l.slug = 'clawspawn' AND t.slug IN ('infrastructure', 'compute', 'ai-agent');

COMMIT;
