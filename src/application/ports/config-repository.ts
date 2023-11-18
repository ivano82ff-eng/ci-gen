import type { Result } from '../result.js';
import type { RawConfig } from '../../domain/schema.js';
import type { ConfigReadError } from '../../domain/errors.js';

export interface ConfigRepository {
  load(path: string): Result<RawConfig, ConfigReadError>;
}
