import { LOTOData } from '../App';
import { AlertTriangle } from 'lucide-react';

interface QuickReferenceGuideProps {
  formData: LOTOData;
}

export function QuickReferenceGuide({ formData }: QuickReferenceGuideProps) {
  // Get energy type mapping for display
  const getEnergyTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'electrical': 'Electrical',
      'hydraulic': 'Hydraulic',
      'pneumatic': 'Pneumatic',
      'mechanical': 'Mechanical',
      'thermal': 'Thermal',
      'chemical': 'Chemical',
      'gravity': 'Gravity',
      'pressure': 'Pressure/Vacuum',
      'stored': 'Stored Energy'
    };
    return typeMap[type.toLowerCase()] || type;
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" style={{ minHeight: '297mm' }}>
      {/* Header */}
      <div className="border-4 border-red-600 p-6 mb-6">
        <h1 className="text-center text-red-600 mb-2">
          LOCKOUT/TAGOUT (LOTO) – QUICK REFERENCE GUIDE
        </h1>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <span>Equipment Name: </span>
            <span className="border-b border-black inline-block min-w-[200px]">
              {formData.equipmentName || '____________________________'}
            </span>
          </div>
          <div>
            <span>Equipment ID: </span>
            <span className="border-b border-black inline-block min-w-[200px]">
              {formData.equipmentID || '____________________________'}
            </span>
          </div>
          <div className="col-span-2">
            <span>Location: </span>
            <span className="border-b border-black inline-block min-w-[300px]">
              {formData.location || '____________________________'}
            </span>
          </div>
        </div>
      </div>

      {/* Equipment Photo */}
      {formData.equipmentPhoto && (
        <div className="mb-6 text-center">
          <img 
            src={formData.equipmentPhoto} 
            alt="Equipment" 
            className="max-w-full h-auto max-h-64 mx-auto rounded border-2 border-slate-300"
          />
        </div>
      )}

      {/* 1. Hazardous Energy Sources */}
      <div className="mb-6">
        <h2 className="bg-red-600 text-white px-3 py-2 mb-3">
          1. HAZARDOUS ENERGY SOURCES
        </h2>
        <p className="text-sm mb-2">List the actual sources for this machine:</p>
        
        <table className="w-full border-collapse border border-slate-400 text-sm">
          <thead>
            <tr className="bg-slate-200">
              <th className="border border-slate-400 px-2 py-1 text-left">Energy Type</th>
              <th className="border border-slate-400 px-2 py-1 text-left">Isolation Point</th>
              <th className="border border-slate-400 px-2 py-1 text-left">How to Lock Out</th>
            </tr>
          </thead>
          <tbody>
            {formData.energySources && formData.energySources.length > 0 ? (
              formData.energySources.map((source) => (
                <tr key={source.id}>
                  <td className="border border-slate-400 px-2 py-1">{getEnergyTypeLabel(source.type)}</td>
                  <td className="border border-slate-400 px-2 py-1">{source.location}</td>
                  <td className="border border-slate-400 px-2 py-1">{source.isolationMethod}</td>
                </tr>
              ))
            ) : (
              <>
                <tr>
                  <td className="border border-slate-400 px-2 py-1">Electrical</td>
                  <td className="border border-slate-400 px-2 py-1">Main Disconnect</td>
                  <td className="border border-slate-400 px-2 py-1">Switch OFF → Apply Lock & Tag</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 px-2 py-1">Hydraulic</td>
                  <td className="border border-slate-400 px-2 py-1">Supply Valve</td>
                  <td className="border border-slate-400 px-2 py-1">Close Valve → Bleed Pressure</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 px-2 py-1">Pneumatic</td>
                  <td className="border border-slate-400 px-2 py-1">Air Line</td>
                  <td className="border border-slate-400 px-2 py-1">Close Valve → Vent System</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        <p className="text-xs italic text-slate-600 mt-2">
          (Insert lockout point diagram here – arrows pointing to valves, disconnects, etc.)
        </p>
      </div>

      {/* 2. LOTO Steps */}
      <div className="mb-6">
        <h2 className="bg-red-600 text-white px-3 py-2 mb-3">
          2. LOTO STEPS (AT-A-GLANCE)
        </h2>
        
        <div className="space-y-3 text-sm">
          {/* A. Before Starting */}
          <div>
            <h3 className="bg-slate-200 px-2 py-1 mb-1">A. BEFORE STARTING</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Notify affected employees</li>
              <li>Review the full LOTO procedure</li>
              <li>Gather locks, tags, and devices</li>
              <li>Wear required PPE</li>
            </ul>
          </div>

          {/* B. Shutdown */}
          <div>
            <h3 className="bg-slate-200 px-2 py-1 mb-1">B. SHUTDOWN</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Turn OFF machine using normal controls</li>
              <li>Wait for movement/rotation to stop</li>
            </ul>
          </div>

          {/* C. Isolate Energy Sources */}
          <div>
            <h3 className="bg-slate-200 px-2 py-1 mb-1">C. ISOLATE ENERGY SOURCES</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Shut OFF each energy source</li>
              <li>Apply lockout devices</li>
              <li>Attach Lock + Tag with your name</li>
            </ul>
          </div>

          {/* D. Release Stored Energy */}
          <div>
            <h3 className="bg-slate-200 px-2 py-1 mb-1">D. RELEASE STORED ENERGY</h3>
            <ul className="list-disc ml-6 space-y-1">
              {formData.storedEnergySteps && formData.storedEnergySteps.length > 0 ? (
                formData.storedEnergySteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))
              ) : (
                <>
                  <li>Bleed pressure (air/hydraulic)</li>
                  <li>Block or secure mechanical motion</li>
                  <li>Discharge capacitors</li>
                  <li>Drain any stored fluids</li>
                </>
              )}
            </ul>
          </div>

          {/* E. Verify Zero-Energy State */}
          <div>
            <h3 className="bg-slate-200 px-2 py-1 mb-1">E. VERIFY ZERO-ENERGY STATE</h3>
            <p className="ml-2 mb-1">Required:</p>
            <ul className="list-disc ml-6 space-y-1">
              {formData.verificationMethods && formData.verificationMethods.length > 0 ? (
                formData.verificationMethods.map((method, index) => (
                  <li key={index}>{method}</li>
                ))
              ) : (
                <>
                  <li>Try-start attempt (machine must NOT start)</li>
                  <li>Meter test if applicable</li>
                  <li>Visual/physical inspection</li>
                </>
              )}
            </ul>
            <p className="mt-2 text-red-600">
              Do NOT begin work until all energy is confirmed isolated.
            </p>
          </div>

          {/* F. Restore to Service */}
          <div>
            <h3 className="bg-slate-200 px-2 py-1 mb-1">F. RESTORE TO SERVICE</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Clear personnel & tools</li>
              <li>Remove blocks & reinstall guards</li>
              <li>Remove your lock(s) only</li>
              <li>Notify affected employees</li>
              <li>Restart equipment following standard controls</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Required PPE */}
      <div className="mb-6">
        <h2 className="bg-red-600 text-white px-3 py-2 mb-3">
          3. REQUIRED PPE
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {formData.ppe && formData.ppe.length > 0 ? (
            formData.ppe.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="border border-slate-400 w-4 h-4 inline-block"></span>
                <span>{item}</span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="border border-slate-400 w-4 h-4 inline-block"></span>
                <span>Safety glasses</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-slate-400 w-4 h-4 inline-block"></span>
                <span>Gloves</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-slate-400 w-4 h-4 inline-block"></span>
                <span>Face shield</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-slate-400 w-4 h-4 inline-block"></span>
                <span>Arc flash PPE (if electrical)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-slate-400 w-4 h-4 inline-block"></span>
                <span>Protective footwear</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Authorized Personnel */}
      <div className="mb-6">
        <h2 className="bg-red-600 text-white px-3 py-2 mb-3">
          4. AUTHORIZED PERSONNEL ONLY
        </h2>
        <p className="text-sm mb-2">
          Only trained, authorized employees may apply or remove locks.
        </p>
        {formData.authorizedPersonnel && formData.authorizedPersonnel.length > 0 && (
          <div>
            <p className="text-sm mb-1">Authorized Individuals:</p>
            <ul className="list-disc ml-6 text-sm">
              {formData.authorizedPersonnel.map((person, index) => (
                <li key={index}>{person}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 5. Emergency Information */}
      <div className="mb-6">
        <h2 className="bg-red-600 text-white px-3 py-2 mb-3">
          5. EMERGENCY INFORMATION
        </h2>
        <div className="text-sm space-y-1">
          <div>
            <span>Safety Manager: </span>
            <span className="border-b border-black inline-block min-w-[200px]">
              {formData.safetyManager || '____________________________'}
            </span>
          </div>
          <div>
            <span>Phone: </span>
            <span className="border-b border-black inline-block min-w-[200px]">
              {formData.safetyManagerPhone || '____________________________'}
            </span>
          </div>
          <div>
            <span>24/7 Emergency Line: </span>
            <span className="border-b border-black inline-block min-w-[200px]">
              {formData.emergencyPhone || '____________________________'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Special Warnings */}
      <div className="mb-6">
        <h2 className="bg-red-600 text-white px-3 py-2 mb-3">
          6. SPECIAL WARNINGS
        </h2>
        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="text-sm space-y-1">
              {formData.specialPrecautions ? (
                <p>{formData.specialPrecautions}</p>
              ) : (
                <>
                  <p>• Do NOT assume equipment is off—verify isolation.</p>
                  <p>• Stored pressure may remain even after shutdown.</p>
                  <p>• Auto-restart hazards may exist.</p>
                  <p>• Do not bypass or defeat any safety device.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-slate-400 pt-2 text-xs text-center text-slate-600">
        This Quick Reference Guide is a summary. Always refer to the full LOTO SOP before performing lockout/tagout procedures.
      </div>
    </div>
  );
}
