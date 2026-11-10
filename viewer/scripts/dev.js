// Starts several `npm run dev` processes from one terminal, with prefixed output.
// Ctrl+C stops all of them, and if one of them crashes the rest are stopped too.
//
//   node scripts/dev.js              viewer server + viewer client
//   node scripts/dev.js --with-main  also the main app's server + client (../server, ../client)
//
// It only *runs* the main app's existing `dev` scripts; it never modifies those folders.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const withMain = process.argv.includes('--with-main');

const targets = [
  { name: 'viewer-server', dir: path.join(root, 'server'), color: 36 },
  { name: 'viewer-client', dir: path.join(root, 'client'), color: 35 },
];
if (withMain) {
  targets.push(
    { name: 'main-server', dir: path.resolve(root, '..', 'server'), color: 33 },
    { name: 'main-client', dir: path.resolve(root, '..', 'client'), color: 32 },
  );
}

// Fail early with a clear message instead of a confusing "vite not found".
const missing = targets.filter((t) => !fs.existsSync(path.join(t.dir, 'node_modules')));
if (missing.length) {
  console.error('Dependencies are not installed for:');
  for (const t of missing) console.error(`  - ${path.relative(process.cwd(), t.dir) || '.'}`);
  console.error(missing.some((t) => t.name.startsWith('viewer'))
    ? '\nRun "npm run setup" in the viewer folder first (the main app folders need their own "npm install").'
    : '\nRun "npm install" in those folders first.');
  process.exit(1);
}

const width = Math.max(...targets.map((t) => t.name.length));
const children = [];
let stopping = false;
let exitCode = 0;

function prefixLines(target, stream, out) {
  let buffer = '';
  const tag = `\x1b[${target.color}m${target.name.padEnd(width)} |\x1b[0m `;
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();
    for (const line of lines) out.write(`${tag}${line}\n`);
  });
  stream.on('end', () => buffer && out.write(`${tag}${buffer}\n`));
}

function kill(child) {
  if (child.exitCode !== null || child.killed) return;
  try {
    if (isWin) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(-child.pid, 'SIGTERM'); // whole process group (npm -> node)
  } catch {
    /* already gone */
  }
}

function stopAll(code) {
  if (stopping) return;
  stopping = true;
  exitCode = code;
  children.forEach(kill);
  setTimeout(() => process.exit(exitCode), 1500).unref();
}

for (const target of targets) {
  const child = spawn('npm', ['run', 'dev'], {
    cwd: target.dir,
    shell: isWin, // npm is npm.cmd on Windows
    detached: !isWin, // own process group so we can stop the whole tree
    env: { ...process.env, FORCE_COLOR: '1' },
  });
  children.push(child);
  prefixLines(target, child.stdout, process.stdout);
  prefixLines(target, child.stderr, process.stderr);
  child.on('error', (err) => {
    console.error(`${target.name}: failed to start: ${err.message}`);
    stopAll(1);
  });
  child.on('exit', (code, signal) => {
    if (stopping) {
      if (children.every((c) => c.exitCode !== null || c.signalCode !== null)) process.exit(exitCode);
      return;
    }
    console.error(`\n${target.name} exited (${signal || `code ${code}`}); stopping the others.`);
    stopAll(code || 1);
  });
}

console.log(`Starting: ${targets.map((t) => t.name).join(', ')}  (Ctrl+C to stop all)\n`);
process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
