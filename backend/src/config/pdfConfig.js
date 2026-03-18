/**
 * PDF Generation Configuration
 * Customize PDF appearance, headers, footers, and form-specific settings
 */

module.exports = {
  /**
   * Document Control Number (DCN) Configuration
   * Format: F-[FORM_CODE]-[FORM_ID] V[YEAR].[VERSION]
   * Example: F-JSA-1001 V26.1
   */
  dcn: {
    prefix: 'F',  // Always 'F' for Form
    formCodes: {
      'jsa': 'JSA',
      'loto': 'LOT',
      'injury': 'INJ',
      'accident': 'ACC',
      'spillReport': 'SPL',
      'inspection': 'INS',
      'monthlyInspection': 'MHI'
    },
    baseYear: 2026,
    defaultVersion: '1'
  },

  /**
   * Company Information
   * This appears in PDF headers and footers
   */
  company: {
    name: process.env.COMPANY_NAME || 'Silver Bay Seafoods',
    address: process.env.COMPANY_ADDRESS || '4019 21st Ave W Suite 300, Seattle, WA 98199',
    phone: process.env.COMPANY_PHONE || '',
    email: process.env.COMPANY_EMAIL || '',
    website: process.env.COMPANY_WEBSITE || '',
    industry: 'Fish Processing & Seafood Operations'
  },

  /**
   * PDF Footer Configuration
   * Customize the footer text for each form type
   */
  footers: {
    // Default footer for all forms
    default: {
      line1: 'Silver Bay Seafoods, LLC\n4019 21st Ave W Suite 300, Seattle, WA 98199\n',
      line2: 'Generated on: {timestamp}',
      line3: 'For internal use only - Confidential'
    },

    // Job Safety Analysis specific footer
    jsa: {
      line1: 'Job Safety Analysis - Document reviewed and approved by supervisor.',
      line2: 'Generated on: {timestamp}',
      line3: 'All personnel must follow the control measures listed above.'
    },

    // LOTO specific footer
    loto: {
      line1: 'Lockout/Tagout Procedure - Compliance with OSHA 1910.147 required.',
      line2: 'Generated on: {timestamp}',
      line3: 'Unauthorized removal of locks is strictly prohibited.'
    },

    // Injury Report specific footer
    injury: {
      line1: 'Employee Injury Report - OSHA recordable incident documentation.',
      line2: 'Generated on: {timestamp}',
      line3: 'Retain for OSHA compliance - 5 years minimum.'
    },

    // Accident Report specific footer
    accident: {
      line1: 'Accident Report - Official incident documentation.',
      line2: 'Generated on: {timestamp}',
      line3: 'For workers compensation and insurance purposes.'
    },

    // Spill Report specific footer
    spillReport: {
      line1: 'Emergency Spill/Release Report - EPA reporting documentation.',
      line2: 'Generated on: {timestamp}',
      line3: 'Retain as required by environmental regulations.'
    },

    // Inspection specific footer
    inspection: {
      line1: 'Safety Inspection Report - Facility compliance documentation.',
      line2: 'Generated on: {timestamp}',
      line3: 'Follow-up required for all deficiencies noted.'
    },

    monthlyInspection: {
      line1: 'Monthly Hygiene Inspection - HACCP compliance documentation.',
      line2: 'Generated on: {timestamp}',
      line3: 'Corrective actions must be completed within 48 hours.'
    }
  },

  /**
   * PDF Styling Configuration
   */
  styling: {
    // Page margins
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    },

    // Colors
    colors: {
      primary: '#1e40af',          // Blue for headers/titles
      secondary: '#64748b',        // Gray for metadata
      danger: '#dc2626',           // Red for warnings/critical
      success: '#10b981',          // Green for success/controls
      text: '#000000',             // Black for body text
      // Text variants
      subtle: '#666666',           // Subtle gray for subtitles and footers
      bodyText: '#333333',         // Dark gray for field values
      muted: '#999999',            // Light gray for placeholder/disabled text
      // Section-specific
      aiHeader: '#0369a1',         // Darker blue for AI section header
      aiMeta: '#667780',           // Muted blue-gray for AI metadata text
      warningText: '#92400e',      // Orange-brown for warning headings
      warningTextDark: '#78350f',  // Dark brown for warning sub-text
      tableBorder: '#d0d5dd'       // Light gray for table cell borders
    },

    // Background tints (light fills for section headers and alternating rows)
    bgColors: {
      primaryTint: '#e8f0fe',  // Light blue for primary section headers
      dangerTint:  '#fef2f2',  // Light red for danger/critical sections
      infoTint:    '#f0f9ff',  // Light info-blue for checklist sections
      rowAlt:      '#f8f9fa',  // Alternating table row background
      aiSection:   '#e0f2fe',  // AI safety analysis section background
      warning:     '#fef3c7'   // Warning / pending-report background
    },

    // Font sizes (pt)
    fonts: {
      title: 24,
      heading: 14,
      subheading: 11,
      body: 9,
      small: 8,
      footer: 8
    }
  },

  /**
   * Form-Specific Settings
   */
  formSettings: {
    jsa: {
      requiresSignature: true,
      watermark: null,
      pageOrientation: 'portrait'
    },
    loto: {
      requiresSignature: true,
      watermark: 'AUTHORIZED PERSONNEL ONLY',
      pageOrientation: 'portrait'
    },
    injury: {
      requiresSignature: true,
      watermark: 'CONFIDENTIAL',
      pageOrientation: 'portrait'
    },
    accident: {
      requiresSignature: true,
      watermark: 'CONFIDENTIAL',
      pageOrientation: 'portrait'
    },
    spillReport: {
      requiresSignature: true,
      watermark: null,
      pageOrientation: 'portrait'
    },
    inspection: {
      requiresSignature: false,
      watermark: null,
      pageOrientation: 'portrait'
    }
  },

  /**
   * Full display names for each form type (used in PDF footer)
   */
  formNames: {
    jsa: 'Job Safety Analysis',
    loto: 'Lockout/Tagout Procedure',
    injury: 'Employee Injury Report',
    accident: 'Accident Report',
    spillReport: 'Emergency Spill/Release Report',
    inspection: 'Safety Inspection Report',
    monthlyInspection: 'Monthly Hygiene Inspection'
  },

  /**
   * Photo Settings
   */
  photos: {
    maxWidth: 450,
    maxHeight: 400,
    quality: 0.9,
    format: 'jpeg'
  },

  /**
   * Custom Fields to Always Show
   * These fields will always be displayed even if empty
   */
  requiredFields: {
    jsa: ['jobTitle', 'workArea', 'date', 'supervisor'],
    loto: ['equipmentName', 'location', 'authorizedBy'],
    injury: ['employeeName', 'incidentDate', 'bodyPartAffected'],
    accident: ['accidentDate', 'location', 'driverName'],
    spillReport: ['incidentDate', 'location', 'materialName'],
    inspection: ['inspectionDate', 'inspectorName', 'area']
  }
};
