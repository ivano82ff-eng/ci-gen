import { randomUUID } from 'node:crypto';
import type { Logger } from '../application/ports/logger.js';
import type { MetricsCollector } from '../application/ports/metrics.js';
import type { ErrorReporter } from '../application/ports/error-reporter.js';
import { GenerateCiUseCase } from '../application/use-cases/generate-ci.js';
import { ValidateCiUseCase } from '../application/use-cases/validate-ci.js';
import { YamlConfigRepository } from '../infrastructure/config/yaml-config-repository.js';
import { ZodConfigValidator } from '../infrastructure/config/zod-config-validator.js';
import { GitlabCiGenerator } from '../infrastructure/generator/gitlab-ci-generator.js';
import { RendererFactory } from '../infrastructure/generator/renderer-factory.js';
import { NodeFileWriter } from '../infrastructure/fs/node-file-writer.js';
import { ConsoleLogger } from '../infrastructure/logger/console-logger.js';
import { InMemoryMetrics } from '../infrastructure/metrics/in-memory-metrics.js';
import { SentryErrorReporter } from '../infrastructure/sentry/sentry-error-reporter.js';
import { DefaultTemplateRegistry } from '../infrastructure/templates/template-registry.js';

export interface ComposeOptions {
  readonly verbose: boolean;
  readonly correlationId?: string;
  readonly sentryDsn?: string;
}

export interface App {
  readonly generate: GenerateCiUseCase;
  readonly validate: ValidateCiUseCase;
  readonly logger: Logger;
  readonly metrics: MetricsCollector;
  readonly reporter: ErrorReporter;
}

export function createApp(options: ComposeOptions): App {
  const correlationId = options.correlationId ?? randomUUID();
  const logger = new ConsoleLogger({ verbose: options.verbose, correlationId });
  const metrics = new InMemoryMetrics();
  const reporter = new SentryErrorReporter(options.sentryDsn ?? process.env.SENTRY_DSN);
  const repository = new YamlConfigRepository();
  const validator = new ZodConfigValidator();
  const templates = new DefaultTemplateRegistry();
  const generator = new GitlabCiGenerator(new RendererFactory());
  const writer = new NodeFileWriter();

  const shared = { repository, validator, logger, metrics, reporter };

  return {
    generate: new GenerateCiUseCase({
      ...shared,
      generator,
      writer,
      templates,
    }),
    validate: new ValidateCiUseCase(shared),
    logger,
    metrics,
    reporter,
  };
}
