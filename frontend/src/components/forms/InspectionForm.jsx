/**
 * Monthly Facility Inspection Form
 * Routine inspection of facility areas and equipment
 */

import React, { useState, useCallback } from 'react';
import { CheckSquare, CheckCircle } from 'lucide-react';
import PhotoCapture from '../common/PhotoCapture';
import { FormPreviewModal } from '../common/FormPreviewModal';
import {
  FormSection,
  FormField,
  FormAlert,
} from './FormComponents';
import { submitInspection, saveDraft, submitDraft } from '../../services/forms';
import { getFacilityOptions } from '../../constants/facilities';

const InspectionForm = ({ onSuccess, onCancel, formId: initialFormId = null, initialData = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(initialFormId);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [deficiencies, setDeficiencies] = useState(
    Array.isArray(initialData?.deficiencies) ? initialData.deficiencies : [{ item: '', description: '', correctionDate: '', responsible: '' }]
  );
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState(() => ({
    // Facility
    facility: '',

    // Inspection Info
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectionType: 'monthly',
    inspectionArea: '',
    otherArea: '',

    // Inspector Info
    inspectorName: '',
    inspectorTitle: '',

    // Checklist Items - Safety
    fireExtinguishers: 'pass', // pass, fail, na
    fireExits: 'pass',
    emergencyLights: 'pass',
    firstAidKit: 'pass',
    eyewash: 'pass',
    safetyShower: 'pass',
    aed: 'pass',

    // Checklist Items - Housekeeping
    floorCondition: 'pass',
    clutter: 'pass',
    trippingHazards: 'pass',
    spills: 'pass',
    waste: 'pass',
    organized: 'pass',

    // Checklist Items - Equipment
    machineGuards: 'pass',
    lockoutTags: 'pass',
    electricalCondition: 'pass',
    toolCondition: 'pass',
    equipmentMaintenance: 'pass',

    // Checklist Items - PPE
    ppeAvailable: 'pass',
    ppeCondition: 'pass',
    ppeSignage: 'pass',

    // Checklist Items - Storage
    chemicalStorage: 'pass',
    sdsAccess: 'pass',
    storageAir: 'pass',
    labelingSystem: 'pass',

    // Checklist Items - Environmental
    temperature: 'pass',
    lighting: 'pass',
    ventilation: 'pass',
    noise: 'pass',

    // General
    deficienciesFound: false,
    overallCondition: 'excellent', // excellent, good, fair, poor
    safetyObservations: '',
    recommendations: '',
    followUpNeeded: false,
    followUpDate: '',

    // Sign-Off
    supervisorName: '',
    supervisorDate: new Date().toISOString().split('T')[0],
    notes: '',
    ...(initialData || {}),
  }));

  const inspectionAreas = [
    'Production Floor',
    'Warehouse',
    'Packaging Area',
    'Freezer/Cold Storage',
    'Chemical Storage',
    'Maintenance Shop',
    'Office Area',
    'Restrooms',
    'Cafeteria',
    'Loading Dock',
    'Vehicle Area',
    'Other'
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

  const handleDeficiencyChange = (index, field, value) => {
    const updated = [...deficiencies];
    updated[index] = { ...updated[index], [field]: value };
    setDeficiencies(updated);
  };

  const addDeficiency = () => {
    setDeficiencies([...deficiencies, { item: '', description: '', correctionDate: '', responsible: '' }]);
  };

  const removeDeficiency = (index) => {
    if (deficiencies.length > 1) {
      setDeficiencies(deficiencies.filter((_, i) => i !== index));
    }
  };

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
      const draftData = { ...formData, deficiencies };
      const result = await saveDraft('inspection', draftData, capturedPhotos, currentFormId);
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
        deficiencies: JSON.stringify(deficiencies)
      };

      let response;
      if (currentFormId) {
        response = await submitDraft(currentFormId, submissionData, capturedPhotos);
      } else {
        response = await submitInspection(submissionData, capturedPhotos);
      }
      const newId = response?.id || response?.formId || response?.data?.id || currentFormId;
      if (newId) setCurrentFormId(newId);

      setSuccessMessage(`Inspection report submitted successfully! Reference: ${response?.id || newId}`);
      setShowPreview(false);

      if (onSuccess) {
        setTimeout(() => onSuccess(response), 1500);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit inspection report. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ChecklistItem = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100 hover:bg-gray-50">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className={`px-3 py-1 text-sm font-semibold rounded border-0 ${
          value === 'pass'
            ? 'bg-green-100 text-green-800'
            : value === 'fail'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
        }`}
      >
        <option value="pass">PASS</option>
        <option value="fail">FAIL</option>
        <option value="na">N/A</option>
      </select>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <CheckSquare size={28} className="text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Facility Inspection Form</h2>
      </div>
      <p className="text-gray-600 mb-6">Monthly facility and equipment safety inspection</p>

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

      {/* Inspection Information */}
      <FormSection title="Inspection Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Inspection Date"
            name="inspectionDate"
            type="date"
            value={formData.inspectionDate}
            onChange={(e) => handleFieldChange('inspectionDate', e.target.value)}
            error={errors.inspectionDate}
            required
          />

          <FormField
            label="Inspection Type"
            name="inspectionType"
            type="select"
            value={formData.inspectionType}
            onChange={(e) => handleFieldChange('inspectionType', e.target.value)}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'annual', label: 'Annual' },
              { value: 'incident-related', label: 'Incident Related' },
              { value: 'follow-up', label: 'Follow-up' }
            ]}
          />

          <FormField
            label="Area Inspected"
            name="inspectionArea"
            type="select"
            value={formData.inspectionArea}
            onChange={(e) => handleFieldChange('inspectionArea', e.target.value)}
            options={inspectionAreas}
            error={errors.inspectionArea}
            required
          />
        </div>

        {formData.inspectionArea === 'Other' && (
          <FormField
            label="Specify Area"
            name="otherArea"
            value={formData.otherArea}
            onChange={(e) => handleFieldChange('otherArea', e.target.value)}
            error={errors.otherArea}
            required
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Inspector Name"
            name="inspectorName"
            value={formData.inspectorName}
            onChange={(e) => handleFieldChange('inspectorName', e.target.value)}
            error={errors.inspectorName}
            required
          />

          <FormField
            label="Inspector Title"
            name="inspectorTitle"
            value={formData.inspectorTitle}
            onChange={(e) => handleFieldChange('inspectorTitle', e.target.value)}
          />
        </div>
      </FormSection>

      {/* Emergency Safety */}
      <FormSection title="Emergency Equipment & Safety">
        <ChecklistItem
          label="Fire extinguishers present and accessible"
          value={formData.fireExtinguishers}
          onChange={(e) => handleFieldChange('fireExtinguishers', e.target.value)}
        />
        <ChecklistItem
          label="Fire exits marked and unobstructed"
          value={formData.fireExits}
          onChange={(e) => handleFieldChange('fireExits', e.target.value)}
        />
        <ChecklistItem
          label="Emergency lights functional"
          value={formData.emergencyLights}
          onChange={(e) => handleFieldChange('emergencyLights', e.target.value)}
        />
        <ChecklistItem
          label="First aid kit available and stocked"
          value={formData.firstAidKit}
          onChange={(e) => handleFieldChange('firstAidKit', e.target.value)}
        />
        <ChecklistItem
          label="Eyewash station accessible"
          value={formData.eyewash}
          onChange={(e) => handleFieldChange('eyewash', e.target.value)}
        />
        <ChecklistItem
          label="Safety shower functional"
          value={formData.safetyShower}
          onChange={(e) => handleFieldChange('safetyShower', e.target.value)}
        />
        <ChecklistItem
          label="AED available"
          value={formData.aed}
          onChange={(e) => handleFieldChange('aed', e.target.value)}
        />
      </FormSection>

      {/* Housekeeping */}
      <FormSection title="Housekeeping and General Conditions">
        <ChecklistItem
          label="Floor clean and undamaged"
          value={formData.floorCondition}
          onChange={(e) => handleFieldChange('floorCondition', e.target.value)}
        />
        <ChecklistItem
          label="Area free of clutter"
          value={formData.clutter}
          onChange={(e) => handleFieldChange('clutter', e.target.value)}
        />
        <ChecklistItem
          label="No tripping hazards"
          value={formData.trippingHazards}
          onChange={(e) => handleFieldChange('trippingHazards', e.target.value)}
        />
        <ChecklistItem
          label="No spills or leaks"
          value={formData.spills}
          onChange={(e) => handleFieldChange('spills', e.target.value)}
        />
        <ChecklistItem
          label="Waste properly contained"
          value={formData.waste}
          onChange={(e) => handleFieldChange('waste', e.target.value)}
        />
        <ChecklistItem
          label="Items organized and properly stored"
          value={formData.organized}
          onChange={(e) => handleFieldChange('organized', e.target.value)}
        />
      </FormSection>

      {/* Equipment */}
      <FormSection title="Equipment & Machinery">
        <ChecklistItem
          label="Machine guards in place"
          value={formData.machineGuards}
          onChange={(e) => handleFieldChange('machineGuards', e.target.value)}
        />
        <ChecklistItem
          label="Lockout tags properly placed"
          value={formData.lockoutTags}
          onChange={(e) => handleFieldChange('lockoutTags', e.target.value)}
        />
        <ChecklistItem
          label="Electrical equipment in good condition"
          value={formData.electricalCondition}
          onChange={(e) => handleFieldChange('electricalCondition', e.target.value)}
        />
        <ChecklistItem
          label="Hand tools in good condition"
          value={formData.toolCondition}
          onChange={(e) => handleFieldChange('toolCondition', e.target.value)}
        />
        <ChecklistItem
          label="Equipment maintenance current"
          value={formData.equipmentMaintenance}
          onChange={(e) => handleFieldChange('equipmentMaintenance', e.target.value)}
        />
      </FormSection>

      {/* PPE */}
      <FormSection title="Personal Protective Equipment">
        <ChecklistItem
          label="Proper PPE available for area"
          value={formData.ppeAvailable}
          onChange={(e) => handleFieldChange('ppeAvailable', e.target.value)}
        />
        <ChecklistItem
          label="PPE in good condition"
          value={formData.ppeCondition}
          onChange={(e) => handleFieldChange('ppeCondition', e.target.value)}
        />
        <ChecklistItem
          label="PPE requirements clearly posted"
          value={formData.ppeSignage}
          onChange={(e) => handleFieldChange('ppeSignage', e.target.value)}
        />
      </FormSection>

      {/* Storage */}
      <FormSection title="Chemical & Material Storage">
        <ChecklistItem
          label="Chemicals stored properly"
          value={formData.chemicalStorage}
          onChange={(e) => handleFieldChange('chemicalStorage', e.target.value)}
        />
        <ChecklistItem
          label="SDS readily accessible"
          value={formData.sdsAccess}
          onChange={(e) => handleFieldChange('sdsAccess', e.target.value)}
        />
        <ChecklistItem
          label="Storage area well ventilated"
          value={formData.storageAir}
          onChange={(e) => handleFieldChange('storageAir', e.target.value)}
        />
        <ChecklistItem
          label="All containers properly labeled"
          value={formData.labelingSystem}
          onChange={(e) => handleFieldChange('labelingSystem', e.target.value)}
        />
      </FormSection>

      {/* Environmental */}
      <FormSection title="Environmental Conditions">
        <ChecklistItem
          label="Temperature appropriate"
          value={formData.temperature}
          onChange={(e) => handleFieldChange('temperature', e.target.value)}
        />
        <ChecklistItem
          label="Lighting adequate"
          value={formData.lighting}
          onChange={(e) => handleFieldChange('lighting', e.target.value)}
        />
        <ChecklistItem
          label="Ventilation adequate"
          value={formData.ventilation}
          onChange={(e) => handleFieldChange('ventilation', e.target.value)}
        />
        <ChecklistItem
          label="Noise levels acceptable"
          value={formData.noise}
          onChange={(e) => handleFieldChange('noise', e.target.value)}
        />
      </FormSection>

      {/* Overall Assessment */}
      <FormSection title="Overall Assessment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Overall Condition"
            name="overallCondition"
            type="select"
            value={formData.overallCondition}
            onChange={(e) => handleFieldChange('overallCondition', e.target.value)}
            options={[
              { value: 'excellent', label: 'Excellent' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' }
            ]}
          />

          <FormField
            label="Deficiencies Found?"
            name="deficienciesFound"
            type="checkbox"
            value={formData.deficienciesFound}
            onChange={(e) => handleFieldChange('deficienciesFound', e.target.checked)}
          />
        </div>

        <FormField
          label="Safety Observations"
          name="safetyObservations"
          type="textarea"
          value={formData.safetyObservations}
          onChange={(e) => handleFieldChange('safetyObservations', e.target.value)}
          placeholder="Notable observations about safety conditions"
          rows={3}
        />

        <FormField
          label="Recommendations"
          name="recommendations"
          type="textarea"
          value={formData.recommendations}
          onChange={(e) => handleFieldChange('recommendations', e.target.value)}
          placeholder="Recommendations for improvement"
          rows={3}
        />
      </FormSection>

      {/* Deficiencies */}
      {formData.deficienciesFound && (
        <FormSection title="Deficiencies Identified">
          {deficiencies.map((deficiency, index) => (
            <div key={index} className="mb-4 p-4 bg-red-50 rounded border border-red-200">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-red-900">Deficiency {index + 1}</span>
                {deficiencies.length > 1 && (
                  <button
                    onClick={() => removeDeficiency(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  placeholder="Item/Area"
                  value={deficiency.item}
                  onChange={(e) => handleDeficiencyChange(index, 'item', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <textarea
                  placeholder="Description of deficiency"
                  value={deficiency.description}
                  onChange={(e) => handleDeficiencyChange(index, 'description', e.target.value)}
                  rows={2}
                  className="px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="date"
                    placeholder="Correction Date"
                    value={deficiency.correctionDate}
                    onChange={(e) => handleDeficiencyChange(index, 'correctionDate', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Responsible Person"
                    value={deficiency.responsible}
                    onChange={(e) => handleDeficiencyChange(index, 'responsible', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addDeficiency}
            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded font-semibold text-sm"
          >
            + Add Deficiency
          </button>
        </FormSection>
      )}

      {/* Follow-up */}
      <FormSection title="Follow-up">
        <FormField
          label="Follow-up Inspection Needed?"
          name="followUpNeeded"
          type="checkbox"
          value={formData.followUpNeeded}
          onChange={(e) => handleFieldChange('followUpNeeded', e.target.checked)}
        />

        {formData.followUpNeeded && (
          <FormField
            label="Scheduled Follow-up Date"
            name="followUpDate"
            type="date"
            value={formData.followUpDate}
            onChange={(e) => handleFieldChange('followUpDate', e.target.value)}
          />
        )}
      </FormSection>

      {/* Sign-off */}
      <FormSection title="Inspector Sign-off">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Supervisor/Manager Name"
            name="supervisorName"
            value={formData.supervisorName}
            onChange={(e) => handleFieldChange('supervisorName', e.target.value)}
          />

          <FormField
            label="Date"
            name="supervisorDate"
            type="date"
            value={formData.supervisorDate}
            onChange={(e) => handleFieldChange('supervisorDate', e.target.value)}
          />
        </div>

        <FormField
          label="Additional Notes"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Any additional comments or observations"
          rows={3}
        />
      </FormSection>

      {/* Photos */}
      <FormSection title="Photo Documentation">
        <PhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onCaptionUpdate={handleCaptionUpdate}
          onPhotoDelete={handlePhotoDelete}
          label="Document facility conditions and any deficiencies"
          maxImages={10}
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded transition"
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
        formTitle="Facility Inspection Report"
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

export default InspectionForm;
