import { ZodConfigValidator } from '../../src/infrastructure/config/zod-config-validator.js';
import type { RawConfig } from '../../src/domain/schema.js';

const validator = new ZodConfigValidator();

describe('ZodConfigValidator', () => {
  it('принимает корректный конфиг', () => {
    const result = validator.validate({
      project: 'svc',
      nodeVersion: '20',
      jobs: [{ name: 'build', stage: 'build', script: ['npm ci'] }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.jobs[0]?.rules).toEqual([]);
    }
  });

  it('подставляет дефолт nodeVersion', () => {
    const result = validator.validate({
      project: 'svc',
      jobs: [{ name: 'build', stage: 'build', script: ['npm ci'] }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.nodeVersion).toBe('18');
    }
  });

  it('возвращает ошибку при пустом jobs', () => {
    const result = validator.validate({ project: 'svc', nodeVersion: '20', jobs: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.issues.some((issue) => issue.includes('jobs'))).toBe(true);
    }
  });

  it('возвращает ошибку при неверном stage с путём до поля', () => {
    const result = validator.validate({
      project: 'svc',
      nodeVersion: '20',
      jobs: [{ name: 'x', stage: 'wrong', script: ['ls'] }],
    } as unknown as RawConfig);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.issues[0]).toContain('jobs.0.stage');
    }
  });

  it('возвращает ошибку при неверном формате nodeVersion', () => {
    const result = validator.validate({
      project: 'svc',
      nodeVersion: 'twenty',
      jobs: [{ name: 'x', stage: 'build', script: ['ls'] }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.issues[0]).toContain('nodeVersion');
    }
  });
});
