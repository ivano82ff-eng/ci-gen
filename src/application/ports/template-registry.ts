import type { Result } from '../result.js';
import type { TemplateName } from '../../domain/config.js';
import type { CiTemplate } from './ci-template.js';
import type { GenerationError } from '../../domain/errors.js';

export interface TemplateRegistry {
  get(name: TemplateName): Result<CiTemplate, GenerationError>;
  names(): readonly TemplateName[];
}
