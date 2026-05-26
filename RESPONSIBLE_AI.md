# Responsible AI

## Safety Position

LifeLine AI is decision-support software for demonstration. It is not a medical device, diagnostic system, or substitute for examination by a qualified healthcare provider.

The assistant and risk workflow always state:

> This is decision-support guidance, not a medical diagnosis. For emergency symptoms, contact a qualified healthcare provider immediately.

## Implemented Guardrails

- Transparent, inspectable rule scoring rather than hidden diagnostic claims.
- Source citation output for contextual guidance.
- Graph path explanations showing why an action appears.
- Automatic human-review flag for Red and Orange emergency alerts.
- Audit logs storing event type, actor role, retrieved chunks, graph path, score, and disclaimer.
- UI privacy and limitation messaging.
- Role-gated worker and doctor/admin API reads in the demonstration.

## Privacy and Security Requirements

The dataset in this repository is synthetic. Real deployment needs patient consent and lawful basis, minimized collection, encryption at rest/in transit, token-only authenticated RBAC, secure secret management, audit retention controls, breach response, and anonymized/suppressed reporting exports. The `x-demo-role` UI mechanism must be disabled outside demonstrations.

## Bias and Clinical Validation

Maternal risk varies by access to care, local protocols, co-morbidities, language, measurement quality, and social conditions. Rules, Bangla simplifications, source chunks, thresholds, and referral pathways require evaluation with local clinicians and affected communities. Monitor false negatives and delays with particular attention to underserved populations.

## Human Escalation

A Red output never automatically decides treatment. It queues a visible referral-review alert. A qualified health worker or doctor confirms symptoms/vitals, follows approved emergency protocol, contacts the receiving facility, and records the outcome.
