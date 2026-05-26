"""Example Prefect flow for chunking and embedding approved documents."""
from prefect import flow, task


@task
def semantic_chunk(document: str) -> list[str]:
    return [block.strip() for block in document.split("\n\n") if block.strip()]


@task
def write_pgvector_chunks(chunks: list[str]) -> int:
    # Connect to PostgreSQL only after document provenance and approval checks.
    return len(chunks)


@flow(name="lifeline-rag-refresh")
def rag_refresh(document: str) -> int:
    return write_pgvector_chunks(semantic_chunk(document))
