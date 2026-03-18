import { Dispatch, SetStateAction } from 'react';
import { LOTOData } from '../../App';
import { Droplets } from 'lucide-react';

interface StoredEnergySectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

const STORED_ENERGY_OPTIONS = [
  'Bleed off hydraulic pressure',
  'Vent pneumatic lines',
  'Block mechanical parts',
  'Secure gravity hazards',
  'Discharge capacitors',
  'Drain fluids',
  'Release spring tension',
  'Cool hot surfaces',
  'Neutralize chemicals'
];

export function StoredEnergySection({ formData, setFormData }: StoredEnergySectionProps) {
  const toggleStep = (step: string) => {
    setFormData(prev => ({
      ...prev,
      storedEnergySteps: prev.storedEnergySteps.includes(step)
        ? prev.storedEnergySteps.filter(s => s !== step)
        : [...prev.storedEnergySteps, step]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Droplets className="w-5 h-5 text-red-600" />
        <h2 className="text-xl text-slate-900">Release of Stored/Residual Energy</h2>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Select all applicable steps to safely release stored or residual energy
      </p>

      <div className="space-y-2">
        {STORED_ENERGY_OPTIONS.map(step => (
          <label
            key={step}
            className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={formData.storedEnergySteps.includes(step)}
              onChange={() => toggleStep(step)}
              className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
            />
            <span className="text-slate-900">{step}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
