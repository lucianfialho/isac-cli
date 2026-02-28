import { getClient } from "./client.js";
import { log } from "../ui/logger.js";
import type { Ora } from "ora";

export interface StreamEvent {
  type: string;
  data?: any;
}

export async function streamSession(
  sessionId: string,
  spinner?: Ora
): Promise<void> {
  const client = getClient();

  try {
    const events = client.chat.events(sessionId);

    for await (const event of events) {
      handleEvent(event, spinner);
    }
  } catch {
    // Stream ended or not supported — silent fallback
  }
}

function handleEvent(event: StreamEvent, spinner?: Ora): void {
  switch (event.type) {
    case "tool_use":
      if (spinner && event.data?.name) {
        spinner.text = `Using ${event.data.name}...`;
      }
      break;
    case "text_delta":
      // Silent — we wait for the full result
      break;
    case "error":
      log.error(`Stream error: ${event.data?.message ?? "unknown"}`);
      break;
  }
}
