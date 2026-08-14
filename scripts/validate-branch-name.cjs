const { execSync } = require('node:child_process');

const TYPES = [
  'feat',
  'fix',
  'chore',
  'refactor',
  'docs',
  'test',
  'build',
  'ci',
  'style',
  'perf',
  'revert',
  'release',
];
const PATTERN = new RegExp(`^(${TYPES.join('|')})/[\\w.-]+$`);
const ALLOWED_TRUNKS = new Set(['main', 'develop', 'dev', 'staging']);
const ALLOWED_PREFIXES = ['dependabot/', 'renovate/'];

function currentBranch() {
  if (process.argv[2]) {
    return process.argv[2];
  }
  return execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf8',
  }).trim();
}

function main() {
  const branch = currentBranch();

  if (ALLOWED_TRUNKS.has(branch)) {
    return;
  }
  if (ALLOWED_PREFIXES.some((prefix) => branch.startsWith(prefix))) {
    return;
  }
  if (!PATTERN.test(branch)) {
    console.error(`[branch-name] La rama '${branch}' no cumple la convención.`);
    console.error(`  Esperado: <tipo>/<slug>  donde tipo ∈ {${TYPES.join(', ')}}`);
    console.error(
      `  Trunks permitidos: ${[...ALLOWED_TRUNKS].join(', ')}. Prefijos: ${ALLOWED_PREFIXES.join(', ')}`,
    );
    console.error(
      '  Ejemplo: feat/login-screen | fix/remito-print | chore/rename-ryes-to-branches',
    );
    process.exit(1);
  }
}

main();
