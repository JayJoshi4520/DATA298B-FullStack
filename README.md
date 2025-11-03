# DATA 298B Project

## Try it out

1. Clone the git Repo using ```git clone https://github.com/JayJoshi4520/DATA298B-FullStack.git```
2. ```cd DATA298-FullStack```
3. Create below .env file, NOTE: for testing only change the API KEY of LLM_API_KEY
```
# ======================
# LLM PROVIDER CONFIGURATION
# ======================

# Primary provider (auto-detected if not set)
# Options: openai, anthropic, gemini, ollama, custom1, custom2
LLM_PRIMARY_PROVIDER=gemini

# Fallback providers (comma-separated)
# LLM_FALLBACK_PROVIDERS=anthropic,openai

# ======================
# OPENAI CONFIGURATION
# ======================
# OPENAI_API_KEY=sk-your_openai_api_key_here
# OPENAI_MODEL=gpt-4
# OPENAI_BASE_URL=https://api.openai.com/v1
# OPENAI_MAX_TOKENS=4000

# ======================
# ANTHROPIC CONFIGURATION
# ======================
# ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
# ANTHROPIC_MODEL=claude-3-sonnet-20240229
# ANTHROPIC_BASE_URL=https://api.anthropic.com
# ANTHROPIC_MAX_TOKENS=4000

# ======================
# GOOGLE GEMINI CONFIGURATION
# ======================
GOOGLE_APPLICATION_CREDENTIALS=/var/secrets/sa.json
GOOGLE_GENAI_USE_VERTEXAI=true
# LLM_MODEL=projects/excellent-hue-472000-n4/locations/us-east-4/endpoints/3088198308934451200
GOOGLE_CLOUD_PROJECT=excellent-hue-472000-n4
GOOGLE_CLOUD_LOCATION=us-east4

LLM_API_KEY=YOUR_API_KEY
LLM_MODEL=YOU_LLM_MODEL
GEMINI_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MAX_TOKENS=4000

# ======================
# OLLAMA CONFIGURATION (Local/Open Source)
# ======================
OLLAMA_ENABLED=true
OLLAMA_MODEL=llama2
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MAX_TOKENS=4000
OLLAMA_SUPPORTS_TOOLS=false

# ======================
# CUSTOM PROVIDER 1 (e.g., Hugging Face, Together AI, etc.)
# ======================
CUSTOM1_NAME=huggingface
CUSTOM1_API_KEY=hf_your_token_here
CUSTOM1_BASE_URL=https://api-inference.huggingface.co/models
CUSTOM1_MODEL=microsoft/DialoGPT-large
CUSTOM1_MAX_TOKENS=2000
CUSTOM1_SUPPORTS_TOOLS=false
CUSTOM1_AUTH_HEADER=Authorization
CUSTOM1_AUTH_PREFIX=Bearer

# ======================
# CUSTOM PROVIDER 2 (e.g., Replicate, Cohere, etc.)
# ======================
CUSTOM2_NAME=together
CUSTOM2_API_KEY=your_together_api_key
CUSTOM2_BASE_URL=https://api.together.xyz/v1
CUSTOM2_MODEL=meta-llama/Llama-2-70b-chat-hf
CUSTOM2_MAX_TOKENS=4000
CUSTOM2_SUPPORTS_TOOLS=true
CUSTOM2_AUTH_HEADER=Authorization
CUSTOM2_AUTH_PREFIX=Bearer

# ======================
# SERVER CONFIGURATION
# ======================
NODE_ENV=development
PORT=3030
PROJECT_ROOT=/home/coder/project
COMMAND_TIMEOUT=30000
MAX_FILE_SIZE=1048576

# Development options
DEV_MODE=true
ENABLE_MOCK_AI=false
DEBUG=true


```
4. Run docker command ``````

Once the containers have started, open your browser to http://localhost:5173 and you’ll see the Workspace!,

To Test backend API use http://localhost:3030 using Postman.

Click the **Load VS Code here** button to display the VS Code IDE in the right side panel.


## Development

To work on the Labspace infrastructure, you can utilize the `compose.yaml` file. Make sure to enable Compose Watch mode with the `--watch` flag.

```console
docker compose up --watch --build
```

After it starts, open the workspace at http://localhost:5173.


## Known limitations

- Running multiple workspace concurrently is not supported at this time on the same machine
