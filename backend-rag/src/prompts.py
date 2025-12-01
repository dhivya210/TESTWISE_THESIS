"""
Prompt templates for chat
"""


def get_chat_prompt(question: str, context: str, conversation_history: list = None) -> str:
    """
    Generate prompt for chat with RAG context (optimized for speed)
    """
    # Shorter, more focused prompt for faster responses
    prompt = f"""Answer this question about test automation tools (Selenium, Playwright, Testim, Mabl) using the context below. Keep your answer concise (2-3 sentences max).

Context: {context[:800]}  # Limit context length

Question: {question}

Answer:"""

    # Add conversation history if provided
    if conversation_history:
        history_text = "\n\nPrevious conversation:\n"
        for msg in conversation_history[-5:]:  # Last 5 messages
            history_text += f"- {msg.get('role', 'user')}: {msg.get('content', '')}\n"
        prompt = history_text + "\n\n" + prompt

    return prompt

