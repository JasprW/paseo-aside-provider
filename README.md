# Aside provider for Paseo (unofficial)

<img src="icon.png" width="64" alt="Aside logo">

Unofficial community integration. Not affiliated with or endorsed by Aside.

[![Check](https://github.com/JasprW/paseo-aside-provider/actions/workflows/ci.yml/badge.svg)](https://github.com/JasprW/paseo-aside-provider/actions/workflows/ci.yml)

Use [Aside](https://aside.com)'s browser agent from [Paseo](https://paseo.sh). Select **Aside**, choose a model, thinking effort, permission mode and Final confirm, and send browser tasks from your desktop or phone.

The plugin uses a pinned version of [aside-acp](https://github.com/JasprW/aside-acp). It connects the bridge to Paseo's official ACP provider API, with conversation replay and cleanup when unloaded.

## Requirements

- Paseo 0.11.2 with trusted plugins enabled on the target daemon.
- A local macOS Aside installation, running and signed in on that daemon machine.
- Aside CLI 1.26.1010.1739 or newer, available on the daemon's PATH or configured explicitly.
- Node.js 22.6 or newer and npm for dependency installation and development.

The supported Paseo range is `>=0.11.2 <0.12.0`. Later releases need compatibility verification.

## Install

```sh
paseo plugin install git:JasprW/paseo-aside-provider
paseo provider diagnostic aside
```

For a remote Paseo daemon, install on the machine where Aside is running using Paseo's `--host` option. The plugin uses that machine's browser profile.

Create a new agent and choose **Aside**. A quick read-only task:

```sh
paseo run --provider aside "Open https://example.com and tell me the page title. Read only."
```

Plugin ID: `paseo-aside-provider`. Provider ID: `aside`.

```sh
paseo plugin update paseo-aside-provider
paseo plugin reload paseo-aside-provider
paseo plugin logs paseo-aside-provider
paseo plugin remove paseo-aside-provider
```

### Migrating an older Aside provider

Only one plugin should register the `aside` provider. Remove the old `aside-acp` plugin before installing this one. Existing `~/.aside-acp.json` settings and `~/.aside-acp/sessions` mappings are reused.

If you used a legacy `agents.providers.aside` entry with `extends: "acp"`, back up the daemon's config, remove that specific entry, and run `paseo reload`. A custom provider entry overrides plugin registration. Create new Paseo agents after migrating from that legacy provider format; its old Aside session files are retained.

## Import Aside history

Open **Import Sessions**, filter to **Aside**, and select a native chat. If it belongs to another directory, choose **Show all directories**. Paseo uses the native chat’s stored working directory for placement and resumes the original Aside session, keeping its browser context. Model and thinking choices follow Paseo’s composer controls.

Discovery reads the selected account’s `state.db` through macOS’s `/usr/bin/sqlite3` in read-only mode. Visible, non-archived root chats are listed by last activity; incognito, ephemeral and child sessions are excluded. Search and directory filters apply before limiting results. Existing bridge persistence IDs are reused so Paseo can exclude chats already imported.

User, assistant and exposed reasoning text is copied from the native transcript for replay. Browser tool results and attachments are omitted. The initial transcript is captured when first imported; subsequent bridge messages are appended. Listing and import do not start a model turn or write to Aside’s database. Deleted/missing chats and unavailable transcripts produce an explicit error.

## Settings

The bridge reads `~/.aside-acp.json`. Omit it to use defaults, or use this minimal example:

```json
{
  "account": 1,
  "default_effort": "medium",
  "default_permission": "full-access"
}
```

| Setting | Meaning |
| --- | --- |
| `aside_cli` | Explicit Aside executable path |
| `account` | Local account number; otherwise pins the current account |
| `default_model` | Qualified `provider/model` ID; otherwise the account default |
| `default_effort` | Thinking level, default `medium` |
| `approved_models` | Optional allowlist of model IDs or provider IDs |
| `exec_timeout_seconds` | Turn timeout, default 1200 seconds |
| `default_confirmation` | New-chat Final confirm: `ask-first` (default) or `skip-confirmation`; Read only always disables it |
| `default_permission` | New-chat permission: `read-only`, `guard` or `full-access` |
| `grant_full_access` | Legacy fallback: `true` means Full access, `false` means Guard; defaults to `true` |
| `style`, `owner_name` | Bridge persona preferences |

`ASIDE_ACP_CONFIG` chooses another config file, `ASIDE_ACP_CLI` selects the executable, `ASIDE_HOME` selects Aside's data directory, and `ASIDE_ACP_LOG_FILE` enables file diagnostics. Reload the plugin after changing daemon environment variables. Per-agent Paseo environment overrides are not forwarded.

## Permission modes and Final confirm

The two controls are independent. The mode controls Aside's file/tool access policy; **Final confirm** controls confirmation before externally visible, destructive or paid actions such as sending, paying, deleting and submitting.

| Mode | Native access policy | Final confirm |
| --- | --- | --- |
| Read only | Work within this task's folder; no access to other folders | Disabled, matching Aside |
| Guard | Task folder, Documents and Downloads; ask before accessing other folders | Switching into Guard defaults to Ask first; can then select Skip confirmation |
| Full access | Read and write anywhere on this computer | Ask first or Skip confirmation; switching into this mode preserves the current choice |

Select **Ask first** or **Skip confirmation** under **Final confirm** in Paseo's session settings. Skip confirmation does not bypass Guard's access boundaries. Full access does not itself disable final-action confirmation. For new bridge chats, confirmation defaults to Ask first (except Read only); `default_confirmation: "skip-confirmation"` changes this default. Selecting the same mode again preserves an explicit confirmation choice.

Both settings are committed through Aside's native session API, with a read-back before reporting success. Imports/reconnects restore native settings, and native choices are refreshed before each task. Failed setting changes report an error rather than silently escalating access. The bridge does not continuously mirror idle desktop selector changes. Older `Auto` modes preserve native permissions.

The Paseo provider relays real Aside `approval` and `action-confirmation` suspensions into its standard permission UI:

- File/tool access: Allow once, Reject, and Always allow this permission when supported. Forwarded subagent approvals offer no permanent grant.
- Final action: Confirm or Cancel for the exact proposed action, including the original message and draft/artifact data for review. Screenshot artifacts are shown as metadata/path, not an embedded Aside screenshot viewer.
- Decisions resolve the original native suspension, so the same paused tool continues. Native request IDs and the current scope are checked before replying. Expired requests, failures, cancellation and plugin teardown never imply approval.
- Requests handled in Aside are withdrawn from Paseo. A pending request is discovered again on reconnect. Native authentication/polling errors appear as a session notice; approval is never synthesized to recover from an error.

Aside enforces its native access restrictions. Final confirm uses Aside's own model instructions and confirmation tool; it is not an OS-level interception of every possible side effect. Old `[[APPROVAL]]` blocks remain a compatibility fallback only while Ask first is enabled. New prompts use the native confirmation tool, avoiding a second bridge prompt after choosing Skip confirmation.

Aside CLI creates sessions with Final confirm off and does not support creating Read only directly. The bridge first creates an acknowledgement-only session with no requested actions, then applies both settings before the first user task. If configuration fails, that task is not sent.

The bridge authenticates to the **local loopback Aside daemon** using the installed CLI's `aside-native.node` helper and Aside's existing OS-user key. Session tokens stay in memory; keys/tokens are not copied into config, mappings or diagnostics. Only the selected account and bound session are addressed. Updating confirmation alone preserves Aside's remembered permission grants. This integration uses inspected native daemon APIs and requires a daemon exposing suspension IDs (inspected in 1.26.1011.1437). Remote Aside daemons are unsupported.

Native `ask-user-question` suspensions from imported chats still need an answer in Aside and produce a visible notice. New bridge tasks use `[[QUESTION]]` forms when the ACP client supports elicitation, or text questions otherwise.

## Behavior and limits

- Model and thinking controls update the same native Aside session. Browser context survives agent and plugin reloads.
- Conversation text is saved in `~/.aside-acp/sessions` and replayed into Paseo after reconnecting.
- Upstream errors appear once with their specific reason and request ID when supplied. Content-filter rejections are not automatically retried.
- Replies stream during generation from Aside CLI’s raw text events. Thinking appears in Paseo’s reasoning rows when the model exposes it, and is saved for replay. Individual browser tool calls are not rendered.
- Live events are read every 40 ms through the CLI’s hidden `--log-dump` option, inspected in CLI 1.26.1010.1739. Completed transcripts recover missing final text without repeating streamed output. Intermediate assistant commentary may appear before the final answer.
- Per-turn raw events are stored in private temporary files and removed when the CLI exits.
- Native permission and final-action requests appear in Paseo's approval UI. Questions use forms if the ACP client supports elicitation, otherwise text.
- The legacy default remains Full access unless `default_permission` or `grant_full_access` selects another mode. Native permissions and final-action confirmation are handled by Aside, with requests relayed to Paseo.
- Image/audio prompts and MCP servers are unsupported.
- Prompts run through your local Aside account. The plugin reads Aside's model catalog, transcripts and live event logs; it does not copy browser credentials into Paseo. Logs may contain prompts and errors.

## Development

```sh
git clone https://github.com/JasprW/paseo-aside-provider.git
cd paseo-aside-provider
npm ci
npm run typecheck
npm test
paseo plugin install "$PWD"
npm run test:plugin
```

`npm test` checks history replay without an Aside account. `test:plugin` runs against a live local Paseo daemon and signed-in Aside installation. It consumes model quota, uses public pages or simulated tasks, and archives its own test agent. Do not run it against a user conversation.

See [verification](docs/verification.md), [contributing](CONTRIBUTING.md), and [changelog](CHANGELOG.md).

## Structure

```text
index.server.ts       Provider registration through runAcpProvider
server/connector.ts   In-process ACP streams and cleanup
server/history.ts     Replay supplement for Paseo 0.11.2
server/sessions.ts    Native discovery, search and persistence IDs
server/modes.ts       Legacy Auto mode compatibility
test/                 Local replay and live integration tests
paseo-plugin.json     Compatibility and Git installation build step
```

The bridge implementation belongs to `aside-acp`; this repository pins its revision in the package lock. Update and verify that dependency when changing bridge behavior.

## License

MIT for this plugin. The bridge and its dependencies retain their own terms. See [LICENSE](LICENSE).

Aside branding identifies the integration and is not covered by this repository’s code license. See [third-party notices](THIRD_PARTY_NOTICES.md).
