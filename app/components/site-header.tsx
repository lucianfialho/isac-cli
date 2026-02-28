"use client";

const SANS =
  'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "var(--sf-warm-400)",
        textDecoration: "none",
        transition: "color 0.1s cubic-bezier(0.165, 0.84, 0.44, 1)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.color = "var(--sf-warm-100)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.color = "var(--sf-warm-400)")
      }
    >
      {children}
    </a>
  );
}

function CtaButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: SANS,
        fontSize: 14,
        fontWeight: 500,
        padding: "8px 20px",
        borderRadius: 9999,
        border: "1px solid var(--sf-warm-600)",
        color: "var(--sf-warm-100)",
        textDecoration: "none",
        transition: "background-color 0.2s ease",
        background: "transparent",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background =
          "var(--sf-warm-900)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "transparent")
      }
    >
      {children}
    </a>
  );
}

export function SiteHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: 68,
        background: "var(--sf-black)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        borderBottom: "1px solid var(--sf-warm-900)",
      }}
    >
      {/* Anthropic logo */}
      <a
        href="https://www.anthropic.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: "none",
          color: "var(--sf-warm-100)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg
          width="32"
          height="20"
          viewBox="0 0 120 72"
          fill="currentColor"
        >
          <path d="M81.5 0L120 72H100.2L61.7 0H81.5ZM38.3 0L0 72H19.8L58.3 0H38.3Z" />
        </svg>
      </a>

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          fontFamily: SANS,
          fontSize: 14,
        }}
      >
        <NavLink href="https://www.anthropic.com/research">Research</NavLink>
        <NavLink href="https://www.anthropic.com/economic-futures">
          Economic Futures
        </NavLink>
        <NavLink href="https://www.anthropic.com/commitments">
          Commitments
        </NavLink>
        <NavLink href="https://www.anthropic.com/learn">Learn</NavLink>
        <NavLink href="https://www.anthropic.com/news">News</NavLink>
        <CtaButton href="https://claude.ai/">Try Claude</CtaButton>
      </nav>
    </header>
  );
}
