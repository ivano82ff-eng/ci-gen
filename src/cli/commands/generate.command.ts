import { resolve } from 'node:path';
import type { Command } from 'commander';
import type { TemplateName } from '../../domain/config.js';
import type { App } from '../create-app.js';
import type { CliRuntime } from '../runtime.js';

export interface GenerateOptions {
  readonly input: string;
  readonly output: string;
  readonly template: TemplateName;
  readonly verbose?: boolean;
  readonly metrics?: boolean;
}

export function registerGenerateCommand(
  program: Command,
  compose: (verbose: boolean) => App,
  runtime: CliRuntime,
): void {
  program
    .command('generate')
    .description('Сгенерировать .gitlab-ci.yml из конфига')
    .option('-i, --input <path>', 'путь к конфигу', 'ci-gen.yml')
    .option('-o, --output <path>', 'путь к результату', '.gitlab-ci.yml')
    .option('-t, --template <name>', 'шаблон: node | python | go', 'node')
    .action((opts: GenerateOptions, command: Command) => {
      const globals = command.optsWithGlobals() as { verbose?: boolean; metrics?: boolean };
      const verbose = Boolean(globals.verbose);
      const app = compose(verbose);
      const template = parseTemplate(opts.template, app, runtime);
      if (!template) return;

      const result = app.generate.execute({
        inputPath: resolve(runtime.cwd(), opts.input),
        outputPath: resolve(runtime.cwd(), opts.output),
        templateName: template,
      });

      if (globals.metrics) {
        runtime.writeOut(app.metrics.toPrometheus());
      }

      runtime.exit(result.ok ? 0 : 1);
    });
}

function parseTemplate(
  value: string,
  app: App,
  runtime: CliRuntime,
): TemplateName | undefined {
  if (value === 'node' || value === 'python' || value === 'go') {
    return value;
  }
  app.logger.error(`Неизвестный шаблон "${value}". Доступны: node, python, go`);
  runtime.exit(1);
  return undefined;
}
