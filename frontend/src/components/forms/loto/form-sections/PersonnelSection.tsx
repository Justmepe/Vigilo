import { Dispatch, SetStateAction, useState } from 'react';
import { LOTOData } from '../../App';
import { Plus, Trash2, Users } from 'lucide-react';

interface PersonnelSectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

export function PersonnelSection({ formData, setFormData }: PersonnelSectionProps) {
  const [newPerson, setNewPerson] = useState('');

  const handleChange = (field: keyof LOTOData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPerson = () => {
    if (newPerson.trim()) {
      setFormData(prev => ({
        ...prev,
        authorizedPersonnel: [...prev.authorizedPersonnel, newPerson.trim()]
      }));
      setNewPerson('');
    }
  };

  const removePerson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      authorizedPersonnel: prev.authorizedPersonnel.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPerson();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-red-600" />
        <h2 className="text-xl text-slate-900">Authorized Personnel & Emergency Contacts</h2>
      </div>

      {/* Authorized Personnel */}
      <div className="mb-6">
        <h3 className="text-slate-900 mb-3">Authorized Personnel</h3>
        <p className="text-sm text-slate-600 mb-4">
          List all personnel authorized to perform this LOTO procedure
        </p>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPerson}
            onChange={(e) => setNewPerson(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter name and press Enter or click Add"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            onClick={addPerson}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {formData.authorizedPersonnel.length > 0 ? (
          <div className="space-y-2">
            {formData.authorizedPersonnel.map((person, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <span className="text-slate-900">{person}</span>
                <button
                  onClick={() => removePerson(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-lg">
            <p className="text-slate-600">No authorized personnel added yet</p>
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="border-t pt-6">
        <h3 className="text-slate-900 mb-4">Emergency Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="safetyManager" className="block text-sm text-slate-700 mb-2">
              Safety Manager Name
            </label>
            <input
              id="safetyManager"
              type="text"
              value={formData.safetyManager}
              onChange={(e) => handleChange('safetyManager', e.target.value)}
              placeholder="e.g., John Smith"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="safetyManagerPhone" className="block text-sm text-slate-700 mb-2">
              Safety Manager Phone
            </label>
            <input
              id="safetyManagerPhone"
              type="tel"
              value={formData.safetyManagerPhone}
              onChange={(e) => handleChange('safetyManagerPhone', e.target.value)}
              placeholder="e.g., (555) 123-4567"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="emergencyContact" className="block text-sm text-slate-700 mb-2">
              Emergency Contact Name
            </label>
            <input
              id="emergencyContact"
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => handleChange('emergencyContact', e.target.value)}
              placeholder="e.g., John Smith - Safety Manager"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="emergencyPhone" className="block text-sm text-slate-700 mb-2">
              Emergency Phone Number
            </label>
            <input
              id="emergencyPhone"
              type="tel"
              value={formData.emergencyPhone}
              onChange={(e) => handleChange('emergencyPhone', e.target.value)}
              placeholder="e.g., (555) 123-4567"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}