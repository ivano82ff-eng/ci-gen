import type { ErrorKind } from '../../domain/errors.js';

export type { ErrorKind };

export interface MetricsCollector {
  incrementGenerated(): void;
  incrementError(kind: ErrorKind): void;
  toPrometheus(): string;
}
