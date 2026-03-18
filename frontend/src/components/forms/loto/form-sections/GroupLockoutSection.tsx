import { Dispatch, SetStateAction } from 'react';
import { LOTOData } from '../../App';
import { Users } from 'lucide-react';

interface GroupLockoutSectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

export function GroupLockoutSection({ formData, setFormData }: GroupLockoutSectionProps) {
  const handleChange = (field: keyof LOTOData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-red-600" />
        <h2 className="text-xl text-slate-900">Group Lockout & Coordination</h2>
      </div>

      {/* Group Lockout */}
      <div className="mb-6">
        <h3 className="text-slate-900 mb-3">Group Lockout Procedure</h3>
        <p className="text-sm text-slate-600 mb-4">
          Required when multiple employees work on the same equipment
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="groupLockoutLead" className="block text-sm text-slate-700 mb-2">
              Lead Authorized Employee
            </label>
            <input
              id="groupLockoutLead"
              type="text"
              value={formData.groupLockoutLead}
              onChange={(e) => handleChange('groupLockoutLead', e.target.value)}
              placeholder="Name or role of lead employee"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.groupLockoutLockbox}
                onChange={(e) => handleChange('groupLockoutLockbox', e.target.checked)}
                className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
              />
              <div>
                <span className="text-slate-900 block">Lockbox Required</span>
                <span className="text-sm text-slate-600">Each worker must apply their personal lock to the lockbox</span>
              </div>
            </label>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Each worker must apply their personal lock. Lead removes last lock only after confirming all personnel are clear.
            </p>
          </div>
        </div>
      </div>

      {/* Shift Change */}
      <div className="border-t pt-6 mb-6">
        <h3 className="text-slate-900 mb-3">Shift or Personnel Change Procedure</h3>
        <p className="text-sm text-slate-600 mb-4">
          Describe the handoff procedure when shifts change or personnel are replaced
        </p>
        <textarea
          value={formData.shiftChangeProcedure}
          onChange={(e) => handleChange('shiftChangeProcedure', e.target.value)}
          placeholder="Example: Outgoing employee removes their lock only after incoming employee applies theirs. Lead verifies continuity of isolation. Document handoff if required."
          rows={4}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Contractor Coordination */}
      <div className="border-t pt-6">
        <h3 className="text-slate-900 mb-3">Contractor Coordination</h3>
        <p className="text-sm text-slate-600 mb-4">
          Procedures for coordinating LOTO with outside contractors
        </p>
        <textarea
          value={formData.contractorCoordination}
          onChange={(e) => handleChange('contractorCoordination', e.target.value)}
          placeholder="Example: Outside contractors must follow facility LOTO rules. A responsible company representative must coordinate: scope of work, energy control responsibilities, and verification steps."
          rows={4}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
}
