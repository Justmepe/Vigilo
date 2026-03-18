import React, { useState } from 'react';
import { FileText, Lock, ChevronDown, ChevronUp, Download } from 'lucide-react';
import MachineSafetyCard from './MachineSafetyCard';
import LOTOSummaryCard from './LOTOSummaryCard';

const SafetyCardDisplay = ({ jsaData, lotoData, formId, formType, onClose }) => {
  const [expandedCard, setExpandedCard] = useState('jsa');

  const downloadCard = async (cardType) => {
    try {
      const cardElement = document.querySelector(cardType === 'jsa' ? '.machine-safety-card' : '.loto-summary-card');
      if (!cardElement) {
        alert('Card not found');
        return;
      }

      // Wait for html2pdf library to load (with timeout)
      let html2pdf = window.html2pdf;
      let attempts = 0;
      while (!html2pdf && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        html2pdf = window.html2pdf;
        attempts++;
      }

      if (!html2pdf) {
        console.error('PDF library not loaded. Check that html2pdf library script is loaded.');
        alert('PDF library failed to load. Please refresh the page and try again.');
        return;
      }

      const element = cardElement;
      const opt = {
        margin: 0,
        filename: `${cardType.toUpperCase()}-Card-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: 'portrait', unit: 'in', format: 'letter' }
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error downloading card:', error);
      alert('Failed to download card: ' + error.message);
    }
  };

  const downloadReport = async () => {
    try {
      if (!formId || !formType) {
        alert('Form information not available');
        return;
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/${formType}/${formId}/export-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formType.toUpperCase()}-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto" style={{ left: '260px' }}>
      <div className="min-h-screen py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800">📋 Safety Cards Generated</h1>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                Close
              </button>
            </div>
            
            <div className="flex gap-3 mb-4">
              {jsaData && (
                <button
                  onClick={() => downloadCard('jsa')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Download size={18} />
                  Download Machine Card
                </button>
              )}
              {lotoData && (
                <button
                  onClick={() => downloadCard('loto')}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  <Download size={18} />
                  Download LOTO Card
                </button>
              )}
              {formId && formType && (
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  <Download size={18} />
                  Download Full Report
                </button>
              )}
            </div>
            
            <p className="text-gray-600">
              Your forms have been submitted successfully. Below are your safety cards ready to print and post.
            </p>
          </div>

          <div className="space-y-6">
            {jsaData && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => setExpandedCard(expandedCard === 'jsa' ? null : 'jsa')}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center hover:from-blue-700 hover:to-blue-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={24} />
                    <h2 className="text-xl font-bold">Machine Safety Card</h2>
                  </div>
                  {expandedCard === 'jsa' ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
                
                {expandedCard === 'jsa' && (
                  <div className="p-6 bg-gray-50">
                    <p className="text-gray-600 mb-4">This card is designed to be printed, laminated, and posted at the machine location.</p>
                    <MachineSafetyCard jsaData={jsaData} />
                  </div>
                )}
              </div>
            )}

            {lotoData && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => setExpandedCard(expandedCard === 'loto' ? null : 'loto')}
                  className="w-full px-6 py-4 bg-gradient-to-r from-yellow-600 to-red-600 text-white flex justify-between items-center hover:from-yellow-700 hover:to-red-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <Lock size={24} />
                    <h2 className="text-xl font-bold">LOTO Summary Card</h2>
                  </div>
                  {expandedCard === 'loto' ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
                
                {expandedCard === 'loto' && (
                  <div className="p-6 bg-gray-50">
                    <p className="text-gray-600 mb-4">This card shows active lockout status and must be posted at the equipment during maintenance.</p>
                    <LOTOSummaryCard lotoData={lotoData} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mt-6">
            <h3 className="font-bold text-blue-900 mb-3">📌 How to Use These Cards</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✅ <strong>Machine Safety Card:</strong> Print in color and laminate. Post at the machine in a visible location.</li>
              <li>✅ <strong>LOTO Card:</strong> Print and post whenever this equipment is locked out for maintenance.</li>
              <li>✅ Both cards contain QR codes linking to full details in the safety portal.</li>
              <li>✅ Update cards when JSA or LOTO procedures change.</li>
              <li>✅ Keep laminated cards protected from water and wear.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyCardDisplay;
