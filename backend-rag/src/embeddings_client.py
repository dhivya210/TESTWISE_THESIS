"""
OpenAI embeddings client
"""
import openai
from typing import List


class EmbeddingsClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        self.client = openai.OpenAI(api_key=api_key)
        self.model = "text-embedding-3-small"

    def get_embedding(self, text: str) -> List[float]:
        """Get embedding for a single text (optimized for speed)"""
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text,
                timeout=10.0  # 10 second timeout
            )
            return response.data[0].embedding
        except Exception as e:
            raise Exception(f"Failed to get embedding: {str(e)}")

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings for multiple texts"""
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            raise Exception(f"Failed to get embeddings: {str(e)}")

