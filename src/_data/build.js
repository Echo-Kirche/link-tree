import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function readGit(cmd, fallback) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || fallback;
  } catch {
    return fallback;
  }
}

export default function () {
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
  const envCommit = (process.env.COMMIT_REF || '').trim();
  const commit = (envCommit ? envCommit.slice(0, 7) : '') || readGit('git rev-parse --short HEAD', 'unknown');
  const commitNumber = readGit('git rev-list --count HEAD', '0');

  return {
    version: pkg.version || '1.0.0',
    commit,
    commitNumber,
  };
}
