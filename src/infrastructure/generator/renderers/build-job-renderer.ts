import { BaseJobRenderer } from './base-job-renderer.js';
import type { Job } from '../../../domain/config.js';
import type { CiTemplate } from '../../../application/ports/ci-template.js';

export class BuildJobRenderer extends BaseJobRenderer {
  protected override renderExtras(job: Job, template: CiTemplate, lines: string[]): void {
    if (job.name !== 'install') return;
    const paths = template.cachePaths();
    if (paths.length === 0) return;
    lines.push('  cache:');
    if (template.name === 'node') {
      lines.push('    key:');
      lines.push('      files:');
      lines.push('        - package-lock.json');
    } else {
      lines.push('    key: "$CI_COMMIT_REF_SLUG"');
    }
    lines.push('    paths:');
    for (const cachePath of paths) {
      lines.push(`      - ${cachePath}`);
    }
  }
}
