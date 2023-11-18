import { DefaultTemplateRegistry } from '../../src/infrastructure/templates/template-registry.js';
import { GitlabCiGenerator } from '../../src/infrastructure/generator/gitlab-ci-generator.js';
import { RendererFactory } from '../../src/infrastructure/generator/renderer-factory.js';
import type { Config } from '../../src/domain/config.js';

const registry = new DefaultTemplateRegistry();
const generator = new GitlabCiGenerator(new RendererFactory());

const base: Config = {
  project: 'svc',
  nodeVersion: '20',
  jobs: [{ name: 'install', stage: 'build', script: ['install'], rules: [] }],
};

describe('templates', () => {
  it('node использует node image и cache node_modules', () => {
    const template = registry.get('node');
    expect(template.ok).toBe(true);
    if (!template.ok) return;
    const result = generator.generate({ ...base, nodeVersion: '20' }, template.value);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain('node:20-alpine');
    expect(result.value).toContain('node_modules/');
  });

  it('python использует python image и pip cache', () => {
    const template = registry.get('python');
    expect(template.ok).toBe(true);
    if (!template.ok) return;
    const result = generator.generate({ ...base, nodeVersion: '3.11' }, template.value);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain('python:3.11-alpine');
    expect(result.value).toContain('.pip-cache/');
  });

  it('go использует golang image и module cache', () => {
    const template = registry.get('go');
    expect(template.ok).toBe(true);
    if (!template.ok) return;
    const result = generator.generate({ ...base, nodeVersion: '1.21' }, template.value);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain('golang:1.21-alpine');
    expect(result.value).toContain('.go/pkg/mod/');
  });
});
