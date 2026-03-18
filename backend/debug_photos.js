/**
 * Debug script to check if photos are being stored in database
 */

const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'safety_manager.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  }
  console.log('✓ Database connected\n');

  // Get the last 5 forms
  db.all(
    `SELECT id, form_type, created_at, form_data FROM forms ORDER BY id DESC LIMIT 5`,
    (err, rows) => {
      if (err) {
        console.error('Query error:', err);
        db.close();
        process.exit(1);
      }

      if (!rows || rows.length === 0) {
        console.log('No forms found in database');
        db.close();
        process.exit(0);
      }

      console.log(`Found ${rows.length} recent forms:\n`);

      rows.forEach((row, index) => {
        console.log(`\n${index + 1}. Form ID: ${row.id} (${row.form_type})`);
        console.log(`   Created: ${row.created_at}`);
        
        try {
          const formData = JSON.parse(row.form_data);
          
          // Check if attachedPhotos exists
          if (formData.attachedPhotos) {
            console.log(`   ✅ attachedPhotos found: ${formData.attachedPhotos.length} photo(s)`);
            if (formData.attachedPhotos.length > 0) {
              formData.attachedPhotos.forEach((photo, i) => {
                console.log(`      Photo ${i + 1}:`);
                console.log(`        - Caption: ${photo.caption || '[no caption]'}`);
                console.log(`        - Has URL: ${photo.url ? 'YES' : 'NO'}`);
                if (photo.url) {
                  console.log(`        - URL length: ${photo.url.length} chars`);
                  console.log(`        - Starts with: ${photo.url.substring(0, 50)}...`);
                }
              });
            }
          } else {
            console.log(`   ❌ attachedPhotos NOT FOUND in form data`);
          }

          // Check for photos field (old format)
          if (formData.photos) {
            console.log(`   ⚠️  photos field exists: ${formData.photos.length} item(s)`);
          }

          // List all top-level keys
          const keys = Object.keys(formData);
          console.log(`   Fields in form_data: ${keys.join(', ')}`);
          
        } catch (parseErr) {
          console.log(`   Error parsing form_data: ${parseErr.message}`);
        }
      });

      db.close();
      process.exit(0);
    }
  );
});
