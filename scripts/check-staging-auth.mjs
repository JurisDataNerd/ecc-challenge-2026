// Staging-only verification. Creates a synthetic account without sending email; cleanup deletes it.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').trim().split(/\r?\n/).map(line => {
  const separator = line.indexOf('='); return [line.slice(0, separator), line.slice(separator + 1)];
}));
const url = env.VITE_SUPABASE_URL;
assert.equal(new URL(url).hostname, 'gzyqpvihvqgxttpshmde.supabase.co', 'Verification must target ECC staging');
const client = createClient(url, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const settings = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } }).then(response => response.json());
assert.equal(settings.disable_signup, true, 'The server must enforce invitation-only access');
assert.equal(settings.external.email, true, 'Email sign-in must remain enabled');
const fixturePath = '.scratch/auth-fixture.local';
const credentialPath = join(tmpdir(), 'ecc-auth-verification.local');
const mode = process.argv[2] || 'smoke';
if (mode === 'verify-login') {
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  const result = await client.auth.signInWithPassword({ email: fixture.email, password: fixture.nextPassword });
  assert.equal(result.error, null, result.error?.message);
  assert.equal(result.data.user.id, fixture.userId);
  await client.auth.signOut({ scope: 'local' });
  console.log('PASS: recovered password authenticates the expected synthetic account.');
} else if (mode === 'smoke') {
  const result = await client.auth.signUp({ email: `fq-signup-check-${Date.now()}@example.invalid`, password: randomBytes(24).toString('hex') });
  assert.equal(result.error?.code, 'signup_disabled');
  console.log('PASS: email login enabled; public signup rejected by server.');
} else {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || readFileSync(credentialPath, 'utf8').trim();
  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  if (mode === 'prepare') {
    mkdirSync('.scratch/game-experience-overhaul/evidence', { recursive: true });
    assert.equal(existsSync(fixturePath), false, 'Clean up the existing synthetic fixture first');
    const email = `fq-experience-qa-${Date.now()}@example.invalid`;
    const { data, error } = await admin.auth.admin.generateLink({ type: 'invite', email, options: { redirectTo: 'http://localhost:5173/auth/accept-invite' } });
    assert.equal(error, null, error?.message);
    assert.ok(data.user.id && data.properties.hashed_token);
    assert.equal(new URL(data.properties.action_link).searchParams.get('redirect_to'), 'http://localhost:5173/auth/accept-invite');
    writeFileSync(fixturePath, JSON.stringify({ userId: data.user.id, email, password: `${randomBytes(20).toString('hex')}!Aa5`, nextPassword: `${randomBytes(20).toString('hex')}!Bb6`, inviteUrl: `http://localhost:5173/auth/accept-invite?token_hash=${data.properties.hashed_token}&type=invite` }));
    const schemaResponse = await fetch(`${url}/rest/v1/`, { headers: { apikey: secret, Authorization: `Bearer ${secret}`, Accept: 'application/openapi+json' } });
    if (schemaResponse.ok) {
      const schema = await schemaResponse.json();
      const tables = Object.keys(schema.definitions || {});
      const profiles = Object.entries(schema.definitions || {}).filter(([name]) => /profile|user|enrollment/.test(name)).map(([name, definition]) => ({ table: name, columns: Object.keys(definition.properties || {}) }));
      writeFileSync('.scratch/game-experience-overhaul/evidence/02-schema-contract.json', JSON.stringify({ tables, profiles }, null, 2));
      console.log(`Inspected exposed schema: ${tables.length} tables. Column evidence contains no participant records.`);
    }
    console.log('PASS: synthetic invitation generated without email; local callback accepted. Private fixture saved outside tracked evidence.');
  } else if (mode === 'recovery') {
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
    const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email: fixture.email, options: { redirectTo: 'http://localhost:5173/auth/reset-password' } });
    assert.equal(error, null, error?.message);
    assert.equal(new URL(data.properties.action_link).searchParams.get('redirect_to'), 'http://localhost:5173/auth/reset-password');
    fixture.recoveryUrl = `http://localhost:5173/auth/reset-password?token_hash=${data.properties.hashed_token}&type=recovery`;
    fixture.nextPassword = `${randomBytes(20).toString('hex')}!Bb6`;
    writeFileSync(fixturePath, JSON.stringify(fixture));
    console.log('PASS: recovery link generated without email; reset callback accepted.');
  } else if (mode === 'cleanup') {
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
    const { error } = await admin.auth.admin.deleteUser(fixture.userId);
    assert.equal(error, null, error?.message);
    unlinkSync(fixturePath);
    if (existsSync(credentialPath)) unlinkSync(credentialPath);
    console.log('PASS: synthetic account and temporary verification credential removed.');
  } else throw new Error('Use smoke, prepare, recovery, or cleanup');
}
