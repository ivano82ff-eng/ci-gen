import type { CiTemplate } from '../../application/ports/ci-template.js';

export class PythonTemplate implements CiTemplate {
  readonly name = 'python' as const;

  defaultImage(languageVersion: string): string {
    return `python:${languageVersion}-alpine`;
  }

  cachePaths(): readonly string[] {
    return ['.pip-cache/'];
  }

  coverageRegex(): string | null {
    return '/TOTAL\\\\s+\\\\d+\\\\s+\\\\d+\\\\s+(\\d+%)/';
  }
}
