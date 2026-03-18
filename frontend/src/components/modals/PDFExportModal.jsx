/**
 * Enhanced PDF Export Modal with Claude AI Analysis
 * Displays organized PDF generation with AI-powered safety analysis
 */

import React, { useState } from 'react';
import { FileText, Download, Loader, CheckCircle, AlertCircle, Settings, Info } from 'lucide-react';
import PDFGenerationService from '../../services/PDFGenerationService';

const PDFExportModal = ({ 
  isOpen, 
  formId, 
  formType, 
  formData, 
  onClose, 
  authToken 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const formTypeInfo = {
    'jsa': {
      name: 'Job Safety Analysis (JSA)',
      description: 'Comprehensive job safety analysis with hazard identification and control measures',
      icon: '🔍',
      sections: [
        'Company Information',
        'Job Steps Analysis',
        'Hazards Assessment',
        'Control Measures',
        'Work Team Details',
        'PPE Requirements',
        'AI Safety Analysis',
        'Compliance Status',
        'Page Footers with DCN'
      ]
    },
    'loto': {
      name: 'Lockout/Tagout (LOTO)',
      description: 'Equipment lockout and tagout procedure documentation',
      icon: '🔐',
      sections: ['Equipment Details', 'Lockout Procedures', 'Safety Controls', 'Verification Steps']
    },
    'injury': {
      name: 'Injury & Illness Report',
      description: 'Employee injury and illness incident documentation',
      icon: '⚕️',
      sections: ['Incident Details', 'Injury Assessment', 'Medical Treatment', 'Prevention Measures']
    },
    'accident': {
      name: 'Accident Report',
      description: 'Comprehensive accident incident reporting',
      icon: '⚠️',
      sections: ['Accident Details', 'Root Cause Analysis', 'Impact Assessment', 'Corrective Actions']
    },
    'spillReport': {
      name: 'Emergency Spill/Release Report',
      description: 'Environmental incident and spill documentation',
      icon: '🚨',
      sections: ['Spill Details', 'Response Actions', 'Environmental Impact', 'Cleanup Report']
    },
    'inspection': {
      name: 'Safety Inspection Report',
      description: 'Facility safety inspection and audit documentation',
      icon: '✓',
      sections: ['Inspection Findings', 'Deficiencies', 'Controls Verification', 'Recommendations']
    }
  };

  const info = formTypeInfo[formType] || {
    name: 'Safety Report',
    icon: '📋',
    description: 'Safety documentation export',
    sections: []
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);
    setErrorMessage('');

    try {
      console.log('[PDFExportModal] Starting export:', { formId, formType });
      
      // Export using the service
      await PDFGenerationService.exportAndDownload(formId, formType, authToken);
      
      setExportStatus('success');
      console.log('[PDFExportModal] Export successful');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('[PDFExportModal] Export failed:', error);
      setExportStatus('error');
      setErrorMessage(error.message || 'Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{info.icon}</span>
            <div>
              <h2 className="text-2xl font-bold">{info.name}</h2>
              <p className="text-blue-100">{info.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Messages */}
          {exportStatus === 'success' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-semibold text-green-900">PDF Generated Successfully!</p>
                <p className="text-sm text-green-700">Your organized safety report is being downloaded...</p>
              </div>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <p className="font-semibold text-red-900">Export Failed</p>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* AI Analysis Note */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="text-blue-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-blue-900">🤖 Claude AI-Powered Analysis</p>
                <p className="text-sm text-blue-700 mt-1">
                  This PDF includes AI-generated safety analysis, control measure recommendations, and compliance insights powered by Claude AI.
                </p>
              </div>
            </div>
          </div>

          {/* PDF Features */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700">📄 Sections Included</p>
              <p className="text-xs text-gray-600 mt-1">{info.sections.length} organized sections</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700">🔐 Document Control</p>
              <p className="text-xs text-gray-600 mt-1">DCN tracking & footers included</p>
            </div>
          </div>

          {/* Expandable Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
          >
            <Settings size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Included Report Sections</span>
            <span className="ml-auto text-xs text-gray-500">
              {showDetails ? '▼' : '▶'}
            </span>
          </button>

          {showDetails && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <ul className="space-y-2">
                {info.sections.map((section, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    {section}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-semibold">Form ID:</span>
                <p className="font-mono text-gray-700">{formId}</p>
              </div>
              <div>
                <span className="font-semibold">Form Type:</span>
                <p className="font-mono text-gray-700">{formType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 p-4 flex gap-3 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || exportStatus === 'success'}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader size={18} className="animate-spin" />
                Generating PDF...
              </>
            ) : exportStatus === 'success' ? (
              <>
                <CheckCircle size={18} />
                Downloaded!
              </>
            ) : (
              <>
                <Download size={18} />
                Export with Claude Analysis
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFExportModal;
