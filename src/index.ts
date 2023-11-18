#!/usr/bin/env node
import { createProgram } from './cli/program.js';
import { createApp } from './cli/create-app.js';
import { NodeCliRuntime } from './cli/runtime.js';

const runtime = new NodeCliRuntime();

try {
  createProgram((verbose) => createApp({ verbose }), runtime).parse();
} catch {
  // Commander exitOverride already forwarded the code to runtime.exit
}
