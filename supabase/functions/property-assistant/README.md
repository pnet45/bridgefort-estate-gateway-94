# Bridgefort Homes property assistant

The public website chat sends bounded conversation history to this Supabase Edge
Function. The function calls a separately hosted Ollama-compatible service; do
not put its URL or API key in browser/Vite environment variables.

Configure these Edge Function secrets before deployment:

- `OLLAMA_BASE_URL`: HTTPS base URL reachable from Supabase, such as
  `https://ollama.example.com`. The function appends `/api/chat`.
- `OLLAMA_MODEL`: optional model name; defaults to `qwen2.5:7b`. Set this to an
  installed model, for example `llama3.3:70b` if that model is available.
- `OLLAMA_API_KEY`: optional bearer token for an authenticated Ollama gateway.

The assistant does not query live listing data. Its responses should not be
treated as confirmation of availability, pricing, or legal terms. Public
deployments should additionally apply request rate limiting at the hosting
gateway or a trusted proxy in front of the model service.
