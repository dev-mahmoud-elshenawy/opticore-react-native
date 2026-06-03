#!/usr/bin/env node
/**
 * opticore-install-peers
 *
 * One-shot installer for every OptiCore peer dependency. Detects the package
 * manager and runs `expo install` (preferred — picks SDK-aligned versions)
 * or falls back to `npm install` for non-Expo projects.
 *
 * Usage:
 *   npx opticore-install-peers              # required + optional peers
 *   npx opticore-install-peers --required   # required peers only
 *   npx opticore-install-peers --optional   # optional peers only
 *   npx opticore-install-peers --dry-run    # print the command but don't run
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REQUIRED = [
  'expo-secure-store',
  '@react-native-async-storage/async-storage',
  '@react-native-community/netinfo',
];

// Optional peers — Expo modules, because OptiCore's clipboard/device adapter
// chains PREFER them and they ship inside Expo Go (the bare RN equivalents,
// react-native-device-info / @react-native-clipboard/clipboard, only work in a
// custom dev build — install those manually if you're on a bare RN workflow).
const OPTIONAL = [
  'expo-clipboard',
  'expo-device',
  'expo-application',
];

function parseArgs(argv) {
  const flags = new Set(argv.slice(2));
  return {
    requiredOnly: flags.has('--required'),
    optionalOnly: flags.has('--optional'),
    dryRun: flags.has('--dry-run'),
  };
}

function detectExpo(cwd) {
  const pkgPath = resolve(cwd, 'package.json');
  if (!existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return Boolean(
      pkg.dependencies?.expo ||
        pkg.devDependencies?.expo ||
        pkg.peerDependencies?.expo,
    );
  } catch {
    return false;
  }
}

function detectPackageManager(cwd) {
  if (existsSync(resolve(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(resolve(cwd, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

function buildCommand({ isExpo, manager, packages }) {
  if (isExpo) {
    // `expo install` resolves SDK-compatible versions automatically.
    return { command: 'npx', args: ['expo', 'install', ...packages] };
  }
  switch (manager) {
    case 'pnpm':
      return { command: 'pnpm', args: ['add', ...packages] };
    case 'yarn':
      return { command: 'yarn', args: ['add', ...packages] };
    default:
      return { command: 'npm', args: ['install', ...packages] };
  }
}

function main() {
  const cwd = process.cwd();
  const { requiredOnly, optionalOnly, dryRun } = parseArgs(process.argv);

  let packages = [...REQUIRED, ...OPTIONAL];
  if (requiredOnly) packages = REQUIRED;
  if (optionalOnly) packages = OPTIONAL;

  const isExpo = detectExpo(cwd);
  const manager = detectPackageManager(cwd);
  const { command, args } = buildCommand({ isExpo, manager, packages });

  const banner = isExpo
    ? '📦 OptiCore: installing peers via `expo install` (SDK-aligned)'
    : `📦 OptiCore: installing peers via \`${manager}\``;
  console.log(`\n${banner}\n   ${command} ${args.join(' ')}\n`);

  if (dryRun) {
    console.log('   (dry run — nothing executed)\n');
    return;
  }

  const result = spawnSync(command, args, { stdio: 'inherit', cwd });
  if (result.status !== 0) {
    console.error(
      `\n❌ Peer install failed (exit ${result.status}). ` +
        'Run with --dry-run to inspect the command.\n',
    );
    process.exit(result.status ?? 1);
  }

  console.log('\n✅ Peers installed. You can now build your dev client.\n');
}

main();
