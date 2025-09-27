# Noah ChromaDB Vector Store

This directory contains the persistent storage for Noah's ChromaDB vector database.

## Structure
- **Collections**: Noah uses a single collection `noah-knowledge-base` for storing all document embeddings
- **Persistence**: Vector data is automatically persisted here by the ChromaDB instance

## Usage
The vector store is automatically initialized when Noah's RAG system starts up. No manual setup required.

## Files
- This directory will contain ChromaDB's internal storage files once the system begins processing documents
- The vector store supports knowledge articles, conversation history, and artifact embeddings

## Health Check
The RAG system includes health monitoring to ensure the vector store is functioning properly.