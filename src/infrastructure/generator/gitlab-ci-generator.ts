import type { CiGenerator } from '../../application/ports/ci-generator.js';
import type { CiTemplate } from '../../application/ports/ci-template.js';
import type { Config, Job, Stage } from '../../domain/config.js';
import { STAGE_ORDER } from '../../domain/config.js';
import { GenerationError } from '../../domain/errors.js';
import type { Result } from '../../application/result.js';
import { err, ok } from '../../application/result.js';
import { RendererFactory } from './renderer-factory.js';

export class GitlabCiGenerator implements CiGenerator {
  constructor(private readonly factory: RendererFactory) {}

  generate(config: Config, template: CiTemplate): Result<string, GenerationError> {
    if (config.jobs.length === 0) {
      return err(new GenerationError('Нет ни одного job для генерации'));
    }

    const parts: string[] = [this.renderHeader(config, template)];
    const grouped = this.groupByStage(config);

    for (const stage of this.usedStages(config)) {
      const jobs = grouped.get(stage);
      if (!jobs) continue;
      parts.push(`# --- ${stage} ---`);
      for (const job of jobs) {
        const resolved: Job = {
          ...job,
          image: job.image ?? template.defaultImage(config.nodeVersion),
        };
        try {
          parts.push(this.factory.create(stage).render(resolved, template));
        } catch (error) {
          if (error instanceof GenerationError) return err(error);
          return err(new GenerationError((error as Error).message));
        }
        parts.push('');
      }
    }

    return ok(parts.join('\n').trimEnd() + '\n');
  }

  private renderHeader(config: Config, template: CiTemplate): string {
    return [
      `# Сгенерировано ci-gen для проекта ${config.project}`,
      `# Шаблон: ${template.name}. Не редактируйте вручную — измените ci-gen.yml и запустите ci-gen generate`,
      '',
      'default:',
      `  image: ${template.defaultImage(config.nodeVersion)}`,
      '',
      'stages:',
      ...this.usedStages(config).map((stage) => `  - ${stage}`),
      '',
    ].join('\n');
  }

  private usedStages(config: Config): readonly Stage[] {
    const present = new Set(config.jobs.map((job) => job.stage));
    return STAGE_ORDER.filter((stage) => present.has(stage));
  }

  private groupByStage(config: Config): Map<Stage, Job[]> {
    const map = new Map<Stage, Job[]>();
    for (const job of config.jobs) {
      const list = map.get(job.stage) ?? [];
      list.push(job);
      map.set(job.stage, list);
    }
    return map;
  }
}
