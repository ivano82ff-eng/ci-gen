import { BaseJobRenderer } from './base-job-renderer.js';
import type { Job } from '../../../domain/config.js';
import type { CiTemplate } from '../../../application/ports/ci-template.js';

export class DeployJobRenderer extends BaseJobRenderer {
  protected override renderExtras(_job: Job, _template: CiTemplate, lines: string[]): void {
    lines.push('  environment:');
    lines.push('    name: production');
  }
}
