import { BaseJobRenderer } from './base-job-renderer.js';
import type { Job } from '../../../domain/config.js';
import type { CiTemplate } from '../../../application/ports/ci-template.js';

export class TestJobRenderer extends BaseJobRenderer {
  protected override renderExtras(_job: Job, template: CiTemplate, lines: string[]): void {
    const coverage = template.coverageRegex();
    if (!coverage) return;
    lines.push(`  coverage: "${coverage}"`);
  }
}
