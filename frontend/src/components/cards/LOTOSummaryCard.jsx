/* eslint-disable no-unused-vars, react/function-component-definition, react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, PrinterIcon, Download, Lock, Clock } from 'lucide-react';
import { generateQRCode } from '../../utils/qrCodeGenerator';
import {
  WORK_AREAS,
  EQUIPMENT_BY_AREA,
  LOTO_ENERGY_SOURCES,
  LOCKOUT_DEVICES,
  VERIFICATION_METHODS,
  PPE_OPTIONS
} from '../../data/seafoodOperationsData';

const LOTOSummaryCard = ({ lotoData }) => {
  const [qrCode, setQrCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    generateQR();
  }, [lotoData]);

  const generateQR = async () => {
    if (!lotoData) return;
    
    setIsGenerating(true);
    const qrData = {
      type: 'LOTO',
      equipment: lotoData.equipment,
      startTime: lotoData.startDateTime,
      authorizedEmployee: lotoData.authorizedEmployee
    };
    
    const qr = await generateQRCode(qrData);
    setQrCode(qr);
    setIsGenerating(false);
  };

  const getEnergySourcesList = () => {
    const sources = [];
    Object.entries(lotoData.energySources || {}).forEach(([category, items]) => {
      if (items && items.length > 0) {
        const categoryLabel = category.replace(/_/g, ' ').toUpperCase();
        items.forEach(itemId => {
          const item = LOTO_ENERGY_SOURCES[category]?.find(s => s.id === itemId);
          if (item) {
            sources.push(`${categoryLabel}: ${item.label}`);
          }
        });
      }
    });
    return sources;
  };

  const getDevicesList = () => {
    if (!Array.isArray(lotoData.lockoutDevices)) return [];
    return lotoData.lockoutDevices
      .map(deviceId => LOCKOUT_DEVICES.find(d => d.id === deviceId))
      .filter(Boolean)
      .map(d => d.label);
  };

  const getVerificationList = () => {
    if (!Array.isArray(lotoData.verificationMethods)) return [];
    return lotoData.verificationMethods
      .map(methodId => VERIFICATION_METHODS.find(m => m.id === methodId))
      .filter(Boolean)
      .map(m => m.label);
  };

  const getPPEList = () => {
    if (!Array.isArray(lotoData.selectedPPE)) return [];
    return lotoData.selectedPPE
      .map(ppeId => PPE_OPTIONS.find(p => p.id === ppeId))
      .filter(Boolean);
  };

  const getEquipmentName = () => {
    // Find work area ID by matching label if needed
    let workAreaId = lotoData.workArea;
    if (!EQUIPMENT_BY_AREA[workAreaId]) {
      const area = WORK_AREAS.find(a => a.label === lotoData.workArea);
      workAreaId = area?.id || lotoData.workArea;
    }
    
    const availableEquipment = EQUIPMENT_BY_AREA[workAreaId] || [];
    const equipment = availableEquipment.find(e => e.id === lotoData.equipment);
    return equipment?.label || lotoData.equipment || 'Equipment';
  };

  const getWorkAreaName = () => {
    // If lotoData.workArea is already a label, return it
    if (WORK_AREAS.find(a => a.label === lotoData.workArea)) {
      return lotoData.workArea;
    }
    // Otherwise try to find by ID
    return WORK_AREAS.find(a => a.id === lotoData.workArea)?.label || lotoData.workArea;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const opt = {
      margin: 0.3,
      filename: `LOTO-Card-${lotoData.equipment}-${new Date().getTime()}.pdf`,
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(element).save();
  };

  if (!lotoData) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">No LOTO data available. Please complete the LOTO form first.</p>
      </div>
    );
  }

  const energySources = getEnergySourcesList();
  const devices = getDevicesList();
  const verifications = getVerificationList();
  const ppe = getPPEList();
  const startTime = new Date(lotoData.startDateTime);

  return (
    <div>
      <div
        ref={printRef}
        className="loto-summary-card bg-white border-4 border-yellow-600 rounded-lg overflow-hidden shadow-2xl"
        style={{ width: '11in', height: '8.5in', margin: '0 auto', padding: 0 }}
      >
        <div className="bg-gradient-to-r from-yellow-600 to-red-600 text-white p-3 h-20 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-black">🔒 LOCKOUT/TAGOUT (LOTO) SUMMARY</h1>
            <p className="text-xs opacity-90">ACTIVE LOCKOUT IN PROGRESS - DO NOT OPERATE</p>
          </div>
          <div className="text-right flex items-center gap-2">
            <Clock size={24} />
            <div>
              <p className="text-xs">Started</p>
              <p className="font-bold">{startTime.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-3 gap-4 h-full" style={{ height: 'calc(100% - 80px)' }}>
          <div className="space-y-3 border-r-2 border-gray-300 pr-4">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Equipment</p>
              <p className="text-lg font-black text-gray-800">{getEquipmentName()}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Work Area</p>
              <p className="text-sm text-gray-700">{getWorkAreaName()}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Location</p>
              <p className="text-sm text-gray-700">{lotoData.location}</p>
            </div>

            <div className="bg-red-50 p-3 rounded border-2 border-red-300 mt-2">
              <p className="text-xs font-bold text-red-700 mb-2">🚨 AUTHORIZED EMPLOYEE</p>
              <p className="text-sm font-bold text-red-900">{lotoData.authorizedEmployee}</p>
              {lotoData.assistantEmployees && (
                <p className="text-xs text-red-700 mt-1">Assists: {lotoData.assistantEmployees}</p>
              )}
            </div>
          </div>

          <div className="space-y-3 border-r-2 border-gray-300 pr-4">
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase mb-2">⚡ Energy Sources Isolated</p>
              <div className="bg-orange-50 border border-orange-200 rounded p-2 space-y-1 max-h-32 overflow-y-auto">
                {energySources.length > 0 ? (
                  energySources.map((source, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold min-w-fit">✓</span>
                      <span className="text-xs text-gray-800">{source}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No energy sources specified</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-blue-700 uppercase mb-1">🔐 Lockout Devices Used</p>
              <div className="space-y-1">
                {devices.map((device, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-blue-50 rounded text-xs">
                    <Lock size={14} className="text-blue-600" />
                    <span className="text-gray-800">{device}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase mb-2">✅ Verification Methods</p>
              <div className="bg-green-50 border border-green-200 rounded p-2 space-y-1">
                {verifications.map((method, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-xs text-gray-800">{method}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-purple-700 uppercase mb-2">🛡️ Required PPE</p>
              <div className="grid grid-cols-2 gap-2">
                {ppe.slice(0, 6).map(item => (
                  <div key={item.id} className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded border border-purple-200">
                    <span className="text-xs font-bold text-purple-700">●</span>
                    <span className="text-xs text-gray-800">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-end pt-2 border-t border-gray-300">
              <div>
                <p className="text-xs text-gray-600">Supervisor</p>
                <p className="font-bold text-sm">{lotoData.supervisor}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Full Details</p>
                {qrCode && (
                  <img src={qrCode} alt="QR Code" className="w-14 h-14 border-2 border-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          .no-print { display: none; }
        }
      `}</style>
    </div>
  );
};

export default LOTOSummaryCard;
