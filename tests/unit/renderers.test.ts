import { BuildJobRenderer } from '../../src/infrastructure/generator/renderers/build-job-renderer.js';
import { TestJobRenderer } from '../../src/infrastructure/generator/renderers/test-job-renderer.js';
import { DeployJobRenderer } from '../../src/infrastructure/generator/renderers/deploy-job-renderer.js';
import { NodeTemplate } from '../../src/infrastructure/templates/node-template.js';
import type { Job } from '../../src/domain/config.js';

const template = new NodeTemplate();

const baseJob: Job = {
  name: 'build',
  stage: 'build',
  image: 'node:20-alpine',
  script: ['npm ci'],
  rules: [],
};

describe('renderers', () => {
  it('BuildJobRenderer добавляет cache для install', () => {
    const out = new BuildJobRenderer().render({ ...baseJob, name: 'install' }, template);
    expect(out).toContain('cache:');
    expect(out).toContain('node_modules/');
    expect(out).toContain('package-lock.json');
  });

  it('BuildJobRenderer не добавляет cache для обычного build', () => {
    const out = new BuildJobRenderer().render(baseJob, template);
    expect(out).not.toContain('cache:');
  });

  it('TestJobRenderer добавляет coverage', () => {
    const out = new TestJobRenderer().render({ ...baseJob, stage: 'test', name: 'test' }, template);
    expect(out).toContain('coverage:');
  });

  it('DeployJobRenderer добавляет environment', () => {
    const out = new DeployJobRenderer().render(
      { ...baseJob, stage: 'deploy', name: 'deploy' },
      template,
    );
    expect(out).toContain('environment:');
    expect(out).toContain('production');
  });

  it('рендерит rules, если они есть', () => {
    const out = new TestJobRenderer().render(
      {
        ...baseJob,
        rules: ['$CI_COMMIT_BRANCH == "main"'],
      },
      template,
    );
    expect(out).toContain("if: '$CI_COMMIT_BRANCH == \"main\"'");
  });
});
