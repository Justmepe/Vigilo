import { Dispatch, SetStateAction, useState } from 'react';
import { LOTOData, ProcedureStep } from '../../App';
import { Plus, Trash2, List, ChevronDown, ChevronUp } from 'lucide-react';

interface ProceduresSectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

type ProcedureType = 'preparationSteps' | 'shutdownSteps' | 'restorationSteps';

const PROCEDURE_CONFIGS = [
  { key: 'preparationSteps' as ProcedureType, title: 'Preparation Steps', description: 'Steps to prepare for LOTO' },
  { key: 'shutdownSteps' as ProcedureType, title: 'Shutdown Steps', description: 'Steps to properly shut down equipment' },
  { key: 'restorationSteps' as ProcedureType, title: 'Restoration Steps', description: 'Steps to restore equipment to operation' }
];

export function ProceduresSection({ formData, setFormData }: ProceduresSectionProps) {
  const [expandedSections, setExpandedSections] = useState<Set<ProcedureType>>(
    new Set(['preparationSteps', 'shutdownSteps', 'restorationSteps'])
  );

  const toggleSection = (key: ProcedureType) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const addStep = (procedureType: ProcedureType) => {
    const steps = formData[procedureType];
    const newStep: ProcedureStep = {
      id: Date.now().toString(),
      stepNumber: steps.length + 1,
      description: '',
      responsible: ''
    };
    setFormData(prev => ({
      ...prev,
      [procedureType]: [...steps, newStep]
    }));
  };

  const removeStep = (procedureType: ProcedureType, id: string) => {
    const steps = formData[procedureType];
    const updatedSteps = steps
      .filter(step => step.id !== id)
      .map((step, index) => ({ ...step, stepNumber: index + 1 }));
    
    setFormData(prev => ({
      ...prev,
      [procedureType]: updatedSteps
    }));
  };

  const updateStep = (procedureType: ProcedureType, id: string, field: keyof ProcedureStep, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [procedureType]: prev[procedureType].map(step =>
        step.id === id ? { ...step, [field]: value } : step
      )
    }));
  };

  const moveStep = (procedureType: ProcedureType, index: number, direction: 'up' | 'down') => {
    const steps = [...formData[procedureType]];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= steps.length) return;
    
    [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
    
    const reorderedSteps = steps.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    
    setFormData(prev => ({
      ...prev,
      [procedureType]: reorderedSteps
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <List className="w-5 h-5 text-red-600" />
        <h2 className="text-xl text-slate-900">LOTO Procedures</h2>
      </div>

      <div className="space-y-4">
        {PROCEDURE_CONFIGS.map(({ key, title, description }) => {
          const steps = formData[key];
          const isExpanded = expandedSections.has(key);

          return (
            <div key={key} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="text-left">
                  <h3 className="text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-600">{description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    {steps.length} {steps.length === 1 ? 'step' : 'steps'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 bg-white">
                  {steps.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                      <p className="text-slate-600 mb-4">No steps added yet</p>
                      <button
                        onClick={() => addStep(key)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Add First Step
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {steps.map((step, index) => (
                        <div key={step.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mt-1">
                              {step.stepNumber}
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="block text-sm text-slate-700 mb-2">
                                  Step Description <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                  value={step.description}
                                  onChange={(e) => updateStep(key, step.id, 'description', e.target.value)}
                                  placeholder="Describe the step in detail..."
                                  rows={2}
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm text-slate-700 mb-2">
                                  Responsible Person/Role
                                </label>
                                <input
                                  type="text"
                                  value={step.responsible}
                                  onChange={(e) => updateStep(key, step.id, 'responsible', e.target.value)}
                                  placeholder="e.g., Maintenance Technician, Electrician"
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => moveStep(key, index, 'up')}
                                disabled={index === 0}
                                className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => moveStep(key, index, 'down')}
                                disabled={index === steps.length - 1}
                                className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeStep(key, step.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Remove step"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => addStep(key)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 hover:border-red-600 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Step
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}