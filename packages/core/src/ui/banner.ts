import chalk from "chalk";

const VERSION = "1.0.0";

export function printBanner() {
  console.log(chalk.bold(`
  ╦╔═╗╔═╗╔═╗
  ║╚═╗╠═╣║
  ╩╚═╝╩ ╩╚═╝  v${VERSION}
`));
}
