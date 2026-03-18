import { LOTOData } from '../App';
import { AlertTriangle } from 'lucide-react';

interface LOTOPreviewProps {
  formData: LOTOData;
}

export function LOTOPreview({ formData }: LOTOPreviewProps) {
  return (
    <div className="bg-white p-12 min-h-screen">
      {/* Header */}
      <div className="border-4 border-red-600 p-6 mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <AlertTriangle className="w-12 h-12 text-red-600" />
          <div className="text-center">
            <h1 className="text-3xl text-red-600 mb-1">DANGER</h1>
            <h2 className="text-xl text-slate-900">LOCKOUT/TAGOUT (LOTO)</h2>
            <p className="text-lg text-slate-700">Standard Operating Procedure</p>
          </div>
          <AlertTriangle className="w-12 h-12 text-red-600" />
        </div>
      </div>

      {/* Document Control */}
      <section className="mb-8 border border-slate-300 p-4">
        <h3 className="text-lg text-slate-900 mb-3">Document Control</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <div className="flex">
            <span className="text-slate-600 min-w-[150px]">Document Number:</span>
            <span className="text-slate-900">{formData.documentNumber || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 min-w-[150px]">Revision Number:</span>
            <span className="text-slate-900">{formData.revisionNumber || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 min-w-[150px]">Effective Date:</span>
            <span className="text-slate-900">{formData.effectiveDate || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 min-w-[150px]">Next Review Date:</span>
            <span className="text-slate-900">{formData.reviewDate || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 min-w-[150px]">Prepared By:</span>
            <span className="text-slate-900">{formData.preparedBy || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="text-slate-600 min-w-[150px]">Reviewed By:</span>
            <span className="text-slate-900">{formData.reviewedBy || 'N/A'}</span>
          </div>
          <div className="flex col-span-2">
            <span className="text-slate-600 min-w-[150px]">Approved By:</span>
            <span className="text-slate-900">{formData.approvedBy || 'N/A'}</span>
          </div>
        </div>
      </section>

      {/* Scope & Applicability */}
      <section className="mb-8">
        <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">1. Scope & Applicability</h3>
        <div className="text-slate-900 space-y-3">
          <p>This Lockout/Tagout (LOTO) Standard Operating Procedure (SOP) applies to all servicing, maintenance, cleaning, repair, installation, and troubleshooting tasks where employees may be exposed to hazardous energy.</p>
          
          <p><strong>It applies to:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Authorized Employees performing LOTO</li>
            <li>Affected Employees working near equipment being serviced</li>
            <li>Other Employees in the surrounding area</li>
          </ul>
          
          <p className="text-sm italic">This SOP does not apply during minor tool changes or routine adjustments if they meet OSHA's "minor servicing" exemption and are performed with effective alternative protection.</p>
        </div>
      </section>

      {/* Purpose */}
      <section className="mb-8">
        <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">2. Purpose of Lockout/Tagout</h3>
        <p className="text-slate-900 whitespace-pre-wrap">{formData.purposeOfLockout || 'N/A'}</p>
      </section>

      {/* Definitions */}
      <section className="mb-8">
        <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">3. Definitions</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-slate-900"><strong>Authorized Employee:</strong></dt>
            <dd className="text-slate-900 ml-4">Person trained and approved to perform LOTO.</dd>
          </div>
          <div>
            <dt className="text-slate-900"><strong>Affected Employee:</strong></dt>
            <dd className="text-slate-900 ml-4">Person operating or working near equipment under LOTO.</dd>
          </div>
          <div>
            <dt className="text-slate-900"><strong>Energy-Isolating Device:</strong></dt>
            <dd className="text-slate-900 ml-4">Mechanical device that physically prevents energy transmission.</dd>
          </div>
          <div>
            <dt className="text-slate-900"><strong>Zero Energy State:</strong></dt>
            <dd className="text-slate-900 ml-4">All hazardous energy sources relieved, blocked, or restrained.</dd>
          </div>
          <div>
            <dt className="text-slate-900"><strong>Try-Start Verification:</strong></dt>
            <dd className="text-slate-900 ml-4">Attempt to start equipment to confirm isolation.</dd>
          </div>
          <div>
            <dt className="text-slate-900"><strong>Tagout:</strong></dt>
            <dd className="text-slate-900 ml-4">Placement of a tag when locking is not feasible.</dd>
          </div>
        </dl>
      </section>

      {/* Equipment Information */}
      <section className="mb-8">
        <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">4. Equipment Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Equipment Name:</p>
            <p className="text-slate-900">{formData.equipmentName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Equipment ID:</p>
            <p className="text-slate-900">{formData.equipmentID || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Location:</p>
            <p className="text-slate-900">{formData.location || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Department:</p>
            <p className="text-slate-900">{formData.department || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Manufacturer:</p>
            <p className="text-slate-900">{formData.manufacturer || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Model Number:</p>
            <p className="text-slate-900">{formData.modelNumber || 'N/A'}</p>
          </div>
        </div>
      </section>

      {/* Hazardous Energy Sources */}
      <section className="mb-8">
        <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">5. Hazardous Energy Sources</h3>
        {formData.energySources.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left text-slate-900">Energy Type</th>
                  <th className="border border-slate-300 p-2 text-left text-slate-900">Description</th>
                  <th className="border border-slate-300 p-2 text-left text-slate-900">Location</th>
                  <th className="border border-slate-300 p-2 text-left text-slate-900">Isolation Method</th>
                </tr>
              </thead>
              <tbody>
                {formData.energySources.map((source, index) => (
                  <tr key={source.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 p-2 text-slate-900">{source.type}</td>
                    <td className="border border-slate-300 p-2 text-slate-900">{source.description}</td>
                    <td className="border border-slate-300 p-2 text-slate-900">{source.location}</td>
                    <td className="border border-slate-300 p-2 text-slate-900">{source.isolationMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-600 italic">No energy sources defined</p>
        )}
      </section>

      {/* Required LOTO Devices */}
      <section className="mb-8">
        <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">6. Required LOTO Devices & Tools</h3>
        {formData.lotoDevices.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {formData.lotoDevices.map((device, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-slate-900">☑</span>
                <span className="text-slate-900">{device}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 italic">No devices specified</p>
        )}
      </section>

      {/* Required PPE */}
      <section className="mb-8">
        <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">7. Required PPE</h3>
        {formData.ppe.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {formData.ppe.map((item, index) => (
              <li key={index} className="text-slate-900">{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-600 italic">No PPE requirements specified</p>
        )}
      </section>

      {/* LOTO Procedures */}
      <section className="mb-8">
        <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">8. LOTO Procedures</h3>
        
        {/* Preparation */}
        {formData.preparationSteps.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg text-slate-900 mb-3">8.1 Preparation</h4>
            <div className="space-y-3">
              {formData.preparationSteps.map((step) => (
                <div key={step.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900">{step.description}</p>
                    {step.responsible && (
                      <p className="text-sm text-slate-600">Responsible: {step.responsible}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shutdown */}
        {formData.shutdownSteps.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg text-slate-900 mb-3">8.2 Equipment Shutdown</h4>
            <div className="space-y-3">
              {formData.shutdownSteps.map((step) => (
                <div key={step.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900">{step.description}</p>
                    {step.responsible && (
                      <p className="text-sm text-slate-600">Responsible: {step.responsible}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Energy Isolation */}
        {formData.isolationSteps.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg text-slate-900 mb-3">8.3 Energy Isolation</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-left text-slate-900">Step</th>
                    <th className="border border-slate-300 p-2 text-left text-slate-900">Energy Source</th>
                    <th className="border border-slate-300 p-2 text-left text-slate-900">Action to Isolate</th>
                    <th className="border border-slate-300 p-2 text-left text-slate-900">Lockout Device</th>
                    <th className="border border-slate-300 p-2 text-left text-slate-900">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.isolationSteps.map((step, index) => (
                    <tr key={step.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 p-2 text-center text-slate-900">{step.step}</td>
                      <td className="border border-slate-300 p-2 text-slate-900">{step.energySource}</td>
                      <td className="border border-slate-300 p-2 text-slate-900">{step.actionToIsolate}</td>
                      <td className="border border-slate-300 p-2 text-slate-900">{step.lockoutDevice}</td>
                      <td className="border border-slate-300 p-2 text-slate-900">{step.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stored Energy */}
        {formData.storedEnergySteps.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg text-slate-900 mb-3">8.4 Release of Stored/Residual Energy</h4>
            <div className="space-y-1">
              {formData.storedEnergySteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-slate-900">☑</span>
                  <span className="text-slate-900">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification */}
        <div className="mb-6">
          <h4 className="text-lg text-slate-900 mb-3">8.5 Verification of Zero Energy State</h4>
          
          {formData.verificationMethods.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-slate-900 mb-2">Verification Method(s):</p>
              <div className="space-y-1">
                {formData.verificationMethods.map((method, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-slate-900">☑</span>
                    <span className="text-slate-900">{method}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.verificationRecords.length > 0 && (
            <div>
              <p className="text-sm text-slate-900 mb-2">Record Verification:</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2 text-left text-slate-900">Verified By</th>
                      <th className="border border-slate-300 p-2 text-left text-slate-900">Date/Time</th>
                      <th className="border border-slate-300 p-2 text-left text-slate-900">Method Used</th>
                      <th className="border border-slate-300 p-2 text-left text-slate-900">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.verificationRecords.map((record, index) => (
                      <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="border border-slate-300 p-2 text-slate-900">{record.verifiedBy || '_______________'}</td>
                        <td className="border border-slate-300 p-2 text-slate-900">{record.dateTime || '_______________'}</td>
                        <td className="border border-slate-300 p-2 text-slate-900">{record.methodUsed || '_______________'}</td>
                        <td className="border border-slate-300 p-2 text-slate-900">{record.result || '_______________'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Performing Work */}
        <div className="mb-6">
          <h4 className="text-lg text-slate-900 mb-3">8.6 Performing the Work</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-900">
            <li>Only authorized employees may work under LOTO</li>
            <li>Maintain control of keys</li>
            <li>No bypassing permitted</li>
          </ul>
        </div>

        {/* Restoration */}
        {formData.restorationSteps.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg text-slate-900 mb-3">8.7 Restoring to Service</h4>
            <div className="space-y-3">
              {formData.restorationSteps.map((step) => (
                <div key={step.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900">{step.description}</p>
                    {step.responsible && (
                      <p className="text-sm text-slate-600">Responsible: {step.responsible}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Group Lockout */}
      {(formData.groupLockoutLead || formData.groupLockoutLockbox) && (
        <section className="mb-8">
          <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">9. Group Lockout Procedure</h3>
          <p className="text-slate-900 mb-3">Required when multiple employees work on equipment.</p>
          {formData.groupLockoutLead && (
            <p className="text-slate-900 mb-2">
              <strong>Lead authorized employee:</strong> {formData.groupLockoutLead}
            </p>
          )}
          <p className="text-slate-900 mb-2">
            <strong>Lockbox required:</strong> {formData.groupLockoutLockbox ? 'Yes' : 'No'}
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-900 ml-4">
            <li>Each worker must apply their personal lock</li>
            <li>Lead removes last lock only after confirming all personnel are clear</li>
          </ul>
        </section>
      )}

      {/* Shift Change */}
      {formData.shiftChangeProcedure && (
        <section className="mb-8">
          <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">10. Shift or Personnel Change Procedure</h3>
          <p className="text-slate-900 whitespace-pre-wrap">{formData.shiftChangeProcedure}</p>
        </section>
      )}

      {/* Contractor Coordination */}
      {formData.contractorCoordination && (
        <section className="mb-8">
          <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">11. Contractor Coordination</h3>
          <p className="text-slate-900 whitespace-pre-wrap">{formData.contractorCoordination}</p>
        </section>
      )}

      {/* Authorized Personnel */}
      <section className="mb-8">
        <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">12. Authorized Personnel List</h3>
        {formData.authorizedPersonnel.length > 0 ? (
          <ul className="space-y-2">
            {formData.authorizedPersonnel.map((person, index) => (
              <li key={index} className="text-slate-900">Name: {person}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-600 italic">No authorized personnel listed</p>
        )}
      </section>

      {/* Emergency Contact */}
      <section className="mb-8">
        <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">13. Emergency Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Safety Manager:</p>
            <p className="text-slate-900">{formData.safetyManager || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Phone:</p>
            <p className="text-slate-900">{formData.safetyManagerPhone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Emergency Line:</p>
            <p className="text-slate-900">{formData.emergencyPhone || 'N/A'}</p>
          </div>
        </div>
      </section>

      {/* Special Precautions */}
      {formData.specialPrecautions && (
        <section className="mb-8">
          <h3 className="text-xl text-slate-900 mb-4 pb-2 border-b-2 border-slate-300">14. Special Hazards / Precautions</h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-slate-900 whitespace-pre-wrap">{formData.specialPrecautions}</p>
          </div>
        </section>
      )}

      {/* Footer Warning */}
      <div className="mt-12 border-4 border-red-600 p-4 bg-red-50">
        <p className="text-center text-red-900">
          <strong>WARNING:</strong> Failure to follow this LOTO procedure may result in serious injury or death. Only authorized and trained personnel may perform lockout/tagout procedures.
        </p>
      </div>
    </div>
  );
}
