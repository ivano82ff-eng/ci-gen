export type Stage = 'build' | 'test' | 'deploy';

export type TemplateName = 'node' | 'python' | 'go';

export interface Job {
  readonly name: string;
  readonly stage: Stage;
  readonly image?: string;
  readonly script: readonly string[];
  readonly rules: readonly string[];
}

export interface Config {
  readonly project: string;
  readonly nodeVersion: string;
  readonly jobs: readonly Job[];
}

export const STAGE_ORDER: readonly Stage[] = ['build', 'test', 'deploy'];
