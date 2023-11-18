import type { Stage } from '../../domain/config.js';
import { GenerationError } from '../../domain/errors.js';
import type { JobRenderer } from './renderers/base-job-renderer.js';
import { BuildJobRenderer } from './renderers/build-job-renderer.js';
import { TestJobRenderer } from './renderers/test-job-renderer.js';
import { DeployJobRenderer } from './renderers/deploy-job-renderer.js';

const defaultRegistry: Readonly<Record<Stage, () => JobRenderer>> = {
  build: (): JobRenderer => new BuildJobRenderer(),
  test: (): JobRenderer => new TestJobRenderer(),
  deploy: (): JobRenderer => new DeployJobRenderer(),
};

export class RendererFactory {
  private readonly registry: Map<Stage, () => JobRenderer>;

  constructor(registry: Readonly<Record<Stage, () => JobRenderer>> = defaultRegistry) {
    this.registry = new Map(Object.entries(registry) as [Stage, () => JobRenderer][]);
  }

  register(stage: Stage, create: () => JobRenderer): void {
    this.registry.set(stage, create);
  }

  create(stage: Stage): JobRenderer {
    const make = this.registry.get(stage);
    if (!make) {
      throw new GenerationError(`Нет стратегии рендеринга для stage "${stage}"`);
    }
    return make();
  }
}
