import { ANIMATION_DETECTION_SCRIPT } from "../templates/animation-detection.js.js";

export function getAnimationDetectorPrompt(url: string): string {
  return `You are a frontend animation specialist. Your job is to visit a live web page and catalog every animation present.

## Your mission

Navigate to the reference URL via chrome-devtools and produce a complete animation catalog at \`.claude/animations/catalog.json\`.

## Target URL

${url}

## Process

1. **Navigate** to the URL via \`navigate_page\`
2. **Wait** for complete load via \`wait_for\` (networkIdle)
3. **Run the detection script** via \`evaluate_script\`:

Execute this script in the page context:

\`\`\`javascript
${ANIMATION_DETECTION_SCRIPT}
\`\`\`

5. **Parse and enhance** the raw catalog:
   - Add \`motionEquivalent\` suggestions for each animation
   - Categorize animations by complexity
6. **Write the catalog** to \`.claude/animations/catalog.json\`

## Additional detection (manual checks)

After the script runs, also check:

1. **Hover effects**: Use \`hover\` on key interactive elements (buttons, links, cards) and observe style changes
2. **Scroll behavior**: Use \`evaluate_script\` to check \`document.documentElement.style.scrollBehavior\`
3. **Loading animations**: Check for skeleton screens or spinners in the initial HTML

## Motion.dev mapping rules

When adding \`motionEquivalent\` to each animation, follow these rules:

| Animation type | Trigger | Motion.dev equivalent |
|---|---|---|
| CSS animation (entrance) | page-load | \`animate(selector, keyframes, options)\` |
| CSS animation (infinite) | page-load | \`animate(selector, keyframes, { repeat: Infinity })\` |
| CSS transition (hover) | hover | Keep as CSS \`transition\` property |
| CSS transition (state) | interaction | \`animate(selector, newState, options)\` |
| Scroll reveal | in-view | \`inView(selector, ({ target }) => animate(target, ...))\` |
| Scroll parallax | scroll | \`scroll(animate(selector, keyframes), { target })\` |
| Staggered entrance | page-load | \`animate(selector, keyframes, { delay: stagger(0.1) })\` |
| Complex sequence | page-load | \`timeline([...])\` from \`motion\` |

## Output format

Write \`.claude/animations/catalog.json\` with this structure:

\`\`\`json
{
  "url": "${url}",
  "detectedLibraries": [],
  "keyframes": {},
  "animations": [],
  "summary": { "total": 0, "byType": {}, "byTrigger": {}, "complexity": "none" }
}
\`\`\`

## Success criteria

- Catalog file exists at \`.claude/animations/catalog.json\`
- All CSS animations on the page are detected
- All CSS transitions on interactive elements are detected
- Each animation has a \`motionEquivalent\` suggestion
- Summary accurately reflects the animation count and complexity`;
}
