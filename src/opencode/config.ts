export interface OpenCodeConfig {
  provider: {
    default: string;
  };
  model: {
    default: string;
  };
  mcp: Record<
    string,
    | { type: "local"; command: string[] }
    | { type: "remote"; url: string }
  >;
}

export function buildConfig(): OpenCodeConfig {
  return {
    provider: {
      default: "anthropic",
    },
    model: {
      default: "claude-sonnet-4-20250514",
    },
    mcp: {
      "chrome-devtools": {
        type: "local",
        command: ["npx", "-y", "chrome-devtools-mcp@latest"],
      },
      shadcn: {
        type: "remote",
        url: "https://www.shadcn.io/api/mcp",
      },
      hugeicons: {
        type: "local",
        command: ["npx", "-y", "@hugeicons/mcp-server"],
      },
      reactbits: {
        type: "local",
        command: ["npx", "-y", "reactbits-mcp-server"],
      },
    },
  };
}
