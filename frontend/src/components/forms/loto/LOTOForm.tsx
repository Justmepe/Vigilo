import { Dispatch, SetStateAction } from 'react';
import { LOTOData } from '../App';
import { DocumentControlSection } from './form-sections/DocumentControlSection';
import { EquipmentInfoSection } from './form-sections/EquipmentInfoSection';
import { EnergySourcesSection } from './form-sections/EnergySourcesSection';
import { LOTODevicesSection } from './form-sections/LOTODevicesSection';
import { ProceduresSection } from './form-sections/ProceduresSection';
import { IsolationStepsSection } from './form-sections/IsolationStepsSection';
import { StoredEnergySection } from './form-sections/StoredEnergySection';
import { VerificationSection } from './form-sections/VerificationSection';
import { GroupLockoutSection } from './form-sections/GroupLockoutSection';
import { PersonnelSection } from './form-sections/PersonnelSection';
import { AdditionalInfoSection } from './form-sections/AdditionalInfoSection';

interface LOTOFormProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

export function LOTOForm({ formData, setFormData }: LOTOFormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> This LOTO SOP template must be customized for each specific piece of equipment. All hazardous energy sources must be identified and controlled.
            </p>
          </div>
        </div>
      </div>

      <DocumentControlSection formData={formData} setFormData={setFormData} />
      <EquipmentInfoSection formData={formData} setFormData={setFormData} />
      <EnergySourcesSection formData={formData} setFormData={setFormData} />
      <LOTODevicesSection formData={formData} setFormData={setFormData} />
      <ProceduresSection formData={formData} setFormData={setFormData} />
      <IsolationStepsSection formData={formData} setFormData={setFormData} />
      <StoredEnergySection formData={formData} setFormData={setFormData} />
      <VerificationSection formData={formData} setFormData={setFormData} />
      <GroupLockoutSection formData={formData} setFormData={setFormData} />
      <PersonnelSection formData={formData} setFormData={setFormData} />
      <AdditionalInfoSection formData={formData} setFormData={setFormData} />
    </div>
  );
}