# Local LLM Configuration

The MVP runs without a model by default. `LLM_PROVIDER=mock` returns deterministic retrieval-grounded text, keeping the demo free, fast, and reviewable. A local model may later rephrase approved context; emergency rules and severity assignment remain in code.

## Supported Runtimes

| Runtime | Intended Use | Example Model Families |
| --- | --- | --- |
| Ollama | Easiest local laptop demo runtime | Llama 3.1, Qwen 2.5, DeepSeek R1 distilled, Phi |
| llama.cpp | CPU/edge deployment with quantized GGUF files | Quantized Llama, Qwen, Phi variants |
| vLLM | GPU server with OpenAI-compatible local endpoint | Larger instruction-tuned open-weight models |

Model availability, licenses, memory requirements, and clinical performance must be assessed for the exact artifact selected.

## Ollama Example

Install Ollama locally and pull a model according to its official license and resource needs, then configure:

```dotenv
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1:8b
```

The API sends only retrieved context to a configured local runtime, times out safely to its retrieval-template fallback, enforces the required disclaimer, and identifies the selected provider in its response. A production deployment should additionally persist exact model and prompt versions in every audit event.

The included adapter supports local invocation:

```dotenv
# Ollama
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=qwen2.5:7b

# Or an OpenAI-compatible llama.cpp/vLLM server
LLM_PROVIDER=vllm
LLM_BASE_URL=http://host.docker.internal:8000
LLM_MODEL=Qwen/Qwen2.5-7B-Instruct
```

Use `LLM_PROVIDER=llamacpp` for a llama.cpp OpenAI-compatible server. If a configured runtime cannot be reached, the API automatically returns cited retrieval-template guidance.

## Deployment Safety

- Never ask a local model to override rule severity or make a diagnosis.
- Use a local embedding model to populate `pgvector` only after source approval.
- Log runtime/model version, prompt template version, citations, and fallback decisions.
- Keep a non-model emergency rule path available in offline mode.
