# Verification

## 0.3.1 Electron authentication fix

Pins aside-acp 0.4.1, commit `8516e1b282b4c09b6a3d90b9095a41485be07163`.

The user-reported missing-helper error was reproduced as a code-signing failure in Paseo Helper (Electron 44.2.0, Node 24.20.0): macOS rejects Aside's native addon because its Team ID differs from Paseo's. The file exists, and standalone Node can load it, but signing then fails with SecItemCopyMatching -34018 because Node lacks Aside's Keychain entitlement. Updating the installed CLI was not the remedy.

Authentication now runs through the signed Aside CLI's normal account-status command using a temporary loopback relay limited to daemon authentication and read-only account-summary routes. A diagnostic from the exact Paseo Helper runtime completed authentication and read an existing native session successfully. It printed only success booleans, not session contents or tokens. Type/syntax/diff checks passed. No automated tests, model turns, permission mutations or approval UI exercises were run; approval decisions remain for manual testing.

## 0.3.0 native permissions and Final confirm

Pins aside-acp 0.4.0, commit `e7ff56e903379c6ea14f308b2f68d4e65ef25225`.

Static type/syntax/diff checks and plugin installation status only. No automated tests, model turns, native permission mutations or approval UI exercises were run for this update. Existing config-option count expectation was updated for the additional setting. Prior verification results below apply to their stated versions, not this new native relay.

Contracts were inspected from Aside CLI 1.26.1010.1739, daemon 1.26.1011.1437, current desktop selector code and Paseo 0.11.2. Native mode defaults, CLI's forced `finalConfirm: false`, authenticated local tRPC, persisted suspensions and ID-checked reply schemas were read directly from the installed runtime. Paseo's CJS bundle initially rejected an import.meta-based require anchor; it was replaced with the installed CLI's absolute path. Runtime helpers use those contracts; actual authentication, native mutations and UI behavior remain for manual testing.

Manual checks: change each mode and Final confirm choice; import/reconnect a chat; trigger a Guard folder-access request and allow/reject it; review a simulated final-action confirmation and cancel it without taking an external action; answer in Aside and confirm the Paseo buttons disappear; interrupt/reload with a pending request; verify Skip confirmation retains Guard access checks. No successful live approval is claimed by the static checks.

## 0.2.2 provider icon size

The provider SVG viewBox is reduced from 40 to 32 units and centered on the original brand mark, increasing its rendered size by 25%. Static type and diff checks only; no automated tests or visual UI checks were run. Bridge dependency unchanged.

## 0.2.1 native permission modes

Pins aside-acp 0.3.1, commit `19cac4381304667de8b96efa4014c92402b9e917`. Static type/syntax checks only. Aside CLI help, built-in Aside skill, desktop permission schemas/templates and local session metadata were inspected read-only. No automated tests, permission mutations, model turns or UI tests were run. Native switching, Read only initialization and confirmation UI remain for manual testing.

## 0.2.0 native history import

Pins aside-acp 0.3.0, commit `42c0b44f74be394c19e030b4cac4823cc2b261c5`. Static type/syntax checks only; no automated tests, imports or model turns. Paseo 0.11.2 discovery/replay contracts and local Aside metadata/transcript layouts were inspected read-only. Import UI rendering and continuation remain for manual testing.

## 0.1.2 error reporting

Pins aside-acp 0.2.2, commit `3e5268b1082552d7788a7e645a30b4a1512aeb2d`. Static checks only; no new agent turns or UI tests. Existing user-run logs confirmed real streaming and an upstream content-filter rejection; this update improves error reporting without bypassing that rejection.

## 0.1.1 streaming update

Pins aside-acp 0.2.1, commit `4adde06fcda235ce4f96832b2b0ea2632fe5a535`. Static type/syntax checks only; no new agent turns or UI tests were run. The raw-event contract was inspected in installed Aside CLI 1.26.1010.1739. Assistant text and exposed thinking are now streamed; browser tool calls remain unrendered.

## Earlier 0.1.0 checks

Local verification on 2026-10-11 (Asia/Singapore), using Paseo 0.11.2 and Aside CLI 1.26.1010.1739 on macOS.

| Check | Result |
| --- | --- |
| TypeScript provider entry and connector | Passed |
| Isolated replay regressions (`npm test`) | 5/5 |
| Bridge protocol regressions | 6/6 |
| Standalone ACP browser, controls and cancellation | 9/9 |
| ACP disconnect/reconnect | 11/11 |
| Simulated ACP approval | 5/5 |
| Initial local Paseo integration | 14/14 |
| Public GitHub installation, full Paseo integration | 14/14 |
| GitHub Actions: typecheck, replay tests, package contents | Passed |

The live checks use real browser navigation to example.com, public Wikipedia pages for cancellation, and simulated approvals. They cover model and thinking controls, conversation replay, native session continuity, approval denial, cancellation, explicit errors and hot reload while a turn is active.

The public artifact was installed with `paseo plugin install git:JasprW/paseo-aside-provider`, using the manifest's production dependency preparation step. The plugin reached `running`; the Aside provider diagnostic reported 70 models and `Ready`. The complete live integration suite then passed again against that Git installation.

The bridge dependency is pinned to aside-acp 0.2.0, commit `fa41bc9b20150e1938944b85190156a8d1fdc272`, downloaded over HTTPS with lockfile integrity verification.

These checks verify the provider protocol and local daemon. No visual client audit was performed. Individual tool calls and thinking details are not rendered. Other operating systems and later Paseo releases have not been verified.
