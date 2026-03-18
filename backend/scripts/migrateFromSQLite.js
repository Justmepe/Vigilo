/**
 * migrateFromSQLite.js
 * Migrates users + forms from the old Safety SQLite DB → Vigilo PostgreSQL
 * Run: node scripts/migrateFromSQLite.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Path to the old SQLite DB export (JSON files we'll generate via sqlite3 CLI)
const SQLITE_USERS_FILE = process.env.SQLITE_USERS_FILE || '/tmp/sqlite_users.json';
const SQLITE_FORMS_FILE = process.env.SQLITE_FORMS_FILE || '/tmp/sqlite_forms.json';

async function migrate() {
  if (!fs.existsSync(SQLITE_USERS_FILE) || !fs.existsSync(SQLITE_FORMS_FILE)) {
    console.error('❌ Export files not found. Run the export step first (see instructions below).');
    console.log('\nRun on the server:\n');
    console.log(`sqlite3 /var/www/safety/database/safety.db "SELECT json_object('id',id,'username',username,'email',email,'password_hash',password_hash,'full_name',full_name,'job_title',job_title,'role',role,'is_active',is_active,'created_at',created_at) FROM users;" > /tmp/sqlite_users.json`);
    console.log(`sqlite3 /var/www/safety/database/safety.db "SELECT json_object('id',id,'user_id',user_id,'form_type',form_type,'form_data',form_data,'status',status,'created_at',created_at,'ai_report',ai_report) FROM forms;" > /tmp/sqlite_forms.json`);
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('✅ Connected to PostgreSQL');

  // Parse — sqlite3 JSON mode outputs one JSON object per line
  const users = fs.readFileSync(SQLITE_USERS_FILE, 'utf8')
    .split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
  const forms = fs.readFileSync(SQLITE_FORMS_FILE, 'utf8')
    .split('\n').filter(l => l.trim()).map(l => JSON.parse(l));

  console.log(`📦 Migrating ${users.length} users and ${forms.length} forms...`);

  // ── Users ──────────────────────────────────────────────────────────────────
  let usersMigrated = 0;
  let usersSkipped = 0;
  const userIdMap = {}; // old_id → new_id

  for (const u of users) {
    try {
      // Normalise role: old app used lowercase 'user', new uses 'User'
      const role = u.role === 'Admin' ? 'Admin' : 'User';

      const res = await client.query(`
        INSERT INTO users (username, email, password_hash, full_name, job_title, role, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
        RETURNING id
      `, [
        u.username,
        u.email || null,
        u.password_hash,
        u.full_name || null,
        u.job_title || null,
        role,
        u.is_active ?? 1,
        u.created_at || new Date().toISOString(),
      ]);

      userIdMap[u.id] = res.rows[0].id;
      usersMigrated++;
      console.log(`  ✅ User: ${u.username} (${u.email}) → pg id ${res.rows[0].id}`);
    } catch (err) {
      console.warn(`  ⚠️  Skipped user ${u.username}: ${err.message}`);
      usersSkipped++;
    }
  }

  // ── Forms ──────────────────────────────────────────────────────────────────
  let formsMigrated = 0;
  let formsSkipped = 0;

  for (const f of forms) {
    try {
      const newUserId = userIdMap[f.user_id];
      if (!newUserId) {
        console.warn(`  ⚠️  Form ${f.id} skipped — user_id ${f.user_id} not mapped`);
        formsSkipped++;
        continue;
      }

      await client.query(`
        INSERT INTO forms (user_id, form_type, form_data, status, created_at, ai_report)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        newUserId,
        f.form_type,
        f.form_data,
        f.status || 'submitted',
        f.created_at || new Date().toISOString(),
        f.ai_report || null,
      ]);

      formsMigrated++;
    } catch (err) {
      console.warn(`  ⚠️  Skipped form ${f.id}: ${err.message}`);
      formsSkipped++;
    }
  }

  await client.end();

  console.log('\n── Migration Complete ───────────────────────────────');
  console.log(`  Users:  ${usersMigrated} migrated, ${usersSkipped} skipped`);
  console.log(`  Forms:  ${formsMigrated} migrated, ${formsSkipped} skipped`);
  console.log('─────────────────────────────────────────────────────');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
