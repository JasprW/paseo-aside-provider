# Changelog

## 0.3.0

- Add native Final confirm (Ask first / Skip confirmation), independent of access mode.
- Match Aside's mode defaults: Guard enables confirmation, Read only disables it, Full access preserves it.
- Relay native file/tool approvals and final-action suspensions into Paseo's permission buttons; reply to the original request with identity and scope checks.
- Preserve supported permanent grants; handle cancellation, external replies, reconnect and stale buttons.
- Restore native confirmation on import/resume and refresh both settings before tasks.
- Correct CLI's forced confirmation-off default before the first task; stop forcing duplicate prompt-based approvals.
- Use Aside's installed authentication helper for the local daemon; tokens remain in memory.

## 0.2.2

- Reduce provider SVG padding and center the Aside mark, increasing its visible size by 25% to match neighboring provider icons.

## 0.2.1

- Pin aside-acp 0.3.1 and expose native Read only, Guard and Full access modes.
- Apply permission changes to the original Aside session and read back committed state.
- Preserve native mode on import/resume and accept older placeholder Auto modes.
- Add `default_permission` while retaining legacy `grant_full_access` behavior.

## 0.2.0

- Use Aside’s official brand assets for plugin and provider icons; label the integration unofficial.

- Pin aside-acp 0.3.0 for native Aside history in Import Sessions.
- Search/filter before limiting and reuse existing persistence IDs for deduplication.
- Bind to original native sessions and replay user/assistant/reasoning text without a bootstrap turn.
- Read native metadata with the macOS SQLite CLI in read-only mode; keep account boundaries and reject unavailable sessions.

## 0.1.2

- Pin aside-acp 0.2.2 to display upstream failure reasons and request IDs.
- Remove duplicate assistant error text and generic turn-failed messages.

## 0.1.1

- Pin aside-acp 0.2.1 for real text and thinking streaming from Aside CLI events.
- Replay reasoning alongside conversation messages.
- Deduplicate final output and clean up private raw-event files after each CLI turn.

## 0.1.0

- Register Aside as a native Paseo provider using the official ACP shim.
- Embed aside-acp 0.2.0 through object streams with pinned dependencies.
- Expose model selection, thinking effort, streamed replies and approvals.
- Replay user and assistant messages when resuming a conversation.
- Dispose active connections and resume native sessions after hot reload.
- Add replay regressions, live Paseo integration checks and CI.
