import type { CiTemplate } from '../../application/ports/ci-template.js';

export class GoTemplate implements CiTemplate {
  readonly name = 'go' as const;

  defaultImage(languageVersion: string): string {
    return `golang:${languageVersion}-alpine`;
  }

  cachePaths(): readonly string[] {
    return ['.go/pkg/mod/'];
  }

  coverageRegex(): string | null {
    return '/coverage:\\\\s*([\\d.]+%)/';
  }
}
