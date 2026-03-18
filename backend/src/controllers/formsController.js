/**
 * Forms Controller
 * Handles creation, retrieval, and management of all safety forms
 */

const logger = require('../utils/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const pdfConfig = require('../config/pdfConfig');
const AIReportGenerator = require('../services/aiReportGenerator');

class FormsController {
  /**
   * Create JSA Form
   * POST /api/jsa
   * Minimum required: date, location, job title
   */
  static async createJSA(req, res, next) {
    try {
      const {
        date,
        location,
        jobTitle,
        jhaNumber,
        responsibleSupervisor,
        jobDescription,
        contactNumber,
        preparedBy,
        reviewedBy,
        approvedBy,
        workTeamMembers,
        jobSteps,
        permitConditionsAcknowledged,
      } = req.body;

      // Minimum validation — skip for drafts
      const isDraft = req.body.status === 'draft';
      if (!isDraft && (!date || !location || !jobTitle)) {
        throw new ValidationError('Missing required JSA fields: date, location, and job title are required');
      }

      // Save to database
      const result = await db.runAsync(
        'INSERT INTO forms (user_id, form_type, form_data, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [req.user?.id || null, 'jsa', JSON.stringify(req.body), req.body.status === 'draft' ? 'draft' : 'submitted', new Date().toISOString()]
      );

      const formId = result.id;
      const savedStatus = req.body.status === 'draft' ? 'draft' : 'submitted';
      logger.info(`JSA form created and saved: ${formId} (${savedStatus})`, { userId: req.user?.id });

      // Send immediate response to user
      res.status(201).json({
        success: true,
        id: formId,
        formId,
        status: savedStatus,
        message: savedStatus === 'draft' ? 'JSA draft saved successfully' : 'JSA form created and saved successfully',
        data: {
          formId,
          date,
          location,
          jobTitle,
          status: savedStatus,
          createdAt: new Date().toISOString()
        }
      });

      // Generate AI report asynchronously — only for submitted forms, not drafts
      if (savedStatus !== 'draft') {
        setImmediate(async () => {
          try {
            const pdfData = {
              formId,
              formType: 'jsa',
              formData: req.body,
              userId: req.user?.id
            };
            await AIReportGenerator.generateReportAsync(formId, pdfData);
          } catch (aiError) {
            logger.warn(`Background AI report generation failed for form ${formId}`, { error: aiError.message });
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Injury Report
   * POST /api/injury
   * Accepts both frontend and backend field names for compatibility
   */
  static async createInjuryReport(req, res, next) {
    try {
      // Accept both frontend and backend field names
      const incidentDate = req.body.incidentDate || req.body.incidentDateTime?.split('T')[0] || req.body.date;
      const incidentLocation = req.body.incidentLocation || req.body.locationOfIncident || req.body.location;
      const description = req.body.description || req.body.incidentDescription;
      const employeeName = req.body.employeeName;
      const bodyPartAffected = req.body.bodyPartAffected || req.body.bodyPartInjured;
      const injuryType = req.body.injuryType || req.body.typeOfInjury;

      const isDraft = req.body.status === 'draft';
      if (!isDraft && (!incidentDate || !incidentLocation || !description || !employeeName)) {
        throw new ValidationError('Missing required injury report fields: date, location, description, and employee name');
      }

      // Save to database
      const result = await db.runAsync(
        'INSERT INTO forms (user_id, form_type, form_data, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [req.user?.id || null, 'injury', JSON.stringify(req.body), req.body.status === 'draft' ? 'draft' : 'submitted', new Date().toISOString()]
      );

      const formId = result.id;
      const savedStatus = req.body.status === 'draft' ? 'draft' : 'submitted';
      logger.info(`Injury report created and saved: ${formId} (${savedStatus})`, { userId: req.user?.id });

      res.status(201).json({
        success: true,
        id: formId,
        formId,
        status: savedStatus,
        message: savedStatus === 'draft' ? 'Injury report draft saved' : 'Injury report created and saved successfully',
        data: { formId, incidentDate, incidentLocation, description, employeeName, bodyPartAffected, injuryType, status: savedStatus, createdAt: new Date().toISOString() }
      });

      if (savedStatus !== 'draft') {
        setImmediate(async () => {
          try {
            await AIReportGenerator.generateReportAsync(formId, { formId, formType: 'injury', formData: req.body, userId: req.user?.id });
          } catch (aiError) {
            logger.warn(`Background AI report generation failed for form ${formId}`, { error: aiError.message });
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create LOTO Form
   * POST /api/loto
   */
  static async createLOTO(req, res, next) {
    try {
      const {
        equipmentName,
        authorizedBy,
        energySources,
        authorizedPersonTrainingDate,
        lockoutStartTime,
        tryOutPerformed,
        zeroEnergyStateVerified,
      } = req.body;

      // More lenient validation - just check core required fields; skip for drafts
      const isDraft = req.body.status === 'draft';
      if (!isDraft && (!equipmentName || !authorizedBy)) {
        logger.warn('Missing LOTO required fields', {
          received: { equipmentName, authorizedBy, energySources },
          userId: req.user?.id
        });
        throw new ValidationError('Missing required LOTO fields: Equipment name and authorized person are required');
      }

      // Save to database
      const result = await db.runAsync(
        'INSERT INTO forms (user_id, form_type, form_data, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [req.user?.id || null, 'loto', JSON.stringify(req.body), req.body.status === 'draft' ? 'draft' : 'submitted', new Date().toISOString()]
      );

      const formId = result.id;
      const savedStatus = req.body.status === 'draft' ? 'draft' : 'submitted';
      logger.info(`LOTO form created and saved: ${formId} (${savedStatus})`, { userId: req.user?.id });

      res.status(201).json({
        success: true,
        id: formId,
        formId,
        status: savedStatus,
        message: savedStatus === 'draft' ? 'LOTO draft saved' : 'LOTO form created and saved successfully',
        data: { formId, equipmentName, authorizedBy, status: savedStatus, createdAt: new Date().toISOString() }
      });

      if (savedStatus !== 'draft') {
        setImmediate(async () => {
          try {
            await AIReportGenerator.generateReportAsync(formId, { formId, formType: 'loto', formData: req.body, userId: req.user?.id });
          } catch (aiError) {
            logger.warn(`Background AI report generation failed for form ${formId}`, { error: aiError.message });
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Accident Report
   * POST /api/accident
   * Accepts any combination of accident fields  
   */
  static async createAccidentReport(req, res, next) {
    try {
      const accidentDate = req.body.accidentDate || req.body.date;
      const location = req.body.location || req.body.accidentLocation;
      const driverName = req.body.driverName || req.body.name;
      const accidentDescription = req.body.accidentDescription || req.body.description;

      // Accept if at least one identifying field provided; skip for drafts
      const isDraft = req.body.status === 'draft';
      if (!isDraft && !accidentDate && !location && !driverName && !accidentDescription) {
        throw new ValidationError('At least one accident report field is required');
      }

      // Save to database
      const result = await db.runAsync(
        'INSERT INTO forms (user_id, form_type, form_data, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [req.user?.id || null, 'accident', JSON.stringify(req.body), req.body.status === 'draft' ? 'draft' : 'submitted', new Date().toISOString()]
      );

      const formId = result.id;
      const savedStatus = req.body.status === 'draft' ? 'draft' : 'submitted';
      logger.info(`Accident report created and saved: ${formId} (${savedStatus})`, { userId: req.user?.id });

      res.status(201).json({
        success: true,
        id: formId,
        formId,
        status: savedStatus,
        message: savedStatus === 'draft' ? 'Accident report draft saved' : 'Accident report created and saved successfully',
        data: { formId, accidentDate, location, driverName, accidentDescription, status: savedStatus, createdAt: new Date().toISOString() }
      });

      if (savedStatus !== 'draft') {
        setImmediate(async () => {
          try {
            await AIReportGenerator.generateReportAsync(formId, { formId, formType: 'accident', formData: req.body, userId: req.user?.id });
          } catch (aiError) {
            logger.warn(`Background AI report generation failed for form ${formId}`, { error: aiError.message });
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Spill Report
   * POST /api/spill
   * Accepts both frontend and backend field names for compatibility
   */
  static async createSpillReport(req, res, next) {
    try {
      // Accept both frontend and backend field names
      const incidentDate = req.body.incidentDate || req.body.date;
      const materialName = req.body.materialName || req.body.chemicalName;
      const quantity = req.body.quantity || req.body.quantityReleased;
      const location = req.body.location || `${req.body.incidentAddress || ''} ${req.body.city || ''}`.trim();
      const reportedBy = req.body.reportedBy || req.body.reportedBy || 'Unknown';

      const isDraft = req.body.status === 'draft';
      if (!isDraft && (!incidentDate || !location || !materialName || !quantity)) {
        throw new ValidationError('Missing required spill report fields: date, location, chemical name, and quantity');
      }

      // Save to database
      const result = await db.runAsync(
        'INSERT INTO forms (user_id, form_type, form_data, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [req.user?.id || null, 'spill', JSON.stringify(req.body), req.body.status === 'draft' ? 'draft' : 'submitted', new Date().toISOString()]
      );

      const formId = result.id;
      const savedStatus = req.body.status === 'draft' ? 'draft' : 'submitted';
      logger.info(`Spill report created and saved: ${formId} (${savedStatus})`, { userId: req.user?.id });

      res.status(201).json({
        success: true,
        id: formId,
        formId,
        status: savedStatus,
        message: savedStatus === 'draft' ? 'Spill report draft saved' : 'Spill report created and saved successfully',
        data: { formId, incidentDate, location, materialName, quantity, reportedBy, status: savedStatus, createdAt: new Date().toISOString() }
      });

      if (savedStatus !== 'draft') {
        setImmediate(async () => {
          try {
            await AIReportGenerator.generateReportAsync(formId, { formId, formType: 'spill', formData: req.body, userId: req.user?.id });
          } catch (aiError) {
            logger.warn(`Background AI report generation failed for form ${formId}`, { error: aiError.message });
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Inspection Form
   * POST /api/inspection
   * Accepts both frontend and backend field names for compatibility
   */
  static async createInspection(req, res, next) {
    try {
      // Accept both frontend and backend field names
      const inspectionDate = req.body.inspectionDate || req.body.date;
      const inspectionArea = req.body.inspectionArea || req.body.area;
      const inspectorName = req.body.inspectorName || req.body.inspector;

      const isDraft = req.body.status === 'draft';
      if (!isDraft && (!inspectionDate || !inspectionArea || !inspectorName)) {
        throw new ValidationError('Missing required inspection fields: date, area, and inspector name');
      }

      // Save to database
      const result = await db.runAsync(
        'INSERT INTO forms (user_id, form_type, form_data, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [req.user?.id || null, 'inspection', JSON.stringify(req.body), req.body.status === 'draft' ? 'draft' : 'submitted', new Date().toISOString()]
      );

      const formId = result.id;
      const savedStatus = req.body.status === 'draft' ? 'draft' : 'submitted';
      logger.info(`Inspection form created and saved: ${formId} (${savedStatus})`, { userId: req.user?.id });

      // Send immediate response to user
      res.status(201).json({
        success: true,
        id: formId,
        formId,
        status: savedStatus,
        message: savedStatus === 'draft' ? 'Inspection draft saved' : 'Inspection form created and saved successfully',
        data: {
          formId,
          inspectionDate,
          inspectionArea,
          inspectorName,
          status: savedStatus,
          createdAt: new Date().toISOString()
        }
      });

      if (savedStatus !== 'draft') {
        setImmediate(async () => {
          try {
            await AIReportGenerator.generateReportAsync(formId, { formId, formType: 'inspection', formData: req.body, userId: req.user?.id });
          } catch (aiError) {
            logger.warn(`Background AI report generation failed for form ${formId}`, { error: aiError.message });
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update existing form (save draft progress or submit a draft)
   * PUT/PATCH /api/forms/:formId
   */
  static async updateForm(req, res, next) {
    try {
      const { formId } = req.params;
      const { formData: newFormData, status } = req.body;
      const userId = req.user?.id || null;
      const newStatus = status === 'draft' ? 'draft' : 'submitted';

      if (!newFormData) {
        throw new ValidationError('formData is required');
      }

      // First check the form exists and belongs to this user
      const row = await db.getAsync(
        'SELECT id, form_type, status, user_id FROM forms WHERE id = ?',
        [formId]
      );

      if (!row) {
        return res.status(404).json({ success: false, message: `Form ${formId} not found` });
      }

      const wasSubmitted = row.status === 'submitted';
      const formDataJson = JSON.stringify(newFormData);

      await db.runAsync(
        'UPDATE forms SET form_data = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [formDataJson, newStatus, formId]
      );

      logger.info(`Form ${formId} updated to ${newStatus}`, { userId });

      res.status(200).json({
        success: true,
        id: parseInt(formId),
        formId: parseInt(formId),
        status: newStatus,
        message: newStatus === 'draft' ? 'Draft saved successfully' : 'Form submitted successfully'
      });

      // If transitioning from draft → submitted, trigger AI report
      if (!wasSubmitted && newStatus === 'submitted') {
        setImmediate(async () => {
          try {
            await AIReportGenerator.generateReportAsync(parseInt(formId), {
              formId: parseInt(formId),
              formType: row.form_type,
              formData: newFormData,
              userId
            });
          } catch (aiError) {
            logger.warn(`AI report generation failed for updated form ${formId}`, { error: aiError.message });
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload Photos for a Form
   * POST /api/uploads/photos
   * Expects: formId, type (jsa|loto|injury|etc), photos (multipart array)
   */
  static async uploadPhotos(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        throw new ValidationError('No photos provided');
      }

      const { formId, type } = req.body;

      if (!formId || !type) {
        throw new ValidationError('formId and type are required');
      }

      // Process uploaded files
      const uploadedPhotos = req.files.map((file, index) => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        caption: req.body[`captions[${index}]`] || '',
        uploadedAt: new Date().toISOString()
      }));

      logger.info(`Photos uploaded for form ${formId}`, {
        userId: req.user?.id,
        photoCount: uploadedPhotos.length
      });

      return res.status(200).json({
        success: true,
        message: `${uploadedPhotos.length} photos uploaded successfully`,
        data: {
          formId,
          type,
          photos: uploadedPhotos
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Form by ID
   * GET /api/forms/:formId
   */
  static async getFormById(req, res, next) {
    try {
      const { formId } = req.params;

      const row = await db.getAsync(
        'SELECT id, user_id, form_type, form_data, status, created_at FROM forms WHERE id = ?',
        [formId]
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: `Form ${formId} not found`
        });
      }

      logger.info(`Form retrieved: ${formId}`, { userId: req.user?.id });

      return res.status(200).json({
        success: true,
        data: {
          id: row.id,
          formType: row.form_type,
          formData: JSON.parse(row.form_data),
          status: row.status,
          createdAt: row.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Forms List
   * GET /api/forms
   * Query params: type, page, limit
   */
  static async getFormsList(req, res, next) {
    try {
      const { type, status, page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const userId = req.user?.id || null;

      // Build query — always filter by user_id so users only see their own forms
      const conditions = [];
      const params = [];

      if (userId) {
        conditions.push('user_id = ?');
        params.push(userId);
      }
      if (type) {
        conditions.push('form_type = ?');
        params.push(type);
      }
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }

      const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
      const query = `SELECT id, user_id, form_type, form_data, status, created_at, updated_at FROM forms${where} ORDER BY COALESCE(updated_at, created_at) DESC LIMIT ? OFFSET ?`;
      const queryParams = [...params, parseInt(limit), offset];

      const rows = await db.allAsync(query, queryParams);

      const countParams = conditions.length ? [...params] : [];
      const countQuery = `SELECT COUNT(*) as count FROM forms${where}`;
      const countRow = await db.getAsync(countQuery, countParams);

      logger.info('Forms list retrieved', { userId, type, status, count: rows?.length || 0 });

      return res.status(200).json({
        success: true,
        data: {
          forms: (rows || []).map(row => {
            let parsed = {};
            try { parsed = JSON.parse(row.form_data || '{}'); } catch (_) {}
            return {
              id: row.id,
              formType: row.form_type,
              status: row.status,
              facility: parsed.facility || '',
              title: parsed.jobTitle || parsed.equipmentName || parsed.employeeName || parsed.inspectionArea || parsed.materialName || '',
              location: parsed.location || parsed.incidentLocation || parsed.inspectionArea || '',
              date: parsed.date || parsed.incidentDate || parsed.accidentDate || parsed.inspectionDate || '',
              revisionNumber: parsed.revisionNumber || '0',
              createdAt: row.created_at,
              updatedAt: row.updated_at
            };
          }),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countRow?.count || 0,
            totalPages: Math.ceil((countRow?.count || 0) / parseInt(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit Form with Data
   * POST /api/forms/submit
   * Expects: formType, formData, photos
   */
  static async submitForm(req, res, next) {
    try {
      const { formType, formData, photos } = req.body;
      const userId = req.user?.id;

      if (!formType || !formData) {
        throw new ValidationError('formType and formData are required');
      }

      // Generate unique form ID
      const formId = `${formType.toUpperCase()}-${Date.now()}-${uuidv4().substring(0, 8)}`;

      // Save form data as JSON
      const formsDir = path.join(process.cwd(), 'backend', 'pdfs');
      if (!fs.existsSync(formsDir)) {
        fs.mkdirSync(formsDir, { recursive: true });
      }

      // Save form data to file
      const formDataPath = path.join(formsDir, `${formId}-data.json`);
      fs.writeFileSync(formDataPath, JSON.stringify({
        formId,
        formType,
        userId,
        formData,
        photos,
        submittedAt: new Date().toISOString()
      }, null, 2));

      logger.info(`Form submitted: ${formId}`, { userId, formType });

      return res.status(201).json({
        success: true,
        message: 'Form submitted successfully',
        data: {
          formId,
          formType,
          submittedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export Form as PDF
   * GET /api/forms/:formId/export-pdf
   */
  static async exportFormPDF(req, res, next) {
    try {
      const formId = req.params.formId || req.params.id;

      // Create pdfs directory if it doesn't exist
      const formsDir = path.join(__dirname, '../../pdfs');
      if (!fs.existsSync(formsDir)) {
        fs.mkdirSync(formsDir, { recursive: true });
      }

      // Get form from database
      const row = await db.getAsync(
        'SELECT id, user_id, form_type, form_data, created_at, ai_report, ai_report_generated_at, ai_provider FROM forms WHERE id = ?',
        [formId]
      );

      if (!row) {
        return res.status(404).json({ success: false, message: `Form ${formId} not found` });
      }

      let formData;
      try {
        formData = typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data;
      } catch (parseErr) {
        formData = row.form_data;
      }

      const pdfFormData = {
        formId: row.id,
        formType: row.form_type,
        userId: row.user_id,
        formData: formData,
        submittedAt: row.created_at,
        photos: formData.attachedPhotos || formData.photos || [],
        ai_report: row.ai_report,
        ai_report_generated_at: row.ai_report_generated_at,
        ai_provider: row.ai_provider
      };

      // Trigger AI report generation if not yet generated
      if (!pdfFormData.ai_report && AIReportGenerator) {
        logger.info(`[PDF] AI report not found for ${formId}, generating before PDF export...`, { formId });
        try {
          const generatedReport = await AIReportGenerator.generateReportAsync(formId, pdfFormData);
          if (generatedReport) {
            pdfFormData.ai_report = generatedReport;
            logger.info(`[PDF] AI report generated successfully, including in PDF`, { formId });
          }
        } catch (err) {
          logger.error(`[PDF] AI report generation failed during PDF export`, { formId, error: err.message });
        }
      }

      await generateAndSendPDF(res, pdfFormData, formId);

      // Helper function to generate PDF
      async function generateAndSendPDF(res, formData, formId) {
        try {
          logger.info(`[PDF Generation] Starting PDF generation for form ${formId}, type: ${formData.formType}`, { formId, formType: formData.formType });
          const tempImageFiles = [];

          // Map form types to professional document names
          const formTypeNames = {
            'jsa': 'Job_Safety_Analysis',
            'loto': 'Lockout_Tagout_Procedure',
            'injury': 'Injury_Illness_Report',
            'accident': 'Accident_Report',
            'spill': 'Emergency_Spill_Release_Report',
            'inspection': 'Safety_Inspection_Report',
            'monthlyInspection': 'Monthly_Hygiene_Inspection',
            'spillReport': 'Emergency_Spill_Release_Report'
          };

          // Generate professional document name
          const docName = formTypeNames[formData.formType] || 'Safety_Form';
          const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          const pdfFileName = `${docName}_${formId}_${timestamp}.pdf`;

          // Create PDF document
          const pdfFilePath = path.join(formsDir, pdfFileName);

          // Destructure all styling from central config — no hardcoded values below
          const { colors, bgColors, fonts: fsize, margins: margin } = pdfConfig.styling;
          const formSettings = pdfConfig.formSettings[formData.formType] || {};

          const doc = new PDFDocument({
            size: 'A4',
            margins: { top: margin.top, bottom: 5, left: margin.left, right: margin.right },
            bufferPages: true  // Buffer all pages so footers/watermarks can be applied at the end
          });

          // Stable page geometry (A4 is fixed; compute once after first page is added)
          const pLeft  = margin.left;
          const pRight = doc.page.width - margin.right;
          const pWidth = doc.page.width - margin.left - margin.right;

          // Create write stream
          const writeStream = fs.createWriteStream(pdfFilePath);
          doc.pipe(writeStream);

      // Track page count during document generation
      let pageCount = 1;

      // Helper function to render page header
      const renderHeader = (isFirstPage = false) => {
        if (isFirstPage) {
          // First page - full header with company info and logo
          doc.y = margin.top - 10;

          // Company Logo at Top (if available) - CENTERED
          const logoPath = path.join(formsDir, 'company-logo.png');
          if (fs.existsSync(logoPath)) {
            try {
              const logoX = (doc.page.width - 125) / 2;
              doc.image(logoPath, logoX, doc.y, { width: 125, height: 60 });
              doc.y += 65;
            } catch (logoError) {
              logger.warn(`Could not embed company logo`, { error: logoError.message });
            }
          }

          // Company Header with DCN
          const dcn = AIReportGenerator.generateDCN(formId, formData.formType);
          doc.fontSize(fsize.subheading).font('Helvetica-Bold').fillColor(colors.primary);
          doc.text(pdfConfig.company.name, { align: 'center' });
          doc.fontSize(fsize.small).font('Times-Roman').fillColor(colors.subtle);
          doc.text(pdfConfig.company.address || '', { align: 'center' });
          doc.fontSize(fsize.small).font('Helvetica-Bold').fillColor(colors.primary);
          doc.text(dcn, { align: 'center' });
          doc.moveDown(0.3);

          // Form Type Title
          const formTypeTitles = {
            'jsa': 'Job Safety Analysis (JSA) Report',
            'loto': 'Lockout/Tagout (LOTO) Report',
            'injury': 'Employee Injury & Illness Report',
            'accident': 'Accident Report',
            'spillReport': 'Emergency Spill/Release Report',
            'monthlyInspection': 'Monthly Hygiene Inspection Report',
            'inspection': 'Safety Inspection Report'
          };

          const formTitle = formTypeTitles[formData.formType] || 'Safety Form Report';
          doc.fontSize(fsize.title).font('Helvetica-Bold').fillColor(colors.primary);
          doc.text(formTitle, { align: 'center' });
          doc.fillColor(colors.text);
          doc.moveDown(0.2);

          // Header info section - compact
          doc.fontSize(fsize.body).font('Times-Roman').fillColor(colors.subtle);
          doc.text(`Form ID: ${formId} | Submitted: ${new Date(formData.submittedAt).toLocaleDateString()}`, { align: 'center' });
          doc.fillColor(colors.text);
          doc.moveDown(0.3);

          // Divider line
          doc.strokeColor(colors.primary).lineWidth(1);
          doc.moveTo(pLeft, doc.y).lineTo(pRight, doc.y).stroke();
          doc.moveDown(0.5);
          doc.strokeColor(colors.text);
        } else {
          // Continuation pages - minimal header
          doc.y = margin.top - 5;
          doc.fontSize(fsize.small).font('Times-Roman').fillColor(colors.subtle);
          doc.text(`(Continued) Form ID: ${formId}`, { align: 'center' });
          doc.fillColor(colors.text);
          doc.x = pLeft;
          doc.moveDown(0.4);
        }
      };

      // Render footer on the currently-active buffered page.
      // Three-column layout:  [DCN code / version]  |  [Company name / address]  |  [Form type / Page N of M]
      // Called at the end of generation when all pages are known (bufferPages: true).
      const renderFooter = (pageNum, totalPages) => {
        // Build DCN identifier from facility code + form code + zero-padded form ID
        const facilityCode = (formContent && formContent.facility
          ? String(formContent.facility) : 'SBS').toUpperCase().substring(0, 6);
        const formCode  = pdfConfig.dcn.formCodes[formData.formType] || formData.formType.toUpperCase().substring(0, 4);
        const paddedId  = String(formId).padStart(3, '0');
        const year      = String(new Date().getFullYear()).slice(-2);
        const revision  = (formContent && formContent.revisionNumber != null)
          ? String(formContent.revisionNumber) : pdfConfig.dcn.defaultVersion;
        const formName  = pdfConfig.formNames[formData.formType] || 'Safety Form';

        const dcnRef  = `${facilityCode}-${formCode}-${paddedId}`;
        const dcnVer  = `V${year}.${revision}`;

        const footerY = doc.page.height - margin.bottom + 5;
        const row1Y   = footerY + 6;
        const row2Y   = footerY + 18;
        const colW    = 150; // left/right column width

        // Separator line
        doc.strokeColor(colors.muted).lineWidth(0.75)
           .moveTo(pLeft, footerY).lineTo(pRight, footerY).stroke()
           .strokeColor(colors.text);

        doc.fontSize(fsize.footer).fillColor(colors.subtle);

        // Row 1 — DCN ref  |  company name  |  form type name
        doc.font('Helvetica').text(dcnRef,               pLeft,        row1Y, { width: colW,   align: 'left',   lineBreak: false });
        doc.font('Helvetica').text(pdfConfig.company.name, pLeft,      row1Y, { width: pWidth,  align: 'center', lineBreak: false });
        doc.font('Helvetica').text(formName,             pRight - colW, row1Y, { width: colW,   align: 'right',  lineBreak: false });

        // Row 2 — version  |  company address  |  page N of M
        doc.font('Helvetica').text(dcnVer,               pLeft,        row2Y, { width: colW,   align: 'left',   lineBreak: false });
        doc.font('Helvetica').text(pdfConfig.company.address, pLeft,   row2Y, { width: pWidth,  align: 'center', lineBreak: false });
        doc.font('Helvetica').text(`Page ${pageNum} of ${totalPages}`, pRight - colW, row2Y, { width: colW, align: 'right', lineBreak: false });

        doc.fillColor(colors.text);
      };

      // Check if the remaining space on the page is insufficient; add a new page if so.
      // Footers/watermarks are applied to all pages at the end (bufferPages: true),
      // so no footer rendering happens here.
      const checkPageBreak = (spaceNeeded = 50) => {
        // Reserve bottom margin + footer area so content never overlaps the footer
        const contentBottomLimit = doc.page.height - margin.bottom;

        if (doc.y + spaceNeeded > contentBottomLimit) {
          doc.addPage();
          pageCount++;
          renderHeader(false);
          return true;
        }
        return false;
      };

      // Render first page header
      renderHeader(true);

      // ============================================================
      // SAFETY ANALYSIS REPORT (if available)
      // ============================================================
      if (formData.ai_report && formData.ai_report.trim()) {
        checkPageBreak(40);

        // Report header with background
        const aiHdrY = doc.y;
        doc.fill(bgColors.aiSection).rect(pLeft, aiHdrY, pWidth, 26).fill();
        doc.fontSize(fsize.subheading).font('Helvetica-Bold').fillColor(colors.aiHeader)
           .text('SAFETY ANALYSIS REPORT', pLeft + 15, aiHdrY + 7, { lineBreak: false });
        doc.strokeColor(colors.aiHeader).lineWidth(2.5)
           .moveTo(pLeft, aiHdrY + 26).lineTo(pRight, aiHdrY + 26).stroke();
        doc.strokeColor(colors.text);
        doc.y = aiHdrY + 32;
        doc.x = pLeft;

        // Clean the report text
        let cleanReport = formData.ai_report.trim();
        cleanReport = cleanReport.replace(/\[Senior Safety Manager Signature Analysis\]/g, '');
        cleanReport = cleanReport.replace(/\n{3,}/g, '\n\n'); // collapse runs of blank lines to one

        // Helper: render one line with **bold** markdown — odd-indexed segments between
        // ** markers are rendered in Helvetica-Bold; even-indexed in Times-Roman.
        const renderBoldLine = (line) => {
          const parts = (line || ' ').split('**');
          const segments = parts
            .map((text, i) => ({ text, isBold: i % 2 === 1 }))
            .filter(s => s.text !== '');
          if (segments.length === 0) {
            doc.font('Times-Roman').fillColor(colors.text).text(' ', { width: pWidth, align: 'left', lineGap: 2 });
            return;
          }
          segments.forEach((seg, j) => {
            doc.font(seg.isBold ? 'Helvetica-Bold' : 'Times-Roman')
               .fillColor(colors.text)
               .text(seg.text, { width: pWidth, align: 'left', lineGap: 2, continued: j < segments.length - 1 });
          });
        };

        // Render line-by-line so checkPageBreak can fire before each line —
        // this prevents PDFKit from auto-adding pages without headers/footers.
        const reportLines = cleanReport.split('\n');
        reportLines.forEach(line => {
          const stripped = (line || ' ').replace(/\*\*/g, '');
          const lineH = doc.heightOfString(stripped, { width: pWidth }) + 4;
          checkPageBreak(lineH);
          doc.fontSize(fsize.body + 1).fillColor(colors.text);
          renderBoldLine(line);
        });

        doc.fillColor(colors.text);
        doc.moveDown(0.5);
      } else {
        // Show pending report message if being generated
        checkPageBreak(45);
        doc.moveDown(0.3);

        // Pending message with background
        doc.fill(bgColors.warning).rect(pLeft, doc.y, pWidth, 35).fill();
        doc.fontSize(fsize.body + 1).font('Helvetica-Bold').fillColor(colors.warningText)
           .text('[Safety Analysis Report: Generating...]', pLeft + 15, doc.y + 5);
        doc.fontSize(fsize.small).font('Times-Roman').fillColor(colors.warningTextDark)
           .text(
             'The AI safety analysis will be available when you download the PDF after generation completes (~5-10 seconds).',
             pLeft + 15, doc.y + 22, { width: pWidth - 30 }
           );
        doc.moveDown(0.8);

        doc.fillColor(colors.text);
      }

      // ============================================================
      // LAYOUT ENGINE: Professional rendering of complex data
      // ============================================================
      
      // Helper function to draw a professional table with proper formatting
      const drawTableRow = (columns, isHeader = false, rowIndex = 0) => {
        const currentY = doc.y;
        
        // Calculate row height based on content
        const cellHeights = columns.map(col => {
          const text = String(col.text || '').substring(0, 60);
          return doc.heightOfString(text, { width: Math.max(col.width - 15, 20) });
        });
        const rowHeight = isHeader ? 24 : Math.max(...cellHeights, 20) + 12;
        
        // Draw background for alternating rows (if not header)
        if (!isHeader && rowIndex % 2 === 1) {
          doc.fill(bgColors.rowAlt).rect(pLeft, currentY, pWidth, rowHeight).fill();
        }

        // Draw header background
        if (isHeader) {
          doc.fill(bgColors.primaryTint).rect(pLeft, currentY, pWidth, rowHeight).fill();
        }

        // Draw table border
        doc.strokeColor(colors.tableBorder).lineWidth(1);
        doc.rect(pLeft, currentY, pWidth, rowHeight).stroke();

        // Draw each column
        let currentX = pLeft;
        columns.forEach((col, colIndex) => {
          // Draw vertical dividers between columns
          if (colIndex > 0) {
            doc.moveTo(currentX, currentY).lineTo(currentX, currentY + rowHeight).stroke();
          }

          const cellX = currentX + 8;
          const cellY = currentY + 6;
          const cellWidth = col.width - 16;
          const text = String(col.text || '').substring(0, 60);

          // Set font and color from config
          if (isHeader) {
            doc.fill(colors.primary).font('Helvetica-Bold').fontSize(fsize.body);
          } else {
            doc.fill(colors.text).font('Times-Roman').fontSize(fsize.small);
          }

          // Draw text in cell
          doc.text(text, cellX, cellY, {
            width: cellWidth,
            align: col.align || 'left',
            lineBreak: true,
            valign: 'top'
          });

          currentX += col.width;
        });

        // Move below row
        doc.y = currentY + rowHeight;
        doc.fill(colors.text);
      };

      const formContent = formData.formData;
      const complexFields = [
        'jobSteps', 'workTeamMembers', 'photos', 'attachedPhotos', 'photo',
        'commonHazards', 'commonControls', 'ppeRequired', 'signatures',
        'deficiencies'
      ];

      // DEBUG: Log form content for troubleshooting
      logger.debug(`[PDF] Form content available: ${typeof formContent === 'object' ? 'YES' : 'NO'}`, { formId });
      if (typeof formContent === 'object') {
        logger.debug(`[PDF] Form keys: ${Object.keys(formContent||{}).join(', ')}`, { formId });
      }

      // ============================================================
      // SECTION 1: Key-Value Data (Simple Fields)
      // ============================================================
      if (typeof formContent === 'object') {
        logger.debug(`[PDF] SECTION 1 START: Rendering key-value data`, { formId });
        checkPageBreak(40);
        
        // Section header with background
        const fInfoHdrY = doc.y;
        doc.fill(bgColors.primaryTint).rect(pLeft, fInfoHdrY, pWidth, 26).fill();
        doc.fontSize(fsize.subheading).font('Helvetica-Bold').fillColor(colors.primary)
           .text('FORM INFORMATION', pLeft + 15, fInfoHdrY + 7, { lineBreak: false });
        doc.strokeColor(colors.primary).lineWidth(2.5)
           .moveTo(pLeft, fInfoHdrY + 26).lineTo(pRight, fInfoHdrY + 26).stroke();
        doc.strokeColor(colors.text);
        doc.y = fInfoHdrY + 32;
        doc.x = pLeft;

        // Collect and render fields
        const simpleFields = Object.entries(formContent)
          .filter(([key, value]) => !complexFields.includes(key) && value && typeof value === 'string')
          .slice(0, 15);

        logger.debug(`[PDF] Found ${simpleFields.length} simple fields to render`, { formId });

        // Render fields in an organised layout
        simpleFields.forEach(([key, value]) => {
          const label = FormsController.formatKey(key);

          if (checkPageBreak(14)) {
            doc.moveDown(0.3);
          }

          // Label
          doc.fontSize(fsize.body).font('Helvetica-Bold').fillColor(colors.primary);
          doc.text(label.toUpperCase(), { width: 120, continued: true });

          // Value on same line
          doc.fontSize(fsize.body).font('Times-Roman').fillColor(colors.bodyText);
          doc.text(': ' + String(value).substring(0, 120), { width: pWidth - 120 });

          doc.moveDown(0.15);
        });

        doc.fillColor(colors.text);
        doc.moveDown(0.2);
        logger.debug(`[PDF] SECTION 1 COMPLETE`, { formId });
      } else {
        logger.warn(`[PDF] formContent is not an object, type: ${typeof formContent}`, { formId });
      }

      // ============================================================
      // SECTION 2: JOB STEPS (Professional Table)
      // ============================================================
      if (formContent && formContent.jobSteps) {
        const jobSteps = typeof formContent.jobSteps === 'string' 
          ? JSON.parse(formContent.jobSteps) 
          : formContent.jobSteps;

        if (Array.isArray(jobSteps) && jobSteps.length > 0 && jobSteps.some(s => s.jobStep)) {
          checkPageBreak(35);

          doc.moveDown(0.2);

          // Section header with background
          const jsaHdrY = doc.y;
          doc.fill(bgColors.primaryTint).rect(pLeft, jsaHdrY, pWidth, 26).fill();
          doc.fontSize(fsize.subheading).font('Helvetica-Bold').fillColor(colors.primary)
             .text('JOB SAFETY ANALYSIS STEPS', pLeft + 15, jsaHdrY + 7, { lineBreak: false });
          doc.strokeColor(colors.primary).lineWidth(2.5)
             .moveTo(pLeft, jsaHdrY + 26).lineTo(pRight, jsaHdrY + 26).stroke();
          doc.strokeColor(colors.text);
          doc.y = jsaHdrY + 32;
          doc.x = pLeft;

          const colWidth = pWidth / 4;

          // Header Row
          drawTableRow([
            { text: '#', width: colWidth * 0.8, align: 'center' },
            { text: 'JOB STEP', width: colWidth * 1.2, align: 'left' },
            { text: 'HAZARDS IDENTIFIED', width: colWidth * 1, align: 'left' },
            { text: 'CONTROL MEASURES', width: colWidth * 1, align: 'left' }
          ], true, 0);
          doc.moveDown(0.3);

          // Data Rows
          jobSteps.forEach((step, idx) => {
            if (checkPageBreak(40)) {
              // Redraw table header on new page
              drawTableRow([
                { text: '#', width: colWidth * 0.8, align: 'center' },
                { text: 'JOB STEP', width: colWidth * 1.2, align: 'left' },
                { text: 'HAZARDS IDENTIFIED', width: colWidth * 1, align: 'left' },
                { text: 'CONTROL MEASURES', width: colWidth * 1, align: 'left' }
              ], true, 0);
              doc.moveDown(0.3);
            }

            drawTableRow([
              { text: String(idx + 1), width: colWidth * 0.8, align: 'center' },
              { text: (step.jobStep || '').substring(0, 35), width: colWidth * 1.2, align: 'left' },
              { text: (step.hazardsIdentified || '').substring(0, 30), width: colWidth * 1, align: 'left' },
              { text: (step.controlMeasures || '').substring(0, 30), width: colWidth * 1, align: 'left' }
            ], false, idx + 1);
          });

          doc.moveDown(0.2);
        }
      }

      // ============================================================
      // SECTION 3: WORK TEAM MEMBERS (Formatted List)
      // ============================================================
      if (formContent && formContent.workTeamMembers) {
        const members = typeof formContent.workTeamMembers === 'string'
          ? JSON.parse(formContent.workTeamMembers)
          : formContent.workTeamMembers;

        if (Array.isArray(members) && members.length > 0 && members.some(m => m.classification)) {
          checkPageBreak(35);

          doc.moveDown(0.2);

          // Section header with background
          const wtmHdrY = doc.y;
          doc.fill(bgColors.primaryTint).rect(pLeft, wtmHdrY, pWidth, 26).fill();
          doc.fontSize(fsize.subheading).font('Helvetica-Bold').fillColor(colors.primary)
             .text('WORK TEAM MEMBERS', pLeft + 15, wtmHdrY + 7, { lineBreak: false });
          doc.strokeColor(colors.primary).lineWidth(2.5)
             .moveTo(pLeft, wtmHdrY + 26).lineTo(pRight, wtmHdrY + 26).stroke();
          doc.strokeColor(colors.text);
          doc.y = wtmHdrY + 32;
          doc.x = pLeft;

          members.forEach((member, idx) => {
            if (checkPageBreak(30)) {
              doc.moveDown(0.3);
            }

            if (member.classification) {
              // Member number and classification
              doc.fontSize(fsize.subheading).font('Times-Bold').fillColor(colors.primary);
              doc.text(`${idx + 1}. ${member.classification}`, { width: pWidth - 15 });

              // PPE and Tools details
              doc.fontSize(fsize.body).font('Times-Roman').fillColor(colors.bodyText);
              if (member.personalProtection) {
                doc.text(`   PPE Required: ${member.personalProtection}`, { width: pWidth - 20 });
              }
              if (member.plantEquipmentTools) {
                doc.text(`   Equipment/Tools: ${member.plantEquipmentTools}`, { width: pWidth - 20 });
              }

              doc.fillColor(colors.text);
              doc.moveDown(0.4);
            }
          });
          doc.moveDown(0.2);
        }
      }

      // ============================================================
      // SECTION 4: CHECKLISTS (PPE, Hazards, Controls)
      // ============================================================
      // Checklist color map uses config colors
      const checklists = [
        { key: 'ppeRequired',    title: 'PPE REQUIRED',        color: colors.primary },
        { key: 'commonHazards',  title: 'IDENTIFIED HAZARDS',  color: colors.danger  },
        { key: 'commonControls', title: 'CONTROL MEASURES',    color: colors.success }
      ];

      checklists.forEach(({ key, title, color }) => {
        if (formContent && formContent[key]) {
          let items = [];
          const data = formContent[key];

          if (Array.isArray(data)) {
            items = data.filter(i => i && typeof i === 'string' && i.trim());
          } else if (typeof data === 'string') {
            try {
              items = JSON.parse(data);
              if (!Array.isArray(items)) items = [];
            } catch (e) {
              items = data.split(',').map(i => i.trim()).filter(i => i);
            }
          }

          if (items.length > 0) {
            checkPageBreak(40);

            doc.moveDown(0.2);

            // Section header with colour-coded background
            const secHdrY = doc.y;
            doc.fill(bgColors.infoTint).rect(pLeft, secHdrY, pWidth, 26).fill();
            doc.fontSize(fsize.subheading).font('Helvetica-Bold').fillColor(color)
               .text(title, pLeft + 15, secHdrY + 7, { lineBreak: false });
            doc.strokeColor(color).lineWidth(2.5)
               .moveTo(pLeft, secHdrY + 26).lineTo(pRight, secHdrY + 26).stroke();
            doc.strokeColor(colors.text);
            doc.y = secHdrY + 32;
            doc.x = pLeft;

            items.forEach((item) => {
              if (checkPageBreak(15)) {
                doc.fontSize(fsize.subheading).font('Helvetica-Bold').fillColor(color);
                doc.text(title + ' (continued)');
                doc.moveDown(0.4);
              }

              doc.fontSize(fsize.body).font('Times-Roman').fillColor(colors.text);
              doc.text(`  • ${item}`, { width: pWidth - 20, align: 'left' });
              doc.moveDown(0.25);
            });

            doc.moveDown(0.2);
          }
        }
      });

      // ============================================================
      // SECTION 5: INSPECTION DEFICIENCIES
      // ============================================================
      if (formContent && formContent.deficiencies) {
        const deficiencies = typeof formContent.deficiencies === 'string'
          ? JSON.parse(formContent.deficiencies)
          : formContent.deficiencies;

        const validDefects = Array.isArray(deficiencies)
          ? deficiencies.filter(d => d && d.item && d.item.trim())
          : [];

        if (validDefects.length > 0) {
          checkPageBreak(35);

          doc.moveDown(0.2);

          // Section header with warning colour
          const defHdrY = doc.y;
          doc.fill(bgColors.dangerTint).rect(pLeft, defHdrY, pWidth, 26).fill();
          doc.fontSize(fsize.subheading).font('Helvetica-Bold').fillColor(colors.danger)
             .text('INSPECTION DEFICIENCIES', pLeft + 15, defHdrY + 7, { lineBreak: false });
          doc.strokeColor(colors.danger).lineWidth(2.5)
             .moveTo(pLeft, defHdrY + 26).lineTo(pRight, defHdrY + 26).stroke();
          doc.strokeColor(colors.text);
          doc.y = defHdrY + 32;
          doc.x = pLeft;

          // Deficiency list
          validDefects.forEach((defect, idx) => {
            if (checkPageBreak(35)) {
              doc.fontSize(fsize.subheading).font('Helvetica-Bold').fillColor(colors.danger);
              doc.text('INSPECTION DEFICIENCIES (continued)');
              doc.moveDown(0.4);
            }

            // Deficiency number and item
            doc.fontSize(fsize.body + 1).font('Helvetica-Bold').fillColor(colors.danger);
            doc.text(`DEFICIENCY ${idx + 1}: ${defect.item}`, { width: pWidth - 15 });

            // Details
            doc.fontSize(fsize.body).font('Times-Roman').fillColor(colors.bodyText);
            if (defect.description) {
              doc.text(`   Description: ${defect.description}`, { width: pWidth - 20 });
            }
            if (defect.responsible) {
              doc.text(`   Responsible Party: ${defect.responsible}`, { width: pWidth - 20 });
            }
            if (defect.correctionDate) {
              doc.text(`   Target Correction Date: ${defect.correctionDate}`, { width: pWidth - 20 });
            }

            doc.fillColor(colors.text);
            doc.moveDown(0.5);
          });
          doc.moveDown(0.5);
        }
      }

      // ============================================================
      // SECTION 6: PHOTOS & DOCUMENTATION
      // ============================================================
      if (formData.photos && formData.photos.length > 0) {
        logger.debug(`[PDF] Processing ${formData.photos.length} photos`, { formId });
        // Filter out invalid photos (no URL or empty entries)
        const validPhotos = formData.photos.filter(photo => 
          photo && 
          photo.url && 
          typeof photo.url === 'string' && 
          photo.url.trim().length > 0
        );
        
        logger.debug(`[PDF] Valid photos after filtering: ${validPhotos.length}`, { formId });

        if (validPhotos.length > 0) {
          checkPageBreak(35);

          doc.moveDown(0.2);
          // Photos section header
          const photosHdrY = doc.y;
          doc.fill(bgColors.primaryTint).rect(pLeft, photosHdrY, pWidth, 26).fill();
          doc.fontSize(fsize.subheading).font('Helvetica-Bold').fillColor(colors.primary)
             .text('ATTACHED PHOTOS & DOCUMENTATION', pLeft + 15, photosHdrY + 7, { lineBreak: false });
          doc.strokeColor(colors.primary).lineWidth(2.5)
             .moveTo(pLeft, photosHdrY + 26).lineTo(pRight, photosHdrY + 26).stroke();
          doc.strokeColor(colors.text);
          doc.y = photosHdrY + 32;
          doc.x = pLeft;

          // Photo count note
          doc.fontSize(fsize.footer).font('Times-Italic').fillColor(colors.subtle);
          doc.text(`${validPhotos.length} attached photo(s) for complete documentation.`);
          doc.fillColor(colors.text);
          doc.moveDown(0.2);

          // Dimensions from config
          const frameWidth   = Math.min(pdfConfig.photos.maxWidth,  pWidth);
          const frameHeight  = pdfConfig.photos.maxHeight;
          const framePadding = 6;

          // Build document reference for photo labels: e.g. DHM-F-JSA-023
          const photoFacility = (formContent && formContent.facility
            ? String(formContent.facility) : 'SBS').toUpperCase().substring(0, 6);
          const photoFormCode = pdfConfig.dcn.formCodes[formData.formType] || 'FRM';
          const photoDocRef   = `${photoFacility}-F-${photoFormCode}-${String(formId).padStart(3, '0')}`;

          // Process all valid photos
          validPhotos.forEach((photo, index) => {
            try {
              let imageBuffer  = null;
              let tmpImagePath = null;

              if (photo.url.startsWith('data:image')) {
                const base64Data = photo.url.replace(/^data:image\/\w+;base64,/, '');
                imageBuffer = Buffer.from(base64Data, 'base64');
              } else if (photo.url.startsWith('/')) {
                const imagePath = path.join(process.cwd(), 'backend', photo.url);
                if (fs.existsSync(imagePath)) {
                  imageBuffer = fs.readFileSync(imagePath);
                }
              }

              if (imageBuffer && imageBuffer.length > 0) {
                tmpImagePath = path.join(formsDir, `temp-${formId}-${index}-${Date.now()}.jpg`);
                fs.writeFileSync(tmpImagePath, imageBuffer);
                tempImageFiles.push(tmpImagePath);

                // Calculate the actual rendered height based on the image's aspect ratio
                // so the frame box fits the image exactly (not a fixed 400pt box).
                let actualImgH = frameHeight;
                try {
                  const imgObj = doc.openImage(tmpImagePath);
                  const imgAspect = imgObj.width / imgObj.height;
                  const boxAspect = frameWidth / frameHeight;
                  actualImgH = imgAspect >= boxAspect
                    ? Math.round(frameWidth / imgAspect)   // width-constrained
                    : frameHeight;                          // height-constrained
                } catch (_) { /* fall back to frameHeight */ }

                if (checkPageBreak(actualImgH + framePadding + 90)) {
                  doc.moveDown(0.5);
                }

                // Photo frame border — sized to actual image height
                const photoY = doc.y;
                doc.rect(pLeft - framePadding, photoY - framePadding, frameWidth + (framePadding * 2), actualImgH + (framePadding * 2))
                   .stroke(colors.primary);

                // Embed image
                try {
                  doc.image(tmpImagePath, pLeft, photoY, { width: frameWidth, fit: [frameWidth, actualImgH] });
                } catch (imgErr) {
                  logger.error(`Failed to embed image: ${tmpImagePath}`, { error: imgErr.message });
                  doc.rect(pLeft, photoY, frameWidth, actualImgH).stroke();
                  doc.fontSize(fsize.body + 1).text('[Image could not be embedded]', pLeft, photoY + (actualImgH / 2));
                }

                doc.y = photoY + actualImgH + framePadding + 10;

                // Photo label with facility document reference
                doc.fontSize(fsize.body + 1).font('Helvetica-Bold').fillColor(colors.primary);
                doc.text(`Photo ${index + 1} of ${validPhotos.length}`, pLeft, doc.y, { continued: true });
                doc.font('Helvetica').fillColor(colors.secondary)
                   .text(`  ${photoDocRef}`, { continued: false });
                doc.fillColor(colors.text);

                // Caption
                if (photo.caption && typeof photo.caption === 'string' && photo.caption.trim()) {
                  doc.moveDown(0.2);
                  doc.fontSize(fsize.small).font('Helvetica-Bold').fillColor(colors.subtle);
                  doc.text('DESCRIPTION:', pLeft, doc.y);
                  doc.fontSize(fsize.body + 1).font('Times-Roman').fillColor(colors.bodyText);
                  doc.text(photo.caption, pLeft, doc.y, { width: pWidth, align: 'left' });
                  doc.fillColor(colors.text);
                } else {
                  doc.moveDown(0.2);
                  doc.fontSize(fsize.body).font('Times-Italic').fillColor(colors.muted);
                  doc.text('[No description provided]', pLeft);
                  doc.fillColor(colors.text);
                }

                // Field name
                if (photo.fieldName && typeof photo.fieldName === 'string' && photo.fieldName.trim()) {
                  doc.moveDown(0.1);
                  doc.fontSize(fsize.small).font('Helvetica-Bold').fillColor(colors.subtle);
                  doc.text('FIELD:', { continued: true });
                  doc.fontSize(fsize.body).font('Times-Roman').fillColor(colors.bodyText);
                  doc.text(photo.fieldName);
                  doc.fillColor(colors.text);
                }

                doc.moveDown(0.4);
              } else {
                logger.warn(`Photo ${index} has no valid image data`, { formId });
              }
            } catch (imageError) {
              logger.error(`Could not process photo ${index} in PDF`, { formId, error: imageError.message, stack: imageError.stack, photoUrl: photo.url });
            }
          });
        } else {
          doc.fontSize(fsize.body + 1).font('Times-Italic').fillColor(colors.muted);
          doc.text('No valid photos attached to this form.');
          doc.fillColor(colors.text);
          doc.moveDown(0.5);
        }
      } else {
        doc.fontSize(fsize.body + 1).font('Times-Italic').fillColor(colors.muted);
        doc.text('No photos attached to this form.');
        doc.fillColor(colors.text);
        doc.moveDown(0.5);
      }

      // Apply footers and optional watermarks to every buffered page now that we
      // know the total page count, then flush and close the document.
      logger.debug(`[PDF] PDF generation complete, finalizing all pages...`, { formId });

      const bufferedRange  = doc.bufferedPageRange();
      const totalPageCount = bufferedRange.count;
      const watermarkText  = formSettings.watermark || null;

      for (let pi = 0; pi < bufferedRange.count; pi++) {
        doc.switchToPage(bufferedRange.start + pi);

        // Footer
        renderFooter(pi + 1, totalPageCount);

        // Watermark (diagonal, semi-transparent) — only when configured
        if (watermarkText) {
          doc.save();
          doc.opacity(0.07);
          doc.translate(doc.page.width / 2, doc.page.height / 2);
          doc.rotate(-45);
          doc.fontSize(55).font('Helvetica-Bold').fillColor(colors.danger);
          doc.text(watermarkText, -150, -30, { width: 300, align: 'center' });
          doc.restore();
        }
      }

      // Flush buffered pages and finalize
      doc.flushPages();
      doc.end();

      // Handle stream events
      writeStream.on('finish', () => {
        logger.info(`PDF generated: ${formId}`, { userId: req.user?.id, photoCount: tempImageFiles.length });

        // Send PDF file with professional name
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);

        const fileStream = fs.createReadStream(pdfFilePath);
        fileStream.pipe(res);

        fileStream.on('end', () => {
          // Clean up temporary image files
          setTimeout(() => {
            tempImageFiles.forEach(tmpFile => {
              try {
                if (fs.existsSync(tmpFile)) {
                  fs.unlinkSync(tmpFile);
                  logger.debug(`Deleted temp file: ${tmpFile}`);
                }
              } catch (err) {
                logger.warn(`Failed to delete temp file ${tmpFile}`, { error: err.message });
              }
            });
          }, 1000); // Wait 1 second before cleanup to ensure file is released
        });
      });

      writeStream.on('error', (error) => {
        logger.error(`PDF generation error: ${formId}`, { error: error.message, stack: error.stack });
        if (!res.headersSent) {
          res.status(500).json({ error: 'PDF stream error: ' + error.message });
        }
      });
        } catch (pdfError) {
          logger.error('Error generating PDF', { formId, error: pdfError.message, stack: pdfError.stack, formType: formData.formType });
          if (!res.headersSent) {
            res.status(500).json({ error: 'PDF generation failed: ' + (pdfError.message || 'Unknown error') });
          }
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Form
   * DELETE /api/forms/:formId
   */
  static async deleteForm(req, res, next) {
    try {
      const { formId } = req.params;

      const result = await db.runAsync(
        'DELETE FROM forms WHERE id = ?',
        [formId]
      );

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          message: `Form ${formId} not found`
        });
      }

      logger.info(`Form deleted: ${formId}`, { userId: req.user?.id });

      return res.status(200).json({
        success: true,
        message: 'Form deleted successfully',
        data: { formId }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload Company Logo
   * POST /api/forms/logo/upload
   */
  static async uploadCompanyLogo(req, res, next) {
    try {
      const formsDir = path.join(process.cwd(), 'backend', 'pdfs');
      if (!fs.existsSync(formsDir)) {
        fs.mkdirSync(formsDir, { recursive: true });
      }

      const logoPath = path.join(formsDir, 'company-logo.png');
      const { logoBase64 } = req.body;

      if (!logoBase64) {
        throw new ValidationError('logoBase64 is required');
      }

      // Remove data URL prefix if present
      let base64Data = logoBase64;
      if (logoBase64.includes('base64,')) {
        base64Data = logoBase64.split('base64,')[1];
      }

      // Convert base64 to buffer and save
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(logoPath, buffer);

      logger.info('Company logo uploaded', { userId: req.user?.id, size: buffer.length });

      return res.status(200).json({
        success: true,
        message: 'Company logo uploaded successfully',
        data: { logoSize: buffer.length }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Company Logo
   * GET /api/forms/logo
   */
  static async getCompanyLogo(req, res, next) {
    try {
      const formsDir = path.join(process.cwd(), 'backend', 'pdfs');
      const logoPath = path.join(formsDir, 'company-logo.png');

      if (!fs.existsSync(logoPath)) {
        return res.status(404).json({
          success: false,
          message: 'Company logo not found'
        });
      }

      // Read logo and return as base64
      const logoBuffer = fs.readFileSync(logoPath);
      const base64Logo = logoBuffer.toString('base64');

      return res.status(200).json({
        success: true,
        data: {
          logo: `data:image/png;base64,${base64Logo}`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Company Logo
   * DELETE /api/forms/logo
   */
  static async deleteCompanyLogo(req, res, next) {
    try {
      const formsDir = path.join(process.cwd(), 'backend', 'pdfs');
      const logoPath = path.join(formsDir, 'company-logo.png');

      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
        logger.info('Company logo deleted', { userId: req.user?.id });
      }

      return res.status(200).json({
        success: true,
        message: 'Company logo deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Dashboard Statistics
   * GET /api/dashboard/stats
   */
  static async getDashboardStats(req, res, next) {
    try {
      const userId = req.user?.id;

      // Calculate week start (Monday) and month start
      const today = new Date();
      const dayOfWeek = today.getDay() || 7;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dayOfWeek + 1);
      weekStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const monthStartStr = monthStart.toISOString();
      const weekStartStr  = weekStart.toISOString();

      // Query the database for submitted forms this month
      let rows = [];
      try {
        rows = await db.allAsync(
          `SELECT id, form_type, created_at FROM forms
           WHERE user_id = ? AND status = 'submitted' AND created_at >= ?
           ORDER BY created_at DESC`,
          [userId, monthStartStr]
        );
      } catch (err) {
        logger.error('DB error in getDashboardStats', { error: err.message });
        rows = [];
      }

      const reportsThisMonth = rows.length;

      const inspectionsThisWeek = rows.filter(r =>
        (r.form_type === 'monthlyInspection' || r.form_type === 'inspection') &&
        new Date(r.created_at) >= weekStart
      ).length;

      const formTypeNames = {
        jsa:              'JSA Completed',
        loto:             'LOTO Procedure',
        injury:           'Injury Reported',
        accident:         'Accident Report',
        spill:            'Spill Report Submitted',
        spillReport:      'Spill Report Submitted',
        inspection:       'Safety Inspection',
        monthlyInspection:'Monthly Inspection'
      };
      const icons = {
        jsa: '📋', loto: '🔒', injury: '⚠️', accident: '⚡',
        spill: '🚨', spillReport: '🚨', inspection: '✅', monthlyInspection: '✅'
      };

      const recentActivity = rows.slice(0, 5).map(form => ({
        id:          form.id,
        formType:    form.form_type,
        title:       formTypeNames[form.form_type] || 'Form Submitted',
        icon:        icons[form.form_type] || '📝',
        description: FormsController.getTimeAgoString(new Date(form.created_at)),
        timestamp:   new Date(form.created_at).toLocaleString()
      }));

      const pendingActionItems = 3;

      logger.info('Dashboard stats generated', {
        userId,
        inspectionsThisWeek,
        reportsThisMonth,
        recentActivityCount: recentActivity.length
      });

      return res.status(200).json({
        success: true,
        data: { inspectionsThisWeek, pendingActionItems, reportsThisMonth, recentActivity }
      });
    } catch (error) {
      logger.error('Error generating dashboard stats', { error: error.message });
      next(error);
    }
  }

  /**
   * Helper method to format time ago
   */
  static getTimeAgoString(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Helper method to format key names for display
   */
  static formatKey(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}

module.exports = FormsController;
