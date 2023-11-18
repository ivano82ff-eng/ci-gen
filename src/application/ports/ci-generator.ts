import type { Result } from '../result.js';
import type { Config } from '../../domain/config.js';
import type { CiTemplate } from './ci-template.js';
import type { GenerationError } from '../../domain/errors.js';

export interface CiGenerator {
  generate(config: Config, template: CiTemplate): Result<string, GenerationError>;
}
