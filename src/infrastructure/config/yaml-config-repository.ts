import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import type { ConfigRepository } from '../../application/ports/config-repository.js';
import type { RawConfig } from '../../domain/schema.js';
import { ConfigReadError } from '../../domain/errors.js';
import type { Result } from '../../application/result.js';
import { err, ok } from '../../application/result.js';

export class YamlConfigRepository implements ConfigRepository {
  load(path: string): Result<RawConfig, ConfigReadError> {
    let content: string;
    try {
      content = readFileSync(path, 'utf8');
    } catch (error) {
      return err(new ConfigReadError(path, (error as Error).message));
    }

    let parsed: unknown;
    try {
      parsed = yaml.load(content);
    } catch (error) {
      return err(new ConfigReadError(path, `YAML: ${(error as Error).message}`));
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return err(new ConfigReadError(path, 'ожидался объект на верхнем уровне'));
    }

    return ok(parsed as RawConfig);
  }
}
