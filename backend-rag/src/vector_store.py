"""
FAISS vector store for document retrieval
"""
import os
import json
import faiss
import numpy as np
from typing import List, Dict


class VectorStore:
    def __init__(self, store_path: str):
        self.store_path = store_path
        self.index = None
        self.metadata = []
        self.dimension = 1536  # text-embedding-3-small dimension

        # Load existing index or create new one
        self._load_or_create_index()

    def _load_or_create_index(self):
        """Load existing FAISS index or create a new one"""
        index_path = self.store_path
        metadata_path = self.store_path.replace(".faiss", ".json")

        if os.path.exists(index_path) and os.path.exists(metadata_path):
            try:
                # Load existing index
                self.index = faiss.read_index(index_path)
                with open(metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                print(f"✅ Loaded vector store with {self.index.ntotal} documents")
            except Exception as e:
                print(f"⚠️  Error loading vector store: {e}. Creating new one.")
                self._create_new_index()
        else:
            self._create_new_index()

    def _create_new_index(self):
        """Create a new FAISS index"""
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata = []
        print("📦 Created new vector store")

    def add_documents(self, embeddings: List[List[float]], texts: List[str], sources: List[str] = None):
        """Add documents to the vector store"""
        if not embeddings:
            return

        # Convert to numpy array
        embeddings_array = np.array(embeddings).astype("float32")

        # Add to index
        self.index.add(embeddings_array)

        # Add metadata
        if sources is None:
            sources = [f"Document {i+1}" for i in range(len(texts))]

        for i, text in enumerate(texts):
            self.metadata.append({
                "text": text,
                "source": sources[i] if i < len(sources) else "Unknown"
            })

        # Save index and metadata
        self._save()

    def search(self, query_embedding: List[float], top_k: int = 5) -> List[Dict]:
        """Search for similar documents"""
        if self.index.ntotal == 0:
            return []

        # Convert query to numpy array
        query_array = np.array([query_embedding]).astype("float32")

        # Search
        distances, indices = self.index.search(query_array, min(top_k, self.index.ntotal))

        # Get results
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.metadata):
                results.append({
                    "text": self.metadata[idx]["text"],
                    "source": self.metadata[idx].get("source", "Unknown"),
                    "distance": float(distances[0][i])
                })

        return results

    def _save(self):
        """Save index and metadata to disk"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.store_path), exist_ok=True)

            # Save FAISS index
            faiss.write_index(self.index, self.store_path)

            # Save metadata
            metadata_path = self.store_path.replace(".faiss", ".json")
            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(self.metadata, f, ensure_ascii=False, indent=2)

        except Exception as e:
            print(f"⚠️  Error saving vector store: {e}")

    def get_stats(self) -> Dict:
        """Get statistics about the vector store"""
        return {
            "total_documents": self.index.ntotal,
            "dimension": self.dimension,
            "index_type": "FlatL2"
        }



