/**
 * Injury/Incident Report Form
 * Quick reporting system for workplace incidents
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
import { submitInjuryReport, saveDraft, submitDraft } from '../../services/forms';
import { getFacilityOptions } from '../../constants/facilities';

const InjuryReportForm = ({ onSuccess, onCancel, formId: initialFormId = null, initialData = null }) => {
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

    // Incident Details
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: new Date().toTimeString().slice(0, 5),
    incidentLocation: '',
    description: '',

    // Injured Person
    employeeName: '',
    employeeId: '',
    jobTitle: '',
    department: '',
    yearsEmployed: '',

    // Injury Details
    bodyPartAffected: '',
    injuryType: '',
    severity: 'minor', // minor, moderate, severe

    // Treatment
    treatmentAtWork: false,
    treatedBy: '',
    medicalAttention: false,
    hospitalName: '',

    // Witnesses
    witnesses: '',

    // Root Cause
    immediateActor: '', // What directly caused the incident
    underlyingCauses: [], // Contributing factors

    // Corrective Actions
    immediateActions: '', // Actions taken immediately
    preventiveMeasures: '', // Actions to prevent recurrence

    // Report Details
    reportedBy: '',
    reportDate: new Date().toISOString().split('T')[0],
    investigatedBy: '',
    investigationNotes: '',
    ...(initialData || {}),
  }));

  const bodyParts = [
    'Head',
    'Face',
    'Eyes',
    'Ears',
    'Neck',
    'Shoulder',
    'Arms',
    'Elbows',
    'Wrists',
    'Hands',
    'Fingers',
    'Chest',
    'Back',
    'Abdomen',
    'Hip',
    'Legs',
    'Knees',
    'Ankles',
    'Feet',
    'Toes',
    'Multiple'
  ];

  const injuryTypes = [
    'Cut/Laceration',
    'Puncture Wound',
    'Burn',
    'Fracture',
    'Sprain/Strain',
    'Bruise/Contusion',
    'Crushing Injury',
    'Amputation',
    'Chemical Burn',
    'Frostbite',
    'Heat Stress',
    'Occupational Disease',
    'Eye Injury',
    'Foreign Object in Eye',
    'Other'
  ];

  const underlyingCauseOptions = [
    { id: 'inadequate-training', label: 'Inadequate Training' },
    { id: 'procedural', label: 'Procedural Violation' },
    { id: 'equipment-failure', label: 'Equipment Failure' },
    { id: 'worn-equipment', label: 'Worn/Damaged Equipment' },
    { id: 'ppe-failure', label: 'PPE Failure/Not Worn' },
    { id: 'poor-maintenance', label: 'Poor Maintenance' },
    { id: 'inadequate-guards', label: 'Inadequate Guards' },
    { id: 'slippery-surface', label: 'Slippery/Wet Surface' },
    { id: 'poor-lighting', label: 'Poor Lighting' },
    { id: 'fatigue', label: 'Employee Fatigue' },
    { id: 'rushing', label: 'Rushing/Pressure' },
    { id: 'communication', label: 'Communication Failure' },
    { id: 'environmental', label: 'Environmental Factors' },
    { id: 'other', label: 'Other' }
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
      const result = await saveDraft('injury', formData, capturedPhotos, currentFormId);
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
        underlyingCauses: formData.underlyingCauses.join(', ')
      };

      let response;
      if (currentFormId) {
        response = await submitDraft(currentFormId, submissionData, capturedPhotos);
      } else {
        response = await submitInjuryReport(submissionData, capturedPhotos);
      }
      const newId = response?.id || response?.formId || response?.data?.id || currentFormId;
      if (newId) setCurrentFormId(newId);

      setSuccessMessage(`Injury report submitted successfully! Reference: ${response?.id || newId}`);
      setShowPreview(false);

      if (onSuccess) {
        setTimeout(() => onSuccess(response), 1500);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit report. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle size={28} className="text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Injury/Incident Report Form</h2>
      </div>
      <p className="text-gray-600 mb-6">Report workplace injuries and incidents for safety investigation</p>

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

      {/* Incident Details */}
      <FormSection title="Incident Details" description="Information about when and where the incident occurred">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <FormField
          label="Location of Incident"
          name="incidentLocation"
          value={formData.incidentLocation}
          onChange={(e) => handleFieldChange('incidentLocation', e.target.value)}
          placeholder="Specific area/department where incident occurred"
          error={errors.incidentLocation}
          required
        />

        <FormField
          label="Description of Incident"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Explain exactly what happened"
          rows={4}
          maxLength={1000}
          error={errors.description}
          required
        />
      </FormSection>

      {/* Injured Person Information */}
      <FormSection title="Employee Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Employee Name"
            name="employeeName"
            value={formData.employeeName}
            onChange={(e) => handleFieldChange('employeeName', e.target.value)}
            error={errors.employeeName}
            required
          />

          <FormField
            label="Employee ID"
            name="employeeId"
            value={formData.employeeId}
            onChange={(e) => handleFieldChange('employeeId', e.target.value)}
          />

          <FormField
            label="Job Title"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
          />

          <FormField
            label="Department"
            name="department"
            value={formData.department}
            onChange={(e) => handleFieldChange('department', e.target.value)}
          />

          <FormField
            label="Years Employed"
            name="yearsEmployed"
            type="number"
            value={formData.yearsEmployed}
            onChange={(e) => handleFieldChange('yearsEmployed', e.target.value)}
          />
        </div>
      </FormSection>

      {/* Injury Details */}
      <FormSection title="Injury Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Body Part Affected"
            name="bodyPartAffected"
            type="select"
            value={formData.bodyPartAffected}
            onChange={(e) => handleFieldChange('bodyPartAffected', e.target.value)}
            options={bodyParts}
            error={errors.bodyPartAffected}
            required
          />

          <FormField
            label="Type of Injury"
            name="injuryType"
            type="select"
            value={formData.injuryType}
            onChange={(e) => handleFieldChange('injuryType', e.target.value)}
            options={injuryTypes}
            error={errors.injuryType}
            required
          />

          <FormField
            label="Severity Level"
            name="severity"
            type="select"
            value={formData.severity}
            onChange={(e) => handleFieldChange('severity', e.target.value)}
            options={[
              { value: 'minor', label: 'Minor (First Aid)' },
              { value: 'moderate', label: 'Moderate (Medical Treatment)' },
              { value: 'severe', label: 'Severe (Hospitalization)' }
            ]}
          />
        </div>
      </FormSection>

      {/* Treatment Information */}
      <FormSection title="Treatment Information">
        <FormField
          label="Employee Treated at Work?"
          name="treatmentAtWork"
          type="checkbox"
          value={formData.treatmentAtWork}
          onChange={(e) => handleFieldChange('treatmentAtWork', e.target.checked)}
        />

        {formData.treatmentAtWork && (
          <FormField
            label="Treated By"
            name="treatedBy"
            value={formData.treatedBy}
            onChange={(e) => handleFieldChange('treatedBy', e.target.value)}
            placeholder="Name of person who provided treatment"
          />
        )}

        <FormField
          label="Required Medical Attention Off-Site?"
          name="medicalAttention"
          type="checkbox"
          value={formData.medicalAttention}
          onChange={(e) => handleFieldChange('medicalAttention', e.target.checked)}
        />

        {formData.medicalAttention && (
          <FormField
            label="Hospital/Clinic Name"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={(e) => handleFieldChange('hospitalName', e.target.value)}
          />
        )}
      </FormSection>

      {/* Witnesses */}
      <FormSection title="Witnesses">
        <FormField
          label="Witnesses"
          name="witnesses"
          type="textarea"
          value={formData.witnesses}
          onChange={(e) => handleFieldChange('witnesses', e.target.value)}
          placeholder="List names of witnesses"
          rows={3}
        />
      </FormSection>

      {/* Root Cause Analysis */}
      <FormSection title="Root Cause Analysis">
        <FormField
          label="Immediate Cause (Direct Event)"
          name="immediateActor"
          type="textarea"
          value={formData.immediateActor}
          onChange={(e) => handleFieldChange('immediateActor', e.target.value)}
          placeholder="What directly caused the injury?"
          rows={3}
        />

        <CheckboxArray
          label="Contributing Factors (Select All That Apply)"
          name="underlyingCauses"
          items={underlyingCauseOptions}
          values={formData.underlyingCauses}
          onChange={(e) => handleFieldChange('underlyingCauses', e.target.value)}
        />

        <FormField
          label="Immediate Actions Taken"
          name="immediateActions"
          type="textarea"
          value={formData.immediateActions}
          onChange={(e) => handleFieldChange('immediateActions', e.target.value)}
          placeholder="Actions taken immediately after the incident"
          rows={3}
        />

        <FormField
          label="Preventive Measures"
          name="preventiveMeasures"
          type="textarea"
          value={formData.preventiveMeasures}
          onChange={(e) => handleFieldChange('preventiveMeasures', e.target.value)}
          placeholder="Actions to prevent similar incidents"
          rows={3}
        />
      </FormSection>

      {/* Report Information */}
      <FormSection title="Report Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Reported By"
            name="reportedBy"
            value={formData.reportedBy}
            onChange={(e) => handleFieldChange('reportedBy', e.target.value)}
            error={errors.reportedBy}
            required
          />

          <FormField
            label="Report Date"
            name="reportDate"
            type="date"
            value={formData.reportDate}
            onChange={(e) => handleFieldChange('reportDate', e.target.value)}
          />

          <FormField
            label="Investigated By"
            name="investigatedBy"
            value={formData.investigatedBy}
            onChange={(e) => handleFieldChange('investigatedBy', e.target.value)}
          />
        </div>

        <FormField
          label="Investigation Notes"
          name="investigationNotes"
          type="textarea"
          value={formData.investigationNotes}
          onChange={(e) => handleFieldChange('investigationNotes', e.target.value)}
          placeholder="Additional investigation details"
          rows={4}
        />
      </FormSection>

      {/* Photo Evidence */}
      <FormSection title="Photo Evidence">
        <PhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onCaptionUpdate={handleCaptionUpdate}
          onPhotoDelete={handlePhotoDelete}
          label="Capture Photos of Incident/Injury Area"
          maxImages={8}
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded transition"
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
        formTitle="Injury/Incident Report"
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

export default InjuryReportForm;
