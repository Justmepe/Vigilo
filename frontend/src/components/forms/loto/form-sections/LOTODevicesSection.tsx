import { Dispatch, SetStateAction } from 'react';
import { LOTOData } from '../../App';
import { Wrench } from 'lucide-react';

interface LOTODevicesSectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

const LOTO_DEVICE_OPTIONS = [
  'Padlocks',
  'Hasps',
  'Lockout Tags',
  'Valve Lockouts',
  'Circuit Breaker Lockouts',
  'Plug Lockout',
  'Chains / Blocks',
  'Bleed tools (pressure/air)',
  'Voltage meter',
  'Pressure gauge',
  'Cable Lockouts',
  'Gate Valve Lockouts',
  'Ball Valve Lockouts',
  'Multipole Breaker Lockouts'
];

export function LOTODevicesSection({ formData, setFormData }: LOTODevicesSectionProps) {
  const toggleDevice = (device: string) => {
    setFormData(prev => ({
      ...prev,
      lotoDevices: prev.lotoDevices.includes(device)
        ? prev.lotoDevices.filter(d => d !== device)
        : [...prev.lotoDevices, device]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Wrench className="w-5 h-5 text-red-600" />
        <h2 className="text-xl text-slate-900">Required LOTO Devices & Tools</h2>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Select all devices and tools required for this LOTO procedure
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {LOTO_DEVICE_OPTIONS.map(device => (
          <label
            key={device}
            className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={formData.lotoDevices.includes(device)}
              onChange={() => toggleDevice(device)}
              className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
            />
            <span className="text-slate-900">{device}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
