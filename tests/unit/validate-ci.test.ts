import { ValidateCiUseCase } from '../../src/application/use-cases/validate-ci.js';
import { ZodConfigValidator } from '../../src/infrastructure/config/zod-config-validator.js';
import { InMemoryMetrics } from '../../src/infrastructure/metrics/in-memory-metrics.js';
import { ok, err } from '../../src/application/result.js';
import type { ConfigRepository } from '../../src/application/ports/config-repository.js';
import type { Logger } from '../../src/application/ports/logger.js';
import type { ErrorReporter } from '../../src/application/ports/error-reporter.js';
import { ConfigReadError } from '../../src/domain/errors.js';

const silentLogger: Logger = {
  correlationId: 'test',
  info: (): void => {},
  warn: (): void => {},
  error: (): void => {},
  debug: (): void => {},
};

function makeUseCase(repository: ConfigRepository): ValidateCiUseCase {
  return new ValidateCiUseCase({
    repository,
    validator: new ZodConfigValidator(),
    logger: silentLogger,
    metrics: new InMemoryMetrics(),
    reporter: { report: (): void => {} } satisfies ErrorReporter,
  });
}

describe('ValidateCiUseCase', () => {
  it('принимает корректный конфиг', () => {
    const useCase = makeUseCase({
      load: () =>
        ok({
          project: 'svc',
          jobs: [{ name: 'build', stage: 'build', script: ['npm ci'] }],
        }),
    });
    const result = useCase.execute({ inputPath: 'in.yml' });
    expect(result.ok).toBe(true);
  });

  it('возвращает ошибку валидации', () => {
    const useCase = makeUseCase({
      load: () => ok({ project: 'svc', jobs: [] }),
    });
    const result = useCase.execute({ inputPath: 'in.yml' });
    expect(result.ok).toBe(false);
  });

  it('возвращает ошибку чтения', () => {
    const useCase = makeUseCase({
      load: () => err(new ConfigReadError('in.yml', 'ENOENT')),
    });
    const result = useCase.execute({ inputPath: 'in.yml' });
    expect(result.ok).toBe(false);
  });
});
