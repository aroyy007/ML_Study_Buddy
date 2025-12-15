# RAG Chain with Groq LLM
from dataclasses import dataclass, field
from typing import List, Dict, Any
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.documents import Document

@dataclass
class RAGResponse:
    answer: str
    sources: List[str]
    context_chunks: List[Document] = field(default_factory=list)

def format_docs(docs):
    """Format documents for context."""
    return '\n\n'.join(doc.page_content for doc in docs)

class RAGChain:
    """RAG chain using Groq LLM with LCEL (LangChain Expression Language)."""

    def __init__(self, llm_model: str, retriever, groq_api_key: str):
        self.llm = ChatGroq(model=llm_model, api_key=groq_api_key, temperature=0.7)
        self.retriever = retriever
        self._chat_histories: Dict[str, List] = {}
        self._setup_chain()

    def _setup_chain(self):
        system_prompt = """You are a helpful AI assistant specialized in machine learning.
Use the following context to answer the question. If you don't know, say so.
Always cite your sources when possible.

Context:
{context}

Question: {question}
"""
        prompt = ChatPromptTemplate.from_template(system_prompt)

        self.rag_chain = (
            RunnableParallel(context=self.retriever | format_docs, question=RunnablePassthrough())
            | prompt
            | self.llm
            | StrOutputParser()
        )

    def query(self, question: str, session_id: str = "default") -> RAGResponse:
        # Get relevant documents
        docs = self.retriever.invoke(question)

        # Get answer
        answer = self.rag_chain.invoke(question)

        # Extract sources
        sources = []
        for doc in docs:
            if doc.metadata.get("source_file"):
                sources.append(doc.metadata["source_file"])
            elif doc.metadata.get("source_url"):
                sources.append(doc.metadata["source_url"])

        return RAGResponse(answer=answer, sources=list(set(sources)), context_chunks=docs)

    def clear_session(self, session_id: str):
        if session_id in self._chat_histories:
            del self._chat_histories[session_id]
