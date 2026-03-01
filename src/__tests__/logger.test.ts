import { describe, it, expect } from "vitest";
import { log } from "../ui/logger.js";

describe("Logger", () => {
  it("elapsed formats seconds correctly", () => {
    // 5 seconds
    const fiveSecsAgo = Date.now() - 5000;
    const result = log.elapsed(fiveSecsAgo);
    expect(result).toMatch(/^\d+s$/);
  });

  it("elapsed formats minutes and seconds", () => {
    // 125 seconds = 2m 5s
    const start = Date.now() - 125_000;
    const result = log.elapsed(start);
    expect(result).toMatch(/^\d+m \d+s$/);
  });

  it("elapsed handles zero", () => {
    const result = log.elapsed(Date.now());
    expect(result).toBe("0s");
  });

  it("log methods exist and are callable", () => {
    expect(typeof log.phase).toBe("function");
    expect(typeof log.success).toBe("function");
    expect(typeof log.error).toBe("function");
    expect(typeof log.warn).toBe("function");
    expect(typeof log.info).toBe("function");
    expect(typeof log.divider).toBe("function");
    expect(typeof log.summary).toBe("function");
  });
});
