import type { TemplateName } from '../../domain/config.js';

export interface CiTemplate {
  readonly name: TemplateName;
  defaultImage(languageVersion: string): string;
  cachePaths(): readonly string[];
  coverageRegex(): string | null;
}
