#!/usr/bin/env node
const { spawn } = require('node:child_process');
const path = require('node:path');

const args = process.argv.slice(2);
const binName = process.platform === 'win32' ? 'eslint.cmd' : 'eslint';
const eslintBin = path.join(process.cwd(), 'node_modules', '.bin', binName);

const child = spawn(eslintBin, args, {
  env: { ...process.env, ESLINT_USE_FLAT_CONFIG: 'false' },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
