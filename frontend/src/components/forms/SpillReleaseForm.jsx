/**
 * Spill/Release Report Form
 * Documents chemical spills and environmental releases
 */

import React, { useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import PhotoCapture from '../common/PhotoCapture';
import { FormPreviewModal } from '../common/FormPreviewModal';
import {
  FormSection,
  FormField,
  FormAlert,
  CheckboxArray,
} from './FormComponents';
import { submitSpillReport, saveDraft, submitDraft } from '../../services/forms';
import { getFacilityOptions } from '../../constants/facilities';

const SpillReleaseForm = ({ onSuccess, onCancel, formId: initialFormId = null, initialData = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(initialFormId);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState(() => ({
    // Facility
    facility: '',

    // Incident Information
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: new Date().toTimeString().slice(0, 5),
    location: '',
    reportedDate: new Date().toISOString().split('T')[0],
    reportedTime: '',
    reportedBy: '',

    // Material Information
    materialName: '',
    materialId: '',
    chemicalClass: '',
    hazardClass: '',
    sds: false,

    // Spill Quantity
    quantity: '',
    quantityUnit: 'liters',
    estimatedQuantity: false,

    // Spill Source
    spillSource: '',
    container: '', // drum, tank, pipe, equipment, other
    primaryCause: '',

    // Environmental Impact
    environementalImpact: [],
    affectedArea: '',
    waterContaminated: false,
    soilContaminated: false,
    atmosomeContaminated: false,

    // Response & Containment
    immediateResponse: '',
    containmentMeasures: '',
    materialsUsed: '',
    treatmentApplied: '',
    ppeUsed: [],
    evacuationRequired: false,
    peopleEvacuated: '',

    // Health Impact
    healthImpact: false,
    affectedPersons: '',
    medicalAttention: false,

    // Regulatory Notification
    environmentalAgencyNotified: false,
    notificationDetails: '',
    healthDepartmentNotified: false,
    otherAuthorities: '',

    // Cleanup & Disposal
    cleanupCompleted: false,
    cleanupBy: '',
    disposalMethod: '',
    disposalLocation: '',
    wasteDocumentation: '',

    // Investigation
    rootCause: '',
    contributingFactors: [],
    preventiveMeasures: '',
    actionItems: '',
    investigatedBy: '',
    investigationDate: new Date().toISOString().split('T')[0],

    // Additional Notes
    notes: '',
    ...(initialData || {}),
  }));

  const hazardClasses = [
    'Flammable Liquid',
    'Flammable Gas',
    'Flammable Solid',
    'Oxidizer',
    'Toxic/Poisonous',
    'Corrosive',
    'Irritant',
    'Sensitizer',
    'Carcinogenic',
    'Reproductive Hazard',
    'Organ Damage',
    'Environmental Hazard',
    'Explosives',
    'Compressed Gas',
    'Other'
  ];

  const environmentalImpactOptions = [
    { id: 'water', label: 'Water Pollution' },
    { id: 'soil', label: 'Soil Contamination' },
    { id: 'air', label: 'Air Emissions' },
    { id: 'groundwater', label: 'Groundwater' },
    { id: 'surface-water', label: 'Surface Water (River/Stream)' },
    { id: 'vegetation', label: 'Vegetation Damage' },
    { id: 'wildlife', label: 'Wildlife Affected' },
    { id: 'none', label: 'No Environmental Impact' }
  ];

  const contributingFactorOptions = [
    { id: 'equipment-failure', label: 'Equipment Failure' },
    { id: 'poor-maintenance', label: 'Poor Maintenance' },
    { id: 'operator-error', label: 'Operator Error' },
    { id: 'procedural', label: 'Procedural Violation' },
    { id: 'container-defect', label: 'Container Defect' },
    { id: 'age', label: 'Age/Wear of Equipment' },
    { id: 'lack-training', label: 'Lack of Training' },
    { id: 'pressure', label: 'Pressure Imbalance' },
    { id: 'temperature', label: 'Temperature Variation' },
    { id: 'seal-failure', label: 'Seal/Gasket Failure' }
  ];

  const ppeOptions = [
    { id: 'respirator', label: 'Respirator/SCBA' },
    { id: 'gloves', label: 'Gloves' },
    { id: 'boots', label: 'Safety Boots' },
    { id: 'suit', label: 'Protective Suit' },
    { id: 'glasses', label: 'Safety Glasses/Goggles' },
    { id: 'apron', label: 'Apron' },
    { id: 'hard-hat', label: 'Hard Hat' }
  ];

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handlePhotoCapture = useCallback((photo) => {
    setCapturedPhotos(prev => [...prev, photo]);
  }, []);

  const handleCaptionUpdate = useCallback((photoId, caption) => {
    setCapturedPhotos(prev =>
      prev.map(photo =>
        photo.id === photoId ? { ...photo, caption } : photo
      )
    );
  }, []);

  const handlePhotoDelete = useCallback((photoId) => {
    setCapturedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  }, []);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      const result = await saveDraft('spill', formData, capturedPhotos, currentFormId);
      const newId = result?.id || result?.formId || result?.data?.id || currentFormId;
      if (newId) setCurrentFormId(newId);
      setSuccessMessage('Draft saved — you can safely close and resume later.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.facility) newErrors.facility = 'Facility is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      setErrorMessage('Please correct the errors before submitting');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Show preview modal instead of submitting directly
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const submissionData = {
        ...formData,
        environementalImpact: formData.environementalImpact.join(', '),
        ppeUsed: formData.ppeUsed.join(', '),
        contributingFactors: formData.contributingFactors.join(', ')
      };

      let response;
      if (currentFormId) {
        response = await submitDraft(currentFormId, submissionData, capturedPhotos);
      } else {
        response = await submitSpillReport(submissionData, capturedPhotos);
      }
      const newId = response?.id || response?.formId || response?.data?.id || currentFormId;
      if (newId) setCurrentFormId(newId);

      setSuccessMessage(`Spill report submitted successfully! Reference: ${response?.id || newId}`);
      setShowPreview(false);

      if (onSuccess) {
        setTimeout(() => onSuccess(response), 1500);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit spill report. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle size={28} className="text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-900">Spill/Release Report Form</h2>
      </div>
      <p className="text-gray-600 mb-6">Document chemical spills and environmental releases for investigation</p>

      {errorMessage && (
        <FormAlert
          type="error"
          title="Error"
          message={errorMessage}
          onDismiss={() => setErrorMessage('')}
        />
      )}

      {successMessage && (
        <FormAlert
          type="success"
          title="Success"
          message={successMessage}
        />
      )}

      {/* Facility Selection */}
      <FormSection title="Facility">
        <FormField
          label="Facility / Location"
          name="facility"
          type="select"
          value={formData.facility}
          onChange={(e) => handleFieldChange('facility', e.target.value)}
          options={getFacilityOptions()}
          error={errors.facility}
          required
        />
      </FormSection>

      {/* Incident Information */}
      <FormSection title="Incident Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Date of Incident"
            name="incidentDate"
            type="date"
            value={formData.incidentDate}
            onChange={(e) => handleFieldChange('incidentDate', e.target.value)}
            error={errors.incidentDate}
            required
          />

          <FormField
            label="Time of Incident"
            name="incidentTime"
            type="time"
            value={formData.incidentTime}
            onChange={(e) => handleFieldChange('incidentTime', e.target.value)}
          />

          <FormField
            label="Location"
            name="location"
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="Building/Area"
            error={errors.location}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Date Reported"
            name="reportedDate"
            type="date"
            value={formData.reportedDate}
            onChange={(e) => handleFieldChange('reportedDate', e.target.value)}
          />

          <FormField
            label="Time Reported"
            name="reportedTime"
            type="time"
            value={formData.reportedTime}
            onChange={(e) => handleFieldChange('reportedTime', e.target.value)}
          />

          <FormField
            label="Reported By"
            name="reportedBy"
            value={formData.reportedBy}
            onChange={(e) => handleFieldChange('reportedBy', e.target.value)}
            error={errors.reportedBy}
            required
          />
        </div>
      </FormSection>

      {/* Material Information */}
      <FormSection title="Material Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Material Name"
            name="materialName"
            value={formData.materialName}
            onChange={(e) => handleFieldChange('materialName', e.target.value)}
            error={errors.materialName}
            required
          />

          <FormField
            label="Material ID/Product Code"
            name="materialId"
            value={formData.materialId}
            onChange={(e) => handleFieldChange('materialId', e.target.value)}
          />

          <FormField
            label="Hazard Class"
            name="hazardClass"
            type="select"
            value={formData.hazardClass}
            onChange={(e) => handleFieldChange('hazardClass', e.target.value)}
            options={hazardClasses}
          />

          <FormField
            label="SDS Available?"
            name="sds"
            type="checkbox"
            value={formData.sds}
            onChange={(e) => handleFieldChange('sds', e.target.checked)}
          />
        </div>
      </FormSection>

      {/* Spill Quantity */}
      <FormSection title="Spill Quantity">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Quantity"
            name="quantity"
            value={formData.quantity}
            onChange={(e) => handleFieldChange('quantity', e.target.value)}
            error={errors.quantity}
            required
          />

          <FormField
            label="Unit"
            name="quantityUnit"
            type="select"
            value={formData.quantityUnit}
            onChange={(e) => handleFieldChange('quantityUnit', e.target.value)}
            options={['liters', 'gallons', 'kg', 'lbs', 'cubic meters', 'grams', 'ml']}
          />

          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.estimatedQuantity}
                onChange={(e) => handleFieldChange('estimatedQuantity', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Estimated</span>
            </label>
          </div>
        </div>
      </FormSection>

      {/* Spill Source */}
      <FormSection title="Source of Spill">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Spill Source"
            name="spillSource"
            value={formData.spillSource}
            onChange={(e) => handleFieldChange('spillSource', e.target.value)}
            placeholder="e.g., Transfer operation, Storage leak, Valve failure"
          />

          <FormField
            label="Container Type"
            name="container"
            type="select"
            value={formData.container}
            onChange={(e) => handleFieldChange('container', e.target.value)}
            options={['Drum', 'Tank', 'Pipe', 'Equipment', 'Vehicle', 'Other']}
          />
        </div>

        <FormField
          label="Primary Cause of Spill"
          name="primaryCause"
          value={formData.primaryCause}
          onChange={(e) => handleFieldChange('primaryCause', e.target.value)}
          placeholder="What caused the spill?"
        />
      </FormSection>

      {/* Environmental Impact */}
      <FormSection title="Environmental Impact Assessment">
        <CheckboxArray
          label="Environmental Impact (Mark All That Apply)"
          name="environementalImpact"
          items={environmentalImpactOptions}
          values={formData.environementalImpact}
          onChange={(e) => handleFieldChange('environementalImpact', e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormField
            label="Water Contaminated?"
            name="waterContaminated"
            type="checkbox"
            value={formData.waterContaminated}
            onChange={(e) => handleFieldChange('waterContaminated', e.target.checked)}
          />

          <FormField
            label="Soil Contaminated?"
            name="soilContaminated"
            type="checkbox"
            value={formData.soilContaminated}
            onChange={(e) => handleFieldChange('soilContaminated', e.target.checked)}
          />

          <FormField
            label="Air Contaminated?"
            name="atmosomeContaminated"
            type="checkbox"
            value={formData.atmosomeContaminated}
            onChange={(e) => handleFieldChange('atmosomeContaminated', e.target.checked)}
          />
        </div>

        <FormField
          label="Affected Area Description"
          name="affectedArea"
          type="textarea"
          value={formData.affectedArea}
          onChange={(e) => handleFieldChange('affectedArea', e.target.value)}
          placeholder="Describe affected area (size, extent, visible contamination)"
          rows={3}
        />
      </FormSection>

      {/* Response & Containment */}
      <FormSection title="Response and Containment">
        <FormField
          label="Immediate Response Taken"
          name="immediateResponse"
          type="textarea"
          value={formData.immediateResponse}
          onChange={(e) => handleFieldChange('immediateResponse', e.target.value)}
          placeholder="First actions taken"
          rows={3}
        />

        <FormField
          label="Containment Measures"
          name="containmentMeasures"
          type="textarea"
          value={formData.containmentMeasures}
          onChange={(e) => handleFieldChange('containmentMeasures', e.target.value)}
          placeholder="Methods used to contain spill"
          rows={3}
        />

        <FormField
          label="Materials Used for Cleanup"
          name="materialsUsed"
          type="textarea"
          value={formData.materialsUsed}
          onChange={(e) => handleFieldChange('materialsUsed', e.target.value)}
          placeholder="Absorbents, neutralizers, etc."
          rows={2}
        />

        <FormField
          label="Treatment Applied"
          name="treatmentApplied"
          type="textarea"
          value={formData.treatmentApplied}
          onChange={(e) => handleFieldChange('treatmentApplied', e.target.value)}
          placeholder="Chemical or physical treatment applied"
          rows={2}
        />

        <CheckboxArray
          label="PPE Used by Responders"
          name="ppeUsed"
          items={ppeOptions}
          values={formData.ppeUsed}
          onChange={(e) => handleFieldChange('ppeUsed', e.target.value)}
        />
      </FormSection>

      {/* Health Impact */}
      <FormSection title="Health Impact">
        <FormField
          label="Personnel Health Impact?"
          name="healthImpact"
          type="checkbox"
          value={formData.healthImpact}
          onChange={(e) => handleFieldChange('healthImpact', e.target.checked)}
        />

        {formData.healthImpact && (
          <>
            <FormField
              label="Personnel Affected"
              name="affectedPersons"
              value={formData.affectedPersons}
              onChange={(e) => handleFieldChange('affectedPersons', e.target.value)}
              placeholder="Names/number of affected persons"
            />

            <FormField
              label="Medical Attention Required?"
              name="medicalAttention"
              type="checkbox"
              value={formData.medicalAttention}
              onChange={(e) => handleFieldChange('medicalAttention', e.target.checked)}
            />
          </>
        )}

        <FormField
          label="Evacuation Required?"
          name="evacuationRequired"
          type="checkbox"
          value={formData.evacuationRequired}
          onChange={(e) => handleFieldChange('evacuationRequired', e.target.checked)}
        />

        {formData.evacuationRequired && (
          <FormField
            label="Number of People Evacuated"
            name="peopleEvacuated"
            type="number"
            value={formData.peopleEvacuated}
            onChange={(e) => handleFieldChange('peopleEvacuated', e.target.value)}
          />
        )}
      </FormSection>

      {/* Regulatory Notification */}
      <FormSection title="Regulatory Notification">
        <FormField
          label="Environmental Agency Notified?"
          name="environmentalAgencyNotified"
          type="checkbox"
          value={formData.environmentalAgencyNotified}
          onChange={(e) => handleFieldChange('environmentalAgencyNotified', e.target.checked)}
        />

        {formData.environmentalAgencyNotified && (
          <FormField
            label="Notification Details"
            name="notificationDetails"
            type="textarea"
            value={formData.notificationDetails}
            onChange={(e) => handleFieldChange('notificationDetails', e.target.value)}
            placeholder="Agency contact, reference number, date/time"
            rows={2}
          />
        )}

        <FormField
          label="Health Department Notified?"
          name="healthDepartmentNotified"
          type="checkbox"
          value={formData.healthDepartmentNotified}
          onChange={(e) => handleFieldChange('healthDepartmentNotified', e.target.checked)}
        />

        <FormField
          label="Other Authorities Notified"
          name="otherAuthorities"
          value={formData.otherAuthorities}
          onChange={(e) => handleFieldChange('otherAuthorities', e.target.value)}
          placeholder="Police, fire department, etc."
        />
      </FormSection>

      {/* Cleanup & Disposal */}
      <FormSection title="Cleanup and Disposal">
        <FormField
          label="Cleanup Completed?"
          name="cleanupCompleted"
          type="checkbox"
          value={formData.cleanupCompleted}
          onChange={(e) => handleFieldChange('cleanupCompleted', e.target.checked)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Cleanup Completed By"
            name="cleanupBy"
            value={formData.cleanupBy}
            onChange={(e) => handleFieldChange('cleanupBy', e.target.value)}
          />

          <FormField
            label="Disposal Method"
            name="disposalMethod"
            value={formData.disposalMethod}
            onChange={(e) => handleFieldChange('disposalMethod', e.target.value)}
            placeholder="Incineration, landfill, recycling, etc."
          />
        </div>

        <FormField
          label="Disposal Location/Contractor"
          name="disposalLocation"
          value={formData.disposalLocation}
          onChange={(e) => handleFieldChange('disposalLocation', e.target.value)}
        />

        <FormField
          label="Waste Documentation/References"
          name="wasteDocumentation"
          type="textarea"
          value={formData.wasteDocumentation}
          onChange={(e) => handleFieldChange('wasteDocumentation', e.target.value)}
          placeholder="Waste manifest numbers, certificates, etc."
          rows={2}
        />
      </FormSection>

      {/* Investigation */}
      <FormSection title="Root Cause Investigation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Investigated By"
            name="investigatedBy"
            value={formData.investigatedBy}
            onChange={(e) => handleFieldChange('investigatedBy', e.target.value)}
          />

          <FormField
            label="Investigation Date"
            name="investigationDate"
            type="date"
            value={formData.investigationDate}
            onChange={(e) => handleFieldChange('investigationDate', e.target.value)}
          />
        </div>

        <FormField
          label="Root Cause"
          name="rootCause"
          type="textarea"
          value={formData.rootCause}
          onChange={(e) => handleFieldChange('rootCause', e.target.value)}
          placeholder="Why did this spill occur?"
          rows={3}
        />

        <CheckboxArray
          label="Contributing Factors"
          name="contributingFactors"
          items={contributingFactorOptions}
          values={formData.contributingFactors}
          onChange={(e) => handleFieldChange('contributingFactors', e.target.value)}
        />

        <FormField
          label="Preventive Measures"
          name="preventiveMeasures"
          type="textarea"
          value={formData.preventiveMeasures}
          onChange={(e) => handleFieldChange('preventiveMeasures', e.target.value)}
          placeholder="Actions to prevent recurrence"
          rows={3}
        />

        <FormField
          label="Action Items"
          name="actionItems"
          type="textarea"
          value={formData.actionItems}
          onChange={(e) => handleFieldChange('actionItems', e.target.value)}
          placeholder="Specific follow-up actions, responsible parties, deadlines"
          rows={3}
        />
      </FormSection>

      {/* Additional Notes */}
      <FormSection title="Additional Information">
        <FormField
          label="Notes"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Any additional information"
          rows={4}
        />
      </FormSection>

      {/* Photo Evidence */}
      <FormSection title="Photo Documentation">
        <PhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onCaptionUpdate={handleCaptionUpdate}
          onPhotoDelete={handlePhotoDelete}
          label="Document spill area and cleanup activities"
          maxImages={12}
        />
      </FormSection>

      {/* Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={handleSaveDraft}
          disabled={isLoading || isSaving}
          className="px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold rounded transition whitespace-nowrap"
        >
          {isSaving ? 'Saving…' : currentFormId ? 'Update Draft' : 'Save Draft'}
        </button>

        <button
          onClick={handleSubmit}
          disabled={isLoading || isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold rounded transition"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Preview & Submit
            </>
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={isLoading || isSaving}
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-semibold rounded transition"
        >
          Cancel
        </button>
      </div>

      {/* Form Preview Modal */}
      <FormPreviewModal
        isOpen={showPreview}
        formTitle="Spill/Release Report"
        formData={formData}
        onConfirm={handleConfirmSubmit}
        onEdit={() => setShowPreview(false)}
        onClose={() => setShowPreview(false)}
        isSubmitting={isLoading}
        submitButtonText="Confirm & Submit Report"
      />
    </div>
  );
};

export default SpillReleaseForm;
