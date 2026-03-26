/**
 * S03 Verification — Auth flow structural checks
 * Validates auth-related components and API integration patterns.
 */

import { existsSync, readFileSync } from 'fs';

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

function main() {
  console.log('\n🔍 verify-auth-flow: Auth flow structure\n');

  // 1. API helper exists with all methods
  {
    const content = readFileSync('src/lib/api.ts', 'utf-8');
    const pass = content.includes('apiGet') && content.includes('apiPost') && content.includes('apiPatch') && content.includes('apiDelete');
    log({ name: 'API helper has GET/POST/PATCH/DELETE', pass });
  }

  // 2. Credentials included in API calls
  {
    const content = readFileSync('src/lib/api.ts', 'utf-8');
    const pass = content.includes("credentials: 'include'");
    log({ name: 'API calls include credentials', pass });
  }

  // 3. Login page exists for both locales
  {
    const pass = existsSync('src/app/[locale]/login/page.tsx');
    log({ name: 'Login page exists', pass });
  }

  // 4. Register page exists
  {
    const pass = existsSync('src/app/[locale]/register/page.tsx');
    log({ name: 'Register page exists', pass });
  }

  // 5. HomeContent handles auth state
  {
    const content = readFileSync('src/components/HomeContent.tsx', 'utf-8');
    const pass = content.includes('/auth/me') && content.includes('handleLogout');
    log({ name: 'HomeContent checks auth state', pass });
  }

  // 6. Settings page exists
  {
    const pass = existsSync('src/app/[locale]/settings/page.tsx');
    log({ name: 'Settings page exists', pass });
  }

  // 7. Security page exists
  {
    const pass = existsSync('src/app/[locale]/security/page.tsx');
    log({ name: 'Security page exists', pass });
  }

  // 8. Layout has locale support
  {
    const content = readFileSync('src/app/[locale]/layout.tsx', 'utf-8');
    const pass = content.includes('generateStaticParams') && content.includes('locale');
    log({ name: 'Layout supports locale params', pass });
  }

  // 9. Dictionary loader exists
  {
    const pass = existsSync('src/i18n/getDictionary.ts');
    log({ name: 'Dictionary loader exists', pass });
  }

  // 10. Both dictionaries have matching top-level keys
  {
    const en = JSON.parse(readFileSync('src/i18n/dictionaries/en.json', 'utf-8'));
    const ru = JSON.parse(readFileSync('src/i18n/dictionaries/ru.json', 'utf-8'));
    const enKeys = Object.keys(en).sort().join(',');
    const ruKeys = Object.keys(ru).sort().join(',');
    const pass = enKeys === ruKeys;
    log({ name: 'EN and RU dictionaries have matching sections', pass, detail: pass ? `${Object.keys(en).length} sections` : `en=[${enKeys}] ru=[${ruKeys}]` });
  }

  // Summary
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(`\n${passed}/${total} checks passed\n`);

  if (passed < total) {
    process.exit(1);
  }
}

main();
