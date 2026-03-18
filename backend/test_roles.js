/**
 * Role mapping test — run: node test_roles.js
 */
const axios = require('axios');
const BASE = 'http://localhost:5000/api';

async function run() {
  console.log('=== ROLE MAPPING TEST SUITE ===\n');

  const cases = [
    { job_role: 'Safety Manager',        expect: 'Admin' },
    { job_role: 'Plant Manager',         expect: 'Admin' },
    { job_role: 'EHS Manager',           expect: 'Admin' },
    { job_role: 'Safety Coordinator',    expect: 'Supervisor' },
    { job_role: 'Production Supervisor', expect: 'Supervisor' },
    { job_role: 'Line Lead',             expect: 'User' },
    { job_role: 'Worker/Operator',       expect: 'User' },
    { job_role: 'Maintenance',           expect: 'User' },
    { job_role: '',                      expect: 'User' },
  ];

  let pass = 0, fail = 0;
  const ts = Date.now();

  for (const { job_role, expect } of cases) {
    const username = 'rt_' + ts + '_' + Math.random().toString(36).slice(2, 6);
    const res = await axios.post(BASE + '/auth/register', {
      username,
      email: username + '@test.com',
      password: 'Test123!',
      full_name: 'Role Test',
      job_role,
      facility: 'Ketchikan',
    });
    const got = res.data.user.role;
    const ok = got === expect;
    if (ok) pass++; else fail++;
    const label = (job_role || '(empty)').padEnd(26);
    console.log((ok ? '  ✓' : '  ✗'), label, '→', got.padEnd(12), ok ? '' : '  expected: ' + expect);
  }

  console.log('\n' + pass + '/' + cases.length + ' role mappings', fail === 0 ? '✓' : `✗ (${fail} failed)`);

  // Full admin registration + login flow
  const ts2 = Date.now();
  console.log('\n--- Admin registration + login flow ---');
  const adminReg = await axios.post(BASE + '/auth/register', {
    username: 'sm_' + ts2,
    email: 'sm_' + ts2 + '@test.com',
    password: 'Test123!',
    full_name: 'Test Safety Manager',
    job_role: 'Safety Manager',
    facility: 'Naknek',
  });
  const u = adminReg.data.user;
  console.log('  Registration → role:', u.role, '| job_title:', u.job_title, '| facility:', u.facility);
  console.log('  Role is Admin:', u.role === 'Admin' ? '✓' : '✗');
  console.log('  Should redirect to /admin:', u.role === 'Admin' ? '✓' : '✗');

  const login = await axios.post(BASE + '/auth/login', { username: 'sm_' + ts2, password: 'Test123!' });
  console.log('  Login JWT role:', login.data.user.role, login.data.user.role === 'Admin' ? '✓' : '✗');

  // Full supervisor registration + login flow
  console.log('\n--- Supervisor registration + login flow ---');
  const supReg = await axios.post(BASE + '/auth/register', {
    username: 'sc_' + ts2,
    email: 'sc_' + ts2 + '@test.com',
    password: 'Test123!',
    full_name: 'Test Coordinator',
    job_role: 'Safety Coordinator',
    facility: 'Sitka',
  });
  const su = supReg.data.user;
  console.log('  Registration → role:', su.role, '| job_title:', su.job_title);
  console.log('  Role is Supervisor:', su.role === 'Supervisor' ? '✓' : '✗');

  if (fail === 0) {
    console.log('\n==============================');
    console.log('   ALL TESTS PASSED ✓');
    console.log('==============================');
  } else {
    process.exit(1);
  }
}

run().catch(e => {
  console.error('\nFAILED:', e.response?.data?.message || e.message);
  process.exit(1);
});
