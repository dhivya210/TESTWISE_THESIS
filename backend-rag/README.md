# TestWise RAG Backend

FastAPI-based RAG (Retrieval-Augmented Generation) backend for the TestWise chatbot.

## Features

- **RAG-powered chatbot** using OpenAI GPT-4
- **Vector search** with FAISS
- **Document embeddings** using OpenAI text-embedding-3-small
- **FastAPI** REST API
- **CORS enabled** for frontend integration

## Prerequisites

- Python 3.9 or higher
- OpenAI API key

## Setup

### 1. Install Dependencies

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the `backend-rag` directory:

```env
OPENAI_API_KEY=your-openai-api-key-here
PORT=8000
```

Or copy from example:
```powershell
Copy-Item .env.example .env
# Then edit .env and add your API key
```

### 3. Start Server

**Option A: Using PowerShell script (recommended)**
```powershell
.\start-server.ps1
```

**Option B: Manual start**
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start server
cd src
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at: `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```

### Chat
```
POST /chat
Body: {
  "question": "What is Selenium?",
  "conversation_history": []
}
```

## Project Structure

```
backend-rag/
├── src/
│   ├── main.py              # FastAPI server
│   ├── embeddings_client.py # OpenAI embeddings
│   ├── vector_store.py      # FAISS vector store
│   ├── llm_client.py        # OpenAI LLM client
│   ├── prompts.py           # Chat prompts
│   └── text_splitter.py    # Text splitting utilities
├── data/                    # Vector store data (created automatically)
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (create this)
├── .env.example            # Environment template
├── start-server.ps1        # Startup script
└── README.md               # This file
```

## Notes

- The vector store will be created automatically in `data/vector_store.faiss`
- If no vector store exists, the chatbot will still work but without RAG context
- Make sure your OpenAI API key has sufficient credits



