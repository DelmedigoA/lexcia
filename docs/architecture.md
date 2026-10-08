# Lexcia architecture

The website calls its own Lexcia backend on port 8767. Each request carries the browser conversation UUID. The backend validates requests with Pydantic, ranks local knowledge with BM25, runs a retrieve → answer LangGraph, and translates model chunks into SSE status/item/delta/final events. The scoped prompt answers only from reviewed Lexcia information. No ArchiveLens imports, process, corpus, configuration, or server calls are required.

Sessions are isolated in memory, limited to 128 idle/active entries and ten completed turns per session. Restarting the backend loses its conversation context; on Vercel, a new function instance may also start without earlier turns. Browser transcripts remain local and older ones are read-only. Only completed turns enter backend history. Concurrent requests in the same session are rejected, and cancellation releases its lock. There is no account system or durable server history.

The existing launcher, modal, pinning, resizing, keyboard navigation, saved browser transcripts, and React generative-UI renderer are adapted from the prior local demo. Rich response rendering is available in the frontend but this backend currently produces sourced text only. Sources open the project's reviewed knowledge records. Product positioning, branding and planned pricing are traceable to the reviewed Google Drive document, while implemented demo behavior is traceable to the local prototype. Unknown commercial details are explicitly recorded.

ArchiveLens informed the separation of knowledge, prompts, retrieval, graph, streaming, and UI. Sefaria and assistant-ui remain design references. The backend is a new implementation.
