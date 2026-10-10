# Aside provider for Paseo

[![Check](https://github.com/JasprW/paseo-aside-provider/actions/workflows/ci.yml/badge.svg)](https://github.com/JasprW/paseo-aside-provider/actions/workflows/ci.yml)

Use [Aside](https://aside.com)'s browser agent from [Paseo](https://paseo.sh). Select **Aside**, choose a model and thinking effort, and send browser tasks from your desktop or phone.

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

## Settings

The bridge reads `~/.aside-acp.json`. Omit it to use defaults, or use this minimal example:

```json
{
  "account": 1,
  "default_effort": "medium",
  "grant_full_access": true
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
| `grant_full_access` | Aside full access mode, default `true` |
| `style`, `owner_name` | Bridge persona preferences |

`ASIDE_ACP_CONFIG` chooses another config file, `ASIDE_ACP_CLI` selects the executable, `ASIDE_HOME` selects Aside's data directory, and `ASIDE_ACP_LOG_FILE` enables file diagnostics. Reload the plugin after changing daemon environment variables. Per-agent Paseo environment overrides are not forwarded.

## Behavior and limits

- Model and thinking controls update the same native Aside session. Browser context survives agent and plugin reloads.
- Conversation text is saved in `~/.aside-acp/sessions` and replayed into Paseo after reconnecting.
- Replies stream as assistant text. Individual browser tool calls and thinking details are not rendered.
- `[[APPROVAL]]` requests appear in Paseo's approval UI. Questions appear as forms if the ACP client supports elicitation, otherwise as text.
- Full access is enabled by default. Asking before external actions is a prompt-based convention, not an enforced permission boundary.
- Image/audio prompts and MCP servers are unsupported.
- Prompts run through your local Aside account. The plugin reads Aside's model catalog and transcripts; it does not copy browser credentials into Paseo. Logs may contain prompts and errors.

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
test/                 Local replay and live integration tests
paseo-plugin.json     Compatibility and Git installation build step
```

The bridge implementation belongs to `aside-acp`; this repository pins its revision in the package lock. Update and verify that dependency when changing bridge behavior.

## License

MIT for this plugin. The bridge and its dependencies retain their own terms. See [LICENSE](LICENSE).
