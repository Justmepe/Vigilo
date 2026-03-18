/**
 * Accident Report Form
 * Documents vehicle and equipment accidents
 */

import React, { useState, useCallback } from 'react';
import { AlertOctagon, CheckCircle } from 'lucide-react';
import PhotoCapture from '../common/PhotoCapture';
import { FormPreviewModal } from '../common/FormPreviewModal';
import {
  FormSection,
  FormField,
  FormAlert,
} from './FormComponents';
import { submitAccidentReport, saveDraft, submitDraft } from '../../services/forms';
import { getFacilityOptions } from '../../constants/facilities';

const AccidentReportForm = ({ onSuccess, onCancel, formId: initialFormId = null, initialData = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(initialFormId);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [witnesses, setWitnesses] = useState(
    Array.isArray(initialData?.witnesses) ? initialData.witnesses : [{ name: '', phone: '', email: '' }]
  );
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState(() => ({
    // Facility
    facility: '',

    // Accident Information
    accidentDate: new Date().toISOString().split('T')[0],
    accidentTime: new Date().toTimeString().slice(0, 5),
    location: '',
    address: '',
    city: '',
    state: '',
    accidentType: 'vehicle', // vehicle, equipment, property
    reportedDate: new Date().toISOString().split('T')[0],
    reportedBy: '',

    // Weather Conditions
    weatherConditions: '',
    visibility: '', // excellent, good, fair, poor
    roadConditions: '', // dry, wet, snow, ice, gravel

    // Vehicle Information (if applicable)
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    licensePlate: '',
    vin: '',
    vehicleOwner: '',

    // Driver Information
    driverName: '',
    driverLicense: '',
    driverPhone: '',
    driverAddress: '',
    yearsEmployed: '',
    violationHistory: false,

    // Property/Equipment Involved
    thirdPartyInvolved: false,
    thirdPartyName: '',
    thirdPartyVehicle: '',
    thirdPartyVehicleId: '',
    thirdPartyInsurance: '',
    thirdPartyPolicyNumber: '',

    // Damage Assessment
    vehicleDamage: '', // negligible, minor, moderate, severe, total
    estimatedRepairCost: '',
    thirdPartyDamage: '',
    propertyDamage: '',
    estimatedPropertyDamage: '',

    // Accident Details
    accidentDescription: '',
    causation: '',
    speedInvolved: false,
    speed: '',
    defectiveEquipment: false,
    equipmentDefect: '',
    lightingConditions: 'daylight',

    // Injuries
    injuriesReported: false,
    injuryDetails: '',
    medicalAttention: false,
    hospital: '',

    // Police Involvement
    policeResponded: false,
    policeAgency: '',
    policeReportNumber: '',
    officerName: '',
    citedResponsible: '', // vehicle/person responsible for accident

    // Insurance Details
    companyInsuranceCarrier: '',
    policyNumber: '',
    claimNumber: '',
    claimDate: '',

    // Investigation
    investigatedBy: '',
    investigationDate: new Date().toISOString().split('T')[0],
    rootCause: '',
    preventiveMeasures: '',
    followUpActions: '',

    // Additional Notes
    notes: '',
    ...(initialData || {}),
  }));

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

  const handleWitnessChange = (index, field, value) => {
    const updated = [...witnesses];
    updated[index] = { ...updated[index], [field]: value };
    setWitnesses(updated);
  };

  const addWitness = () => {
    setWitnesses([...witnesses, { name: '', phone: '', email: '' }]);
  };

  const removeWitness = (index) => {
    if (witnesses.length > 1) {
      setWitnesses(witnesses.filter((_, i) => i !== index));
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
      const draftData = { ...formData, witnesses };
      const result = await saveDraft('accident', draftData, capturedPhotos, currentFormId);
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
        witnesses: JSON.stringify(witnesses)
      };

      let response;
      if (currentFormId) {
        response = await submitDraft(currentFormId, submissionData, capturedPhotos);
      } else {
        response = await submitAccidentReport(submissionData, capturedPhotos);
      }
      const newId = response?.id || response?.formId || response?.data?.id || currentFormId;
      if (newId) setCurrentFormId(newId);

      setSuccessMessage(`Accident report submitted successfully! Reference: ${response?.id || newId}`);
      setShowPreview(false);

      if (onSuccess) {
        setTimeout(() => onSuccess(response), 1500);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit accident report. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <AlertOctagon size={28} className="text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Accident Report Form</h2>
      </div>
      <p className="text-gray-600 mb-6">Document vehicle and equipment accidents for investigation</p>

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

      {/* Accident Information */}
      <FormSection title="Accident Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Date of Accident"
            name="accidentDate"
            type="date"
            value={formData.accidentDate}
            onChange={(e) => handleFieldChange('accidentDate', e.target.value)}
            error={errors.accidentDate}
            required
          />

          <FormField
            label="Time of Accident"
            name="accidentTime"
            type="time"
            value={formData.accidentTime}
            onChange={(e) => handleFieldChange('accidentTime', e.target.value)}
          />

          <FormField
            label="Type of Accident"
            name="accidentType"
            type="select"
            value={formData.accidentType}
            onChange={(e) => handleFieldChange('accidentType', e.target.value)}
            options={[
              { value: 'vehicle', label: 'Vehicle Accident' },
              { value: 'equipment', label: 'Equipment Accident' },
              { value: 'property', label: 'Property Damage' }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Street Address"
            name="address"
            value={formData.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            placeholder="Street address"
          />

          <FormField
            label="Location Name"
            name="location"
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="e.g., Warehouse parking lot, Loading dock"
            error={errors.location}
            required
          />

          <FormField
            label="City"
            name="city"
            value={formData.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
          />

          <FormField
            label="State/Province"
            name="state"
            value={formData.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Date Reported"
            name="reportedDate"
            type="date"
            value={formData.reportedDate}
            onChange={(e) => handleFieldChange('reportedDate', e.target.value)}
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

      {/* Weather & Road Conditions */}
      <FormSection title="Environmental Conditions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Weather Conditions"
            name="weatherConditions"
            type="select"
            value={formData.weatherConditions}
            onChange={(e) => handleFieldChange('weatherConditions', e.target.value)}
            options={['Clear', 'Cloudy', 'Rain', 'Snow', 'Fog', 'Hail', 'Ice', 'Wind']}
          />

          <FormField
            label="Visibility"
            name="visibility"
            type="select"
            value={formData.visibility}
            onChange={(e) => handleFieldChange('visibility', e.target.value)}
            options={[
              { value: 'excellent', label: 'Excellent' },
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' }
            ]}
          />

          <FormField
            label="Road Conditions"
            name="roadConditions"
            type="select"
            value={formData.roadConditions}
            onChange={(e) => handleFieldChange('roadConditions', e.target.value)}
            options={['Dry', 'Wet', 'Snow', 'Ice', 'Gravel', 'Debris']}
          />
        </div>

        <FormField
          label="Lighting Conditions"
          name="lightingConditions"
          type="select"
          value={formData.lightingConditions}
          onChange={(e) => handleFieldChange('lightingConditions', e.target.value)}
          options={['Daylight', 'Dusk', 'Dawn', 'Darkness (streetlights)', 'Darkness (no lights)']}
        />
      </FormSection>

      {/* Vehicle Information */}
      <FormSection title="Vehicle Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Vehicle Year"
            name="vehicleYear"
            type="number"
            value={formData.vehicleYear}
            onChange={(e) => handleFieldChange('vehicleYear', e.target.value)}
          />

          <FormField
            label="Make"
            name="vehicleMake"
            value={formData.vehicleMake}
            onChange={(e) => handleFieldChange('vehicleMake', e.target.value)}
          />

          <FormField
            label="Model"
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={(e) => handleFieldChange('vehicleModel', e.target.value)}
          />

          <FormField
            label="Color"
            name="vehicleColor"
            value={formData.vehicleColor}
            onChange={(e) => handleFieldChange('vehicleColor', e.target.value)}
          />

          <FormField
            label="License Plate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={(e) => handleFieldChange('licensePlate', e.target.value)}
          />

          <FormField
            label="VIN"
            name="vin"
            value={formData.vin}
            onChange={(e) => handleFieldChange('vin', e.target.value)}
          />
        </div>

        <FormField
          label="Vehicle Owner"
          name="vehicleOwner"
          value={formData.vehicleOwner}
          onChange={(e) => handleFieldChange('vehicleOwner', e.target.value)}
        />
      </FormSection>

      {/* Driver Information */}
      <FormSection title="Driver Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Driver Name"
            name="driverName"
            value={formData.driverName}
            onChange={(e) => handleFieldChange('driverName', e.target.value)}
            error={errors.driverName}
            required
          />

          <FormField
            label="Driver's License Number"
            name="driverLicense"
            value={formData.driverLicense}
            onChange={(e) => handleFieldChange('driverLicense', e.target.value)}
          />

          <FormField
            label="Phone"
            name="driverPhone"
            type="tel"
            value={formData.driverPhone}
            onChange={(e) => handleFieldChange('driverPhone', e.target.value)}
          />

          <FormField
            label="Address"
            name="driverAddress"
            value={formData.driverAddress}
            onChange={(e) => handleFieldChange('driverAddress', e.target.value)}
          />

          <FormField
            label="Years Employed"
            name="yearsEmployed"
            type="number"
            value={formData.yearsEmployed}
            onChange={(e) => handleFieldChange('yearsEmployed', e.target.value)}
          />

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.violationHistory}
                onChange={(e) => handleFieldChange('violationHistory', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Prior violations?</span>
            </label>
          </div>
        </div>
      </FormSection>

      {/* Third Party Information */}
      <FormSection title="Third Party Information (if applicable)">
        <FormField
          label="Third Party Involved?"
          name="thirdPartyInvolved"
          type="checkbox"
          value={formData.thirdPartyInvolved}
          onChange={(e) => handleFieldChange('thirdPartyInvolved', e.target.checked)}
        />

        {formData.thirdPartyInvolved && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Third Party Name"
                name="thirdPartyName"
                value={formData.thirdPartyName}
                onChange={(e) => handleFieldChange('thirdPartyName', e.target.value)}
              />

              <FormField
                label="Third Party Vehicle"
                name="thirdPartyVehicle"
                value={formData.thirdPartyVehicle}
                onChange={(e) => handleFieldChange('thirdPartyVehicle', e.target.value)}
              />

              <FormField
                label="Vehicle ID/License Plate"
                name="thirdPartyVehicleId"
                value={formData.thirdPartyVehicleId}
                onChange={(e) => handleFieldChange('thirdPartyVehicleId', e.target.value)}
              />

              <FormField
                label="Insurance Company"
                name="thirdPartyInsurance"
                value={formData.thirdPartyInsurance}
                onChange={(e) => handleFieldChange('thirdPartyInsurance', e.target.value)}
              />

              <FormField
                label="Policy Number"
                name="thirdPartyPolicyNumber"
                value={formData.thirdPartyPolicyNumber}
                onChange={(e) => handleFieldChange('thirdPartyPolicyNumber', e.target.value)}
              />
            </div>
          </>
        )}
      </FormSection>

      {/* Damage Assessment */}
      <FormSection title="Damage Assessment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Vehicle Damage Level"
            name="vehicleDamage"
            type="select"
            value={formData.vehicleDamage}
            onChange={(e) => handleFieldChange('vehicleDamage', e.target.value)}
            options={[
              { value: 'negligible', label: 'Negligible' },
              { value: 'minor', label: 'Minor' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'severe', label: 'Severe' },
              { value: 'total', label: 'Total Loss' }
            ]}
          />

          <FormField
            label="Estimated Repair Cost"
            name="estimatedRepairCost"
            type="number"
            value={formData.estimatedRepairCost}
            onChange={(e) => handleFieldChange('estimatedRepairCost', e.target.value)}
            placeholder="$"
          />
        </div>

        <FormField
          label="Third Party Damage Description"
          name="thirdPartyDamage"
          type="textarea"
          value={formData.thirdPartyDamage}
          onChange={(e) => handleFieldChange('thirdPartyDamage', e.target.value)}
          placeholder="Describe damage to third party vehicle"
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Property Damage Description"
            name="propertyDamage"
            value={formData.propertyDamage}
            onChange={(e) => handleFieldChange('propertyDamage', e.target.value)}
            placeholder="If other property was damaged"
          />

          <FormField
            label="Estimated Property Damage"
            name="estimatedPropertyDamage"
            type="number"
            value={formData.estimatedPropertyDamage}
            onChange={(e) => handleFieldChange('estimatedPropertyDamage', e.target.value)}
            placeholder="$"
          />
        </div>
      </FormSection>

      {/* Accident Details */}
      <FormSection title="Accident Details">
        <FormField
          label="Detailed Description of Accident"
          name="accidentDescription"
          type="textarea"
          value={formData.accidentDescription}
          onChange={(e) => handleFieldChange('accidentDescription', e.target.value)}
          placeholder="Explain what happened, step-by-step"
          rows={5}
          error={errors.accidentDescription}
          required
        />

        <FormField
          label="Causation"
          name="causation"
          type="textarea"
          value={formData.causation}
          onChange={(e) => handleFieldChange('causation', e.target.value)}
          placeholder="What caused the accident?"
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.speedInvolved}
                onChange={(e) => handleFieldChange('speedInvolved', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Excessive speed?</span>
            </label>
          </div>

          {formData.speedInvolved && (
            <FormField
              label="Speed (mph/kmh)"
              name="speed"
              value={formData.speed}
              onChange={(e) => handleFieldChange('speed', e.target.value)}
            />
          )}
        </div>

        <FormField
          label="Defective Equipment?"
          name="defectiveEquipment"
          type="checkbox"
          value={formData.defectiveEquipment}
          onChange={(e) => handleFieldChange('defectiveEquipment', e.target.checked)}
        />

        {formData.defectiveEquipment && (
          <FormField
            label="Equipment Defect Description"
            name="equipmentDefect"
            value={formData.equipmentDefect}
            onChange={(e) => handleFieldChange('equipmentDefect', e.target.value)}
            placeholder="Describe mechanical failure or defect"
          />
        )}
      </FormSection>

      {/* Injuries */}
      <FormSection title="Injuries">
        <FormField
          label="Injuries Reported?"
          name="injuriesReported"
          type="checkbox"
          value={formData.injuriesReported}
          onChange={(e) => handleFieldChange('injuriesReported', e.target.checked)}
        />

        {formData.injuriesReported && (
          <>
            <FormField
              label="Injury Details"
              name="injuryDetails"
              type="textarea"
              value={formData.injuryDetails}
              onChange={(e) => handleFieldChange('injuryDetails', e.target.value)}
              placeholder="Describe injuries sustained"
              rows={3}
            />

            <FormField
              label="Medical Attention Required?"
              name="medicalAttention"
              type="checkbox"
              value={formData.medicalAttention}
              onChange={(e) => handleFieldChange('medicalAttention', e.target.checked)}
            />

            {formData.medicalAttention && (
              <FormField
                label="Hospital/Clinic"
                name="hospital"
                value={formData.hospital}
                onChange={(e) => handleFieldChange('hospital', e.target.value)}
              />
            )}
          </>
        )}
      </FormSection>

      {/* Witnesses */}
      <FormSection title="Witnesses">
        {witnesses.map((witness, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700">Witness {index + 1}</span>
              {witnesses.length > 1 && (
                <button
                  onClick={() => removeWitness(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={witness.name}
                onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={witness.phone}
                onChange={(e) => handleWitnessChange(index, 'phone', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={witness.email}
                onChange={(e) => handleWitnessChange(index, 'email', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addWitness}
          className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold text-sm"
        >
          + Add Witness
        </button>
      </FormSection>

      {/* Police Involvement */}
      <FormSection title="Police Report">
        <FormField
          label="Police Responded?"
          name="policeResponded"
          type="checkbox"
          value={formData.policeResponded}
          onChange={(e) => handleFieldChange('policeResponded', e.target.checked)}
        />

        {formData.policeResponded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Police Agency"
              name="policeAgency"
              value={formData.policeAgency}
              onChange={(e) => handleFieldChange('policeAgency', e.target.value)}
            />

            <FormField
              label="Police Report Number"
              name="policeReportNumber"
              value={formData.policeReportNumber}
              onChange={(e) => handleFieldChange('policeReportNumber', e.target.value)}
            />

            <FormField
              label="Officer Name"
              name="officerName"
              value={formData.officerName}
              onChange={(e) => handleFieldChange('officerName', e.target.value)}
            />

            <FormField
              label="Who Was Cited as Responsible?"
              name="citedResponsible"
              value={formData.citedResponsible}
              onChange={(e) => handleFieldChange('citedResponsible', e.target.value)}
            />
          </div>
        )}
      </FormSection>

      {/* Insurance */}
      <FormSection title="Insurance Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Insurance Carrier"
            name="companyInsuranceCarrier"
            value={formData.companyInsuranceCarrier}
            onChange={(e) => handleFieldChange('companyInsuranceCarrier', e.target.value)}
          />

          <FormField
            label="Policy Number"
            name="policyNumber"
            value={formData.policyNumber}
            onChange={(e) => handleFieldChange('policyNumber', e.target.value)}
          />

          <FormField
            label="Claim Number"
            name="claimNumber"
            value={formData.claimNumber}
            onChange={(e) => handleFieldChange('claimNumber', e.target.value)}
          />

          <FormField
            label="Claim Date"
            name="claimDate"
            type="date"
            value={formData.claimDate}
            onChange={(e) => handleFieldChange('claimDate', e.target.value)}
          />
        </div>
      </FormSection>

      {/* Investigation */}
      <FormSection title="Investigation">
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
          placeholder="Why did this accident occur?"
          rows={3}
        />

        <FormField
          label="Preventive Measures"
          name="preventiveMeasures"
          type="textarea"
          value={formData.preventiveMeasures}
          onChange={(e) => handleFieldChange('preventiveMeasures', e.target.value)}
          placeholder="Actions to prevent similar accidents"
          rows={3}
        />

        <FormField
          label="Follow-Up Actions"
          name="followUpActions"
          type="textarea"
          value={formData.followUpActions}
          onChange={(e) => handleFieldChange('followUpActions', e.target.value)}
          placeholder="Specific actions, responsible parties, deadlines"
          rows={3}
        />
      </FormSection>

      {/* Additional Notes */}
      <FormSection title="Additional Notes">
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

      {/* Photos */}
      <FormSection title="Photo Documentation">
        <PhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onCaptionUpdate={handleCaptionUpdate}
          onPhotoDelete={handlePhotoDelete}
          label="Document vehicle damage and accident scene"
          maxImages={15}
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded transition"
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
        formTitle="Accident Report"
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

export default AccidentReportForm;
