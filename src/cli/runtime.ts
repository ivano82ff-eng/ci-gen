export interface CliRuntime {
  cwd(): string;
  exit(code: number): void;
  writeOut(text: string): void;
}

export class NodeCliRuntime implements CliRuntime {
  cwd(): string {
    return process.cwd();
  }

  exit(code: number): void {
    process.exit(code);
  }

  writeOut(text: string): void {
    process.stdout.write(text);
  }
}

export class RecordingRuntime implements CliRuntime {
  exitCode = 0;
  stdout = '';

  constructor(private readonly workingDirectory: string) {}

  cwd(): string {
    return this.workingDirectory;
  }

  exit(code: number): void {
    this.exitCode = code;
  }

  writeOut(text: string): void {
    this.stdout += text;
  }
}
