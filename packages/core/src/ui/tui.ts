import chalk from "chalk";

// ── State ────────────────────────────────────────────────────────────
let currentPhase = "";
let toolCounts: Record<string, number> = {};
let animTimer: ReturnType<typeof setInterval> | null = null;
let blockPos = 0;
let direction = 1;
let phaseStart = 0;
let phaseCostUsd = 0;
let totalCostUsd = 0;

const TRACK_WIDTH = 16;
const BLOCK_WIDTH = 4;
const BLOCK_CHAR = "█";
const BG_CHAR = "░";
const INTERVAL_MS = 80;

// ── Rendering ────────────────────────────────────────────────────────
function renderFrame() {
  const track =
    BG_CHAR.repeat(blockPos) +
    BLOCK_CHAR.repeat(BLOCK_WIDTH) +
    BG_CHAR.repeat(TRACK_WIDTH - BLOCK_WIDTH - blockPos);

  const cost = `$${phaseCostUsd.toFixed(2)}`;
  const line = `  ${chalk.cyan(track)}  ${chalk.dim(currentPhase)}  ${chalk.dim(cost)}`;
  process.stdout.write(`\r\x1b[K${line}`);

  // Ping-pong
  blockPos += direction;
  if (blockPos >= TRACK_WIDTH - BLOCK_WIDTH) {
    blockPos = TRACK_WIDTH - BLOCK_WIDTH;
    direction = -1;
  } else if (blockPos <= 0) {
    blockPos = 0;
    direction = 1;
  }
}

function startAnimation() {
  stopAnimation();
  blockPos = 0;
  direction = 1;
  animTimer = setInterval(renderFrame, INTERVAL_MS);
}

function stopAnimation() {
  if (animTimer) {
    clearInterval(animTimer);
    animTimer = null;
  }
  // Clear the line
  process.stdout.write("\r\x1b[K");
}

// ── Public API ───────────────────────────────────────────────────────
export function setPhase(phaseName: string) {
  if (animTimer) {
    // Auto-succeed previous phase
    const elapsed = formatElapsed(Date.now() - phaseStart);
    stopAnimation();
    console.log(chalk.green(`  ✓ ${currentPhase} (${elapsed} — $${phaseCostUsd.toFixed(2)})`));
  }

  currentPhase = phaseName;
  toolCounts = {};
  phaseCostUsd = 0;
  phaseStart = Date.now();
  startAnimation();
}

export function updateStatus(text: string) {
  currentPhase = text;
}

export function succeedPhase(message?: string) {
  const elapsed = formatElapsed(Date.now() - phaseStart);
  const label = message ?? currentPhase;
  stopAnimation();
  console.log(chalk.green(`  ✓ ${label} (${elapsed} — $${phaseCostUsd.toFixed(2)})`));
}

export function failPhase(message?: string) {
  const label = message ?? `${currentPhase} failed`;
  stopAnimation();
  console.log(chalk.red(`  ✗ ${label} ($${phaseCostUsd.toFixed(2)})`));
}

export function renderEvent(event: Record<string, unknown>) {
  if (!event) return;

  const type = event.type as string | undefined;

  if (type === "assistant" && event.subtype === "tool_use") {
    const toolName = (event.tool_name as string) ?? "unknown";
    toolCounts[toolName] = (toolCounts[toolName] ?? 0) + 1;

    const shortName = toolName.replace("mcp__chrome-devtools__", "chrome:");
    currentPhase = `${currentPhase.split(" — ")[0]} — ${shortName}`;
  }

  if (type === "result") {
    const cost = event.cost_usd as number | undefined;
    if (cost !== undefined && cost > 0) {
      phaseCostUsd = cost;
      totalCostUsd += cost;
    }

    const text = (event.result as string) ?? "";
    if (text.length > 100) {
      currentPhase = `${currentPhase.split(" — ")[0]} — processing result...`;
    }
  }
}

export function renderToolUse(toolName: string) {
  const shortName = toolName.replace("mcp__chrome-devtools__", "chrome:");
  currentPhase = `${currentPhase.split(" — ")[0]} — ${shortName}`;
}

export function getToolCounts(): Record<string, number> {
  return { ...toolCounts };
}

export function getTotalCost(): number {
  return totalCostUsd;
}

export function stopSpinner() {
  stopAnimation();
}

// ── Helpers ──────────────────────────────────────────────────────────
function formatElapsed(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return `${mins}m ${remainSecs}s`;
}
