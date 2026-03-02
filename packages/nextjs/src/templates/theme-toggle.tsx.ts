export const THEME_TOGGLE_TEMPLATE = `"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "ds-theme";

function getSnapshot(): Theme {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(cb: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    html.setAttribute("data-theme", theme);
  }
}

const CYCLE: Theme[] = ["light", "dark", "system"];
const LABELS: Record<Theme, string> = { system: "Auto", light: "Light", dark: "Dark" };
const ICONS: Record<Theme, string> = { system: "◑", light: "☀", dark: "☾" };

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Apply saved theme on mount and listen for system theme changes
  useEffect(() => {
    applyTheme(getSnapshot());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if (getSnapshot() === "system") applyTheme("system"); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const idx = CYCLE.indexOf(theme);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }

  return (
    <button
      onClick={toggle}
      aria-label={\`Theme: \${LABELS[theme]}\`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        fontSize: 13,
        fontWeight: 500,
        border: "1px solid var(--color-border-primary)",
        borderRadius: 9999,
        background: "var(--color-bg-secondary)",
        color: "var(--color-text-primary)",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
    >
      <span>{ICONS[theme]}</span>
      <span>{LABELS[theme]}</span>
    </button>
  );
}
`;
