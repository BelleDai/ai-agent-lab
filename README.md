# ai-agent-lab

🧪 A learning & experimentation lab for building AI Agent infrastructure with **Node.js + TypeScript**.

> **Goal:** combine **Kubernetes**, **Function Calling**, **MCP Agent**, **RAG**, and **Prompt Engineering** into a working prototype that can later be productionised.

---

## 📦 Project Structure

```
.
├── src
│   ├── config/          # Environment helpers
│   ├── mcp/             # Minimal MCP server & client skeleton
│   ├── openai/          # Lightweight OpenAI REST client & function-calling orchestrator
│   ├── prompts/         # Prompt templates & orchestrator for tool selection
│   ├── rag/             # PDF loader, chunker, vector store, and RAG pipeline
│   ├── server/          # Tool registry + HTTP server (K8s friendly)
│   └── tools/           # Example tools (weather + RAG QA)
├── package.json
└── tsconfig.json
```

Each module is intentionally small and dependency-light so you can swap pieces (e.g. Vector DB, server framework) while learning the ecosystem.

---

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Provide credentials**
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```
3. **Run the demo bootstrap**
   ```bash
   npm run dev
   ```

The bootstrap script:
- Spins up the tool HTTP server (usable behind an API Gateway or K8s Service)
- Demonstrates prompt-based tool selection
- Executes a Function Calling round-trip with the `get_weather` tool
- Triggers the MCP client/server skeleton calling the same tool

> ℹ️ The `rag_qa` tool expects a PDF/text path and uses OpenAI embeddings. It falls back to a naive UTF-8 decode when `pdf-parse` is not installed which is fine for text-based PDFs.

---

## 🧰 Modules & Responsibilities

### 1. Tool API Server
- `ToolRegistry` registers strongly typed tools (validated with [zod](https://github.com/colinhacks/zod)).
- `ToolHttpServer` exposes `/tools` and `/call-tool` endpoints. Swap with Express/Fastify or deploy via Helm/Kustomize on Kubernetes.

### 2. OpenAI Function Calling
- `OpenAIClient` is a thin wrapper around the REST API (no SDK required).
- `FunctionCallingOrchestrator` registers one tool at a time and executes the tool payload returned by the LLM.

### 3. MCP Skeleton
- `McpServer` receives tool calls and emits replies.
- `McpClient` acts as an executor/runner, ready to be embedded in an agent runtime.

### 4. RAG Pipeline
- `loadDocument` ingests PDF/text files.
- `simpleSemanticChunk` slices text with overlap.
- `embedChunks` + `InMemoryVectorStore` create a retrieval index.
- `RagPipeline` bundles ingestion + querying; `rag_qa` tool uses it to ground responses.

### 5. Prompt & Context Engineering
- `toolSelectionTemplate` illustrates a guarded prompt for tool choice.
- `PromptOrchestrator` executes templates with validation and deterministic temperature.

---

## 🛣️ Suggested Next Steps

- [ ] Replace `InMemoryVectorStore` with Qdrant/Weaviate clients.
- [ ] Package the HTTP server as a container + Helm chart for Kubernetes deployment.
- [ ] Extend MCP server to support streaming multi-turn replies.
- [ ] Add multi-tool planning logic and state management.
- [ ] Introduce evaluation harness & feedback loop for prompt iterations.

---

## 📝 Notes

- No tests yet—focus is on providing a scaffold to iterate quickly.
- Keep secrets out of the repo. Use Kubernetes Secrets or external secret stores in production.
- The current bootstrap logs to the console; replace with structured logging for real deployments.
