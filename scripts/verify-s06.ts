/**
 * S06 Slice Verification — End-to-End SSO Integration
 * Checks: API health, userinfo auth errors, full OAuth PKCE flow with userinfo,
 * test-client build, test-client page render, regression suites.
 *
 * Usage: npx tsx scripts/verify-s06.ts
 */

import { createHash, randomBytes } from 'node:crypto';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const API = 'http://localhost:3001';
const TEST_CLIENT_PORT = 3002;
const TEST_CLIENT_URL = `http://localhost:${TEST_CLIENT_PORT}`;
const CLIENT_ID = 'kapustin-team';
const REDIRECT_URI = `http://localhost:${TEST_CLIENT_PORT}/api/auth/callback/kapustin`;

interface Result {
  name: string;
  pass: boolean;
  detail?: string;
}

const results: Result[] = [];

function log(r: Result) {
  results.push(r);
  const icon = r.pass ? '✓' : '✗';
  const detail = r.detail ? ` — ${r.detail}` : '';
  console.log(`  ${icon} ${r.name}${detail}`);
}

// ─── PKCE helpers ────────────────────────────────────────────────────────────
function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  const hash = createHash('sha256').update(verifier).digest('base64');
  const challenge = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return { verifier, challenge };
}

function extractSessionCookie(response: Response): string | null {
  const setCookie = response.headers.getSetCookie?.() ?? [];
  for (const c of setCookie) {
    const match = c.match(/^sessionId=([^;]+)/);
    if (match && match[1]) return match[1];
  }
  return null;
}

// ─── Regression helper ───────────────────────────────────────────────────────
function runRegression(label: string, cwd: string, script: string, expectedPattern: RegExp): boolean {
  try {
    const output = execSync(`npx tsx ${script}`, {
      cwd,
      timeout: 60_000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const match = output.match(expectedPattern);
    if (match) {
      log({ name: label, pass: true, detail: match[0].trim() });
      return true;
    }
    log({ name: label, pass: false, detail: `Pattern not found in output` });
    return false;
  } catch (err: any) {
    const output = (err.stdout || '') + (err.stderr || '');
    log({ name: label, pass: false, detail: output.slice(-200).trim() });
    return false;
  }
}

async function main() {
  console.log('\n🔍 S06 Verification: End-to-End SSO Integration\n');

  // ── Check 1: API health ──────────────────────────────────────────────────
  {
    try {
      const res = await fetch(`${API}/health`);
      const body = await res.json() as { status?: string };
      const pass = res.status === 200 && body.status === 'ok';
      log({ name: 'API health returns 200 with {status:"ok"}', pass, detail: `status=${res.status}` });
    } catch (e: any) {
      log({ name: 'API health returns 200 with {status:"ok"}', pass: false, detail: e.message });
    }
  }

  // ── Check 2: Userinfo without token → 401 ────────────────────────────────
  {
    try {
      const res = await fetch(`${API}/oauth/userinfo`);
      const body = await res.json() as { error?: string };
      const pass = res.status === 401 && body.error === 'invalid_token';
      log({ name: 'Userinfo without token → 401 invalid_token', pass, detail: `status=${res.status}, error=${body.error}` });
    } catch (e: any) {
      log({ name: 'Userinfo without token → 401 invalid_token', pass: false, detail: e.message });
    }
  }

  // ── Check 3: Userinfo with invalid token → 401 ───────────────────────────
  {
    try {
      const res = await fetch(`${API}/oauth/userinfo`, {
        headers: { Authorization: 'Bearer invalid-garbage-token' },
      });
      const body = await res.json() as { error?: string };
      const pass = res.status === 401;
      log({ name: 'Userinfo with invalid token → 401', pass, detail: `status=${res.status}, error=${body.error}` });
    } catch (e: any) {
      log({ name: 'Userinfo with invalid token → 401', pass: false, detail: e.message });
    }
  }

  // ── Check 3b: Userinfo with empty Bearer → 401 ───────────────────────────
  {
    try {
      const res = await fetch(`${API}/oauth/userinfo`, {
        headers: { Authorization: 'Bearer ' },
      });
      const pass = res.status === 401;
      log({ name: 'Userinfo with empty Bearer value → 401', pass, detail: `status=${res.status}` });
    } catch (e: any) {
      log({ name: 'Userinfo with empty Bearer value → 401', pass: false, detail: e.message });
    }
  }

  // ── Check 4: Register + login test user ──────────────────────────────────
  const testEmail = `sso-test-${Date.now()}@kapustin.id`;
  const testPassword = 'TestPass123!';
  const testName = 'SSO Test User';
  let sessionCookie = '';

  {
    // Register
    const regRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword, name: testName }),
      redirect: 'manual',
    });
    const regCookie = extractSessionCookie(regRes);

    // Login (fresh session)
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
      redirect: 'manual',
    });
    const loginCookie = extractSessionCookie(loginRes);
    sessionCookie = loginCookie || regCookie || '';

    const pass = loginRes.status === 200 && sessionCookie.length > 0;
    log({ name: 'Register + login test user, get session cookie', pass, detail: `register=${regRes.status}, login=${loginRes.status}, cookie=${sessionCookie ? 'yes' : 'no'}` });
  }

  // ── Check 5: Full OAuth PKCE flow → userinfo ─────────────────────────────
  {
    try {
      const { verifier, challenge } = generatePKCE();
      const state = randomBytes(16).toString('hex');

      // 5a. Authorize with consent=granted
      const authParams = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        code_challenge: challenge,
        code_challenge_method: 'S256',
        state,
        consent: 'granted',
        scope: 'openid profile email',
      });

      const authRes = await fetch(`${API}/oauth/authorize?${authParams}`, {
        headers: { Cookie: `sessionId=${sessionCookie}` },
        redirect: 'manual',
      });

      const location = authRes.headers.get('location') || '';
      const locationUrl = new URL(location, API);
      const code = locationUrl.searchParams.get('code') || '';
      const returnedState = locationUrl.searchParams.get('state') || '';

      if (!code || returnedState !== state) {
        log({
          name: 'Full OAuth flow: authorize → code → token → userinfo',
          pass: false,
          detail: `No code or state mismatch. status=${authRes.status}, location=${location}`,
        });
      } else {
        // 5b. Token exchange
        const tokenRes = await fetch(`${API}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            code_verifier: verifier,
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
          }),
        });
        const tokenBody = await tokenRes.json() as { access_token?: string };
        const accessToken = tokenBody.access_token;

        if (!accessToken) {
          log({
            name: 'Full OAuth flow: authorize → code → token → userinfo',
            pass: false,
            detail: `Token exchange failed: status=${tokenRes.status}, body=${JSON.stringify(tokenBody)}`,
          });
        } else {
          // 5c. Userinfo with valid token
          const userinfoRes = await fetch(`${API}/oauth/userinfo`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const userinfo = (await userinfoRes.json()) as {
            sub?: string;
            email?: string;
            name?: string;
            picture?: string | null;
          };

          const hasSub = typeof userinfo.sub === 'string' && userinfo.sub.length > 0;
          const emailMatch = userinfo.email === testEmail;
          const hasName = typeof userinfo.name === 'string';
          const hasPicture = 'picture' in userinfo;

          const pass = userinfoRes.status === 200 && hasSub && emailMatch && hasName && hasPicture;
          log({
            name: 'Full OAuth flow: authorize → code → token → userinfo',
            pass,
            detail: `userinfo status=${userinfoRes.status}, sub=${hasSub}, email=${emailMatch}, name=${hasName}, picture_key=${hasPicture}`,
          });
        }
      }
    } catch (e: any) {
      log({
        name: 'Full OAuth flow: authorize → code → token → userinfo',
        pass: false,
        detail: e.message,
      });
    }
  }

  // ── Check 6: Test client build ────────────────────────────────────────────
  {
    const testClientDir = resolve(process.cwd(), 'test-client');
    try {
      execSync('npm run build', { cwd: testClientDir, timeout: 120_000, stdio: 'pipe' });
      log({ name: 'Test client build succeeds (npm run build)', pass: true });
    } catch (e: any) {
      const stderr = (e.stderr || '').toString().slice(-300);
      log({ name: 'Test client build succeeds (npm run build)', pass: false, detail: stderr });
    }
  }

  // ── Check 7: Test client page renders ─────────────────────────────────────
  {
    // Start the test client dev server, check page content, then kill it
    const testClientDir = resolve(process.cwd(), 'test-client');
    let serverProcess: ReturnType<typeof import('node:child_process').spawn> | null = null;
    let pass = false;
    let detail = '';

    try {
      const { spawn } = await import('node:child_process');
      serverProcess = spawn('npx', ['next', 'start', '-p', String(TEST_CLIENT_PORT)], {
        cwd: testClientDir,
        stdio: 'pipe',
        env: { ...process.env, PORT: String(TEST_CLIENT_PORT) },
      });

      // Wait for server to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Test client start timeout')), 30_000);
        const check = async () => {
          try {
            await fetch(TEST_CLIENT_URL);
            clearTimeout(timeout);
            resolve();
          } catch {
            setTimeout(check, 500);
          }
        };
        check();
      });

      const res = await fetch(TEST_CLIENT_URL);
      const body = await res.text();
      pass = res.status === 200 && body.includes('Kapustin');
      detail = `status=${res.status}, containsKapustin=${body.includes('Kapustin')}`;
    } catch (e: any) {
      detail = e.message;
    } finally {
      if (serverProcess) {
        serverProcess.kill('SIGTERM');
        // Give it a moment to clean up
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    log({ name: 'Test client page contains "Kapustin" text', pass, detail });
  }

  // ── Check 8: Regression — verify-oauth-flow.ts (13/13) ────────────────────
  {
    const apiDir = resolve(process.cwd(), '..', 'api.kapustin.id');
    runRegression(
      'Regression: verify-oauth-flow (13/13)',
      apiDir,
      'scripts/verify-oauth-flow.ts',
      /13\/13 tests passed/,
    );
  }

  // ── Check 9: Regression — verify-auth-flow.ts (10/10) ─────────────────────
  {
    const apiDir = resolve(process.cwd(), '..', 'api.kapustin.id');
    runRegression(
      'Regression: verify-auth-flow (10/10)',
      apiDir,
      'scripts/verify-auth-flow.ts',
      /10 passed, 0 failed out of 10/,
    );
  }

  // ── Check 10: Regression — verify-s05.ts (10/10) ──────────────────────────
  {
    runRegression(
      'Regression: verify-s05 (10/10)',
      process.cwd(),
      'scripts/verify-s05.ts',
      /10\/10 checks passed/,
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(`\n${passed}/${total} checks passed\n`);

  if (passed < total) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Verification failed:', err.message);
  process.exit(1);
});
