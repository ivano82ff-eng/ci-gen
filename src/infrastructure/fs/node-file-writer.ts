import { writeFileSync } from 'node:fs';
import type { FileWriter } from '../../application/ports/file-writer.js';
import { ConfigWriteError } from '../../domain/errors.js';
import type { Result } from '../../application/result.js';
import { err, ok } from '../../application/result.js';

export class NodeFileWriter implements FileWriter {
  write(path: string, content: string): Result<void, ConfigWriteError> {
    try {
      writeFileSync(path, content, 'utf8');
      return ok(undefined);
    } catch (error) {
      return err(new ConfigWriteError(path, (error as Error).message));
    }
  }
}
