import { Dispatch, SetStateAction } from 'react';
import { LOTOData, VerificationRecord } from '../../App';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

interface VerificationSectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

const VERIFICATION_METHOD_OPTIONS = [
  'Try-start test',
  'Meter testing (voltage/pressure)',
  'Visual inspection',
  'Torque/movement test',
  'Temperature measurement',
  'Flow test'
];

export function VerificationSection({ formData, setFormData }: VerificationSectionProps) {
  const toggleMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      verificationMethods: prev.verificationMethods.includes(method)
        ? prev.verificationMethods.filter(m => m !== method)
        : [...prev.verificationMethods, method]
    }));
  };

  const addVerificationRecord = () => {
    const newRecord: VerificationRecord = {
      id: Date.now().toString(),
      verifiedBy: '',
      dateTime: '',
      methodUsed: '',
      result: ''
    };
    setFormData(prev => ({
      ...prev,
      verificationRecords: [...prev.verificationRecords, newRecord]
    }));
  };

  const removeVerificationRecord = (id: string) => {
    setFormData(prev => ({
      ...prev,
      verificationRecords: prev.verificationRecords.filter(record => record.id !== id)
    }));
  };

  const updateVerificationRecord = (id: string, field: keyof VerificationRecord, value: string) => {
    setFormData(prev => ({
      ...prev,
      verificationRecords: prev.verificationRecords.map(record =>
        record.id === id ? { ...record, [field]: value } : record
      )
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="w-5 h-5 text-red-600" />
        <h2 className="text-xl text-slate-900">Verification of Zero Energy State</h2>
      </div>

      {/* Verification Methods */}
      <div className="mb-6">
        <h3 className="text-slate-900 mb-3">Verification Methods</h3>
        <p className="text-sm text-slate-600 mb-4">
          Select all methods used to verify zero energy state
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {VERIFICATION_METHOD_OPTIONS.map(method => (
            <label
              key={method}
              className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.verificationMethods.includes(method)}
                onChange={() => toggleMethod(method)}
                className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
              />
              <span className="text-slate-900">{method}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Verification Records */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">Verification Records (Template)</h3>
          <button
            onClick={addVerificationRecord}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          These fields will be filled out during actual LOTO execution
        </p>

        {formData.verificationRecords.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
            <p className="text-slate-600 mb-4">No verification records added yet</p>
            <button
              onClick={addVerificationRecord}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Add First Record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-3 text-left text-slate-900">Verified By</th>
                  <th className="border border-slate-300 p-3 text-left text-slate-900">Date/Time</th>
                  <th className="border border-slate-300 p-3 text-left text-slate-900">Method Used</th>
                  <th className="border border-slate-300 p-3 text-left text-slate-900">Result</th>
                  <th className="border border-slate-300 p-3 text-center text-slate-900 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.verificationRecords.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 p-2">
                      <input
                        type="text"
                        value={record.verifiedBy}
                        onChange={(e) => updateVerificationRecord(record.id, 'verifiedBy', e.target.value)}
                        placeholder="Name"
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </td>
                    <td className="border border-slate-300 p-2">
                      <input
                        type="datetime-local"
                        value={record.dateTime}
                        onChange={(e) => updateVerificationRecord(record.id, 'dateTime', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </td>
                    <td className="border border-slate-300 p-2">
                      <input
                        type="text"
                        value={record.methodUsed}
                        onChange={(e) => updateVerificationRecord(record.id, 'methodUsed', e.target.value)}
                        placeholder="e.g., Voltage meter"
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </td>
                    <td className="border border-slate-300 p-2">
                      <input
                        type="text"
                        value={record.result}
                        onChange={(e) => updateVerificationRecord(record.id, 'result', e.target.value)}
                        placeholder="e.g., 0V confirmed"
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      <button
                        onClick={() => removeVerificationRecord(record.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
