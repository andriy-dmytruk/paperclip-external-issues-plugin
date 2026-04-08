#!/usr/bin/env node

import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(__dirname, '..', '..');
const stateRoot = await mkdtemp(join(tmpdir(), 'agent-companies-manager-e2e-'));
const paperclipHome = join(stateRoot, 'paperclip-home');
const dataDir = join(stateRoot, 'paperclip-data');
const instanceId = 'agent-companies-manager-e2e';
const baseUrl = process.env.PAPERCLIP_E2E_BASE_URL ?? 'http://127.0.0.1:3100';
const defaultTimeoutMs = 30000;
const env = {
  ...process.env,
  CI: 'true',
  BROWSER: 'none',
  DO_NOT_TRACK: '1',
  PAPERCLIP_OPEN_ON_LISTEN: 'false',
  PAPERCLIP_TELEMETRY_DISABLED: '1',
  PAPERCLIP_HOME: paperclipHome,
  PAPERCLIP_INSTANCE_ID: instanceId,
  FORCE_COLOR: '0'
};

let serverProcess;
let cleanedUp = false;

function log(message) {
  console.log(`[agent-companies-manager:e2e] ${message}`);
}

function getPaperclipCommandArgs(args) {
  return ['-p', 'node@20', '-p', 'paperclipai', 'paperclipai', ...args];
}

function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: pluginRoot,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr?.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
        return;
      }

      rejectPromise(new Error(`${command} ${args.join(' ')} exited with code ${code}\n${stdout}\n${stderr}`));
    });
  });
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {})
    },
    ...init
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} ${text}`);
  }

  return body;
}

async function ensureConfigFile(configPath) {
  await mkdir(dirname(configPath), { recursive: true });
  await mkdir(join(dataDir, 'logs'), { recursive: true });
  await mkdir(join(dataDir, 'storage'), { recursive: true });
  await mkdir(join(dataDir, 'backups'), { recursive: true });

  const config = {
    $meta: {
      version: 1,
      updatedAt: new Date().toISOString(),
      source: 'doctor'
    },
    database: {
      mode: 'embedded-postgres',
      embeddedPostgresDataDir: join(dataDir, 'db'),
      embeddedPostgresPort: 54329,
      backup: {
        enabled: true,
        intervalMinutes: 60,
        retentionDays: 30,
        dir: join(dataDir, 'backups')
      }
    },
    logging: {
      mode: 'file',
      logDir: join(dataDir, 'logs')
    },
    server: {
      deploymentMode: 'local_trusted',
      exposure: 'private',
      host: '127.0.0.1',
      port: 3100,
      serveUi: true,
      allowedHostnames: []
    },
    telemetry: {
      enabled: false
    },
    auth: {
      baseUrlMode: 'auto',
      disableSignUp: false
    },
    storage: {
      provider: 'local_disk',
      localDisk: {
        baseDir: join(dataDir, 'storage')
      },
      s3: {
        bucket: 'paperclip-e2e-placeholder',
        region: 'us-east-1',
        prefix: 'paperclip-e2e',
        forcePathStyle: false
      }
    },
    secrets: {
      provider: 'local_encrypted',
      strictMode: false,
      localEncrypted: {
        keyFilePath: join(dataDir, 'secrets', 'master.key')
      }
    }
  };

  await writeFile(configPath, JSON.stringify(config, null, 2));
}

async function waitForReady(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  const healthUrl = new URL('/api/health', url).toString();

  while (Date.now() < deadline) {
    if (serverProcess?.exitCode !== null && serverProcess?.exitCode !== undefined) {
      throw new Error(`Paperclip exited early with code ${serverProcess.exitCode}.`);
    }

    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // keep polling until timeout
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 1000));
  }

  throw new Error(`Timed out waiting for Paperclip at ${healthUrl}`);
}

async function ensureCompanySeeded() {
  const companiesUrl = new URL('/api/companies', baseUrl).toString();
  const existingCompanies = await fetchJson(companiesUrl);
  if (Array.isArray(existingCompanies) && existingCompanies.length > 0) {
    log(`Found ${existingCompanies.length} existing companies; onboarding should be skipped.`);
    return existingCompanies[0];
  }

  const createdCompany = await fetchJson(companiesUrl, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dummy Company',
      description: 'Seed company for agent-companies-manager e2e verification.'
    })
  });

  const postCreateCompanies = await fetchJson(companiesUrl);
  if (!Array.isArray(postCreateCompanies) || postCreateCompanies.length === 0) {
    throw new Error('Expected at least one company after seeding, but Paperclip still reports none.');
  }

  log(`Seeded company ${createdCompany?.name ?? postCreateCompanies[0]?.name ?? 'unknown'}.`);
  return postCreateCompanies[0];
}

async function waitForServerExit(timeoutMs) {
  if (!serverProcess) {
    return;
  }

  if (serverProcess.exitCode !== null) {
    return;
  }

  await new Promise((resolvePromise) => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolvePromise(undefined);
      }
    };

    serverProcess.once('close', finish);
    setTimeout(finish, timeoutMs);
  });
}

async function cleanup() {
  if (cleanedUp) {
    return;
  }

  cleanedUp = true;

  if (serverProcess) {
    if (serverProcess.exitCode === null && !serverProcess.killed) {
      serverProcess.kill('SIGINT');
      await waitForServerExit(5000);
    }

    if (serverProcess.exitCode === null && !serverProcess.killed) {
      serverProcess.kill('SIGKILL');
      await waitForServerExit(5000);
    }
  }

  await rm(stateRoot, { recursive: true, force: true });
}

async function gotoWithTimeout(page, url) {
  return page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: defaultTimeoutMs
  });
}

async function detectPluginSettingsPath(page) {
  const candidates = ['/settings/plugins', '/plugins/settings', '/settings'];

  for (const path of candidates) {
    const response = await gotoWithTimeout(page, new URL(path, baseUrl).toString());
    const bodyText = (await page.textContent('body', { timeout: defaultTimeoutMs }).catch(() => '')) ?? '';
    if (response && response.ok() && /plugin/i.test(bodyText)) {
      return path;
    }
  }

  await gotoWithTimeout(page, baseUrl);

  const links = await page.locator('a').evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute('href') ?? '',
      text: anchor.textContent ?? ''
    }))
  );

  const pluginLink = links.find((link) => /plugin/i.test(link.text) || /plugin/i.test(link.href));
  if (!pluginLink?.href) {
    throw new Error('Could not find a plugins settings page link in the Paperclip UI.');
  }

  const targetUrl = new URL(pluginLink.href, baseUrl).toString();
  const url = new URL(targetUrl);
  await gotoWithTimeout(page, targetUrl);
  return `${url.pathname}${url.search}`;
}

async function main() {
  process.on('SIGINT', () => {
    void cleanup().finally(() => process.exit(130));
  });
  process.on('SIGTERM', () => {
    void cleanup().finally(() => process.exit(143));
  });

  log(`Working directory ${stateRoot}`);

  const configPath = join(paperclipHome, 'instances', instanceId, 'config.json');
  await ensureConfigFile(configPath);

  serverProcess = spawn('npx', getPaperclipCommandArgs(['run', '--config', configPath, '--data-dir', dataDir]), {
    cwd: pluginRoot,
    env,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  serverProcess.unref();

  serverProcess.stdout?.on('data', (chunk) => {
    process.stdout.write(chunk.toString());
  });
  serverProcess.stderr?.on('data', (chunk) => {
    process.stderr.write(chunk.toString());
  });
  serverProcess.on('error', (error) => {
    console.error(error);
  });

  await waitForReady(baseUrl, 180000);
  log('Paperclip server is ready.');

  await ensureCompanySeeded();

  const companyList = await runCommand(
    'npx',
    getPaperclipCommandArgs(['company', 'list', '--data-dir', dataDir, '--config', configPath, '--json'])
  );
  const listedCompanies = JSON.parse(companyList.stdout);
  if (!Array.isArray(listedCompanies) || listedCompanies.length === 0) {
    throw new Error('Paperclip company list returned no companies after seeding.');
  }

  await runCommand(
    'npx',
    getPaperclipCommandArgs(['plugin', 'install', '--local', pluginRoot, '--data-dir', dataDir, '--config', configPath])
  );
  log('Installed local agent-companies-manager plugin.');

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(defaultTimeoutMs);

  try {
    await gotoWithTimeout(page, new URL('/', baseUrl).toString());

    if (page.url().includes('/onboarding')) {
      throw new Error(`Paperclip still redirected to onboarding after seeding: ${page.url()}`);
    }

    const pluginSettingsPath = await detectPluginSettingsPath(page);
    log(`Resolved plugin settings path: ${pluginSettingsPath}`);

    const bodyText = await page.textContent('body', { timeout: defaultTimeoutMs });
    if (!bodyText || !/plugin/i.test(bodyText)) {
      throw new Error('Paperclip plugin settings page did not render plugin-related content.');
    }

    await writeFile(
      join(pluginRoot, 'tests/e2e/results/last-run.json'),
      JSON.stringify(
        {
          baseUrl,
          pluginSettingsPath,
          companyCount: listedCompanies.length
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
  }

  await cleanup();
}

try {
  await main();
} catch (error) {
  await cleanup();
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
}
