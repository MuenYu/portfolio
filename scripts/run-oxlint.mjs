import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const executableName = process.platform === 'win32' ? 'oxlint.cmd' : 'oxlint';
const oxlintPath = join(projectRoot, 'node_modules', '.bin', executableName);

if (!existsSync(oxlintPath)) {
  console.warn('oxlint not found; skipping oxlint step.');
  process.exit(0);
}

const result = spawnSync(oxlintPath, ['--max-warnings=0', '.'], {
  stdio: 'inherit',
  cwd: projectRoot,
});

process.exit(result.status ?? 1);
