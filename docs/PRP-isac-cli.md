# PRP: ISAC CLI — Web Page Replication Tool

## Summary

ISAC is a standalone commercial CLI that replicates web pages as pixel-perfect Next.js apps. It wraps the OpenCode engine (headless, invisible to the user) to orchestrate a multi-phase AI pipeline — screenshot capture, design system extraction, animation detection, planning, implementation, and visual verification.

The user interacts only with `isac`. OpenCode runs embedded as the AI engine, like Chromium inside Electron. Users bring their own LLM API key. ISAC charges a separate subscription.

## Architectural Decision

**Wrapper model (Option A)** — ISAC is a standalone product with its own brand.

- User runs `isac replicate <url>`, never sees or interacts with OpenCode directly
- OpenCode is spawned headless via `createOpencode()` from the SDK
- All prompts live as compiled TypeScript in the ISAC binary (IP protected)
- MCP servers (chrome-devtools, motion-dev) are configured programmatically per session
- OpenCode is a **dependency**, not a platform ISAC lives inside

Why not a plugin inside OpenCode: distributing prompts as `.md` files exposes all IP. The wrapper model keeps prompts compiled and minified in the binary.

## Problem

1. The current ISAC pipeline lives as plaintext `.md` files in a Claude Code plugin — anyone can copy the prompts and use them without paying
2. It's locked to Claude Code (single provider, requires Claude subscription)
3. No monetization layer

## Solution

A standalone CLI (`@isac/cli`) that:
- Wraps OpenCode headless as an embedded AI engine (user never sees OpenCode)
- Keeps all prompt engineering compiled in the binary (IP protected)
- Lets users authenticate with any LLM provider (Anthropic, OpenAI, Google, local)
- Validates an ISAC license key before running (subscription revenue)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  $ isac replicate <url>            ← user's only entry  │
│                                       point              │
│  ┌───────────────────────────────────────────────────┐   │
│  │  ISAC CLI (@isac/cli)                             │   │
│  │                                                   │   │
│  │  ┌──────────────┐  ┌──────────────────────────┐   │   │
│  │  │ License      │  │ Pipeline Orchestrator     │   │   │
│  │  │ Validator    │  │                           │   │   │
│  │  │ (api.isac.   │  │ Phase 0 → 1a+1c → 1b     │   │   │
│  │  │  dev)        │  │ → 2 → 3 → 4 → [retry]    │   │   │
│  │  └──────────────┘  └──────────────────────────┘   │   │
│  │                                                   │   │
│  │  ┌──────────────────────────────────────────────┐ │   │
│  │  │ Prompts (compiled TS, minified, no .md)      │ │   │
│  │  │ Templates (string constants, bundled)         │ │   │
│  │  └──────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌───────────────────────┼───────────────────────────┐   │
│  │  OpenCode Engine (embedded, headless, invisible)   │   │
│  │  spawned via createOpencode() from SDK             │   │
│  │                       │                            │   │
│  │  ┌─────────┐  ┌──────┴──────┐  ┌──────────────┐   │   │
│  │  │ Session │  │ LLM Client  │  │ Tool Runner  │   │   │
│  │  │ Manager │  │ (provider   │  │ (bash, edit,  │   │   │
│  │  │         │  │  agnostic)  │  │  read, write) │   │   │
│  │  └─────────┘  └─────────────┘  └──────────────┘   │   │
│  └───────────────────────┼───────────────────────────┘   │
│                          │                               │
│  ┌───────────────────────┼───────────────────────────┐   │
│  │              MCP Servers (auto-configured)          │   │
│  │  ┌────────────────┐  ┌─────────────────────────┐   │   │
│  │  │ chrome-devtools │  │ motion-dev              │   │   │
│  │  │ (local, npx)   │  │ (local, npx)            │   │   │
│  │  └────────────────┘  └─────────────────────────┘   │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌───────────────────────┼───────────────────────────┐   │
│  │       LLM Provider (user's own API key)            │   │
│  │  Anthropic │ OpenAI │ Google │ Ollama │ Bedrock    │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## How the Wrapper Works

When the user runs `isac replicate <url>`, this is what happens under the hood:

```
1. ISAC CLI boots
   └── Validates license key (POST api.isac.dev, cached 24h)

2. ISAC calls createOpencode() from @opencode-ai/sdk
   └── SDK spawns an OpenCode server process (headless, no TUI)
   └── Server listens on localhost:4096 (invisible to user)
   └── SDK returns a client object for programmatic control

3. ISAC configures MCP servers via SDK
   └── client.config → injects chrome-devtools + motion-dev

4. ISAC creates a session
   └── client.session.create({ title: "ISAC: <url>" })

5. ISAC sends prompts phase by phase
   └── client.session.prompt({ parts: [{ text: COMPILED_PROMPT }] })
   └── Prompts come from TypeScript modules (compiled, not .md files)
   └── OpenCode sends them to the LLM (user's configured provider)
   └── OpenCode executes tool calls (file edits, bash, MCP tools)
   └── ISAC receives structured output back

6. ISAC streams progress to terminal
   └── client.event.subscribe() → renders spinner + phase status

7. Pipeline completes
   └── ISAC shuts down OpenCode server process
   └── User has a working Next.js app
```

The user **never** interacts with OpenCode directly. No OpenCode TUI, no OpenCode commands, no OpenCode config visible. ISAC is the brand, OpenCode is the invisible engine.

## User Flow

### First-time setup

```bash
npm install -g @isac/cli

# 1. ISAC license (subscription)
isac auth login
# → Opens browser → isac.dev/login → Stripe checkout → license key saved

# 2. LLM provider (user's own key)
isac provider setup
# → "Which provider? [Anthropic / OpenAI / Google / Other]"
# → "Enter your API key: sk-ant-..."
# → Saved via OpenCode SDK: client.auth.set({ path: { id: "anthropic" }, body: { type: "api", key: "..." } })
# → Stored in ~/.local/share/opencode/auth.json (managed by OpenCode, invisible to user)
```

### Usage

```bash
# Basic replication
isac replicate https://example.com

# With specific model
isac replicate https://example.com --model anthropic/claude-sonnet-4

# With different provider
isac replicate https://example.com --provider openai

# List previous sessions
isac sessions

# Resume a session
isac resume <session-id>

# Check status
isac status
```

## Authentication — 3 Layers

### Layer 1: ISAC License (your server)

```
POST https://api.isac.dev/v1/license/validate
Headers: { "Authorization": "Bearer <license-key>" }
Response: { "valid": true, "plan": "pro", "expires": "2026-03-28" }
```

- Checked on every `isac replicate` invocation
- License key stored in `~/.isac/config.json`
- Managed via `isac auth login` / `isac auth logout` / `isac auth status`

### Layer 2: LLM Provider (via ISAC, powered by OpenCode)

- User runs `isac provider setup` (ISAC's own flow, not OpenCode's TUI)
- ISAC prompts: "Which provider?" → "Enter API key"
- Under the hood: `client.auth.set()` via OpenCode SDK
- Supports 75+ providers out of the box (Anthropic, OpenAI, Google, Bedrock, Ollama, etc.)
- API key stored in `~/.local/share/opencode/auth.json` (managed by OpenCode, invisible)
- User pays the LLM provider directly — ISAC never touches the key after saving

### Layer 3: MCP Servers (automatic)

- chrome-devtools: local, spawned automatically, no auth
- motion-dev: local, spawned automatically, no auth
- Configured programmatically via SDK on each session

## Package Structure

```
@isac/cli/
├── src/
│   ├── index.ts                  # CLI entry point (commander.js)
│   ├── commands/
│   │   ├── replicate.ts          # Main command
│   │   ├── auth.ts               # isac auth login/logout/status
│   │   ├── provider.ts           # isac provider connect/list
│   │   ├── sessions.ts           # isac sessions / isac resume
│   │   └── status.ts             # isac status
│   ├── pipeline/
│   │   ├── orchestrator.ts       # Phase sequencing + retry logic
│   │   ├── phase-0-screenshot.ts
│   │   ├── phase-1a-tokens.ts
│   │   ├── phase-1b-design-system.ts
│   │   ├── phase-1c-animations.ts
│   │   ├── phase-2-planning.ts
│   │   ├── phase-3-implementation.ts
│   │   └── phase-4-verification.ts
│   ├── prompts/                  # PROPRIETARY — compiled into binary
│   │   ├── screenshot-capturer.ts
│   │   ├── ds-extractor.ts
│   │   ├── ds-page-builder.ts
│   │   ├── animation-detector.ts
│   │   ├── page-planner.ts
│   │   ├── page-builder.ts
│   │   └── visual-verifier.ts
│   ├── templates/                # PROPRIETARY — compiled into binary
│   │   ├── design-tokens.css.ts      # exported as string constant
│   │   ├── design-system-page.tsx.ts # exported as string constant
│   │   └── animation-detection.js.ts # exported as string constant
│   ├── license/
│   │   ├── client.ts             # License validation API client
│   │   └── store.ts              # ~/.isac/config.json read/write
│   ├── opencode/
│   │   ├── client.ts             # OpenCode SDK wrapper
│   │   ├── session.ts            # Session create/prompt/abort
│   │   └── mcp.ts                # MCP server configuration
│   └── ui/
│       ├── spinner.ts            # ora spinner for progress
│       ├── logger.ts             # Structured logging
│       └── banner.ts             # ASCII art banner on start
├── package.json
├── tsconfig.json
├── tsup.config.ts                # Bundle + minify (IP protection)
└── README.md
```

## Pipeline Implementation

Each phase is a function that creates an OpenCode session, sends a proprietary prompt, and returns structured results.

### Example: Phase 0 (Screenshot)

```typescript
// src/pipeline/phase-0-screenshot.ts
import { getScreenshotPrompt } from "../prompts/screenshot-capturer"
import type { OpencodeClient } from "../opencode/client"

interface Phase0Result {
  screenshots: string[]  // paths to saved screenshots
  hasDarkMode: boolean
}

export async function phase0Screenshot(
  client: OpencodeClient,
  sessionId: string,
  url: string
): Promise<Phase0Result> {
  // Prompt is a compiled string — never on disk as .md
  const prompt = getScreenshotPrompt(url)

  const result = await client.session.prompt({
    path: { id: sessionId },
    body: {
      parts: [{ type: "text", text: prompt }],
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            screenshots: {
              type: "array",
              items: { type: "string" }
            },
            hasDarkMode: { type: "boolean" }
          },
          required: ["screenshots", "hasDarkMode"]
        }
      }
    }
  })

  return result.data.info.structured_output as Phase0Result
}
```

### Example: Orchestrator

```typescript
// src/pipeline/orchestrator.ts
import { createOpencode } from "@opencode-ai/sdk"
import { phase0Screenshot } from "./phase-0-screenshot"
import { phase1aTokens } from "./phase-1a-tokens"
// ... other phases

export async function runPipeline(url: string, options: PipelineOptions) {
  const { client } = await createOpencode({
    config: {
      mcp: {
        "chrome-devtools": {
          type: "local",
          command: ["npx", "-y", "chrome-devtools-mcp@latest"]
        },
        "motion-dev": {
          type: "local",
          command: ["npx", "-y", "motion-mcp"]
        }
      }
    }
  })

  const session = await client.session.create({
    body: { title: `ISAC: ${url}` }
  })

  const sid = session.id

  // Phase 0
  const screenshots = await phase0Screenshot(client, sid, url)

  // Phase 1a + 1c can run concurrently (1c reuses browser session)
  const [tokens, animations] = await Promise.all([
    phase1aTokens(client, sid, screenshots),
    phase1cAnimations(client, sid, url)
  ])

  // Phase 1b depends on 1a
  const designSystem = await phase1bDesignSystem(client, sid, tokens, screenshots)

  // Phase 2 depends on 1a, 1b, 1c
  const plan = await phase2Planning(client, sid, tokens, designSystem, animations, screenshots)

  // Phase 3
  await phase3Implementation(client, sid, plan, animations)

  // Phase 4 — verification loop (max 3 iterations)
  let approved = false
  for (let i = 0; i < 3 && !approved; i++) {
    const verification = await phase4Verification(client, sid, screenshots)
    if (verification.approved) {
      approved = true
    } else {
      await phase3Implementation(client, sid, {
        ...plan,
        corrections: verification.issues
      }, animations)
    }
  }

  return { session: sid, approved, url }
}
```

## IP Protection Strategy

### Prompts as TypeScript modules

```typescript
// src/prompts/screenshot-capturer.ts
// This gets compiled + minified by tsup — never readable on disk

export function getScreenshotPrompt(url: string): string {
  return `You are a screenshot specialist...

Navigate to ${url} via chrome-devtools MCP.
Wait for complete load (networkIdle).
Resize viewport to 1440px.
Capture full-page screenshot in light mode.
Try emulating dark mode...

[full proprietary prompt]
`
}
```

### Build step (tsup)

```typescript
// tsup.config.ts
import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  minify: true,        // Obfuscates prompt strings
  bundle: true,        // Single file, no readable source tree
  sourcemap: false,    // No reverse engineering
  clean: true,
})
```

### Additional protection options (future)

- Fetch prompts from server at runtime (requires network, but 100% protected)
- Encrypt prompt strings with a key derived from the license (decrypted at runtime)
- Version prompts server-side so updates don't require CLI updates

## License Server (separate repo)

### Stack

- **Runtime**: Cloudflare Workers (or Vercel Edge Functions)
- **Database**: Cloudflare D1 (or Supabase)
- **Payments**: Stripe Checkout + Webhooks
- **Auth**: email + magic link (or GitHub OAuth)

### API Endpoints

```
POST   /v1/auth/login          # Magic link or GitHub OAuth
POST   /v1/auth/verify         # Verify magic link token
GET    /v1/license/validate     # Validate license key (called by CLI)
POST   /v1/stripe/webhook       # Stripe webhook handler
GET    /v1/account              # User account info
POST   /v1/account/cancel       # Cancel subscription
```

### License validation flow

```
CLI boot → POST /v1/license/validate
         → { key: "isk_...", fingerprint: machineId() }
         ← { valid: true, plan: "pro", features: [...], expires: "..." }
         → Cache result for 24h in ~/.isac/cache.json
         → Allow pipeline to run
```

### Pricing (suggestion)

| Plan | Price | Features |
|------|-------|----------|
| Free trial | $0 / 7 days | 3 replications, watermark in output |
| Pro | $29/mo | Unlimited replications, all phases, all providers |
| Team | $19/mo/seat | Pro + shared sessions, priority support |

## Dependencies

### CLI (@isac/cli)

```json
{
  "dependencies": {
    "@opencode-ai/sdk": "latest",
    "commander": "^12.0.0",
    "ora": "^8.0.0",
    "chalk": "^5.0.0",
    "conf": "^13.0.0",
    "node-machine-id": "^1.1.12"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

### System requirements (user's machine)

- Node.js 18+
- Google Chrome running (for chrome-devtools MCP)
- An LLM provider API key (Anthropic, OpenAI, Google, etc.)
- A Next.js project to replicate into

> **Note**: OpenCode is NOT a separate install. `@opencode-ai/sdk` is bundled as a dependency of `@isac/cli`. When the user runs `npm install -g @isac/cli`, they get everything. The OpenCode server binary is spawned automatically by the SDK — the user never installs, configures, or sees OpenCode.

## Implementation Phases

### Phase 1: CLI scaffold + license (Week 1-2)

- [ ] Init `@isac/cli` monorepo
- [ ] CLI entry point with commander.js (replicate, auth, provider, status)
- [ ] License validation client (POST /validate, cache 24h)
- [ ] `~/.isac/config.json` store (license key, preferences)
- [ ] `isac auth login` → opens browser → callback saves key
- [ ] `isac provider connect` → wraps OpenCode `/connect`
- [ ] Basic spinner/progress UI (ora + chalk)

### Phase 2: OpenCode SDK integration (Week 2-3)

- [ ] OpenCode SDK wrapper (create client, manage sessions)
- [ ] MCP server configuration (chrome-devtools, motion-dev)
- [ ] Session management (create, prompt, abort, resume)
- [ ] Event streaming for real-time progress output
- [ ] Error handling + retry logic

### Phase 3: Pipeline migration (Week 3-4)

- [ ] Convert 7 agent prompts from `.md` to TypeScript string modules
- [ ] Convert 3 templates from files to string constants
- [ ] Implement 7 phase functions with structured output schemas
- [ ] Implement orchestrator with dependency graph (0 → 1a+1c → 1b → 2 → 3 → 4)
- [ ] Implement verification correction loop (max 3 iterations)
- [ ] Concurrent execution for independent phases (1a + 1c)

### Phase 4: Build + distribution (Week 4)

- [ ] tsup config (bundle, minify, no sourcemap)
- [ ] npm publish as `@isac/cli`
- [ ] `npx @isac/cli replicate <url>` works
- [ ] README with installation + usage docs
- [ ] Test on fresh machine (macOS, Linux)

### Phase 5: License server (Week 4-5)

- [ ] Cloudflare Workers project
- [ ] Stripe integration (Checkout, webhooks, subscription management)
- [ ] License key generation + validation endpoint
- [ ] Landing page (Next.js on Vercel)
- [ ] Magic link auth (or GitHub OAuth)

### Phase 6: Polish + launch (Week 5-6)

- [ ] Free trial flow (3 replications, watermark)
- [ ] `isac update` self-update command
- [ ] Error messages with actionable suggestions
- [ ] Telemetry (opt-in, anonymous usage stats)
- [ ] Landing page live at isac.dev
- [ ] Product Hunt / Twitter launch

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenCode SDK breaking changes | Pipeline breaks | Pin SDK version, test before upgrading |
| Chrome DevTools MCP instability | Phase 0 + 1c fail | Retry logic, fallback to Puppeteer direct |
| Prompt extraction from minified bundle | IP leak | Phase 2: move to server-side fetch |
| OpenCode requires separate install | Friction | Auto-detect and offer to install |
| User's API key runs out of credits | Pipeline stops mid-run | Estimate token cost upfront, warn user |
| LLM quality varies across providers | Inconsistent results | Recommend Claude Sonnet 4+, test matrix |

## Success Metrics

- **Week 1 post-launch**: 50 installs, 10 paid subscribers
- **Month 1**: 200 installs, 40 paid, < 10% churn
- **Month 3**: 1000 installs, 150 paid, MRR > $4k
- **Quality**: > 80% of replications pass visual verification in <= 2 iterations

## UX: What the User Sees

```
$ isac replicate https://slopforks.com

  ╦╔═╗╔═╗╔═╗
  ║╚═╗╠═╣║
  ╩╚═╝╩ ╩╚═╝  v1.0.0

  License: Pro (expires 2026-04-28)
  Provider: Anthropic (claude-sonnet-4)
  Target: https://slopforks.com

  ● Phase 0: Capturing screenshots...
    ✓ full-page.png (light)
    ✓ full-page-dark.png (dark)

  ● Phase 1a: Extracting design tokens...
    ✓ 14 primitives, 14 semantics, dark mode ready

  ● Phase 1c: Detecting animations...
    ✓ 3 CSS transitions, 0 scroll-triggered

  ● Phase 1b: Building design system docs...
    ✓ app/design-system/page.tsx (9 sections)

  ● Phase 2: Planning page structure...
    ✓ 4 sections: header, hero, leaderboard, CTA

  ● Phase 3: Implementing page...
    ✓ app/page.tsx + layout.tsx + theme-toggle

  ● Phase 4: Visual verification...
    ✓ APPROVED (1st attempt)

  ─────────────────────────────────────
  Done in 4m 32s

  Files created:
    app/globals.css
    app/page.tsx
    app/layout.tsx
    app/components/theme-toggle.tsx
    app/design-system/page.tsx
    app/design-system/layout.tsx
    app/design-system/components/theme-toggle.tsx

  Run: npm run dev → http://localhost:3000
```

No OpenCode branding, no OpenCode logs, no OpenCode TUI. Pure ISAC.

## Open Questions

1. ~~Should OpenCode be bundled as a dependency or required as a global install?~~ **Decided: bundled as dep**
2. Should prompts be compiled into the binary (simpler) or fetched from server (more secure)?
3. Should we support a `--watch` mode for iterative refinement?
4. Should the free trial require credit card upfront?
5. Should we offer a one-time purchase option alongside subscription?
