import { GitlabCiGenerator } from '../../src/infrastructure/generator/gitlab-ci-generator.js';
import { RendererFactory } from '../../src/infrastructure/generator/renderer-factory.js';
import { NodeTemplate } from '../../src/infrastructure/templates/node-template.js';
import type { Config } from '../../src/domain/config.js';

const template = new NodeTemplate();
const generator = new GitlabCiGenerator(new RendererFactory());

const config: Config = {
  project: 'svc',
  nodeVersion: '20',
  jobs: [
    { name: 'deploy', stage: 'deploy', script: ['./deploy.sh'], rules: ['$CI_COMMIT_TAG'] },
    { name: 'install', stage: 'build', script: ['npm ci'], rules: [] },
    { name: 'test', stage: 'test', script: ['npm test'], rules: [] },
  ],
};

describe('GitlabCiGenerator', () => {
  it('группирует job\'ы и фиксирует порядок stage: build → test → deploy', () => {
    const result = generator.generate(config, template);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const buildAt = result.value.indexOf('# --- build ---');
    const testAt = result.value.indexOf('# --- test ---');
    const deployAt = result.value.indexOf('# --- deploy ---');
    expect(buildAt).toBeGreaterThan(-1);
    expect(testAt).toBeGreaterThan(buildAt);
    expect(deployAt).toBeGreaterThan(testAt);
    expect(result.value).toMatch(/stages:\n {2}- build\n {2}- test\n {2}- deploy/);
  });

  it('пишет заголовок с default, stages и комментарием о генерации', () => {
    const result = generator.generate(config, template);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain('# Сгенерировано ci-gen для проекта svc');
    expect(result.value).toContain('default:');
    expect(result.value).toContain('image: node:20-alpine');
  });
});
