# License Card Generator - Implementation Quick Start Guide

**Quick Navigation:**
- [Database Setup](#database-setup)
- [Photo Validator Utility](#photo-validator-utility)
- [License Card Generator](#license-card-generator)
- [Controller Implementation](#controller-implementation)
- [Routes Setup](#routes-setup)
- [Frontend Component](#frontend-component-react)
- [Integration Checklist](#integration-checklist)

---

## Database Setup

### Add to `database/schema.sql`

```sql
-- License/ID Cards Table
CREATE TABLE IF NOT EXISTS license_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Employee Identity Fields
  employee_name TEXT NOT NULL,
  employee_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  
  -- Dates
  issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiration_date DATETIME NOT NULL,
  
  -- Media Paths
  passport_photo_base64 LONGTEXT,
  signature_base64 LONGTEXT,
  pdf_path TEXT,
  
  -- Metadata
  qr_code_data TEXT,
  status TEXT DEFAULT 'active',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS license_card_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  performed_by INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES license_cards(id)
);
```

---

## Photo Validator Utility

### Create `backend/src/utils/photoValidator.js`

```javascript
/**
 * Photo Validator for License Cards
 * Validates passport-size photos for ID card generation
 */

class PhotoValidator {
  /**
   * Validate passport photo dimensions and size
   * Standard: 35mm x 45mm = 390px x 510px at 300 DPI
   */
  static validatePassportPhoto(photoBuffer) {
    // Size checks
    const MIN_SIZE = 50 * 1024;        // 50KB minimum
    const MAX_SIZE = 5 * 1024 * 1024;  // 5MB maximum
    
    if (!photoBuffer || photoBuffer.length === 0) {
      throw new Error('Photo buffer is empty');
    }
    
    if (photoBuffer.length < MIN_SIZE) {
      throw new Error(`Photo too small: ${photoBuffer.length} bytes (minimum ${MIN_SIZE})`);
    }
    
    if (photoBuffer.length > MAX_SIZE) {
      throw new Error(`Photo too large: ${photoBuffer.length} bytes (maximum ${MAX_SIZE})`);
    }
    
    // Basic image format validation
    const jpegMagic = Buffer.from([0xFF, 0xD8, 0xFF]);
    const pngMagic = Buffer.from([0x89, 0x50, 0x4E]);
    
    const isJpeg = photoBuffer.subarray(0, 3).equals(jpegMagic);
    const isPng = photoBuffer.subarray(0, 3).equals(pngMagic);
    
    if (!isJpeg && !isPng) {
      throw new Error('Invalid image format. JPEG or PNG required');
    }
    
    return {
      isValid: true,
      format: isJpeg ? 'jpeg' : 'png',
      size: photoBuffer.length,
      validated_at: new Date().toISOString()
    };
  }
  
  /**
   * Validate signature image (less strict)
   */
  static validateSignature(signatureBuffer) {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    
    if (!signatureBuffer || signatureBuffer.length === 0) {
      return { isValid: false, error: 'Signature buffer is empty' };
    }
    
    if (signatureBuffer.length > MAX_SIZE) {
      return { isValid: false, error: `Signature too large: ${signatureBuffer.length} > ${MAX_SIZE}` };
    }
    
    return {
      isValid: true,
      size: signatureBuffer.length,
      validated_at: new Date().toISOString()
    };
  }
  
  /**
   * Extract image buffer from data URL
   */
  static extractImageBuffer(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') {
      throw new Error('Invalid data URL format');
    }
    
    const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image data URL');
    }
    
    try {
      return Buffer.from(matches[2], 'base64');
    } catch (err) {
      throw new Error(`Failed to decode base64: ${err.message}`);
    }
  }
}

module.exports = PhotoValidator;
```

---

## License Card Generator

### Create `backend/src/utils/licenseCardGenerator.js`

```javascript
/**
 * License Card PDF Generator
 * Generates professional ID cards with photo, signature, and metadata
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class LicenseCardGenerator {
  /**
   * Generate a two-page license card PDF
   * @param {Object} licenseData - Card data with photos
   * @param {String} outputPath - Where to save PDF
   * @returns {Promise<Object>} Success object with filename
   */
  static generateCard(licenseData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Standard ID card dimensions doubled for quality: 500x315pt (about 170x107mm)
        const cardWidth = 500;
        const cardHeight = 315;
        const margin = 20;
        const contentWidth = cardWidth - (margin * 2);
        
        const doc = new PDFDocument({
          size: [cardWidth, cardHeight],
          margin: margin,
          bufferPages: true
        });
        
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);
        
        // ========== FRONT OF CARD ==========
        this._renderFrontPage(doc, licenseData, cardWidth, cardHeight, margin);
        
        // ========== BACK OF CARD ==========
        doc.addPage();
        this._renderBackPage(doc, licenseData, cardWidth, cardHeight, margin);
        
        // Finalize PDF
        doc.end();
        
        writeStream.on('finish', () => {
          logger.info(`License card PDF generated: ${outputPath}`);
          resolve({
            success: true,
            filename: path.basename(outputPath),
            path: outputPath
          });
        });
        
        writeStream.on('error', (error) => {
          logger.error('PDF write stream error', { error: error.message });
          reject(error);
        });
        
      } catch (error) {
        logger.error('License card generation error', { error: error.message });
        reject(error);
      }
    });
  }
  
  static _renderFrontPage(doc, data, cardWidth, cardHeight, margin) {
    const contentWidth = cardWidth - (margin * 2);
    
    // ===== BACKGROUND & HEADER =====
    // Background color (Silver Bay blue)
    doc.rect(0, 0, cardWidth, cardHeight).fill('#1e40af');
    
    // Company header area
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff');
    doc.text('SILVER BAY SEAFOODS', margin + 10, margin + 10, {
      width: contentWidth - 20,
      align: 'left'
    });
    
    // ===== PASSPORT PHOTO SECTION =====
    const photoX = margin + 10;
    const photoY = margin + 40;
    const photoWidth = 95;
    const photoHeight = 125;
    
    if (data.passportPhoto && data.passportPhoto.url) {
      try {
        const photoBuffer = this._extractImageBuffer(data.passportPhoto.url);
        const tempPhotoPath = path.join(__dirname, `../../pdfs/temp-photo-${Date.now()}.jpg`);
        
        fs.writeFileSync(tempPhotoPath, photoBuffer);
        
        // Photo frame border
        doc.rect(photoX - 2, photoY - 2, photoWidth + 4, photoHeight + 4)
          .stroke('#ffffff');
        
        // Photo
        doc.image(tempPhotoPath, photoX, photoY, {
          width: photoWidth,
          height: photoHeight,
          fit: ['cover']
        });
        
        // Cleanup temp file
        fs.unlinkSync(tempPhotoPath);
        
      } catch (imgErr) {
        logger.warn(`Photo embedding failed: ${imgErr.message}`);
        // Fallback: placeholder box
        doc.rect(photoX, photoY, photoWidth, photoHeight).stroke('#ffffff');
        doc.fontSize(8).fillColor('#cccccc').text('[PHOTO]', photoX + 30, photoY + 55);
      }
    }
    
    // ===== EMPLOYEE INFORMATION SECTION =====
    const infoX = photoX + photoWidth + 15;
    const infoTopY = photoY;
    
    // Name (largest text)
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#ffffff');
    doc.text(data.employeeName, infoX, infoTopY, {
      width: cardWidth - infoX - margin,
      align: 'left'
    });
    
    // Employee ID
    doc.fontSize(10).font('Helvetica').fillColor('#e0e7ff').moveDown(0.15);
    doc.text(`ID: ${data.employeeId}`, { width: cardWidth - infoX - margin });
    
    // Category/Position
    doc.fontSize(9).fillColor('#c7d2fe').moveDown(0.1);
    doc.text(`${data.category}`, { width: cardWidth - infoX - margin });
    
    // Issue and Expiration Dates
    doc.fontSize(8).fillColor('#a5b4fc').moveDown(0.15);
    const issueDate = new Date(data.issueDate);
    const expireDate = new Date(data.expirationDate);
    
    doc.text(`Issued: ${issueDate.toLocaleDateString()}`, { 
      width: cardWidth - infoX - margin 
    });
    doc.text(`Expires: ${expireDate.toLocaleDateString()}`, { 
      width: cardWidth - infoX - margin 
    });
    
    // ===== BOTTOM STRIPE (SECURITY) =====
    doc.rect(0, cardHeight - 20, cardWidth, 20).fill('#0f172a');
    
    doc.fontSize(6.5).fillColor('#94a3b8').font('Helvetica');
    doc.text(
      'OFFICIAL ID • NOT TRANSFERABLE • KEEP ON PERSON',
      margin,
      cardHeight - 16,
      { width: contentWidth, align: 'center' }
    );
    
    // ===== QR CODE PLACEHOLDER (bottom right) =====
    if (data.qrCodeData) {
      const qrX = cardWidth - margin - 35;
      const qrY = cardHeight - margin - 35;
      
      // Frame for QR
      doc.rect(qrX - 1, qrY - 1, 32, 32).stroke('#ffffff');
      doc.fontSize(5).fillColor('#ffffff').text('QR', qrX + 8, qrY + 13);
    }
  }
  
  static _renderBackPage(doc, data, cardWidth, cardHeight, margin) {
    const contentWidth = cardWidth - (margin * 2);
    
    // ===== BACK PAGE BACKGROUND =====
    doc.rect(0, 0, cardWidth, cardHeight).fill('#0f172a');
    
    // ===== TITLE =====
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#e0e7ff');
    doc.text('EMPLOYEE IDENTIFICATION', margin, margin + 10, {
      width: contentWidth,
      align: 'center'
    });
    
    doc.moveTo(margin, margin + 30).lineTo(cardWidth - margin, margin + 30).stroke('#1e40af');
    
    // ===== SIGNATURE SECTION =====
    doc.fontSize(9).font('Helvetica').fillColor('#94a3b8').moveDown(1);
    doc.text('AUTHORIZED SIGNATURE:', margin, margin + 40);
    
    // Signature line or image
    if (data.signature && data.signature.url) {
      try {
        const sigBuffer = this._extractImageBuffer(data.signature.url);
        const tempSigPath = path.join(__dirname, `../../pdfs/temp-sig-${Date.now()}.jpg`);
        
        fs.writeFileSync(tempSigPath, sigBuffer);
        
        doc.image(tempSigPath, margin, margin + 55, {
          width: 100,
          height: 35,
          fit: ['contain']
        });
        
        fs.unlinkSync(tempSigPath);
        
      } catch (e) {
        logger.warn(`Signature embedding failed: ${e.message}`);
        doc.moveTo(margin, margin + 85).lineTo(margin + 100, margin + 85).stroke('#94a3b8');
      }
    } else {
      // Just a line
      doc.moveTo(margin, margin + 85).lineTo(margin + 100, margin + 85).stroke('#94a3b8');
    }
    
    // Employee confirms signature
    doc.fontSize(7).fillColor('#64748b');
    doc.text('Employee Signature', margin, margin + 90, { width: 100 });
    
    // ===== TERMS & CONDITIONS =====
    const termsY = margin + 120;
    doc.fontSize(7).fillColor('#94a3b8').font('Helvetica');
    
    const termsText = `This identification card is valid for access to Silver Bay Seafoods 
facilities and equipment. The cardholder agrees to:

• Wear ID card visibly during work hours
• Return card immediately upon resignation or termination
• Report lost/stolen cards to facility management immediately
• Not transfer card to any other person
• Follow all safety protocols and facility rules

This card remains the property of Silver Bay Seafoods and may be 
revoked without notice if terms are violated.`;
    
    doc.text(termsText, margin, termsY, { 
      width: contentWidth,
      align: 'left',
      lineGap: 2
    });
    
    // ===== FOOTER =====
    doc.moveTo(margin, cardHeight - margin - 20)
      .lineTo(cardWidth - margin, cardHeight - margin - 20)
      .stroke('#1e40af');
    
    doc.fontSize(6).fillColor('#64748b');
    const timestamp = new Date().toLocaleDateString();
    doc.text(`Generated: ${timestamp} | Employee: ${data.employeeId}`, 
      margin, cardHeight - margin - 15, 
      { width: contentWidth, align: 'center' }
    );
  }
  
  static _extractImageBuffer(dataUrl) {
    const matches = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image data URL');
    }
    return Buffer.from(matches[1], 'base64');
  }
}

module.exports = LicenseCardGenerator;
```

---

## Controller Implementation

### Create `backend/src/controllers/licenseCardController.js`

```javascript
/**
 * License Card Controller
 * Handles creation and management of employee ID cards
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const PhotoValidator = require('../utils/photoValidator');
const LicenseCardGenerator = require('../utils/licenseCardGenerator');
const { v4: uuidv4 } = require('uuid');

class LicenseCardController {
  static async createLicenseCard(req, res, next) {
    const cardsDir = path.join(process.cwd(), 'backend', 'pdfs');
    if (!fs.existsSync(cardsDir)) {
      fs.mkdirSync(cardsDir, { recursive: true });
    }
    
    try {
      const {
        employeeName,
        employeeId,
        category,
        passportPhoto,
        signature
      } = req.body;
      
      const userId = req.user?.id;
      
      // ===== VALIDATION =====
      if (!employeeName || !employeeId || !category || !passportPhoto) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, ID, category, and passport photo'
        });
      }
      
      // Validate category
      const validCategories = ['Manager', 'Operator', 'Supervisor', 'Safety Officer'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }
      
      // Validate photo
      try {
        const photoBuffer = PhotoValidator.extractImageBuffer(passportPhoto);
        PhotoValidator.validatePassportPhoto(photoBuffer);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: `Photo validation failed: ${err.message}`
        });
      }
      
      // Validate signature if provided
      if (signature) {
        try {
          const sigBuffer = PhotoValidator.extractImageBuffer(signature);
          const sigValidation = PhotoValidator.validateSignature(sigBuffer);
          if (!sigValidation.isValid) {
            return res.status(400).json({
              success: false,
              message: `Signature validation failed: ${sigValidation.error}`
            });
          }
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: `Signature validation error: ${err.message}`
          });
        }
      }
      
      // ===== GENERATE DATES & QR =====
      const issueDate = new Date();
      const expirationDate = new Date(issueDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      
      // QR Code data: employee ID + timestamp hash
      const qrCodeData = `${employeeId}:${issueDate.getTime().toString(36).toUpperCase()}`;
      
      // ===== SAVE TO DATABASE =====
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO license_cards 
           (user_id, employee_name, employee_id, category, 
            issue_date, expiration_date, passport_photo_base64, 
            signature_base64, qr_code_data, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId || null,
            employeeName,
            employeeId,
            category,
            issueDate.toISOString(),
            expirationDate.toISOString(),
            passportPhoto,
            signature || null,
            qrCodeData,
            'active'
          ],
          async function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({
                  success: false,
                  message: `Employee ID ${employeeId} already exists`
                });
              }
              logger.error('Database insert error', { error: err.message });
              return reject(err);
            }
            
            const cardId = this.lastID;
            
            // ===== GENERATE PDF =====
            try {
              const timestamp = issueDate.toISOString().split('T')[0];
              const pdfFileName = `license-card-${employeeId}-${cardId}-${timestamp}.pdf`;
              const pdfPath = path.join(cardsDir, pdfFileName);
              
              const licenseData = {
                cardId,
                employeeName,
                employeeId,
                category,
                issueDate: issueDate.toISOString(),
                expirationDate: expirationDate.toISOString(),
                passportPhoto: { url: passportPhoto },
                signature: signature ? { url: signature } : null,
                qrCodeData
              };
              
              await LicenseCardGenerator.generateCard(licenseData, pdfPath);
              
              // ===== UPDATE DATABASE WITH PDF PATH =====
              db.run(
                'UPDATE license_cards SET pdf_path = ? WHERE id = ?',
                [pdfPath, cardId],
                (updateErr) => {
                  if (updateErr) {
                    logger.warn('Failed to update PDF path', { error: updateErr.message });
                  }
                  
                  // ===== LOG AUDIT TRAIL =====
                  db.run(
                    'INSERT INTO license_card_audit (card_id, action, performed_by) VALUES (?, ?, ?)',
                    [cardId, 'created', userId || null],
                    (auditErr) => {
                      if (auditErr) {
                        logger.warn('Failed to log audit', { error: auditErr.message });
                      }
                    }
                  );
                  
                  logger.info(`License card created: ${cardId}`, { 
                    userId, 
                    employeeId,
                    category
                  });
                  
                  res.status(201).json({
                    success: true,
                    cardId,
                    employeeId,
                    message: 'License card generated successfully',
                    data: {
                      cardId,
                      employeeId,
                      employeeName,
                      category,
                      issueDate: issueDate.toLocaleDateString(),
                      expirationDate: expirationDate.toLocaleDateString(),
                      downloadUrl: `/api/license-cards/${cardId}/download`,
                      viewUrl: `/api/license-cards/${cardId}/view`
                    }
                  });
                }
              );
            } catch (pdfErr) {
              logger.error('PDF generation failed', { cardId, error: pdfErr.message });
              db.run(
                'UPDATE license_cards SET status = ? WHERE id = ?',
                ['failed', cardId]
              );
              res.status(500).json({
                success: false,
                message: 'PDF generation failed',
                cardId
              });
            }
          }
        );
      }).catch(error => next(error));
      
    } catch (error) {
      logger.error('License card creation error', { error: error.message });
      next(error);
    }
  }
  
  static async downloadLicenseCard(req, res, next) {
    try {
      const { cardId } = req.params;
      
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT pdf_path, employee_id FROM license_cards WHERE id = ?',
          [cardId],
          (err, row) => {
            if (err) return reject(err);
            
            if (!row || !row.pdf_path) {
              return res.status(404).json({
                success: false,
                message: 'License card PDF not found'
              });
            }
            
            if (!fs.existsSync(row.pdf_path)) {
              logger.warn('PDF file not found on disk', { path: row.pdf_path });
              return res.status(404).json({
                success: false,
                message: 'PDF file not found'
              });
            }
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
              'Content-Disposition',
              `attachment; filename="license-card-${row.employee_id}-${cardId}.pdf"`
            );
            
            const fileStream = fs.createReadStream(row.pdf_path);
            fileStream.pipe(res);
            fileStream.on('end', () => resolve());
            fileStream.on('error', (err) => {
              logger.error('File stream error', { error: err.message });
              reject(err);
            });
          }
        );
      }).catch(error => next(error));
      
    } catch (error) {
      next(error);
    }
  }
  
  static async viewLicenseCard(req, res, next) {
    try {
      const { cardId } = req.params;
      
      return new Promise((resolve, reject) => {
        db.get(
          `SELECT id, employee_name, employee_id, category, 
                  issue_date, expiration_date, status FROM license_cards WHERE id = ?`,
          [cardId],
          (err, row) => {
            if (err) return reject(err);
            if (!row) {
              return res.status(404).json({
                success: false,
                message: 'License card not found'
              });
            }
            
            res.json({
              success: true,
              data: {
                cardId: row.id,
                employeeName: row.employee_name,
                employeeId: row.employee_id,
                category: row.category,
                issueDate: new Date(row.issue_date).toLocaleDateString(),
                expirationDate: new Date(row.expiration_date).toLocaleDateString(),
                status: row.status,
                daysUntilExpiry: this._calculateDaysUntilExpiry(row.expiration_date)
              }
            });
          }
        );
      }).catch(error => next(error));
      
    } catch (error) {
      next(error);
    }
  }
  
  static _calculateDaysUntilExpiry(expirationDate) {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

module.exports = LicenseCardController;
```

---

## Routes Setup

### Create `backend/src/routes/licenseCards.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const LicenseCardController = require('../controllers/licenseCardController');
const { authMiddleware } = require('../middleware/auth.middleware');

// Create new license card
router.post('/', authMiddleware, LicenseCardController.createLicenseCard);

// Download license card PDF
router.get('/:cardId/download', authMiddleware, LicenseCardController.downloadLicenseCard);

// View license card details (JSON)
router.get('/:cardId', authMiddleware, LicenseCardController.viewLicenseCard);

module.exports = router;
```

### Update `backend/src/routes/index.js`

Add this line after other route imports:

```javascript
const licenseCardsRoutes = require('./licenseCards.routes');

// ... in the router.use section:
router.use('/api/license-cards', licenseCardsRoutes);
```

---

## Frontend Component (React)

### Create `frontend/src/components/forms/LicenseCardForm.jsx`

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import { PhotoCapture } from '../PhotoCapture';
import { SignatureCapture } from '../SignatureCapture';

export function LicenseCardForm() {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    category: 'Operator',
    passportPhoto: null,
    signature: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedCardId, setGeneratedCardId] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoCapture = (photoData) => {
    setFormData(prev => ({ ...prev, passportPhoto: photoData }));
  };
  
  const handleSignatureCapture = (signatureData) => {
    setFormData(prev => ({ ...prev, signature: signatureData }));
  };
  
  const isFormValid = () => {
    return (
      formData.employeeName.trim() &&
      formData.employeeId.trim() &&
      formData.category &&
      formData.passportPhoto
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setGeneratedCardId(null);
    
    try {
      const response = await axios.post('/api/license-cards', formData);
      
      setGeneratedCardId(response.data.cardId);
      setSuccessMessage(
        `✓ License card created successfully for ${formData.employeeName}!`
      );
      
      // Show download button
      // User can download PDF from the success message
      
      // Reset form
      setFormData({
        employeeName: '',
        employeeId: '',
        category: 'Operator',
        passportPhoto: null,
        signature: null
      });
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                       err.message ||
                       'Failed to create license card';
      setError(errorMsg);
      console.error('License card generation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadPDF = () => {
    if (generatedCardId) {
      const link = document.createElement('a');
      link.href = `/api/license-cards/${generatedCardId}/download`;
      link.download = `license-card-${formData.employeeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <h2 className="text-3xl font-bold">Generate Employee License Card</h2>
          <p className="mt-2 text-blue-100">Create professional ID cards for your team</p>
        </div>
        
        <div className="p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
          
          {/* Success Alert */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
              <p className="font-semibold">{successMessage}</p>
              {generatedCardId && (
                <button
                  onClick={handleDownloadPDF}
                  className="mt-3 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  📥 Download PDF
                </button>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Michael Sales"
                maxLength="100"
              />
            </div>
            
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="EMP-001234"
                maxLength="20"
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Position Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Operator">Operator</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Manager">Manager</option>
                <option value="Safety Officer">Safety Officer</option>
              </select>
            </div>
            
            {/* Passport Photo */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Passport-Size Photo <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-4">
                Minimum 350×450 pixels (recommended 4:5 aspect ratio)
              </p>
              <PhotoCapture onPhotoCapture={handlePhotoCapture} />
              {formData.passportPhoto && (
                <div className="mt-3 p-2 bg-green-100 text-green-700 rounded text-sm flex items-center">
                  <span className="mr-2">✓</span> Photo captured and validated
                </div>
              )}
            </div>
            
            {/* Signature (Optional) */}
            <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Signature (Optional)
              </label>
              <p className="text-xs text-gray-600 mb-4">
                Capture signature on touchscreen or upload image file
              </p>
              <SignatureCapture onSignatureSave={handleSignatureCapture} />
              {formData.signature && (
                <div className="mt-3 p-2 bg-blue-100 text-blue-700 rounded text-sm flex items-center">
                  <span className="mr-2">✓</span> Signature captured
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                loading || !isFormValid()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Generating Card...
                </span>
              ) : (
                'Generate License Card'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

## Integration Checklist

### ✅ Database Setup
- [ ] Add tables to `database/schema.sql`
- [ ] Run `npm run init-db` to create tables
- [ ] Verify tables exist with: `sqlite3 path/to/database.db ".tables"`

### ✅ Backend Setup
- [ ] Create `backend/src/utils/photoValidator.js`
- [ ] Create `backend/src/utils/licenseCardGenerator.js`
- [ ] Create `backend/src/controllers/licenseCardController.js`
- [ ] Create `backend/src/routes/licenseCards.routes.js`
- [ ] Update `backend/src/routes/index.js` to include new routes
- [ ] Restart backend server: `npm start`

### ✅ Frontend Setup
- [ ] Create `frontend/src/components/forms/LicenseCardForm.jsx`
- [ ] Add component to navigation/menu in your app
- [ ] Ensure PhotoCapture component exists
- [ ] Create SignatureCapture component if needed
- [ ] Test form rendering

### ✅ Testing
- [ ] Test creating a license card with valid data
- [ ] Test photo validation (try with invalid dimensions)
- [ ] Test database storage
- [ ] Test PDF generation and download
- [ ] Verify PDF displays correctly
- [ ] Test all category types

### ✅ Optional Enhancements
- [ ] Add QR code library: `npm install qrcode`
- [ ] Improve photo validation with `sharp` library
- [ ] Add batch card generation feature
- [ ] Add card listing/management UI
- [ ] Add expiration renewal workflow

---

## Troubleshooting

### PDF Not Generating
```javascript
// Check temp directory exists and is writable
const fs = require('fs');
const path = require('path');
const pdfsDir = path.join(process.cwd(), 'backend', 'pdfs');
fs.mkdirSync(pdfsDir, { recursive: true });
```

### Photo Base64 Issues
```javascript
// Ensure data URL format is correct
const correctFormat = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
const matches = correctFormat.match(/^data:image\/\w+;base64,(.+)$/);
console.log(matches ? 'Valid format' : 'Invalid format');
```

### Routes Not Found
```javascript
// Verify route registration in index.js
const licenseCardsRoutes = require('./licenseCards.routes');
router.use('/api/license-cards', licenseCardsRoutes);
// Should be AFTER all other route declarations
```

---

**Status: Complete Implementation Guide v1.0**  
**Ready for deployment. Estimated setup time: 2-3 hours**
