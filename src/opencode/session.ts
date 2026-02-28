import { getClient } from "./client.js";
import { log } from "../ui/logger.js";

export async function createSession(): Promise<string> {
  const client = getClient();
  const session = await client.session.create();
  log.dim(`  Session created: ${session.id}`);
  return session.id;
}

export async function sendPrompt(
  sessionId: string,
  prompt: string,
  options?: {
    model?: string;
    format?: {
      type: string;
      schema: Record<string, unknown>;
    };
  }
): Promise<string> {
  const client = getClient();

  const result = await client.chat.send({
    sessionId,
    content: prompt,
    ...(options?.model && { model: options.model }),
    ...(options?.format && { format: options.format as any }),
  });

  return extractResult(result);
}

export function extractResult(result: any): string {
  if (typeof result === "string") return result;

  // Handle structured response
  if (result?.content) {
    if (typeof result.content === "string") return result.content;
    if (Array.isArray(result.content)) {
      return result.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("\n");
    }
  }

  // Handle message array
  if (Array.isArray(result)) {
    const lastAssistant = result
      .filter((m: any) => m.role === "assistant")
      .pop();
    if (lastAssistant) return extractResult(lastAssistant);
  }

  return JSON.stringify(result);
}
