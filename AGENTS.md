# LifeLine AI Contributor Instructions

Always keep the app deployable.

Before finishing:

1. Ensure `docker compose up --build` works, or clearly report why it could not be executed.
2. Do not add a paid API dependency.
3. Keep healthcare AI as decision support, never diagnosis.
4. Update `README.md` when setup or demonstration steps change.
5. Preserve modular architecture and traceability of risk outputs.

Maintain the clinical safety disclaimer on user-facing guidance. Treat real patient data as sensitive and never seed it into this repository.
