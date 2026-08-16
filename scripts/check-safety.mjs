/**
 * End-to-end check of blocking and reporting.
 *
 *   npm run check:safety
 *
 * Creates two throwaway auth users in the DEV project, signs in as each, and
 * exercises the paths a real member would take. The point is to test through
 * row-level security rather than around it — the service-role key bypasses RLS
 * entirely, so a test that uses it proves nothing about whether a member can
 * actually be protected.
 *
 * Refuses to run against anything but the dev project. Cleans up after itself.
 */

import { readFileSync } from "node:fs";

const DEV_PROJECT_REF = "ikzifuotttucelvugjyy";

function readEnv(file) {
  const out = {};
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* file may not exist */
  }
  return out;
}

const env = readEnv(".env.development.local");
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !SERVICE || !ANON) {
  console.error("Missing dev Supabase credentials in .env.development.local.");
  process.exit(1);
}

if (!URL.includes(DEV_PROJECT_REF)) {
  console.error(`Refusing to run: ${URL} is not the dev project. This script creates and deletes users.`);
  process.exit(1);
}

const svc = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
const asUser = (jwt) => ({ apikey: ANON, Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" });
const anon = { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" };

const checks = [];
const failures = [];

function assert(ok, label, detail = "") {
  checks.push(label);
  process.stdout.write(ok ? "." : "x");
  if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
}

// ── Fixtures ────────────────────────────────────────────────────────────────

const stamp = process.pid;
const people = [
  { tag: "asha", email: `safety-test-asha-${stamp}@pravara.test`, password: "Test-Passw0rd-Asha" },
  { tag: "ravi", email: `safety-test-ravi-${stamp}@pravara.test`, password: "Test-Passw0rd-Ravi" },
  // A third member who is party to nothing, for checking that conversations
  // are not readable by people outside them.
  { tag: "meena", email: `safety-test-meena-${stamp}@pravara.test`, password: "Test-Passw0rd-Meena" },
];

async function createUser(person) {
  const res = await fetch(`${URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: svc,
    body: JSON.stringify({ email: person.email, password: person.password, email_confirm: true }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`create user: ${JSON.stringify(body).slice(0, 200)}`);
  person.id = body.id;

  // A profile row must exist — the safety tables reference profiles(id).
  const p = await fetch(`${URL}/rest/v1/profiles`, {
    method: "POST",
    headers: { ...svc, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      id: body.id,
      full_name: `${person.tag[0].toUpperCase()}${person.tag.slice(1)} (test)`,
      email: person.email,
      gender: person.tag === "ravi" ? "Male" : "Female",
      age: 29,
    }),
  });
  if (!p.ok) throw new Error(`create profile: ${(await p.text()).slice(0, 200)}`);
}

async function signIn(person) {
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: person.email, password: person.password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`sign in: ${JSON.stringify(body).slice(0, 200)}`);
  person.jwt = body.access_token;
}

async function cleanup() {
  for (const person of people) {
    if (!person.id) continue;
    await fetch(`${URL}/rest/v1/blocks?or=(blocker_id.eq.${person.id},blocked_id.eq.${person.id})`, {
      method: "DELETE",
      headers: svc,
    });
    await fetch(`${URL}/rest/v1/reports?or=(reporter_id.eq.${person.id},reported_id.eq.${person.id})`, {
      method: "DELETE",
      headers: svc,
    });
    await fetch(`${URL}/rest/v1/profiles?id=eq.${person.id}`, { method: "DELETE", headers: svc });
    await fetch(`${URL}/auth/v1/admin/users/${person.id}`, { method: "DELETE", headers: svc });
  }
}

// ── The run ─────────────────────────────────────────────────────────────────

try {
  for (const person of people) {
    await createUser(person);
    await signIn(person);
  }
  const [asha, ravi] = people;
  console.log(`Two test members created in dev.\n`);

  // The regression that made this whole path untestable: profiles that are not
  // auth users must still be blockable, since that is what the seeded dev data
  // is. Uses a real seeded profile rather than one of our fixtures.
  {
    const seeded = await (
      await fetch(`${URL}/rest/v1/profiles?select=id&limit=1&id=neq.${asha.id}`, { headers: svc })
    ).json();
    const res = await fetch(`${URL}/rest/v1/blocks`, {
      method: "POST",
      headers: asUser(asha.jwt),
      body: JSON.stringify({ blocker_id: asha.id, blocked_id: seeded[0].id }),
    });
    assert(res.ok, "a seeded dev profile can be blocked (the FK fix)", `${res.status} ${(await res.text()).slice(0, 90)}`);
    await fetch(`${URL}/rest/v1/blocks?blocker_id=eq.${asha.id}`, { method: "DELETE", headers: svc });
  }

  // Asha blocks Ravi, as herself.
  {
    const res = await fetch(`${URL}/rest/v1/blocks`, {
      method: "POST",
      headers: asUser(asha.jwt),
      body: JSON.stringify({ blocker_id: asha.id, blocked_id: ravi.id }),
    });
    assert(res.ok, "a member can block someone", `${res.status} ${(await res.text()).slice(0, 90)}`);
  }

  // Nobody may create a block on someone else's behalf.
  {
    const res = await fetch(`${URL}/rest/v1/blocks`, {
      method: "POST",
      headers: asUser(ravi.jwt),
      body: JSON.stringify({ blocker_id: asha.id, blocked_id: ravi.id }),
    });
    assert(!res.ok, "cannot forge a block as another member");
  }

  // The block is symmetric in effect.
  {
    const res = await fetch(`${URL}/rest/v1/rpc/is_blocked_between`, {
      method: "POST",
      headers: asUser(ravi.jwt),
      body: JSON.stringify({ a: ravi.id, b: asha.id }),
    });
    const value = await res.text();
    assert(value.trim() === "true", "the block applies in both directions", `got ${value}`);
  }

  // Ravi must not be able to discover that Asha blocked him.
  {
    const res = await fetch(`${URL}/rest/v1/blocks?select=id,blocker_id`, { headers: asUser(ravi.jwt) });
    const rows = await res.json();
    assert(Array.isArray(rows) && rows.length === 0, "the blocked member cannot see the block", JSON.stringify(rows).slice(0, 90));
  }

  // Asha can see her own.
  {
    const rows = await (await fetch(`${URL}/rest/v1/blocks?select=id`, { headers: asUser(asha.jwt) })).json();
    assert(Array.isArray(rows) && rows.length === 1, "the blocker sees her own block");
  }

  // Anonymous callers see nothing.
  {
    const res = await fetch(`${URL}/rest/v1/blocks?select=id`, { headers: anon });
    const text = await res.text();
    assert(!res.ok || text.trim() === "[]", "anonymous cannot read blocks", text.slice(0, 90));
  }

  // Constraints.
  {
    const self = await fetch(`${URL}/rest/v1/blocks`, {
      method: "POST",
      headers: asUser(asha.jwt),
      body: JSON.stringify({ blocker_id: asha.id, blocked_id: asha.id }),
    });
    assert(!self.ok, "cannot block yourself");

    const dup = await fetch(`${URL}/rest/v1/blocks`, {
      method: "POST",
      headers: asUser(asha.jwt),
      body: JSON.stringify({ blocker_id: asha.id, blocked_id: ravi.id }),
    });
    assert(dup.status === 409, "blocking twice is rejected as a duplicate", `status ${dup.status}`);
  }

  // Reporting.
  {
    const res = await fetch(`${URL}/rest/v1/reports`, {
      method: "POST",
      headers: asUser(ravi.jwt),
      body: JSON.stringify({ reporter_id: ravi.id, reported_id: asha.id, reason: "harassment", detail: "test" }),
    });
    assert(res.ok, "a member can file a report", `${res.status} ${(await res.text()).slice(0, 90)}`);

    const bad = await fetch(`${URL}/rest/v1/reports`, {
      method: "POST",
      headers: asUser(ravi.jwt),
      body: JSON.stringify({ reporter_id: ravi.id, reported_id: asha.id, reason: "not_a_real_reason" }),
    });
    assert(!bad.ok, "an invalid report reason is rejected");

    const forged = await fetch(`${URL}/rest/v1/reports`, {
      method: "POST",
      headers: asUser(ravi.jwt),
      body: JSON.stringify({ reporter_id: asha.id, reported_id: ravi.id, reason: "other" }),
    });
    assert(!forged.ok, "cannot file a report as another member");
  }

  // The reported member must not see the report against them.
  {
    const rows = await (await fetch(`${URL}/rest/v1/reports?select=id`, { headers: asUser(asha.jwt) })).json();
    assert(Array.isArray(rows) && rows.length === 0, "the reported member cannot see the report");
  }

  // The reporter sees their own.
  {
    const rows = await (await fetch(`${URL}/rest/v1/reports?select=id`, { headers: asUser(ravi.jwt) })).json();
    assert(Array.isArray(rows) && rows.length === 1, "the reporter sees their own report");
  }

  // ── The message policy ──────────────────────────────────────────────────
  // The claim being tested: a block holds at the database even when the two
  // are already connected and the request is made directly, bypassing any UI.
  {
    const conn = await fetch(`${URL}/rest/v1/connections`, {
      method: "POST",
      headers: { ...svc, Prefer: "return=representation" },
      body: JSON.stringify({ sender_id: ravi.id, receiver_id: asha.id, status: "accepted" }),
    });

    if (!conn.ok) {
      assert(false, "could create a test connection", (await conn.text()).slice(0, 120));
    } else {
      const [connection] = await conn.json();

      // Ravi is blocked by Asha, so this must fail despite the accepted
      // connection between them.
      const blockedSend = await fetch(`${URL}/rest/v1/messages`, {
        method: "POST",
        headers: asUser(ravi.jwt),
        body: JSON.stringify({ connection_id: connection.id, sender_id: ravi.id, content: "hello" }),
      });
      assert(!blockedSend.ok, "a blocked member cannot message, even when connected", `status ${blockedSend.status}`);

      // Nor may anyone post a message attributed to someone else — the hole
      // the old policy left open, since it only checked connection membership.
      const forged = await fetch(`${URL}/rest/v1/messages`, {
        method: "POST",
        headers: asUser(ravi.jwt),
        body: JSON.stringify({ connection_id: connection.id, sender_id: asha.id, content: "forged" }),
      });
      assert(!forged.ok, "cannot post a message as another member", `status ${forged.status}`);

      // With the block lifted the same send must succeed, otherwise the policy
      // is simply refusing everything and proving nothing.
      await fetch(`${URL}/rest/v1/blocks?blocker_id=eq.${asha.id}&blocked_id=eq.${ravi.id}`, {
        method: "DELETE",
        headers: svc,
      });
      const allowed = await fetch(`${URL}/rest/v1/messages`, {
        method: "POST",
        headers: asUser(ravi.jwt),
        body: JSON.stringify({ connection_id: connection.id, sender_id: ravi.id, content: "hello" }),
      });
      assert(allowed.ok, "an unblocked member CAN message", `${allowed.status} ${(await allowed.text()).slice(0, 90)}`);

      // There are two SELECT policies on this table and only one comes from a
      // migration ("View messages" does not). Since policies are OR'd, a
      // permissive stray would expose every conversation on the platform — so
      // the read side gets asserted rather than assumed.
      const outsider = people.find((p) => p.id !== ravi.id && p.id !== asha.id);
      if (outsider) {
        const rows = await (
          await fetch(`${URL}/rest/v1/messages?select=id&connection_id=eq.${connection.id}`, {
            headers: asUser(outsider.jwt),
          })
        ).json();
        assert(
          Array.isArray(rows) && rows.length === 0,
          "an unrelated member cannot read someone else's conversation",
          JSON.stringify(rows).slice(0, 90),
        );
      }

      await fetch(`${URL}/rest/v1/messages?connection_id=eq.${connection.id}`, { method: "DELETE", headers: svc });
      await fetch(`${URL}/rest/v1/connections?id=eq.${connection.id}`, { method: "DELETE", headers: svc });
    }
  }

  console.log(`\n\n${checks.length - failures.length}/${checks.length} checks passed\n`);
  for (const failure of failures) console.log(`FAIL  ${failure}`);
} catch (error) {
  console.error(`\n\nAborted: ${error.message}`);
  failures.push(error.message);
} finally {
  await cleanup();
  console.log("Test members removed.");
}

process.exit(failures.length ? 1 : 0);
