# Contributing

Use Node.js 22 and install dependencies with `npm ci`. Before opening a pull request, run:

```sh
npm run typecheck
npm test
npm pack --dry-run
```

CI runs these checks without an Aside account. For provider behavior, also run `npm run test:plugin` on macOS with a local signed-in Aside installation. It consumes model quota and creates its own test agent.

Bridge fixes belong in [aside-acp](https://github.com/JasprW/aside-acp). Pin an updated bridge revision and regenerate the lockfile after those changes are released. Keep the official ACP shim for standard protocol behavior; vendor-specific supplements should remain small.

Include reproduction steps, Paseo and Aside versions, and redacted errors in bug reports. Never commit account settings, credentials, session transcripts or logs containing personal data.
