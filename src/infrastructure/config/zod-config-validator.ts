import type { ConfigValidator } from '../../application/ports/config-validator.js';
import type { Config } from '../../domain/config.js';
import { ConfigSchema } from '../../domain/schema.js';
import type { RawConfig } from '../../domain/schema.js';
import { ConfigValidationError } from '../../domain/errors.js';
import type { Result } from '../../application/result.js';
import { err, ok } from '../../application/result.js';

export class ZodConfigValidator implements ConfigValidator {
  validate(raw: RawConfig): Result<Config, ConfigValidationError> {
    const result = ConfigSchema.safeParse(raw);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : '<root>';
        return `${path}: ${issue.message}`;
      });
      return err(new ConfigValidationError(issues));
    }
    return ok({
      project: result.data.project,
      nodeVersion: result.data.nodeVersion,
      jobs: result.data.jobs.map((job) => ({
        name: job.name,
        stage: job.stage,
        script: job.script,
        rules: job.rules,
        ...(job.image ? { image: job.image } : {}),
      })),
    });
  }
}
