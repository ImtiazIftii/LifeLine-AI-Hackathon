import os


def load_env_file(path: str) -> None:
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ[key.strip().lstrip("\ufeff")] = value.strip().strip('"').strip("'")


BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
ROOT_DIR = os.path.dirname(BACKEND_DIR)
load_env_file(os.path.join(ROOT_DIR, ".env"))
load_env_file(os.path.join(BACKEND_DIR, ".env"))

DISCLAIMER = "This system is a decision-support prototype and does not replace doctors."

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "mock")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]
ALLOW_VERCEL_PREVIEWS = os.getenv("ALLOW_VERCEL_PREVIEWS", "false").lower() == "true"
DATA_DIR = os.path.join(BACKEND_DIR, "data")
