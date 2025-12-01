#!/usr/bin/env python3
"""Knowledge base ingestion script."""
import os
import sys
import json
import argparse
from pathlib import Path
import markdown
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables from .env file
project_root = Path(__file__).parent.parent
env_path = project_root / "backend-rag" / ".env"
load_dotenv(env_path)

# Add backend-rag/src to path
sys.path.insert(0, str(project_root / "backend-rag" / "src"))

from text_splitter import split_text
from embeddings_client import EmbeddingsClient
from vector_store import VectorStoreClient

def detect_tool_from_path(path: str) -> str:
    """Detect tool name from file path."""
    path_lower = path.lower()
    if "selenium" in path_lower:
        return "Selenium"
    elif "playwright" in path_lower:
        return "Playwright"
    elif "testim" in path_lower:
        return "Testim"
    elif "mabl" in path_lower:
        return "Mabl"
    elif "testwise" in path_lower:
        return "TestWise"
    return "Unknown"

def extract_text_from_file(filepath: str) -> str:
    """Extract plain text from HTML, Markdown, or text files."""
    ext = os.path.splitext(filepath)[1].lower()
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if ext == ".md":
        # Convert markdown to HTML then extract text
        html = markdown.markdown(content)
        soup = BeautifulSoup(html, "html.parser")
        return soup.get_text()
    elif ext == ".html":
        soup = BeautifulSoup(content, "html.parser")
        return soup.get_text()
    else:
        # Plain text
        return content

def ingest_kb(kb_dir: str, vector_store_path: str = None):
    """Ingest knowledge base files into vector store."""
    kb_path = Path(kb_dir)
    if not kb_path.exists():
        raise ValueError(f"Knowledge base directory not found: {kb_dir}")
    
    print(f"Ingesting knowledge base from: {kb_dir}")
    
    # Initialize clients
    print("Initializing embeddings client...")
    emb_client = EmbeddingsClient()
    
    print("Initializing vector store...")
    vs_client = VectorStoreClient()
    
    manifest = []
    
    # Walk through KB directory
    for root, _, files in os.walk(kb_dir):
        for file in files:
            if not file.endswith((".md", ".html", ".txt")):
                continue
            
            filepath = os.path.join(root, file)
            print(f"Processing: {filepath}")
            
            try:
                # Extract text
                text = extract_text_from_file(filepath)
                
                # Split into chunks
                chunks = split_text(text, max_tokens=400, overlap=50)
                
                # Process each chunk
                for i, chunk in enumerate(chunks):
                    doc_id = f"{os.path.splitext(file)[0]}_{i:03d}"
                    tool = detect_tool_from_path(filepath)
                    
                    metadata = {
                        "id": doc_id,
                        "tool": tool,
                        "title": file,
                        "source_file": filepath,
                        "url": ""  # Can be populated from KB files if available
                    }
                    
                    # Generate embedding
                    print(f"  Embedding chunk {i+1}/{len(chunks)}...")
                    vec = emb_client.embed(chunk)
                    
                    # Upsert to vector store
                    vs_client.upsert(doc_id, vec, metadata, chunk)
                    
                    manifest.append(metadata)
                
                print(f"  Processed {len(chunks)} chunks from {file}")
            
            except Exception as e:
                print(f"  Error processing {filepath}: {e}")
                continue
    
    # Save manifest
    manifest_path = Path(kb_dir).parent / "kb_manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest saved to: {manifest_path}")
    
    # Save vector store if path provided
    if vector_store_path:
        vs_client.save(vector_store_path)
        print(f"Vector store saved to: {vector_store_path}")
    else:
        # Save to default location
        default_path = Path(kb_dir).parent / "backend-rag" / "data" / "vector_store"
        os.makedirs(default_path.parent, exist_ok=True)
        vs_client.save(str(default_path))
        print(f"Vector store saved to: {default_path}")
    
    print(f"\nIngestion complete! Processed {len(manifest)} chunks.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest knowledge base into vector store")
    parser.add_argument("--dir", default="kb", help="Knowledge base directory")
    parser.add_argument("--vector-store", help="Vector store file path")
    args = parser.parse_args()
    
    ingest_kb(args.dir, args.vector_store)

