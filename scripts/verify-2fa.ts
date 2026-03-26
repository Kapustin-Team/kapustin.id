/**
 * S03 Verification — 2FA and security structural checks
 * Validates 2FA-related i18n, security content, and settings integration.
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
  console.log('\n🔍 verify-2fa: 2FA and security structure\n');

  // 1. EN dictionary has twoFactor section
  {
    const dict = JSON.parse(readFileSync('src/i18n/dictionaries/en.json', 'utf-8'));
    const pass = !!dict.twoFactor && !!dict.twoFactor.enable2fa && !!dict.twoFactor.disable2fa;
    log({ name: 'EN dictionary has twoFactor section', pass });
  }

  // 2. RU dictionary has twoFactor section
  {
    const dict = JSON.parse(readFileSync('src/i18n/dictionaries/ru.json', 'utf-8'));
    const pass = !!dict.twoFactor && !!dict.twoFactor.enable2fa && !!dict.twoFactor.disable2fa;
    log({ name: 'RU dictionary has twoFactor section', pass });
  }

  // 3. Security content component exists
  {
    const pass = existsSync('src/components/SecurityContent.tsx');
    log({ name: 'SecurityContent component exists', pass });
  }

  // 4. SecurityContent has 2FA section
  {
    const content = readFileSync('src/components/SecurityContent.tsx', 'utf-8');
    const pass = content.includes('twoFactor') || content.includes('2fa') || content.includes('TwoFactor');
    log({ name: 'SecurityContent handles 2FA', pass });
  }

  // 5. EN dictionary has security section
  {
    const dict = JSON.parse(readFileSync('src/i18n/dictionaries/en.json', 'utf-8'));
    const pass = !!dict.security && !!dict.security.activeSessions;
    log({ name: 'EN dictionary has security section', pass });
  }

  // 6. RU dictionary has security section
  {
    const dict = JSON.parse(readFileSync('src/i18n/dictionaries/ru.json', 'utf-8'));
    const pass = !!dict.security && !!dict.security.activeSessions;
    log({ name: 'RU dictionary has security section', pass });
  }

  // 7. Settings accounts section references Telegram unlink impact
  {
    const dict = JSON.parse(readFileSync('src/i18n/dictionaries/en.json', 'utf-8'));
    const pass = !!dict.settings?.accounts?.twoFactorWarning;
    log({ name: 'Settings warns about 2FA on Telegram unlink', pass });
  }

  // 8. SettingsContent handles Telegram unlink 2FA warning
  {
    const content = readFileSync('src/components/SettingsContent.tsx', 'utf-8');
    const pass = content.includes('telegram') && content.includes('twoFactorWarning');
    log({ name: 'SettingsContent shows 2FA warning for Telegram', pass });
  }

  // 9. Theme script prevents flash (inline before hydration)
  {
    const layout = readFileSync('src/app/[locale]/layout.tsx', 'utf-8');
    const pass = layout.includes('dangerouslySetInnerHTML') && layout.includes('<head>');
    log({ name: 'Theme script is inline in <head> (no flash)', pass });
  }

  // 10. Dark mode CSS tokens exist
  {
    const css = readFileSync('src/app/globals.css', 'utf-8');
    const pass = css.includes('[data-theme="dark"]') && css.includes('--bg:') && css.includes('--fg:');
    log({ name: 'Dark mode CSS tokens defined', pass });
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
