/**
 * S04 Slice Verification — Auth UI pages + i18n
 * Checks: locale redirect, login/register/authorize pages in RU/EN,
 * static asset passthrough, font reference, dictionary existence.
 */

const BASE = "http://localhost:3000";

interface Result {
  name: string;
  pass: boolean;
  detail?: string;
}

const results: Result[] = [];

function log(r: Result) {
  results.push(r);
  const icon = r.pass ? "✓" : "✗";
  const detail = r.detail ? ` — ${r.detail}` : "";
  console.log(`  ${icon} ${r.name}${detail}`);
}

async function fetchText(url: string, followRedirects = true): Promise<{ status: number; body: string; redirected: boolean; url: string }> {
  const res = await fetch(url, { redirect: followRedirects ? "follow" : "manual" });
  const body = followRedirects ? await res.text() : "";
  return { status: res.status, body, redirected: res.redirected, url: res.url };
}

async function main() {
  console.log("\n🔍 S04 Verification: Auth UI + i18n\n");

  // 1. Root redirects to locale-prefixed path
  {
    const res = await fetch(BASE, { redirect: "manual" });
    const location = res.headers.get("location") || "";
    const pass = (res.status === 307 || res.status === 308) && (location.includes("/ru") || location.includes("/en"));
    log({ name: "Root / redirects to locale path", pass, detail: `${res.status} → ${location}` });
  }

  // 2. /ru/login has Russian text
  {
    const { body } = await fetchText(`${BASE}/ru/login`);
    const pass = body.includes("Войти");
    log({ name: "/ru/login contains Russian text (Войти)", pass });
  }

  // 3. /en/login has English text
  {
    const { body } = await fetchText(`${BASE}/en/login`);
    const pass = body.includes("Sign In") || body.includes("Sign in");
    log({ name: "/en/login contains English text (Sign In)", pass });
  }

  // 4. /ru/register has Russian text
  {
    const { body } = await fetchText(`${BASE}/ru/register`);
    const pass = body.includes("Регистрация") || body.includes("Создать аккаунт");
    log({ name: "/ru/register contains Russian text", pass });
  }

  // 5. /en/register has English text
  {
    const { body } = await fetchText(`${BASE}/en/register`);
    const pass = body.includes("Create Account") || body.includes("Create account");
    log({ name: "/en/register contains English text", pass });
  }

  // 6. /ru/authorize page exists (returns 200)
  {
    const { status } = await fetchText(`${BASE}/ru/authorize?client_id=test&redirect_uri=http://localhost&response_type=code`);
    const pass = status === 200;
    log({ name: "/ru/authorize returns 200", pass, detail: `status=${status}` });
  }

  // 7. /en/authorize page exists (returns 200)
  {
    const { status } = await fetchText(`${BASE}/en/authorize?client_id=test&redirect_uri=http://localhost&response_type=code`);
    const pass = status === 200;
    log({ name: "/en/authorize returns 200", pass, detail: `status=${status}` });
  }

  // 8. Onest font loaded (Next.js hashes the name — check for font preload or CSS variable)
  {
    const { body } = await fetchText(`${BASE}/ru/login`);
    // Next.js font optimization hashes "Onest" → __variable_XXXXXX class + woff2 preload
    const hasWoff2Preload = body.includes('.woff2"') || body.includes(".woff2'");
    const hasFontVariable = body.includes("--font-onest") || body.includes("__variable_");
    const pass = hasWoff2Preload || hasFontVariable;
    log({ name: "Onest font loaded (woff2 preload or CSS variable)", pass });
  }

  // 9. Static asset paths NOT locale-prefixed (middleware matcher skips _next)
  {
    // Requesting /_next/... should NOT redirect to /ru/_next/...
    const res = await fetch(`${BASE}/_next/static/chunks/webpack.js`, { redirect: "manual" });
    // Should either 200 (file found) or 404 (file not found) — but NOT 307 redirect
    const pass = res.status !== 307 && res.status !== 308;
    log({ name: "/_next/static not locale-redirected", pass, detail: `status=${res.status}` });
  }

  // 10. Dictionary files exist (filesystem check via import)
  {
    const { existsSync } = await import("fs");
    const ruExists = existsSync("src/i18n/dictionaries/ru.json");
    const enExists = existsSync("src/i18n/dictionaries/en.json");
    const pass = ruExists && enExists;
    log({ name: "Both dictionary files exist (ru.json, en.json)", pass, detail: `ru=${ruExists} en=${enExists}` });
  }

  // Summary
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(`\n${passed}/${total} checks passed\n`);

  if (passed < total) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification failed:", err.message);
  process.exit(1);
});
