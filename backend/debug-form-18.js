#!/usr/bin/env node

/**
 * Debug script to check what's in the database and trace PDF generation
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'backend', 'database.db');
const db = new sqlite3.Database(dbPath);

// Query form 18
db.all(
  'SELECT id, form_type, form_data, ai_report FROM forms WHERE id = 18',
  (err, rows) => {
    if (err) {
      console.error('DB Error:', err);
      db.close();
      return;
    }

    if (!rows || rows.length === 0) {
      console.log('No form found');
      db.close();
      return;
    }

    const form = rows[0];
    console.log('\n" Form 18 Database Content"');
    console.log('- ID:', form.id);
    console.log('- Type:', form.form_type);
    console.log('- Form Data Length:', form.form_data.length);
    console.log('- AI Report:', form.ai_report ? form.ai_report.substring(0, 100) + '...' : 'NULL');

    // Parse form data
    let parsed = {};
    try {
      parsed = JSON.parse(form.form_data);
      console.log('\n" PARSED FORM DATA KEYS"');
      const keys = Object.keys(parsed).sort();
      keys.forEach(k => {
        const val = parsed[k];
        if (typeof val === 'string') {
          console.log(`  ${k}: "${val.substring(0, 50)}${val.length > 50 ? '...' : ''}"`);
        } else if (Array.isArray(val)) {
          console.log(`  ${k}: [array with ${val.length} items]`);
        } else if (typeof val === 'object') {
          console.log(`  ${k}: {object}`);
        } else {
          console.log(`  ${k}: ${val}`);
        }
      });
      
      // Check for photos
      console.log('\n" PHOTO DATA"');
      console.log(`  attachedPhotos: ${Array.isArray(parsed.attachedPhotos) ? parsed.attachedPhotos.length + ' photos' : 'not found'}`);
      console.log(`  photos: ${Array.isArray(parsed.photos) ? parsed.photos.length + ' photos' : 'not found'}`);
      
      // Check for job steps
      console.log('\n" JOB STEPS DATA"');
      if (parsed.jobSteps) {
        if (typeof parsed.jobSteps === 'string') {
          try {
            const steps = JSON.parse(parsed.jobSteps);
            console.log(`  jobSteps: [parsed string] ${steps.length} items`);
            console.log(`  First step:`, steps[0]);
          } catch (e) {
            console.log(`  jobSteps: [string, not JSON] length=${parsed.jobSteps.length}`);
          }
        } else {
          console.log(`  jobSteps: [object/array] ${parsed.jobSteps.length || 'unknown'} items`);
        }
      } else {
        console.log(`  jobSteps: NOT PRESENT`);
      }
      
    } catch (e) {
      console.log('Could not parse form_data as JSON:', e.message);
    }

    db.close();
  }
);
