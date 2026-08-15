import { createHmac, randomBytes } from 'node:crypto';

const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sessionSecret = process.env.MORNING_SESSION_SECRET;

if (!url || !serviceRoleKey || !sessionSecret) {
  throw new Error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MORNING_SESSION_SECRET are required');
}

function getArgument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value.trim();
}

const requestedCode = getArgument('--code')?.toUpperCase();
const code = requestedCode || randomBytes(6).toString('base64url').toUpperCase();
const label = getArgument('--label') || '모닝챌린지 초대';
const maxUses = Number.parseInt(getArgument('--uses') || '1', 10);
const validDays = Number.parseInt(getArgument('--days') || '30', 10);
const requestedExpiry = getArgument('--expires');

if (!/^[A-Z0-9_-]{6,32}$/.test(code)) {
  throw new Error('Invite code must be 6-32 characters using A-Z, 0-9, _ or -');
}
if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 1000) {
  throw new Error('maxUses must be between 1 and 1000');
}
if (!requestedExpiry && (!Number.isInteger(validDays) || validDays < 1 || validDays > 365)) {
  throw new Error('--days must be between 1 and 365');
}

const codeHash = createHmac('sha256', sessionSecret)
  .update(`invite:${code}`)
  .digest('hex');
const expiryDate = requestedExpiry
  ? new Date(`${requestedExpiry}T23:59:59+09:00`)
  : new Date(Date.now() + validDays * 86400000);
if (Number.isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
  throw new Error('--expires must be a future date in YYYY-MM-DD format');
}
const expiresAt = expiryDate.toISOString();

const response = await fetch(`${url}/rest/v1/morning_invite_codes`, {
  method: 'POST',
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  },
  body: JSON.stringify({
    code_hash: codeHash,
    label,
    max_uses: maxUses,
    expires_at: expiresAt,
  }),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Failed to create invite (${response.status}): ${body.slice(0, 200)}`);
}

console.log(`Invite code: ${code}`);
console.log(`Max uses: ${maxUses}`);
console.log(`Expires at: ${expiresAt}`);
