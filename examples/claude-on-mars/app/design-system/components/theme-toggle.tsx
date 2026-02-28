"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(t: Theme) {
  const resolved = t === "system" ? getSystemTheme() : t;
  document.documentElement.setAttribute("data-theme", resolved);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = localStorage.getItem("sf-theme") as Theme | null;
    const initial = saved ?? "system";
    setTheme(initial);
    applyTheme(initial);

    // Listen for system theme changes when in "system" mode
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const current = localStorage.getItem("sf-theme") as Theme | null;
      if (!current || current === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const cycle = useCallback(() => {
    const order: Theme[] = ["system", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("sf-theme", next);
  }, [theme]);

  const icons: Record<Theme, string> = {
    system: "◐",
    light: "☀",
    dark: "☾",
  };

  const labels: Record<Theme, string> = {
    system: "System",
    light: "Light",
    dark: "Dark",
  };

  return (
    <button
      onClick={cycle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        border: "1px solid var(--color-border-secondary)",
        borderRadius: 6,
        background: "var(--color-surface-elevated)",
        color: "var(--color-text-primary)",
        cursor: "pointer",
        transition: "all 150ms ease",
      }}
      title={`Current: ${labels[theme]}. Click to cycle.`}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{icons[theme]}</span>
      {labels[theme]}
    </button>
  );
}
