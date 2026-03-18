/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');
const {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  ConflictError,
  NotFoundError,
  DatabaseError
} = require('../utils/errors');

/**
 * Register a new user
 */
/**
 * Map a job role (what user selects) to the system access role
 */
function mapJobRoleToSystemRole(jobRole) {
  const adminRoles = ['Safety Manager', 'Plant Manager', 'EHS Manager'];
  const supervisorRoles = ['Safety Coordinator', 'Production Supervisor'];
  if (adminRoles.includes(jobRole)) return 'Admin';
  if (supervisorRoles.includes(jobRole)) return 'Supervisor';
  return 'User';
}

exports.register = async (req, res, next) => {
  try {
    const {
      username, email, password, full_name,
      job_role, facility, department,
      company_name, company_industry, site_location, job_title,
    } = req.body;

    logger.info('Registration attempt', { username, email, job_role, company_name });

    if (!username || !email || !password || !full_name) {
      throw new ValidationError('username, email, password, and full_name are required');
    }
    if (!company_name) {
      throw new ValidationError('company_name is required');
    }
    if (!company_industry) {
      throw new ValidationError('company_industry is required');
    }

    // Check if user already exists
    const existingUser = await db.getAsync(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      throw new ConflictError('Username or email already registered');
    }

    // Check if company contact email is already registered (one company per email)
    const existingCompany = await db.getAsync(
      'SELECT id FROM companies WHERE contact_email = ?',
      [email]
    );
    if (existingCompany) {
      throw new ConflictError('A company account is already registered with this email');
    }

    // Create company — the first registrant always creates a new company
    const companyResult = await db.runAsync(
      `INSERT INTO companies (name, industry, site_location, contact_email) VALUES (?, ?, ?, ?)`,
      [company_name, company_industry || 'General', site_location || '', email]
    );
    const company_id = companyResult.id;

    logger.info('Company created', { company_id, company_name, company_industry });

    // First registrant for a company is always SuperAdmin
    const systemRole = 'SuperAdmin';

    // The job_title field takes the dedicated job_title param; fall back to job_role for
    // backwards compatibility with older clients that don't send job_title separately.
    const resolvedJobTitle = job_title || job_role || null;

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user with company_id and SuperAdmin role
    await db.runAsync(
      `INSERT INTO users (username, email, password_hash, full_name, job_title, facility, department, role, company_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, full_name, resolvedJobTitle, facility || site_location || null, department || null, systemRole, company_id, 1]
    );

    const newUser = await db.getAsync('SELECT id, username, role, company_id FROM users WHERE username = ?', [username]);
    logger.info('User registered successfully', { userId: newUser.id, username, systemRole, company_id });

    // Generate token — include company_id so middleware can scope queries
    const token = jwt.sign(
      { id: newUser.id, username, role: systemRole, company_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser.id,
      token,
      user: {
        id: newUser.id,
        username,
        email,
        full_name,
        job_title: resolvedJobTitle,
        role: systemRole,
        company_id,
        facility: facility || site_location || null,
      },
      company: {
        id: company_id,
        name: company_name,
        industry: company_industry,
        site_location: site_location || '',
      },
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, username: req.body.username });
    next(error);
  }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Get user (include company_id so it is embedded in the JWT)
    const user = await db.getAsync(
      'SELECT id, username, email, full_name, password_hash, role, job_title, facility, department, is_active, company_id FROM users WHERE username = ?',
      [username]
    );

    if (!user || !user.is_active) {
      throw new AuthenticationError('Invalid username or password');
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      logger.warn('Failed login attempt', { username, ip: req.ip });
      throw new AuthenticationError('Invalid username or password');
    }

    // Update last login
    try {
      await db.runAsync(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );
    } catch (err) {
      logger.warn('Failed to update last login', { userId: user.id });
    }

    // Generate tokens (company_id in payload for multi-tenant scoping)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    logger.info('User logged in successfully', { userId: user.id, username });

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        company_id: user.company_id || null,
        job_title: user.job_title || null,
        facility: user.facility || null,
        department: user.department || null
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, username: req.body.username });
    next(error);
  }
};

/**
 * Get current user info
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await db.getAsync(
      `SELECT id, username, email, full_name, job_title, facility, department, role, is_active, created_at
       FROM users WHERE id = ? AND is_active = 1`,
      [req.user.id]
    );

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json(user);
  } catch (error) {
    logger.error('Get current user error', { userId: req.user.id, error: error.message });
    next(error);
  }
};

/**
 * Refresh authentication token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Refresh token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await db.getAsync(
      'SELECT id, username, role FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const newToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    res.json({ token: newToken, expiresIn: process.env.JWT_EXPIRY || '24h' });
  } catch (error) {
    logger.error('Token refresh error', { userId: req.user?.id, error: error.message });
    next(new AuthenticationError('Token refresh failed'));
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, email, job_title, facility, department } = req.body;

    // Check if email is already taken
    if (email) {
      const existingUser = await db.getAsync(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );

      if (existingUser) {
        throw new ConflictError('Email is already in use');
      }
    }

    await db.runAsync(
      `UPDATE users SET full_name = ?, email = ?, job_title = ?, facility = ?, department = ?
       WHERE id = ?`,
      [full_name || null, email || null, job_title || null, facility || null, department || null, req.user.id]
    );

    logger.info('User profile updated', { userId: req.user.id });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Update profile error', { userId: req.user.id, error: error.message });
    next(error);
  }
};

/**
 * Change user password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const user = await db.getAsync(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.runAsync(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, req.user.id]
    );

    logger.info('User password changed', { userId: req.user.id });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Change password error', { userId: req.user.id, error: error.message });
    next(error);
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res, next) => {
  try {
    logger.info('User logged out', { userId: req.user.id });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', { userId: req.user.id, error: error.message });
    next(error);
  }
};

module.exports = exports;
