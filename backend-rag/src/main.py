"""
FastAPI server for RAG-powered chatbot
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add parent directory to path for imports
current_dir = Path(__file__).parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from embeddings_client import EmbeddingsClient
from vector_store import VectorStore
from llm_client import LLMClient
from prompts import get_chat_prompt

# Load environment variables (look in parent directory for .env)
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

app = FastAPI(title="TestWise RAG Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients (lazy loading)
embeddings_client = None
vector_store = None
llm_client = None


def get_embeddings_client():
    """Lazy initialization of embeddings client"""
    global embeddings_client
    if embeddings_client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY environment variable is required"
            )
        embeddings_client = EmbeddingsClient(api_key)
    return embeddings_client


def get_vector_store():
    """Lazy initialization of vector store"""
    global vector_store
    if vector_store is None:
        # Get data directory in backend-rag root
        data_dir = Path(__file__).parent.parent / "data"
        data_dir.mkdir(exist_ok=True)
        store_path = str(data_dir / "vector_store.faiss")
        vector_store = VectorStore(store_path)
    return vector_store


def get_llm_client():
    """Lazy initialization of LLM client"""
    global llm_client
    if llm_client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY environment variable is required"
            )
        llm_client = LLMClient(api_key)
    return llm_client


class ChatRequest(BaseModel):
    question: str
    conversation_history: list = []


class ChatResponse(BaseModel):
    answer: str
    sources: list = []


@app.get("/")
async def root():
    return {"message": "TestWise RAG Backend API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok", "message": "RAG backend is running"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Handle chat requests with RAG (optimized for speed)
    """
    import asyncio
    import time
    
    start_time = time.time()
    
    try:
        # Get clients
        embeddings = get_embeddings_client()
        vector_store = get_vector_store()
        llm = get_llm_client()

        # Get question embedding (with timeout)
        try:
            question_embedding = await asyncio.wait_for(
                asyncio.to_thread(embeddings.get_embedding, request.question),
                timeout=10.0
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=504, detail="Embedding generation timed out")

        # Search for relevant context (fast, local operation)
        relevant_docs = vector_store.search(question_embedding, top_k=2)  # Reduced from 3 to 2 for speed

        # Extract context from documents (limit context length)
        context_parts = []
        total_length = 0
        max_context_length = 1000  # Limit context to speed up LLM processing
        
        for doc in relevant_docs:
            text = doc["text"]
            if total_length + len(text) > max_context_length:
                # Truncate if needed
                remaining = max_context_length - total_length
                if remaining > 100:  # Only add if meaningful
                    context_parts.append(text[:remaining] + "...")
                break
            context_parts.append(text)
            total_length += len(text)
        
        context = "\n\n".join(context_parts)

        # Generate response using LLM (with timeout)
        prompt = get_chat_prompt(request.question, context, request.conversation_history)
        try:
            answer = await asyncio.wait_for(
                asyncio.to_thread(llm.generate, prompt),
                timeout=30.0
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=504, detail="LLM generation timed out")

        # Extract sources
        sources = [doc.get("source", "Unknown") for doc in relevant_docs]

        elapsed_time = time.time() - start_time
        print(f"⏱️  Chat response generated in {elapsed_time:.2f}s")

        return ChatResponse(answer=answer, sources=sources)

    except HTTPException:
        raise
    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"❌ Error after {elapsed_time:.2f}s: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"\n🚀 Starting RAG Backend on http://localhost:{port}\n")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)

