import type { ConfigRepository } from '../ports/config-repository.js';
import type { ConfigValidator } from '../ports/config-validator.js';
import type { CiGenerator } from '../ports/ci-generator.js';
import type { FileWriter } from '../ports/file-writer.js';
import type { Logger } from '../ports/logger.js';
import type { MetricsCollector } from '../ports/metrics.js';
import type { ErrorReporter } from '../ports/error-reporter.js';
import type { TemplateRegistry } from '../ports/template-registry.js';
import type { Result } from '../result.js';
import { err, ok } from '../result.js';
import type { TemplateName } from '../../domain/config.js';
import type { DomainError } from '../../domain/errors.js';

export interface GenerateCiInput {
  readonly inputPath: string;
  readonly outputPath: string;
  readonly templateName: TemplateName;
}

export interface GenerateCiDeps {
  readonly repository: ConfigRepository;
  readonly validator: ConfigValidator;
  readonly generator: CiGenerator;
  readonly writer: FileWriter;
  readonly templates: TemplateRegistry;
  readonly logger: Logger;
  readonly metrics: MetricsCollector;
  readonly reporter: ErrorReporter;
}

export class GenerateCiUseCase {
  constructor(private readonly deps: GenerateCiDeps) {}

  execute(input: GenerateCiInput): Result<void, DomainError> {
    const { repository, validator, generator, writer, templates, logger, metrics, reporter } =
      this.deps;

    logger.debug(`generate: template=${input.templateName} input=${input.inputPath}`);

    const templateResult = templates.get(input.templateName);
    if (!templateResult.ok) {
      return this.fail(templateResult.error, reporter, logger, metrics);
    }

    const rawResult = repository.load(input.inputPath);
    if (!rawResult.ok) {
      return this.fail(rawResult.error, reporter, logger, metrics);
    }

    const configResult = validator.validate(rawResult.value);
    if (!configResult.ok) {
      return this.fail(configResult.error, reporter, logger, metrics);
    }

    const outputResult = generator.generate(configResult.value, templateResult.value);
    if (!outputResult.ok) {
      return this.fail(outputResult.error, reporter, logger, metrics);
    }

    const writeResult = writer.write(input.outputPath, outputResult.value);
    if (!writeResult.ok) {
      return this.fail(writeResult.error, reporter, logger, metrics);
    }

    metrics.incrementGenerated();
    logger.info(`Сгенерировано: ${input.outputPath}`);
    return ok(undefined);
  }

  private fail(
    error: DomainError,
    reporter: ErrorReporter,
    logger: Logger,
    metrics: MetricsCollector,
  ): Result<never, DomainError> {
    logger.error(error.message);
    metrics.incrementError(error.code);
    reporter.report(error, { correlationId: logger.correlationId });
    return err(error);
  }
}
