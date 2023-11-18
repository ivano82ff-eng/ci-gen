import type { CiTemplate } from '../../application/ports/ci-template.js';

export class NodeTemplate implements CiTemplate {
  readonly name = 'node' as const;

  defaultImage(languageVersion: string): string {
    return `node:${languageVersion}-alpine`;
  }

  cachePaths(): readonly string[] {
    return ['node_modules/'];
  }

  coverageRegex(): string | null {
    return '/All files\\\\s*\\\\|\\\\s*(\\\\d+\\\\.\\\\d+)/';
  }
}
