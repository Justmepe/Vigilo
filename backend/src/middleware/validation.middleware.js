/**
 * Comprehensive Validation Middleware
 */

const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Middleware to check validation results and throw errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach(err => {
      formattedErrors[err.param] = err.msg;
    });
    throw new ValidationError('Validation failed', formattedErrors);
  }
  next();
};

/**
 * Custom validators
 */
const validators = {
  // Authentication validators
  loginValidator: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    handleValidationErrors
  ],

  registerValidator: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('full_name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('job_title')
      .optional()
      .trim()
      .isLength({ max: 100 }),
    body('facility')
      .optional()
      .trim()
      .isLength({ max: 100 }),
    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 }),
    handleValidationErrors
  ],

  // Form validators
  jsaValidator: [
    body('facility')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Facility is required'),
    body('department')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Department is required'),
    body('job_title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Job title is required'),
    body('hazards')
      .isArray({ min: 1 })
      .withMessage('At least one hazard must be identified'),
    handleValidationErrors
  ],

  injuryValidator: [
    body('incident_date')
      .isISO8601()
      .withMessage('Invalid incident date format'),
    body('employee_name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Employee name is required'),
    body('injury_type')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Injury type is required'),
    body('body_part_affected')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Body part affected is required'),
    handleValidationErrors
  ],

  lotoValidator: [
    body('equipment_id')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Equipment ID is required'),
    body('work_description')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Work description must be between 10 and 500 characters'),
    body('authorized_by')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Authorized by is required'),
    handleValidationErrors
  ],

  // General validators
  idValidator: [
    body('id')
      .isInt({ min: 1 })
      .withMessage('Invalid ID format'),
    handleValidationErrors
  ],

  paginationValidator: [
    body('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    body('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  validators
};
