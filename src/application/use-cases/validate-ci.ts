import type { ConfigRepository } from '../ports/config-repository.js';
import type { ConfigValidator } from '../ports/config-validator.js';
import type { Logger } from '../ports/logger.js';
import type { MetricsCollector } from '../ports/metrics.js';
import type { ErrorReporter } from '../ports/error-reporter.js';
import type { Result } from '../result.js';
import { err, ok } from '../result.js';
import type { Config } from '../../domain/config.js';
import type { DomainError } from '../../domain/errors.js';

export interface ValidateCiInput {
  readonly inputPath: string;
}

export interface ValidateCiDeps {
  readonly repository: ConfigRepository;
  readonly validator: ConfigValidator;
  readonly logger: Logger;
  readonly metrics: MetricsCollector;
  readonly reporter: ErrorReporter;
}

export class ValidateCiUseCase {
  constructor(private readonly deps: ValidateCiDeps) {}

  execute(input: ValidateCiInput): Result<Config, DomainError> {
    const { repository, validator, logger, metrics, reporter } = this.deps;

    logger.debug(`validate: input=${input.inputPath}`);

    const rawResult = repository.load(input.inputPath);
    if (!rawResult.ok) {
      return this.fail(rawResult.error, reporter, logger, metrics);
    }

    const configResult = validator.validate(rawResult.value);
    if (!configResult.ok) {
      return this.fail(configResult.error, reporter, logger, metrics);
    }

    logger.info(`Конфиг валиден: ${input.inputPath} (${configResult.value.jobs.length} job)`);
    return ok(configResult.value);
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
