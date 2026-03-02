import chalk from "chalk";

declare const __PACKAGE_VERSION__: string;

export function printBanner() {
  console.log(chalk.bold(`
  ╦╔═╗╔═╗╔═╗
  ║╚═╗╠═╣║
  ╩╚═╝╩ ╩╚═╝  v${__PACKAGE_VERSION__}
`));
}
