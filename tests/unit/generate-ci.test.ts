import { GenerateCiUseCase } from '../../src/application/use-cases/generate-ci.js';
import { ZodConfigValidator } from '../../src/infrastructure/config/zod-config-validator.js';
import { GitlabCiGenerator } from '../../src/infrastructure/generator/gitlab-ci-generator.js';
import { RendererFactory } from '../../src/infrastructure/generator/renderer-factory.js';
import { DefaultTemplateRegistry } from '../../src/infrastructure/templates/template-registry.js';
import { InMemoryMetrics } from '../../src/infrastructure/metrics/in-memory-metrics.js';
import { ok, err } from '../../src/application/result.js';
import type { ConfigRepository } from '../../src/application/ports/config-repository.js';
import type { FileWriter } from '../../src/application/ports/file-writer.js';
import type { Logger } from '../../src/application/ports/logger.js';
import type { ErrorReporter } from '../../src/application/ports/error-reporter.js';
import { ConfigReadError, ConfigWriteError } from '../../src/domain/errors.js';

const silentLogger: Logger = {
  correlationId: 'test',
  info: (): void => {},
  warn: (): void => {},
  error: (): void => {},
  debug: (): void => {},
};

const noopReporter: ErrorReporter = { report: (): void => {} };

function makeRepo(raw: unknown): ConfigRepository {
  return { load: (): ReturnType<ConfigRepository['load']> => ok(raw as never) };
}

function makeWriter(): { writer: FileWriter; written: { path: string; content: string }[] } {
  const written: { path: string; content: string }[] = [];
  const writer: FileWriter = {
    write: (path: string, content: string): ReturnType<FileWriter['write']> => {
      written.push({ path, content });
      return ok(undefined);
    },
  };
  return { written, writer };
}

function makeUseCase(
  repository: ConfigRepository,
  writer: FileWriter,
  metrics = new InMemoryMetrics(),
): GenerateCiUseCase {
  return new GenerateCiUseCase({
    repository,
    validator: new ZodConfigValidator(),
    generator: new GitlabCiGenerator(new RendererFactory()),
    writer,
    templates: new DefaultTemplateRegistry(),
    logger: silentLogger,
    metrics,
    reporter: noopReporter,
  });
}

describe('GenerateCiUseCase', () => {
  it('генерирует и пишет файл', () => {
    const { writer, written } = makeWriter();
    const useCase = makeUseCase(
      makeRepo({
        project: 'svc',
        nodeVersion: '20',
        jobs: [{ name: 'build', stage: 'build', script: ['npm ci'] }],
      }),
      writer,
    );

    const result = useCase.execute({
      inputPath: 'in.yml',
      outputPath: 'out.yml',
      templateName: 'node',
    });

    expect(result.ok).toBe(true);
    expect(written).toHaveLength(1);
    expect(written[0]?.content).toContain('build:');
    expect(written[0]?.content).toContain('stages:');
    expect(written[0]?.content).toContain('node:20-alpine');
    expect(written[0]?.content).not.toContain('  - deploy');
  });

  it('возвращает ошибку, если конфиг невалиден', () => {
    const { writer } = makeWriter();
    const useCase = makeUseCase(makeRepo({ project: 'svc', jobs: [] }), writer);
    const result = useCase.execute({
      inputPath: 'in.yml',
      outputPath: 'out.yml',
      templateName: 'node',
    });
    expect(result.ok).toBe(false);
  });

  it('возвращает ошибку чтения', () => {
    const failingRepo: ConfigRepository = {
      load: () => err(new ConfigReadError('in.yml', 'read fail')),
    };
    const { writer } = makeWriter();
    const useCase = makeUseCase(failingRepo, writer);
    const result = useCase.execute({
      inputPath: 'in.yml',
      outputPath: 'out.yml',
      templateName: 'node',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.name).toBe('ConfigReadError');
    }
  });

  it('возвращает ошибку записи', () => {
    const writer: FileWriter = {
      write: () => err(new ConfigWriteError('out.yml', 'EACCES')),
    };
    const useCase = makeUseCase(
      makeRepo({
        project: 'svc',
        jobs: [{ name: 'build', stage: 'build', script: ['npm ci'] }],
      }),
      writer,
    );
    const result = useCase.execute({
      inputPath: 'in.yml',
      outputPath: 'out.yml',
      templateName: 'node',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.name).toBe('ConfigWriteError');
    }
  });
});
