# ai-agent-lab

🧪 A learning & experimentation lab for building AI Agent infrastructure with **Node.js + TypeScript**.  
The repo explores how to combine **Kubernetes, Function Calling, MCP Agent, RAG, and Prompt Engineering** into a working prototype.

---

## 🚀 Objectives
1. **System Deployment (Kubernetes + Helm/Kustomize)**  
   - Deploy FastAPI Tool / vLLM API on K8s  
   - Understand Pod, Deployment, Service basics  

2. **OpenAI Function Calling Integration**  
   - Define function schema & tool_call return format  
   - Implement simple functions (weather, Q&A)  
   - Full pipeline: `function_call → custom API → integrated result`  

3. **MCP Agent Framework**  
   - Learn MCP protocol (InputContext, ToolCall, AgentReply)  
   - Build MCP Server (Tool Agent) & MCP Client (Executor)  
   - Support multi-tool calling & multi-turn interactions  

4. **RAG (Retrieval-Augmented Generation)**  
   - PDF → Text → Chunk → Embedding  
   - Store & query with Vector DB (Qdrant / Weaviate)  
   - Implement RAG Q&A flow  

5. **Prompt & Context Engineering**  
   - Stable & controlled prompt templates  
   - Avoid anti-patterns with input validation  
   - Manage token length & prompt injection strategies  
   - Implement a tool-selection prompt composer  

---

## 🧩 Final Integration
- Combine: **K8s + Function Tool + MCP Agent + RAG + Prompt Flow**  
- Build a minimal **multi-tool Chat Agent**  
- Keep extension interfaces for enterprise data & feedback loop  

---

## 🛠️ Tech Stack
- **Language:** Node.js + TypeScript  
- **LLM:** OpenAI API  
- **Deployment:** Kubernetes + Helm/Kustomize  
- **Vector DB:** Qdrant / Weaviate  
- **Agent Protocol:** MCP (Model Context Protocol)  
- **Server Framework:** Express / Fastify  

---

## 📂 Roadmap
- [ ] Setup Node.js + TS project structure  
- [ ] Implement simple Function Calling demo  
- [ ] Deploy FastAPI/vLLM tool on K8s  
- [ ] Build MCP Server & Client skeleton  
- [ ] Add RAG pipeline (PDF → Vector DB → Q&A)  
- [ ] Create Prompt Orchestrator  
- [ ] Integrate everything into a Chat Agent  

---

## 🤝 Purpose
This repo is for **learning, prototyping, and experimenting** — not production-ready.  
The goal is to gradually build confidence in **AI agent systems + infra + orchestration**.
