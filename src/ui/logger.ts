import chalk from "chalk";

export const log = {
  info(msg: string): void {
    console.log(chalk.blue("info") + "  " + msg);
  },
  success(msg: string): void {
    console.log(chalk.green("ok") + "    " + msg);
  },
  warn(msg: string): void {
    console.log(chalk.yellow("warn") + "  " + msg);
  },
  error(msg: string): void {
    console.error(chalk.red("err") + "   " + msg);
  },
  phase(n: number, name: string): void {
    console.log(
      "\n" + chalk.bold.cyan(`Phase ${n}`) + chalk.dim(` — ${name}`)
    );
  },
  dim(msg: string): void {
    console.log(chalk.dim(msg));
  },
};
