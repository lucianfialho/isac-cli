import { ThemeToggle } from "./components/theme-toggle";

/* ─── Font stacks ─── */
const SERIF = 'var(--font-source-serif), Georgia, "Times New Roman", serif';
const SANS =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

/* ─── Leaderboard data ─── */
const projects = [
  {
    rank: 1,
    name: "OpenCode",
    href: "https://github.com/sst/opencode",
    description:
      "Open-source, provider-agnostic AI coding agent — Claude Code reimagined",
    original: "claude-code",
    originalHref: "https://github.com/anthropics/claude-code",
    language: "TypeScript",
    stars: "112.0k",
  },
  {
    rank: 2,
    name: "Void",
    href: "https://github.com/voideditor/void",
    description:
      "The open-source Cursor alternative — VS Code fork with AI agents and checkpoints",
    original: "vscode",
    originalHref: "https://github.com/microsoft/vscode",
    language: "TypeScript",
    stars: "28.3k",
  },
  {
    rank: 3,
    name: "Roo Code",
    href: "https://github.com/RooVetGit/Roo-Code",
    description:
      "Fork of Cline with multi-agent modes — Code, Architect, Debug, Ask",
    original: "cline",
    originalHref: "https://github.com/cline/cline",
    language: "TypeScript",
    stars: "22.4k",
  },
  {
    rank: 4,
    name: "bolt.diy",
    href: "https://github.com/stackblitz-labs/bolt.diy",
    description:
      "Community fork of bolt.new — use any LLM to build full-stack apps",
    original: "bolt.new",
    originalHref: "https://github.com/stackblitz/bolt.new",
    language: "TypeScript",
    stars: "19.1k",
  },
  {
    rank: 5,
    name: "Kilo Code",
    href: "https://github.com/nicepkg/kilo-code",
    description:
      "Fork of Roo Code (which forked Cline) — the slop fork of a slop fork",
    original: "Roo-Code",
    originalHref: "https://github.com/RooVetGit/Roo-Code",
    language: "TypeScript",
    stars: "16.0k",
  },
  {
    rank: 6,
    name: "Melty",
    href: "https://github.com/meltylabs/melty",
    description:
      "VS Code fork where every chat is a git commit — writing half its own code",
    original: "vscode",
    originalHref: "https://github.com/microsoft/vscode",
    language: "TypeScript",
    stars: "5.4k",
  },
  {
    rank: 7,
    name: "vinext",
    href: "#",
    description:
      "Next.js API surface reimplemented on Vite — built in one week with Claude Code",
    original: "next.js",
    originalHref: "https://github.com/vercel/next.js",
    language: "TypeScript",
    stars: "4.4k",
  },
  {
    rank: 8,
    name: "Every Code",
    href: "#",
    description:
      "Fork of OpenAI Codex CLI — adds multi-agent orchestration across providers",
    original: "codex",
    originalHref: "https://github.com/openai/codex",
    language: "Rust",
    stars: "3.5k",
  },
  {
    rank: 9,
    name: "just-bash",
    href: "#",
    description:
      "Bash reimplemented in TypeScript — sandboxed shell for AI agents with 60+ commands",
    original: "bash",
    originalHref: "#",
    language: "TypeScript",
    stars: "1.4k",
  },
  {
    rank: 10,
    name: "LLM Gateway",
    href: "#",
    description:
      "Open-source OpenRouter alternative — unified API for every LLM provider",
    original: "openrouter",
    originalHref: "#",
    language: "TypeScript",
    stars: "917",
  },
  {
    rank: 11,
    name: "Ghostree",
    href: "#",
    description:
      "Ghostty fork with native worktrees — Codex kept trying to PR upstream",
    original: "ghostty",
    originalHref: "https://github.com/ghostty-org/ghostty",
    language: "Zig",
    stars: "61",
  },
];

/* ─── Reusable SVG ─── */
function ForkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.878H6.75v-.878a2.25 2.25 0 1 0-1.5 0ZM8 10.25a.75.75 0 0 1 .75.75v2.25a2.25 2.25 0 1 0-1.5 0V11a.75.75 0 0 1 .75-.75Z" />
    </svg>
  );
}

/* ─── Shared button style ─── */
const submitBtnStyle: React.CSSProperties = {
  display: "inline-block",
  fontFamily: SANS,
  fontSize: 14,
  fontWeight: 500,
  padding: "8px 20px",
  border: "1px solid var(--color-border-secondary)",
  borderRadius: 6,
  background: "var(--color-surface-elevated)",
  color: "var(--color-text-primary)",
  textDecoration: "none",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const submitBtnSmallStyle: React.CSSProperties = {
  ...submitBtnStyle,
  fontSize: 13,
  padding: "6px 16px",
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
      }}
    >
      {/* ═══ HERO / DEFINITION BLOCK ═══ */}
      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "80px 24px 48px",
        }}
      >
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          slop forks
        </h1>

        <div
          style={{
            fontFamily: SANS,
            fontSize: 14,
            color: "var(--color-text-secondary)",
            marginBottom: 2,
          }}
        >
          [släp-fȯrks]
        </div>

        <div
          style={{
            fontFamily: SANS,
            fontSize: 13,
            fontStyle: "italic",
            color: "var(--color-text-secondary)",
            marginBottom: 32,
          }}
        >
          noun, plural
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--color-border-primary)",
            marginBottom: 32,
          }}
        />

        <ol
          style={{
            paddingLeft: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            fontFamily: SANS,
            fontSize: 16,
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          <li>
            A fork of an open-source repository, built primarily with AI, that
            attempts to improve upon, extend, or reimagine the original project.
          </li>
          <li>
            When someone else does it, it&apos;s &ldquo;crafting with
            AI.&rdquo; When you do it, it&apos;s slop.
          </li>
        </ol>

        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: "var(--color-text-secondary)",
            marginBottom: 32,
          }}
        >
          Term coined by{" "}
          <a
            href="https://x.com/cramforce"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "inherit" }}
          >
            Malte Ubl
          </a>
          , creator of{" "}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "inherit" }}
          >
            just-bash
          </a>
          , in Feb 2026. Inspired by{" "}
          <a
            href="https://github.com/southpolesteve"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "inherit" }}
          >
            southpolesteve
          </a>
          &apos;s prolific slopping.
        </p>

        <a href="#" style={submitBtnStyle}>
          Submit Slop
        </a>
      </section>

      {/* ═══ STICKY HEADER (appears when hero scrolls out) ═══ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--color-bg-glass)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            slop forks
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="#" style={submitBtnSmallStyle}>
              Submit Slop
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ═══ LEADERBOARD ═══ */}
      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily: SANS,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Leaderboard
          </h2>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: "var(--color-text-secondary)",
            }}
          >
            Ranked by GitHub stars
          </span>
        </div>

        <div
          style={{
            border: "1px solid var(--color-border-primary)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: SANS,
                fontSize: 14,
                minWidth: 700,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--color-border-primary)",
                    background: "var(--color-bg-secondary)",
                  }}
                >
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                      width: 48,
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Project
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Original
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Language
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "12px 16px",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Stars
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr
                    key={p.rank}
                    style={{
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    {/* Rank */}
                    <td
                      style={{
                        padding: "16px",
                        color: "var(--color-text-secondary)",
                        fontWeight: 500,
                        verticalAlign: "top",
                      }}
                    >
                      {p.rank}
                    </td>

                    {/* Project name + description */}
                    <td style={{ padding: "16px", verticalAlign: "top" }}>
                      <div>
                        <a
                          href={p.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontWeight: 600,
                            textDecoration: "underline",
                            color: "inherit",
                          }}
                        >
                          {p.name}{" "}
                          <span style={{ fontSize: 12 }}>↗</span>
                        </a>
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--color-text-secondary)",
                          marginTop: 4,
                        }}
                      >
                        {p.description}
                      </div>
                    </td>

                    {/* Original repo */}
                    <td style={{ padding: "16px", verticalAlign: "top" }}>
                      <a
                        href={p.originalHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: MONO,
                          fontSize: 13,
                          color: "var(--color-text-secondary)",
                          textDecoration: "underline",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <ForkIcon />
                        {p.original}
                      </a>
                    </td>

                    {/* Language badge */}
                    <td style={{ padding: "16px", verticalAlign: "top" }}>
                      <span
                        style={{
                          fontFamily: SANS,
                          fontSize: 13,
                          padding: "4px 12px",
                          borderRadius: 9999,
                          border: "1px solid var(--color-border-primary)",
                          background: "var(--color-bg-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.language}
                      </span>
                    </td>

                    {/* Star count */}
                    <td
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        fontFamily: MONO,
                        fontWeight: 600,
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            color: "var(--color-accent)",
                            fontSize: 16,
                          }}
                        >
                          ★
                        </span>
                        {p.stars}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 32px",
            border: "1px solid var(--color-border-primary)",
            borderRadius: 8,
            background: "var(--color-bg-secondary)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              Have your own slop?
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: "var(--color-text-secondary)",
              }}
            >
              If you&apos;ve forked a repo and rebuilt it with AI, we want to
              see it.
            </div>
          </div>
          <a href="#" style={submitBtnStyle}>
            Submit Slop
          </a>
        </div>
      </section>
    </div>
  );
}
