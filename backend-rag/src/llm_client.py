"""
OpenAI LLM client for chat generation
"""
import openai
from typing import List, Dict


class LLMClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        self.client = openai.OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"  # Using gpt-4o-mini for cost efficiency

    def generate(self, prompt: str, temperature: float = 0.7, max_tokens: int = 300) -> str:
        """Generate response using LLM with optimized settings for speed"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that provides information about test automation tools (Selenium, Playwright, Testim, and Mabl). Answer questions based on the provided context. Keep answers concise."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=30.0  # 30 second timeout for API call
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            raise Exception(f"Failed to generate response: {str(e)}")

    def generate_stream(self, prompt: str, temperature: float = 0.7):
        """Generate streaming response"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that provides information about test automation tools."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                stream=True
            )
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            raise Exception(f"Failed to generate streaming response: {str(e)}")

