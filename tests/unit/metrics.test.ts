import { InMemoryMetrics } from '../../src/infrastructure/metrics/in-memory-metrics.js';

describe('InMemoryMetrics', () => {
  it('считает успешные генерации и ошибки по типам', () => {
    const metrics = new InMemoryMetrics();
    metrics.incrementGenerated();
    metrics.incrementGenerated();
    metrics.incrementError('validation');
    metrics.incrementError('read');

    const text = metrics.toPrometheus();
    expect(text).toContain('ci_gen_files_generated_total 2');
    expect(text).toContain('ci_gen_errors_total{type="validation"} 1');
    expect(text).toContain('ci_gen_errors_total{type="read"} 1');
    expect(text).toContain('ci_gen_errors_total{type="generation"} 0');
    expect(text).toContain('ci_gen_errors_total{type="write"} 0');
  });
});
