# Verification

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

The live checks use real browser navigation to example.com, public Wikipedia pages for cancellation, and simulated approvals. They cover model and thinking controls, conversation replay, native session continuity, approval denial, cancellation, explicit errors and hot reload while a turn is active.

The bridge dependency is pinned to aside-acp 0.2.0, commit `fa41bc9b20150e1938944b85190156a8d1fdc272`, downloaded over HTTPS with lockfile integrity verification.

These checks verify the provider protocol and local daemon. No visual client audit was performed. Individual tool calls and thinking details are not rendered. Other operating systems and later Paseo releases have not been verified.
