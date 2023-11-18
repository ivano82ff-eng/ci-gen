import type { Result } from '../result.js';
import type { Config } from '../../domain/config.js';
import type { RawConfig } from '../../domain/schema.js';
import type { ConfigValidationError } from '../../domain/errors.js';

export interface ConfigValidator {
  validate(raw: RawConfig): Result<Config, ConfigValidationError>;
}
