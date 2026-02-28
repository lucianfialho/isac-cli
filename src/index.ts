import { Command } from "commander";
import { replicateCommand } from "./commands/replicate.js";

const program = new Command()
  .name("isac")
  .description("ISAC — Intelligent Site Automated Cloner")
  .version("0.1.0");

program.addCommand(replicateCommand);

// Lazy-loaded commands (Wave 5)
program
  .command("auth")
  .description("Manage authentication")
  .argument("[action]", "login | logout | status", "status")
  .action(async (action: string) => {
    const { authCommand } = await import("./commands/auth.js");
    await authCommand(action);
  });

program
  .command("provider")
  .description("Configure AI provider")
  .argument("[action]", "setup", "setup")
  .action(async (action: string) => {
    const { providerCommand } = await import("./commands/provider.js");
    await providerCommand(action);
  });

program
  .command("status")
  .description("Show ISAC status")
  .action(async () => {
    const { statusCommand } = await import("./commands/status.js");
    await statusCommand();
  });

program.parse();
