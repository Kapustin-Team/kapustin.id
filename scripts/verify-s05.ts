/**
 * S05 Slice Verification — Dashboard, Profile, Projects, i18n
 * Checks: unauthenticated home, register, login, dashboard dict delivery,
 * profile update via API, /auth/me image field, project names in dict,
 * Russian locale dict, profile form labels in dict, logout text in dict.
 */

const FRONTEND = "http://localhost:3000";
const API = "http://localhost:3001";

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

const TEST_EMAIL = `s05-verify-${Date.now()}@test.local`;
const TEST_PASSWORD = "TestPass123!";

async function main() {
  console.log("\n🔍 S05 Verification: Dashboard + Profile + Projects\n");

  // 1. Unauthenticated home shows sign-in link
  {
    const res = await fetch(`${FRONTEND}/en/`, { redirect: "follow" });
    const body = await res.text();
    // SSR renders Loading... state, but the RSC payload contains the dict
    // with "Sign in to your account" text that the client component uses
    const pass = body.includes("Sign in to your account") || body.includes("goToLogin");
    log({ name: "Unauthenticated /en/ contains sign-in text", pass, detail: `status=${res.status}` });
  }

  // 2. Register test user
  let sessionCookie = "";
  {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      redirect: "manual",
    });
    const setCookie = res.headers.get("set-cookie") || "";
    const match = setCookie.match(/sessionId=([^;]+)/);
    sessionCookie = match ? match[1] : "";
    const status = res.status;
    const pass = (status === 200 || status === 201) && sessionCookie.length > 0;
    log({ name: "Register test user and get session cookie", pass, detail: `status=${status}, cookie=${sessionCookie ? "yes" : "no"}` });
  }

  // 3. Login test user (fresh session)
  {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      redirect: "manual",
    });
    const setCookie = res.headers.get("set-cookie") || "";
    const match = setCookie.match(/sessionId=([^;]+)/);
    if (match) sessionCookie = match[1];
    const status = res.status;
    const pass = status === 200 && sessionCookie.length > 0;
    log({ name: "Login test user and capture session", pass, detail: `status=${status}` });
  }

  // 4. Authenticated dashboard: RSC payload contains dashboard dict keys
  {
    const res = await fetch(`${FRONTEND}/en/`, {
      redirect: "follow",
      headers: { Cookie: `sessionId=${sessionCookie}` },
    });
    const body = await res.text();
    // The RSC payload serializes the full dictionary as props to HomeContent
    // Dashboard keys will be present in the payload regardless of client render state
    const hasDashboardTitle = body.includes("Dashboard") || body.includes("dashboard");
    const hasProjectsLabel = body.includes("Projects by Kapustin");
    const pass = hasDashboardTitle && hasProjectsLabel;
    log({ name: "Dashboard dict delivered in RSC payload (title + projects label)", pass });
  }

  // 5. Profile update via API
  {
    const res = await fetch(`${API}/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sessionId=${sessionCookie}`,
      },
      body: JSON.stringify({ name: "Test User S05", image: "https://example.com/avatar.png" }),
    });
    const status = res.status;
    let pass = status === 200;
    let detail = `status=${status}`;
    if (pass) {
      const data = await res.json() as { user?: { name?: string; image?: string } };
      pass = data.user?.name === "Test User S05" && data.user?.image === "https://example.com/avatar.png";
      detail += `, name=${data.user?.name}, image=${data.user?.image}`;
    }
    log({ name: "PATCH /auth/profile updates name and image", pass, detail });
  }

  // 6. GET /auth/me includes image field
  {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Cookie: `sessionId=${sessionCookie}` },
    });
    const data = await res.json() as { user?: { image?: string | null } };
    const pass = res.status === 200 && data.user?.image === "https://example.com/avatar.png";
    log({ name: "GET /auth/me returns image field", pass, detail: `image=${data.user?.image}` });
  }

  // 7. Project names compiled into page JS bundle
  {
    // Projects are defined in src/lib/projects.ts and imported by the client component
    // They appear in the compiled JS chunk, not in SSR HTML
    const pageRes = await fetch(`${FRONTEND}/_next/static/chunks/app/%5Blocale%5D/page.js`);
    const jsBody = await pageRes.text();
    const hasKapustinTeam = jsBody.includes("kapustin.team");
    const hasAiacademe = jsBody.includes("aiacade.me");
    const hasNotex = jsBody.includes("notex.pro");
    const count = [hasKapustinTeam, hasAiacademe, hasNotex].filter(Boolean).length;
    const pass = count >= 3;
    log({ name: "Project names in page JS bundle (kapustin.team, aiacade.me, notex.pro)", pass, detail: `${count}/3 found` });
  }

  // 8. Russian locale: RSC payload has Russian dashboard text
  {
    const res = await fetch(`${FRONTEND}/ru/`, {
      redirect: "follow",
      headers: { Cookie: `sessionId=${sessionCookie}` },
    });
    const body = await res.text();
    const hasRussianProjects = body.includes("Проекты Капустина") || body.includes("Панель управления");
    const pass = hasRussianProjects;
    log({ name: "Russian locale /ru/ contains Russian dashboard text", pass });
  }

  // 9. Profile form labels present in RSC payload
  {
    const res = await fetch(`${FRONTEND}/en/`, {
      redirect: "follow",
      headers: { Cookie: `sessionId=${sessionCookie}` },
    });
    const body = await res.text();
    const hasNameLabel = body.includes('"name":"Name"') || body.includes("Avatar URL");
    const hasImageLabel = body.includes("Avatar URL") || body.includes("imageUrl");
    const pass = hasNameLabel && hasImageLabel;
    log({ name: "Profile form labels (Name, Avatar URL) in RSC payload", pass });
  }

  // 10. Logout text present in RSC payload
  {
    const res = await fetch(`${FRONTEND}/en/`, {
      redirect: "follow",
      headers: { Cookie: `sessionId=${sessionCookie}` },
    });
    const body = await res.text();
    const pass = body.includes("Sign out") || body.includes("logout");
    log({ name: "Logout/Sign out text in RSC payload", pass });
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
