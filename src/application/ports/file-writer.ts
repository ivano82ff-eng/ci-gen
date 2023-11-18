import type { Result } from '../result.js';
import type { ConfigWriteError } from '../../domain/errors.js';

export interface FileWriter {
  write(path: string, content: string): Result<void, ConfigWriteError>;
}
