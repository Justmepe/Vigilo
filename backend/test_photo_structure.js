/**
 * Test PDF generation with form that has photos
 */

const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'safety_manager.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  }

  console.log('Checking form 27 (with photos)...\n');

  db.get(
    `SELECT id, form_type, form_data FROM forms WHERE id = 27`,
    (err, row) => {
      if (err) {
        console.error('Query error:', err);
        db.close();
        process.exit(1);
      }

      if (!row) {
        console.log('Form 27 not found');
        db.close();
        process.exit(0);
      }

      try {
        const formData = JSON.parse(row.form_data);
        console.log('Form 27 data structure:');
        console.log('---');
        
        // Check for attachedPhotos
        console.log(`\nformData.attachedPhotos:`, formData.attachedPhotos ? `✅ EXISTS (${formData.attachedPhotos.length} items)` : '❌ MISSING');
        console.log(`formData.photos:`, formData.photos ? `EXISTS (${formData.photos.length} items)` : 'MISSING');
        
        // What the PDF export function would create
        const photos = formData.attachedPhotos || formData.photos || [];
        console.log(`\nPhotos array after extraction: ${photos.length} items`);
        
        // Simulate the pdfFormData object
        const pdfFormData = {
          formId: row.id,
          formType: row.form_type,
          formData: formData,
          photos: photos
        };

        console.log('\npdfFormData structure:');
        console.log(`  - pdfFormData.photos: ${pdfFormData.photos.length} items`);
        console.log(`  - pdfFormData.formData.attachedPhotos: ${pdfFormData.formData.attachedPhotos ? pdfFormData.formData.attachedPhotos.length : 'MISSING'} items`);
        
        // In the PDF generation function, formData parameter receives pdfFormData
        console.log('\nIn generateAndSendPDF function:');
        console.log(`  - formData parameter = pdfFormData (passed object)`);
        console.log(`  - formData.photos = ${pdfFormData.photos.length} items`);
        console.log(`  - Check condition: if (formData.photos && formData.photos.length > 0) = ${pdfFormData.photos && pdfFormData.photos.length > 0 ? '✅ TRUE' : '❌ FALSE'}`);
        
        // Check what's in the form content
        console.log('\nForm content (fields being rendered):');
        const fieldsToRender = Object.keys(formData).filter(key => key !== 'photo' && key !== 'attachedPhotos');
        console.log(`  Fields: ${fieldsToRender.join(', ')}`);
        
      } catch (parseErr) {
        console.error('Error parsing form_data:', parseErr.message);
      }

      db.close();
      process.exit(0);
    }
  );
});
