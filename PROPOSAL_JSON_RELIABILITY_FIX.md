# Proposal JSON Reliability Fix

The proposal generator now uses OpenAI Structured Outputs with a strict JSON schema instead of relying on free-form JSON text.

Changes:
- strict `json_schema` output for proposal content
- output token budget increased from 2200 to 4000
- malformed/empty structured output is retried automatically
- existing HTTP retry and fallback-model behavior is preserved
- parse failures are logged with a short output preview for diagnosis

No database migration is required.
