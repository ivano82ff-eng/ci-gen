import type { Job } from '../../../domain/config.js';
import type { CiTemplate } from '../../../application/ports/ci-template.js';

export interface JobRenderer {
  render(job: Job, template: CiTemplate): string;
}

export abstract class BaseJobRenderer implements JobRenderer {
  render(job: Job, template: CiTemplate): string {
    const lines: string[] = [];
    this.renderHeader(job, template, lines);
    this.renderStage(job, lines);
    this.renderImage(job, template, lines);
    this.renderRules(job, lines);
    this.renderScript(job, lines);
    this.renderExtras(job, template, lines);
    return lines.join('\n');
  }

  protected renderHeader(job: Job, _template: CiTemplate, lines: string[]): void {
    lines.push(`${job.name}:`);
  }

  protected renderStage(job: Job, lines: string[]): void {
    lines.push(`  stage: ${job.stage}`);
  }

  protected renderImage(job: Job, template: CiTemplate, lines: string[]): void {
    const image = job.image ?? template.defaultImage('20');
    lines.push(`  image: ${image}`);
  }

  protected renderRules(job: Job, lines: string[]): void {
    if (job.rules.length === 0) return;
    lines.push('  rules:');
    for (const rule of job.rules) {
      lines.push(`    - if: '${rule}'`);
    }
  }

  protected renderScript(job: Job, lines: string[]): void {
    lines.push('  script:');
    for (const command of job.script) {
      lines.push(`    - ${command}`);
    }
  }

  protected renderExtras(_job: Job, _template: CiTemplate, _lines: string[]): void {
    // точка расширения для наследников
  }
}
