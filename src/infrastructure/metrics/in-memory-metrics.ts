import type { MetricsCollector } from '../../application/ports/metrics.js';
import type { ErrorKind } from '../../domain/errors.js';

const KINDS: readonly ErrorKind[] = ['read', 'validation', 'generation', 'write'];

export class InMemoryMetrics implements MetricsCollector {
  private generated = 0;
  private readonly errors: Record<ErrorKind, number> = {
    read: 0,
    validation: 0,
    generation: 0,
    write: 0,
  };

  incrementGenerated(): void {
    this.generated += 1;
  }

  incrementError(kind: ErrorKind): void {
    this.errors[kind] += 1;
  }

  toPrometheus(): string {
    const lines = [
      '# HELP ci_gen_files_generated_total Number of generated CI files',
      '# TYPE ci_gen_files_generated_total counter',
      `ci_gen_files_generated_total ${this.generated}`,
      '# HELP ci_gen_errors_total Number of errors by type',
      '# TYPE ci_gen_errors_total counter',
      ...KINDS.map((kind) => `ci_gen_errors_total{type="${kind}"} ${this.errors[kind]}`),
    ];
    return `${lines.join('\n')}\n`;
  }
}
