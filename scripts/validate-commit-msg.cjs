const fs = require('node:fs');

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
const HEADER_PATTERN = new RegExp(`^(${TYPES.join('|')})(\\([a-z0-9._-]+\\))?(!)?: .+$`);
const MAX_LENGTH = 100;

function readSubject(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const line = raw.split('\n').find((l) => l.trim().length > 0 && !l.trim().startsWith('#'));
  return (line || '').trim();
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('[commit-msg] No se recibió el archivo del mensaje.');
    process.exit(1);
  }

  const subject = readSubject(file);

  if (subject.startsWith('Merge ')) {
    return;
  }
  if (subject.length === 0) {
    console.error('[commit-msg] El mensaje de commit está vacío.');
    process.exit(1);
  }
  if (subject.length > MAX_LENGTH) {
    console.error(`[commit-msg] El asunto supera ${MAX_LENGTH} caracteres (${subject.length}).`);
    process.exit(1);
  }
  if (!HEADER_PATTERN.test(subject)) {
    console.error('[commit-msg] El mensaje no sigue Conventional Commits.');
    console.error(`  Formato: <tipo>(<scope>): <asunto imperativo>`);
    console.error(`  Tipos: ${TYPES.join(', ')}`);
    console.error('  Ejemplos:');
    console.error('    feat(auth): add login screen');
    console.error('    chore: rename project ryes to branches');
    process.exit(1);
  }
}

main();
