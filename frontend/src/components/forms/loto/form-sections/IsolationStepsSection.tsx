import { Dispatch, SetStateAction } from 'react';
import { LOTOData, LockoutPoint } from '../../App';
import { Plus, Trash2, Lock } from 'lucide-react';

interface IsolationStepsSectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

export function IsolationStepsSection({ formData, setFormData }: IsolationStepsSectionProps) {
  const addIsolationStep = () => {
    const newStep: LockoutPoint = {
      id: Date.now().toString(),
      step: formData.isolationSteps.length + 1,
      energySource: '',
      actionToIsolate: '',
      lockoutDevice: '',
      notes: ''
    };
    setFormData(prev => ({
      ...prev,
      isolationSteps: [...prev.isolationSteps, newStep]
    }));
  };

  const removeIsolationStep = (id: string) => {
    const steps = formData.isolationSteps
      .filter(step => step.id !== id)
      .map((step, index) => ({ ...step, step: index + 1 }));
    
    setFormData(prev => ({
      ...prev,
      isolationSteps: steps
    }));
  };

  const updateIsolationStep = (id: string, field: keyof LockoutPoint, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      isolationSteps: prev.isolationSteps.map(step =>
        step.id === id ? { ...step, [field]: value } : step
      )
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-600" />
          <h2 className="text-xl text-slate-900">Energy Isolation Steps</h2>
        </div>
        <button
          onClick={addIsolationStep}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Document each point where energy must be isolated and locked out
      </p>

      {formData.isolationSteps.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No isolation steps added yet</p>
          <button
            onClick={addIsolationStep}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Add First Step
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-3 text-left text-slate-900 w-16">Step</th>
                <th className="border border-slate-300 p-3 text-left text-slate-900">Energy Source</th>
                <th className="border border-slate-300 p-3 text-left text-slate-900">Action to Isolate</th>
                <th className="border border-slate-300 p-3 text-left text-slate-900">Lockout Device</th>
                <th className="border border-slate-300 p-3 text-left text-slate-900">Notes</th>
                <th className="border border-slate-300 p-3 text-center text-slate-900 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formData.isolationSteps.map((step, index) => (
                <tr key={step.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 p-2 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full">
                      {step.step}
                    </span>
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={step.energySource}
                      onChange={(e) => updateIsolationStep(step.id, 'energySource', e.target.value)}
                      placeholder="e.g., 480V electrical"
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={step.actionToIsolate}
                      onChange={(e) => updateIsolationStep(step.id, 'actionToIsolate', e.target.value)}
                      placeholder="e.g., Open main disconnect"
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={step.lockoutDevice}
                      onChange={(e) => updateIsolationStep(step.id, 'lockoutDevice', e.target.value)}
                      placeholder="e.g., Padlock & tag"
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={step.notes}
                      onChange={(e) => updateIsolationStep(step.id, 'notes', e.target.value)}
                      placeholder="Additional notes"
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </td>
                  <td className="border border-slate-300 p-2 text-center">
                    <button
                      onClick={() => removeIsolationStep(step.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove step"
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
  );
}
