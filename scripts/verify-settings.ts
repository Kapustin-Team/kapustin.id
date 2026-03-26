/**
 * S03 Verification — Settings page structural checks
 * Validates settings page, i18n strings, theme script, and component existence.
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
  console.log('\n🔍 verify-settings: Settings page structure\n');

  // 1. Settings page file exists
  {
    const pass = existsSync('src/app/[locale]/settings/page.tsx');
    log({ name: 'Settings page exists', pass });
  }

  // 2. SettingsContent component exists
  {
    const pass = existsSync('src/components/SettingsContent.tsx');
    log({ name: 'SettingsContent component exists', pass });
  }

  // 3. EN dictionary has settings section
  {
    const dict = JSON.parse(readFileSync('src/i18n/dictionaries/en.json', 'utf-8'));
    const pass = !!dict.settings && !!dict.settings.title && !!dict.settings.theme && !!dict.settings.accounts;
    log({ name: 'EN dictionary has settings section', pass });
  }

  // 4. RU dictionary has settings section
  {
    const dict = JSON.parse(readFileSync('src/i18n/dictionaries/ru.json', 'utf-8'));
    const pass = !!dict.settings && !!dict.settings.title && !!dict.settings.theme && !!dict.settings.accounts;
    log({ name: 'RU dictionary has settings section', pass });
  }

  // 5. Layout has inline theme script
  {
    const layout = readFileSync('src/app/[locale]/layout.tsx', 'utf-8');
    const pass = layout.includes('dangerouslySetInnerHTML') && layout.includes('data-theme') || layout.includes('dataset.theme');
    log({ name: 'Layout has inline theme script', pass });
  }

  // 6. SettingsContent has theme toggle logic
  {
    const content = readFileSync('src/components/SettingsContent.tsx', 'utf-8');
    const hasThemeToggle = content.includes('handleThemeChange') && content.includes("'light'") && content.includes("'dark'") && content.includes("'system'");
    log({ name: 'SettingsContent has theme toggle', pass: hasThemeToggle });
  }

  // 7. SettingsContent has language switcher
  {
    const content = readFileSync('src/components/SettingsContent.tsx', 'utf-8');
    const hasLangSwitch = content.includes('handleLanguageChange') && content.includes('NEXT_LOCALE');
    log({ name: 'SettingsContent has language switcher', pass: hasLangSwitch });
  }

  // 8. SettingsContent has linked accounts management
  {
    const content = readFileSync('src/components/SettingsContent.tsx', 'utf-8');
    const hasAccounts = content.includes('/auth/accounts') && content.includes('handleUnlink');
    log({ name: 'SettingsContent has linked accounts', pass: hasAccounts });
  }

  // 9. HomeContent has settings navigation link
  {
    const content = readFileSync('src/components/HomeContent.tsx', 'utf-8');
    const pass = content.includes('/settings') && content.includes('settingsLink');
    log({ name: 'HomeContent has settings link', pass });
  }

  // 10. HomeContent syncs theme cookie from API
  {
    const content = readFileSync('src/components/HomeContent.tsx', 'utf-8');
    const pass = content.includes('theme=') && content.includes('cookie');
    log({ name: 'HomeContent syncs theme cookie from API', pass });
  }

  // 11. SettingsContent shows lockout prevention warning
  {
    const content = readFileSync('src/components/SettingsContent.tsx', 'utf-8');
    const pass = content.includes('lastMethodWarning') && content.includes('hasPassword');
    log({ name: 'Lockout prevention visible to user', pass });
  }

  // 12. SettingsContent shows Telegram 2FA warning
  {
    const content = readFileSync('src/components/SettingsContent.tsx', 'utf-8');
    const pass = content.includes('twoFactorWarning') && content.includes('telegram');
    log({ name: 'Telegram 2FA warning on unlink', pass });
  }

  // 13. Theme cookie persistence (365 days)
  {
    const content = readFileSync('src/components/SettingsContent.tsx', 'utf-8');
    const pass = content.includes('365');
    log({ name: 'Theme cookie persists for 1 year', pass });
  }

  // 14. DB persistence via PATCH /auth/preferences
  {
    const content = readFileSync('src/components/SettingsContent.tsx', 'utf-8');
    const pass = content.includes("'/auth/preferences'") && content.includes('apiPatch');
    log({ name: 'Preferences saved to DB via API', pass });
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
