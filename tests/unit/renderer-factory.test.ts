import { RendererFactory } from '../../src/infrastructure/generator/renderer-factory.js';
import { BuildJobRenderer } from '../../src/infrastructure/generator/renderers/build-job-renderer.js';
import { TestJobRenderer } from '../../src/infrastructure/generator/renderers/test-job-renderer.js';
import { DeployJobRenderer } from '../../src/infrastructure/generator/renderers/deploy-job-renderer.js';

describe('RendererFactory', () => {
  const factory = new RendererFactory();

  it('выбирает BuildJobRenderer для build', () => {
    expect(factory.create('build')).toBeInstanceOf(BuildJobRenderer);
  });

  it('выбирает TestJobRenderer для test', () => {
    expect(factory.create('test')).toBeInstanceOf(TestJobRenderer);
  });

  it('выбирает DeployJobRenderer для deploy', () => {
    expect(factory.create('deploy')).toBeInstanceOf(DeployJobRenderer);
  });
});
