import chalk from "chalk";

const ASCII = `
  ██╗███████╗ █████╗  ██████╗
  ██║██╔════╝██╔══██╗██╔════╝
  ██║███████╗███████║██║
  ██║╚════██║██╔══██║██║
  ██║███████║██║  ██║╚██████╗
  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝
`;

export function printBanner(): void {
  console.log(chalk.cyan(ASCII));
  console.log(
    chalk.dim("  Intelligent Site Automated Cloner\n")
  );
}
