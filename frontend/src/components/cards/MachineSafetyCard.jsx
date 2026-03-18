/* eslint-disable no-unused-vars, react/function-component-definition, react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, PrinterIcon, Download, Zap, AlertCircle } from 'lucide-react';
import { generateQRCode } from '../../utils/qrCodeGenerator';
import {
  HAZARDS_BY_AREA,
  WORK_AREAS,
  EQUIPMENT_BY_AREA,
  PPE_OPTIONS,
  SEAFOOD_SPECIES
} from '../../data/seafoodOperationsData';

const MachineSafetyCard = ({ jsaData }) => {
  const [qrCode, setQrCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    generateQR();
  }, [jsaData]);

  const generateQR = async () => {
    if (!jsaData) return;
    
    setIsGenerating(true);
    const qrData = {
      type: 'JSA',
      equipment: jsaData.equipment,
      date: jsaData.date,
      supervisor: jsaData.supervisor
    };
    
    const qr = await generateQRCode(qrData);
    setQrCode(qr);
    setIsGenerating(false);
  };

  const getHazardsByArea = () => {
    // Find work area ID by matching label if needed
    let workAreaId = jsaData.workArea;
    if (!HAZARDS_BY_AREA[workAreaId]) {
      const area = WORK_AREAS.find(a => a.label === jsaData.workArea);
      workAreaId = area?.id || jsaData.workArea;
    }
    
    const hazardsList = HAZARDS_BY_AREA[workAreaId] || [];
    if (!Array.isArray(jsaData.commonHazards || jsaData.selectedHazards)) return [];
    
    const hazardIds = jsaData.commonHazards || jsaData.selectedHazards || [];
    return hazardIds
      .map(hazardId => hazardsList.find(h => h.id === hazardId))
      .filter(Boolean)
      .slice(0, 6);
  };

  const getPPEList = () => {
    const ppeIds = jsaData.ppeRequired || jsaData.selectedPPE || [];
    if (!Array.isArray(ppeIds)) return [];
    return ppeIds
      .map(ppeId => PPE_OPTIONS.find(p => p.id === ppeId))
      .filter(Boolean);
  };

  const getEquipmentName = () => {
    // Find work area ID by matching label if needed
    let workAreaId = jsaData.workArea;
    if (!EQUIPMENT_BY_AREA[workAreaId]) {
      const area = WORK_AREAS.find(a => a.label === jsaData.workArea);
      workAreaId = area?.id || jsaData.workArea;
    }
    
    const availableEquipment = EQUIPMENT_BY_AREA[workAreaId] || [];
    const equipment = availableEquipment.find(e => e.id === jsaData.equipment);
    return equipment?.label || jsaData.equipment || 'Equipment';
  };

  const getWorkAreaName = () => {
    // If jsaData.workArea is already a label, return it
    if (WORK_AREAS.find(a => a.label === jsaData.workArea)) {
      return jsaData.workArea;
    }
    // Otherwise try to find by ID
    return WORK_AREAS.find(a => a.id === jsaData.workArea)?.label || jsaData.workArea;
  };

  const getSpeciesName = () => {
    // If jsaData.species is already a label, return it
    if (SEAFOOD_SPECIES.find(s => s.label === jsaData.species)) {
      return jsaData.species;
    }
    // Otherwise try to find by ID
    return SEAFOOD_SPECIES.find(s => s.id === jsaData.species)?.label || jsaData.species;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const opt = {
      margin: 0.5,
      filename: `Safety-Card-${jsaData.equipment}-${jsaData.date}.pdf`,
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(element).save();
  };

  if (!jsaData) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">No JSA data available. Please complete the JSA form first.</p>
      </div>
    );
  }

  const hazards = getHazardsByArea();
  const ppe = getPPEList();

  return (
    <div>
      <div
        ref={printRef}
        className="machine-safety-card bg-white border-4 border-red-600 rounded-lg overflow-hidden shadow-2xl"
        style={{ width: '8.5in', height: '11in', margin: '0 auto', padding: 0 }}
      >
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">⚠️ MACHINE SAFETY CARD</h1>
              <p className="text-xs opacity-90">POST AT MACHINE - REVIEW BEFORE OPERATING</p>
            </div>
            <div className="text-right">
              <p className="text-xs">JSA Date</p>
              <p className="font-bold text-lg">{new Date(jsaData.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-red-200">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Machine / Equipment</p>
              <p className="text-base font-bold text-gray-800">{getEquipmentName()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Species</p>
              <p className="text-base font-bold text-gray-800">{getSpeciesName()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Work Area</p>
              <p className="text-sm text-gray-700">{getWorkAreaName()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Supervisor</p>
              <p className="text-sm text-gray-700">{jsaData.responsibleSupervisor || jsaData.supervisor}</p>
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-2">
              <AlertTriangle size={16} /> TOP HAZARDS
            </h3>
            <div className="bg-red-50 border border-red-200 rounded p-2 space-y-1">
              {hazards.map((hazard, idx) => (
                <div key={hazard.id} className="flex items-start gap-2">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white ${
                    hazard.severity === 'high' ? 'bg-red-600' :
                    hazard.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-green-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium text-gray-800">{hazard.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-2">
              <AlertCircle size={16} /> REQUIRED PPE
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="grid grid-cols-2 gap-2">
                {ppe.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-600 rounded-full" />
                    <span className="text-xs font-bold text-gray-800">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-300">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-2 rounded border-2 border-yellow-400">
              <p className="text-xs font-bold text-yellow-800">🛑 EMERGENCY STOP</p>
              <p className="text-xs text-yellow-700">Located at machine front/control panel</p>
            </div>
            <div className="bg-gray-100 p-2 rounded border border-gray-400">
              <p className="text-xs font-bold text-gray-700">📞 EMERGENCY</p>
              <p className="text-xs font-bold text-gray-800">Notify Supervisor</p>
            </div>
          </div>

          <div className="flex justify-between items-end pt-3 border-t border-gray-300">
            <div>
              <p className="text-xs text-gray-600 mb-1">Full JSA Details</p>
              {qrCode && (
                <img src={qrCode} alt="QR Code" className="w-16 h-16 border border-gray-400" />
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Authorized By</p>
              <p className="font-bold text-sm text-gray-800">{jsaData.authorizedEmployee || 'Safety Officer'}</p>
              <p className="text-xs text-gray-500 mt-1">Valid until next review</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          * { margin: 0; padding: 0; }
          .no-print { display: none; }
        }
      `}</style>
    </div>
  );
};

export default MachineSafetyCard;
