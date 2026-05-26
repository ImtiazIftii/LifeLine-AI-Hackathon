"""Illustrative LangGraph-compatible decision-support state transitions."""
from typing import TypedDict


class MaternalState(TypedDict):
    symptoms: list[str]
    severity: str
    retrieved_chunks: list[dict]
    graph_path: list[str]
    human_review_required: bool


def risk_rules(state: MaternalState) -> MaternalState:
    state["human_review_required"] = state["severity"] in {"Red", "Orange"}
    return state


def retrieval_step(state: MaternalState) -> MaternalState:
    # Replace with backend /api/assistant/query or pgvector-backed retrieval.
    return state


def referral_gate(state: MaternalState) -> MaternalState:
    if state["severity"] == "Red":
        state["human_review_required"] = True
    return state
