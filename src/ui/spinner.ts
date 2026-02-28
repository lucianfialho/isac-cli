import ora, { type Ora } from "ora";

export function createSpinner(text: string): Ora {
  return ora({ text, spinner: "dots" });
}

export async function withSpinner<T>(
  text: string,
  fn: (spinner: Ora) => Promise<T>
): Promise<T> {
  const s = createSpinner(text).start();
  try {
    const result = await fn(s);
    s.succeed();
    return result;
  } catch (err) {
    s.fail();
    throw err;
  }
}
