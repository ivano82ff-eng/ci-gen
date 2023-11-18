import type { Logger } from '../../application/ports/logger.js';

export interface LogSink {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

const consoleSink: LogSink = {
  info: (message: string): void => {
    console.log(message);
  },
  warn: (message: string): void => {
    console.warn(message);
  },
  error: (message: string): void => {
    console.error(message);
  },
};

export class ConsoleLogger implements Logger {
  readonly correlationId: string;

  constructor(
    private readonly options: { readonly verbose: boolean; readonly correlationId: string },
    private readonly sink: LogSink = consoleSink,
  ) {
    this.correlationId = options.correlationId;
  }

  info(message: string): void {
    this.sink.info(this.format('info', message));
  }

  warn(message: string): void {
    this.sink.warn(this.format('warn', message));
  }

  error(message: string): void {
    this.sink.error(this.format('error', message));
  }

  debug(message: string): void {
    if (!this.options.verbose) return;
    this.sink.info(this.format('debug', message));
  }

  private format(level: string, message: string): string {
    return `[${this.correlationId}] ${level}: ${message}`;
  }
}
