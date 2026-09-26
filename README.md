# Jev Tool & Model Router

A TypeScript routing library and Next.js lab for selecting from a fixed set of tools or models with TypeSafe AI's Jev, explicit confidence policies, and inspectable fallbacks.

**Jev selects. Your application authorizes and executes.** This is an unofficial [TypeSafeAI community](https://github.com/TypeSafeAI) project, not the official SDK or a production authorization system. The community organization was created by VC Moderator [@BunsDev](https://github.com/BunsDev).

[Try the lab](https://route.jev.works) · [Developer guide](docs/discovery/README.md) · [Detailed API reference](REFERENCE.md) · [Contributing](CONTRIBUTING.md) · [Agent instructions](AGENTS.md)

![Jev Router: selection is separate from authorization](docs/discovery/assets/social-preview.svg)

## What it does

```text
request + allowed options → Jev choice → validation + fallback → effective option
                                                                  |
                                             your authorization and executor
```

The shared `createRouter` engine asks a closed-set `choice` question, preserves the original selection and scores, applies deterministic policy, and returns the effective option plus a fallback reason. It does not execute the chosen tool or invoke the selected downstream model. A live Jev classification is a provider call; the no-key demo is a labeled local simulation.

The root package is private. This is source in a repository, not a published `npm install typesafe-router` package. Imports using this project's aliases work inside this checkout; integrate deliberately rather than assuming a registry distribution exists.

## Run locally

Use npm and the committed `package-lock.json`. The manifest has no Node/package-manager pin; use a Node version supported by the checked-in Next.js dependency. See the [CI workflow](.github/workflows/ci.yml) for the tested runtime.

```sh
git clone https://github.com/TypeSafeAI/typesafe-router.git
cd typesafe-router
npm ci
npm run dev
```

Open the address printed by Next.js. No key means local mock mode. For intentional live evaluation, follow the [credential and deployment reference](REFERENCE.md#bring-your-own-key-and-privacy); automated tests and screenshots must not spend provider credits.

A browser key overrides the server key, and without either the lab uses its mock. Browser keys persist in unencrypted localStorage and travel through this deployment's server, so use a deployment you trust and remove keys from shared machines. Never put a key in a URL, client bundle, screenshot, export, or `NEXT_PUBLIC_` variable.

## Policy outcomes

| Situation | Behavior |
| --- | --- |
| Valid high-confidence selection | Return the permitted option ID as evidence for the host |
| Low-confidence model choice | Use the configured `safe_default` policy |
| Low-confidence tool choice | Request clarification with no effective tool ID |
| Invalid configuration or missing mandatory fallback | Reject before the provider call |
| Provider/transport failure | Propagate failure; do not manufacture a successful mock result |

The policy name `safe_default` is not a guarantee of harmless execution. Preserve `no_tool_needed`, mandatory fallbacks, unique option IDs, threshold validation, and the distinction between original and effective selections. The host still owns permissions, budgets, privacy, approvals, and dispatch through a trusted registry.

## Source map

| Path | Responsibility |
| --- | --- |
| `lib/jevRouter.ts` | Validation, request construction, routing policy and logs |
| `lib/jevClient.ts` | Provider wire format, normalization and errors |
| `lib/routerConfigs.ts` | Example options and required fallback choices |
| `lib/mockRouter.ts` | Keyword-based local demonstration |
| `types/router.ts`, `lib/index.ts` | Types and public source exports |
| `app/api/route/route.ts` | Server endpoint and credential boundary |
| `components/RouterLab.tsx` | Interactive lab and state |
| `lib/apiKeyStorage.ts`, `lib/labStorage.ts` | Separate browser key and lab persistence |

The [complete pre-existing reference](REFERENCE.md) retains all API examples, storage/export semantics, request limits, proxy/rate-limit guidance, and wire-format details without deleting technical documentation. Historical transferred-owner links remain there; the canonical current clone URL is the TypeSafeAI URL above.

## Verify changes

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run e2e
node --test scripts/social-metadata.test.mjs
```

The browser suite builds and serves a no-key demo. The sharing test checks rendered OG/Twitter metadata, an actual PNG response and its dimensions, and captures the browse-only interface. CI retains browser evidence on successful as well as failed runs. Review the exact run rather than treating a workflow file as proof that checks passed.

For UI changes, also inspect both router modes, option editing, null clarification, key removal, storage/export behavior, themes, keyboard controls, and narrow layouts. Do not weaken validation or lower thresholds to obtain favorable screenshots.

## Share and contribute

The site includes a public 1200×630 OG image route containing editorial copy only. The SVG in this README is separate editable repository artwork, not a screenshot. Follow the [developer/sharing guide](docs/discovery/README.md) for actual image-response and capture evidence.

`repository-metadata.json` records intended About text/topics; it does not apply GitHub settings or upload a Social preview. Do not claim deployed behavior from a source commit alone. Keep unofficial attribution, existing notices, and applicable licensing intact; this change does not grant a new license or imply vendor endorsement.

Official product resources are [typesafe.ai](https://typesafe.ai) and [docs.typesafe.ai](https://docs.typesafe.ai), separate from this community lab.
