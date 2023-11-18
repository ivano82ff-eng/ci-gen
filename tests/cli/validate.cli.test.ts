import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProgram } from '../../src/cli/program.js';
import { createApp } from '../../src/cli/create-app.js';
import { RecordingRuntime } from '../../src/cli/runtime.js';

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

describe('CLI validate', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'ci-gen-val-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('код 0 для корректного конфига', async () => {
    writeFileSync(
      join(dir, 'ci-gen.yml'),
      `
project: demo
jobs:
  - name: build
    stage: build
    script:
      - npm ci
`,
      'utf8',
    );
    const runtime = await runCli(dir, ['validate']);
    expect(runtime.exitCode).toBe(0);
  });

  it('код 1 и не пишет файл при ошибке', async () => {
    writeFileSync(
      join(dir, 'ci-gen.yml'),
      `
project: demo
jobs: []
`,
      'utf8',
    );
    const runtime = await runCli(dir, ['validate', '--metrics']);
    expect(runtime.exitCode).toBe(1);
    expect(runtime.stdout).toContain('ci_gen_errors_total{type="validation"} 1');
  });
});

describe('CLI verbose and metrics', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'ci-gen-obs-'));
    writeFileSync(
      join(dir, 'ci-gen.yml'),
      `
project: demo
jobs:
  - name: build
    stage: build
    script:
      - npm ci
`,
      'utf8',
    );
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('флаг --metrics печатает prometheus после generate', async () => {
    const runtime = await runCli(dir, ['generate', '--metrics']);
    expect(runtime.exitCode).toBe(0);
    expect(runtime.stdout).toContain('ci_gen_files_generated_total 1');
  });
});
