import { resolve } from 'node:path';
import type { Command } from 'commander';
import type { App } from '../create-app.js';
import type { CliRuntime } from '../runtime.js';

export interface ValidateOptions {
  readonly input: string;
}

export function registerValidateCommand(
  program: Command,
  compose: (verbose: boolean) => App,
  runtime: CliRuntime,
): void {
  program
    .command('validate')
    .description('Проверить конфиг без записи файла')
    .option('-i, --input <path>', 'путь к конфигу', 'ci-gen.yml')
    .action((opts: ValidateOptions, command: Command) => {
      const globals = command.optsWithGlobals() as { verbose?: boolean; metrics?: boolean };
      const verbose = Boolean(globals.verbose);
      const app = compose(verbose);
      const result = app.validate.execute({
        inputPath: resolve(runtime.cwd(), opts.input),
      });

      if (globals.metrics) {
        runtime.writeOut(app.metrics.toPrometheus());
      }

      runtime.exit(result.ok ? 0 : 1);
    });
}
