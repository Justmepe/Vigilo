import { Dispatch, SetStateAction } from 'react';
import { LOTOData, EnergySource } from '../../App';
import { Plus, Trash2, Zap } from 'lucide-react';

interface EnergySourcesSectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

const ENERGY_TYPES = [
  'Electrical',
  'Mechanical/Kinetic',
  'Hydraulic',
  'Pneumatic',
  'Thermal/Heat',
  'Chemical',
  'Gravity/Potential',
  'Pressure/Vacuum',
  'Spring',
  'Stored Energy',
  'Other'
];

export function EnergySourcesSection({ formData, setFormData }: EnergySourcesSectionProps) {
  const addEnergySource = () => {
    const newSource: EnergySource = {
      id: Date.now().toString(),
      type: 'Electrical',
      description: '',
      location: '',
      isolationMethod: ''
    };
    setFormData(prev => ({
      ...prev,
      energySources: [...prev.energySources, newSource]
    }));
  };

  const removeEnergySource = (id: string) => {
    setFormData(prev => ({
      ...prev,
      energySources: prev.energySources.filter(source => source.id !== id)
    }));
  };

  const updateEnergySource = (id: string, field: keyof EnergySource, value: string) => {
    setFormData(prev => ({
      ...prev,
      energySources: prev.energySources.map(source =>
        source.id === id ? { ...source, [field]: value } : source
      )
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-600" />
          <h2 className="text-xl text-slate-900">Hazardous Energy Sources</h2>
        </div>
        <button
          onClick={addEnergySource}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Energy Source
        </button>
      </div>

      {formData.energySources.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
          <Zap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No energy sources added yet</p>
          <button
            onClick={addEnergySource}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Add First Energy Source
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {formData.energySources.map((source, index) => (
            <div key={source.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900">Energy Source #{index + 1}</h3>
                <button
                  onClick={() => removeEnergySource(source.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Energy Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={source.type}
                    onChange={(e) => updateEnergySource(source.id, 'type', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  >
                    {ENERGY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Location <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={source.location}
                    onChange={(e) => updateEnergySource(source.id, 'location', e.target.value)}
                    placeholder="e.g., Main control panel, East wall"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-700 mb-2">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={source.description}
                    onChange={(e) => updateEnergySource(source.id, 'description', e.target.value)}
                    placeholder="e.g., 480V 3-phase power supply, 150 PSI air pressure"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-700 mb-2">
                    Isolation Method <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={source.isolationMethod}
                    onChange={(e) => updateEnergySource(source.id, 'isolationMethod', e.target.value)}
                    placeholder="e.g., Open main disconnect switch, Close valve and bleed pressure"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
