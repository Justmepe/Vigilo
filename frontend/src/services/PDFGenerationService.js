/**
 * Frontend PDF Generation Service
 * Integrates with backend Claude AI for organized PDF export with analysis
 */

import axios from 'axios';

class PDFGenerationService {
  /**
   * Export form as organized PDF with Claude AI analysis
   * @param {string} formId - Form ID
   * @param {string} formType - Form type (jsa, loto, injury, etc.)
   * @param {string|null} authToken - Authentication token
   * @returns {Promise<Blob>} PDF blob
   */
  static async exportFormWithAnalysis(formId, formType, authToken) {
    try {
      console.log('[PDF Service] Exporting form with Claude analysis:', { formId, formType });

      // Map form types to backend routes
      const typeToRoute = {
        'jsa': 'jsa',
        'loto': 'loto',
        'injury': 'injury',
        'accident': 'accident',
        'spillReport': 'spill',
        'spillreport': 'spill',
        'monthlyInspection': 'inspection',
        'inspection': 'inspection'
      };

      const route = typeToRoute[formType] || formType;
      const endpoint = `/api/${route}/${formId}/export-pdf`;

      console.log('[PDF Service] Requesting:', endpoint);

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/pdf'
        },
        responseType: 'blob',
        timeout: 30000
      });

      console.log('[PDF Service] PDF received:', { size: response.data.size, type: response.data.type });
      return response.data;
    } catch (error) {
      console.error('[PDF Service] Export error:', error.message);
      throw new Error(`Failed to export PDF: ${error.message}`);
    }
  }

  /**
   * Download PDF file to user's device
   * @param {Blob} pdfBlob - PDF file as blob
   * @param {string} filename - Filename for download
   */
  static downloadPDF(pdfBlob, filename) {
    try {
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'Safety_Report.pdf';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      console.log('[PDF Service] Download initiated:', filename);
    } catch (error) {
      console.error('[PDF Service] Download error:', error);
      throw new Error(`Failed to download PDF: ${error.message}`);
    }
  }

  /**
   * Get formatted filename for form type
   * @param {string} formType - Form type
   * @param {string} formId - Form ID
   * @returns {string} Formatted filename
   */
  static getFilename(formType, formId) {
    const typeNames = {
      'jsa': 'Job_Safety_Analysis',
      'loto': 'Lockout_Tagout',
      'injury': 'Injury_Report',
      'accident': 'Accident_Report',
      'spillReport': 'Spill_Report',
      'spillreport': 'Spill_Report',
      'monthlyInspection': 'Monthly_Inspection',
      'inspection': 'Safety_Inspection'
    };

    const typeName = typeNames[formType] || 'Safety_Form';
    const timestamp = new Date().toISOString().split('T')[0];
    return `${typeName}_${formId}_${timestamp}.pdf`;
  }

  /**
   * Export and download in one operation
   * @param {string} formId - Form ID
   * @param {string} formType - Form type
   * @param {string} authToken - Auth token
   * @returns {Promise<void>}
   */
  static async exportAndDownload(formId, formType, authToken) {
    try {
      console.log('[PDF Service] Starting export and download process');
      
      // Get PDF from backend
      const pdfBlob = await this.exportFormWithAnalysis(formId, formType, authToken);
      
      // Generate filename
      const filename = this.getFilename(formType, formId);
      
      // Download to user's device
      this.downloadPDF(pdfBlob, filename);
      
      console.log('[PDF Service] Export and download completed successfully');
      return { success: true, message: 'PDF downloaded successfully' };
    } catch (error) {
      console.error('[PDF Service] Export and download failed:', error);
      throw error;
    }
  }

  /**
   * Get PDF info without downloading
   * @param {string} formId - Form ID
   * @param {string} formType - Form type
   * @param {string} authToken - Auth token
   * @returns {Promise<Object>} PDF info (size, type, etc.)
   */
  static async getPDFInfo(formId, formType, authToken) {
    try {
      const response = await axios.head(`/api/${formType}/${formId}/export-pdf`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      return {
        size: response.headers['content-length'],
        type: response.headers['content-type'],
        timestamp: response.headers['last-modified']
      };
    } catch (error) {
      console.error('[PDF Service] Get info error:', error);
      return null;
    }
  }
}

export default PDFGenerationService;
