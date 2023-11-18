import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProgram } from '../../src/cli/program.js';
import { createApp } from '../../src/cli/create-app.js';
import { RecordingRuntime } from '../../src/cli/runtime.js';

const validYaml = `
project: demo
nodeVersion: "20"
jobs:
  - name: install
    stage: build
    script:
      - npm ci
  - name: test
    stage: test
    script:
      - npm test
`;

async function runCli(cwd: string, argv: string[]): Promise<RecordingRuntime> {
  const runtime = new RecordingRuntime(cwd);
  const program = createProgram(
    (verbose) => createApp({ verbose, correlationId: 'cli-test' }),
    runtime,
  );
  try {
    await program.parseAsync(['node', 'ci-gen', ...argv]);
  } catch {
    // commander.exitOverride
  }
  return runtime;
}

describe('CLI generate', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'ci-gen-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('позитивный сценарий: пишет .gitlab-ci.yml и выходит с кодом 0', async () => {
    writeFileSync(join(dir, 'ci-gen.yml'), validYaml, 'utf8');
    const runtime = await runCli(dir, ['generate']);
    expect(runtime.exitCode).toBe(0);
    const out = readFileSync(join(dir, '.gitlab-ci.yml'), 'utf8');
    expect(out).toContain('install:');
    expect(out).toContain('test:');
    expect(out).toContain('# --- build ---');
  });

  it('негативный сценарий: нет файла конфига — код 1', async () => {
    const runtime = await runCli(dir, ['generate', '-i', 'missing.yml']);
    expect(runtime.exitCode).toBe(1);
  });

  it('принимает -i и -o', async () => {
    writeFileSync(join(dir, 'custom.yml'), validYaml, 'utf8');
    const runtime = await runCli(dir, ['generate', '-i', 'custom.yml', '-o', 'out.yml']);
    expect(runtime.exitCode).toBe(0);
    expect(readFileSync(join(dir, 'out.yml'), 'utf8')).toContain('stages:');
  });
});
