import { Dispatch, SetStateAction, useState } from 'react';
import { LOTOData } from '../../App';
import { Plus, Trash2, AlertCircle, Shield } from 'lucide-react';

interface AdditionalInfoSectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

const COMMON_PPE = [
  'Safety Glasses',
  'Face Shield',
  'Hard Hat',
  'Safety Shoes/Boots',
  'Gloves (specify type)',
  'Hearing Protection',
  'Respirator',
  'Arc Flash Protection',
  'Insulated Gloves',
  'Leather Gloves',
  'Chemical Resistant Gloves',
  'Safety Harness',
  'High Visibility Vest',
  'Flame Resistant Clothing'
];

export function AdditionalInfoSection({ formData, setFormData }: AdditionalInfoSectionProps) {
  const [newPPE, setNewPPE] = useState('');
  const [showPPEList, setShowPPEList] = useState(false);

  const handleChange = (field: keyof LOTOData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPPE = (item: string) => {
    if (item.trim() && !formData.ppe.includes(item.trim())) {
      setFormData(prev => ({
        ...prev,
        ppe: [...prev.ppe, item.trim()]
      }));
      setNewPPE('');
      setShowPPEList(false);
    }
  };

  const removePPE = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ppe: prev.ppe.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPPE(newPPE);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-red-600" />
        <h2 className="text-xl text-slate-900">Additional Information</h2>
      </div>

      {/* PPE Requirements */}
      <div className="mb-6">
        <h3 className="text-slate-900 mb-3">Required Personal Protective Equipment (PPE)</h3>
        
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newPPE}
                onChange={(e) => {
                  setNewPPE(e.target.value);
                  setShowPPEList(e.target.value.length > 0);
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowPPEList(true)}
                placeholder="Type to add custom PPE or select from common items"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              
              {showPPEList && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {COMMON_PPE.filter(item => 
                    item.toLowerCase().includes(newPPE.toLowerCase()) &&
                    !formData.ppe.includes(item)
                  ).map(item => (
                    <button
                      key={item}
                      onClick={() => addPPE(item)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-900"
                    >
                      {item}
                    </button>
                  ))}
                  {newPPE.trim() && !COMMON_PPE.some(item => item.toLowerCase() === newPPE.toLowerCase()) && (
                    <button
                      onClick={() => addPPE(newPPE)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-900 border-t border-slate-200"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add "{newPPE}"
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => addPPE(newPPE)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {formData.ppe.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {formData.ppe.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-slate-900">{item}</span>
                <button
                  onClick={() => removePPE(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-lg">
            <Shield className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600">No PPE requirements added yet</p>
          </div>
        )}
      </div>

      {/* Special Precautions */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-slate-900">Special Precautions and Warnings</h3>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          Include any special hazards, warnings, or precautions specific to this equipment
        </p>
        <textarea
          value={formData.specialPrecautions}
          onChange={(e) => handleChange('specialPrecautions', e.target.value)}
          placeholder="Examples:&#10;- Do not work alone on this equipment&#10;- High voltage hazard - only qualified electricians&#10;- Hot surfaces may remain hot for 30 minutes after shutdown&#10;- Chemical residue may be present in lines&#10;- Equipment may restart automatically if not properly locked out"
          rows={6}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
}
