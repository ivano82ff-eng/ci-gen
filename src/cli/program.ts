import { Command } from 'commander';
import type { App } from './create-app.js';
import { registerGenerateCommand } from './commands/generate.command.js';
import { registerValidateCommand } from './commands/validate.command.js';
import type { CliRuntime } from './runtime.js';

export function createProgram(
  compose: (verbose: boolean) => App,
  runtime: CliRuntime,
): Command {
  const program = new Command();
  program
    .name('ci-gen')
    .description('CLI-генератор GitLab CI из YAML-конфига')
    .version('1.0.0')
    .option('--verbose', 'подробные логи с correlation id')
    .option('--metrics', 'вывести метрики в Prometheus-формате');

  program.exitOverride((err) => {
    runtime.exit(err.exitCode);
    throw err;
  });

  registerGenerateCommand(program, compose, runtime);
  registerValidateCommand(program, compose, runtime);
  return program;
}
