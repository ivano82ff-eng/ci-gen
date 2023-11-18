export type ErrorKind = 'read' | 'validation' | 'generation' | 'write';

export class DomainError extends Error {
  readonly code: ErrorKind;

  constructor(message: string, code: ErrorKind) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

export class ConfigReadError extends DomainError {
  constructor(path: string, cause: string) {
    super(`Не удалось прочитать конфиг "${path}": ${cause}`, 'read');
    this.name = 'ConfigReadError';
  }
}

export class ConfigValidationError extends DomainError {
  constructor(public readonly issues: readonly string[]) {
    super(
      `Конфиг не прошёл валидацию:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`,
      'validation',
    );
    this.name = 'ConfigValidationError';
  }
}

export class GenerationError extends DomainError {
  constructor(message: string) {
    super(message, 'generation');
    this.name = 'GenerationError';
  }
}

export class ConfigWriteError extends DomainError {
  constructor(path: string, cause: string) {
    super(`Не удалось записать "${path}": ${cause}`, 'write');
    this.name = 'ConfigWriteError';
  }
}
