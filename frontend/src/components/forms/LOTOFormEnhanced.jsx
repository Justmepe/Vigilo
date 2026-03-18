/* eslint-disable no-unused-vars, react/function-component-definition, react-hooks/exhaustive-deps */
/**
 * LOTO (Lockout/Tagout) Form
 * Comprehensive lockout/tagout form for seafood processing facilities
 * Includes food safety, regulatory compliance, and industry-specific requirements
 */

import React, { useState, useCallback } from 'react';
import { Lock, CheckCircle, AlertTriangle, Users, ClipboardCheck } from 'lucide-react';
import PhotoCapture from '../common/PhotoCapture';
import { FormPreviewModal } from '../common/FormPreviewModal';
import SafetyCardDisplay from '../cards/SafetyCardDisplay';
import {
  FormSection,
  FormField,
  FormAlert,
  CheckboxArray,
} from './FormComponents';
import { submitLOTO, saveDraft, submitDraft } from '../../services/forms';
import { getFacilityOptions } from '../../constants/facilities';
import {
  WORK_AREAS,
  EQUIPMENT_BY_AREA,
  LOTO_ENERGY_SOURCES,
  LOCKOUT_DEVICES,
  VERIFICATION_METHODS,
  PPE_MATRIX
} from '../../data/seafoodOperationsData';

const LOTOFormEnhanced = ({ onSuccess, onCancel, formId: initialFormId = null, initialData = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showCardDisplay, setShowCardDisplay] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(initialFormId);
  const [lockoutSteps, setLockoutSteps] = useState(
    Array.isArray(initialData?.lockoutSteps) ? initialData.lockoutSteps : [{ stepNumber: 1, action: '', verifiedBy: '' }]
  );
  const [restorationSteps, setRestorationSteps] = useState(
    Array.isArray(initialData?.restorationSteps) ? initialData.restorationSteps : [{ stepNumber: 1, action: '', verifiedBy: '' }]
  );
  const [affectedPersonnel, setAffectedPersonnel] = useState(
    Array.isArray(initialData?.affectedPersonnel) ? initialData.affectedPersonnel : [{ name: '', notifiedBy: '', notificationTime: '', signature: '' }]
  );
  const [energyVerifications, setEnergyVerifications] = useState(
    Array.isArray(initialData?.energyVerifications) ? initialData.energyVerifications : []
  );
  const [lockoutDevices, setLockoutDevices] = useState(
    Array.isArray(initialData?.lockoutDevices) ? initialData.lockoutDevices : [{ deviceType: '', serialNumber: '', location: '', installedBy: '' }]
  );

  const [formData, setFormData] = useState(() => ({
    // Facility
    facility: '',

    // ========== BASIC INFORMATION ==========
    workOrderNumber: '',
    equipmentName: '',
    equipmentId: '',
    location: '',
    workArea: '',
    workAreaOther: '',
    equipment: '',
    equipmentOther: '',
    department: '',
    maintenanceType: '',
    equipmentManualReference: '',
    equipmentSpecificProcedureReference: '',

    // ========== SEAFOOD INDUSTRY SPECIFIC ==========
    foodContactSurface: 'no', // yes, no
    foodZoneClassification: '', // Zone 1, Zone 2, Zone 3, Zone 4
    preSanitationStatus: '', // cleaned, sanitized, not_required
    postSanitationRequired: 'no', // yes, no
    allergenRiskPresent: 'no', // yes, no
    allergenPreventionMeasures: '',
    productHoldRequired: 'no', // yes, no
    productHoldDetails: '',

    // Seafood-specific equipment
    ammoniaSystemInvolved: 'no',
    ammoniaIsolationDetails: '',
    brineSystemInvolved: 'no',
    brineIsolationDetails: '',
    co2SystemInvolved: 'no',
    co2IsolationDetails: '',
    highPressureWaterInvolved: 'no',
    highPressureWaterDetails: '',
    cipSystemInvolved: 'no',
    cipIsolationDetails: '',

    // ========== TIME TRACKING ==========
    lockoutStartDate: new Date().toISOString().split('T')[0],
    lockoutStartTime: '',
    estimatedCompletionDate: '',
    estimatedCompletionTime: '',
    actualCompletionDate: '',
    actualCompletionTime: '',
    totalLockoutDuration: '',

    // ========== ENERGY SOURCES (STRUCTURED) ==========
    energySourcesByType: {
      electrical: [],
      pneumatic: [],
      hydraulic: [],
      thermal: [],
      refrigeration: [],
      mechanical: []
    },
    energySources: [], // Legacy field for compatibility

    // ========== AUTHORIZED PERSONNEL & TRAINING ==========
    authorizedBy: '',
    authorizedPersonTrainingDate: '',
    authorizedPersonCertificationNumber: '',
    authorizedPersonType: 'authorized', // authorized, affected
    maintenanceSupervisor: '',
    maintenanceSupervisorPhone: '',
    safetyManager: '',
    safetyManagerPhone: '',

    // ========== GROUP LOCKOUT ==========
    groupLockout: 'no', // yes, no
    groupLockoutCoordinator: '',
    numberOfWorkersInvolved: '1',
    groupHaspUsed: 'no',

    // ========== SHIFT CHANGE ==========
    shiftChangeExpected: 'no',
    shiftChangeTransferProcedure: '',
    incomingShiftEmployee: '',
    outgoingShiftEmployee: '',

    // ========== PERMIT INTEGRATION ==========
    hotWorkPermitRequired: 'no',
    hotWorkPermitNumber: '',
    confinedSpacePermitRequired: 'no',
    confinedSpacePermitNumber: '',
    electricalWorkPermitRequired: 'no',
    electricalWorkPermitNumber: '',
    arcFlashBoundary: '',

    // ========== ISOLATION METHODS ==========
    isolationMethodElectrical: '',
    isolationMethodPneumatic: '',
    isolationMethodHydraulic: '',
    isolationMethodThermal: '',
    isolationMethodMechanical: '',
    isolationMethodChemical: '',
    isolationMethodGravity: '',
    isolationMethodRadiation: '',

    // ========== LOCKOUT POINTS ==========
    lockoutPointsIdentified: '',
    totalLockoutPoints: '',

    // ========== TRY-OUT VERIFICATION (CRITICAL) ==========
    tryOutPerformed: 'no', // yes, no
    tryOutMethod: '',
    tryOutResults: '', // pass, fail
    tryOutPerformedBy: '',
    tryOutDateTime: '',
    controlButtonsTested: '',

    // ========== ZERO ENERGY STATE VERIFICATION ==========
    zeroEnergyStateVerified: 'no',
    voltageReadingBefore: '',
    voltageReadingAfter: '',
    pressureReadingBefore: '',
    pressureReadingAfter: '',
    temperatureReadingBefore: '',
    temperatureReadingAfter: '',
    flowMeterReading: '',

    // ========== STORED ENERGY RELEASE ==========
    capacitorDischargeVerified: 'no',
    springTensionReleased: 'no',
    flywheelCoastDownTime: '',
    thermalCoolingTime: '',
    pressureBleedDownValue: '',
    chemicalDrainFlushRequired: 'no',
    chemicalDrainFlushDetails: '',

    // ========== DE-ENERGIZATION ==========
    deenergizedBy: '',
    deenergizedDate: new Date().toISOString().split('T')[0],
    deenergizedTime: '',

    // ========== POST-LOCKOUT VERIFICATION ==========
    verificationDate: new Date().toISOString().split('T')[0],
    verificationTime: '',
    verifiedBy: '',
    residualEnergyChecks: '',
    verificationResults: 'pass', // pass, fail

    // ========== AREA SAFETY ==========
    areaPostedWithSigns: 'no',
    areaBarricaded: 'no',
    affectedEmployeesNotified: 'no',
    productionSupervisorNotified: 'no',
    productionSupervisorName: '',
    productionNotificationTime: '',

    // ========== RESTORATION CHECKLIST ==========
    allToolsRemoved: 'no',
    allGuardsReinstalled: 'no',
    areaClearedOfPersonnel: 'no',
    equipmentInspectionComplete: 'no',
    controlSwitchesInOff: 'no',
    sanitationVerified: 'no',
    testRunCompleted: 'no',
    testRunResults: '',

    // ========== LOCKOUT REMOVAL ==========
    removedBy: '',
    removalDate: '',
    removalTime: '',
    supervisorApproval: '',
    supervisorApprovalTime: '',
    reEnergizationSequence: '',

    // ========== EMERGENCY CONTACTS ==========
    emergencyContactName: '',
    emergencyContactPhone: '',
    afterHoursContact: '',
    afterHoursContactPhone: '',

    // ========== REGULATORY COMPLIANCE ==========
    oshaCompliant: 'no', // OSHA 29 CFR 1910.147
    annualInspectionDate: '',
    periodicInspectionDate: '',
    fdaHaccpConsidered: 'no',

    // ========== MAINTENANCE NOTES ==========
    maintenanceNotes: '',
    additionalObservations: '',
    issuesFound: '',
    followUpRequired: 'no',
    followUpDetails: '',

    // ========== PREVIOUS LOTO HISTORY ==========
    previousLotoDate: '',
    previousLotoIssues: '',
    ...(initialData ? { ...initialData } : {}),
  }));

  // Get equipment options based on selected work area
  const getEquipmentOptionsLOTO = () => {
    if (!formData.workArea) return [];
    const selectedArea = WORK_AREAS.find(a => a.label === formData.workArea);
    if (!selectedArea || !EQUIPMENT_BY_AREA[selectedArea.id]) return [];
    return EQUIPMENT_BY_AREA[selectedArea.id].map(eq => eq.label);
  };

  const energySourceOptions = [
    { id: 'electrical', label: 'Electrical' },
    { id: 'pneumatic', label: 'Pneumatic/Compressed Air' },
    { id: 'hydraulic', label: 'Hydraulic Pressure' },
    { id: 'thermal', label: 'Thermal/Heat' },
    { id: 'mechanical', label: 'Mechanical/Moving Parts' },
    { id: 'chemical', label: 'Chemical Energy' },
    { id: 'gravity', label: 'Gravity/Elevation' },
    { id: 'radiation', label: 'Radiation' },
    { id: 'ammonia', label: 'Ammonia Refrigeration' },
    { id: 'brine', label: 'Brine/Salt Solution' },
    { id: 'co2', label: 'CO2 System' },
    { id: 'cryogenic', label: 'Cryogenic/Blast Freezer' },
  ];

  const isolationMethods = {
    electrical: [
      'Main disconnect switch',
      'Circuit breaker lock',
      'Fused disconnect',
      'Multiplex panel disconnect',
      'Control power disconnect',
      'Capacitor discharge',
    ],
    pneumatic: [
      'Air line disconnect',
      'Shutoff valve lock',
      'Pressure relief valve',
      'Line bleed valve',
      'Regulator adjustment',
      'Complete pressure bleed-down',
    ],
    hydraulic: [
      'Main pump shutoff',
      'Isolation valve lock',
      'Accumulator bleed',
      'Pressure relief valve',
      'Line disconnect',
      'Complete system depressurization',
    ],
    thermal: [
      'Furnace/heater shutoff',
      'Temperature control lock',
      'Circulating pump stop',
      'Fuel supply cutoff',
      'Power disconnect',
      'Cool-down period verification',
    ],
    mechanical: [
      'Clutch disengagement',
      'Belt removal',
      'Chain removal',
      'Gear locking',
      'Shaft lock pin',
      'Flywheel restraint',
    ],
    chemical: [
      'Supply line disconnect',
      'Shutoff valve lock',
      'Transfer pump shutoff',
      'Tank isolation',
      'Drain valve lock',
      'Line flush/purge',
    ],
    gravity: [
      'Mechanical blocks',
      'Support cables',
      'Brakes engaged',
      'Blocks under equipment',
      'Cable restraint',
      'Jack stands',
    ],
    radiation: [
      'Source removal',
      'Shielding lock',
      'Control switch lock',
      'Machine power shutoff',
      'Enclosure lock',
    ],
    ammonia: [
      'Main ammonia valve isolation',
      'Emergency shutoff activation',
      'System depressurization',
      'Ventilation verification',
      'Gas detection active',
      'Ammonia technician on standby',
    ],
    brine: [
      'Brine circulation pump shutoff',
      'Supply valve isolation',
      'Return valve isolation',
      'Tank isolation',
      'Temperature verification',
    ],
    co2: [
      'CO2 supply valve shutoff',
      'Pressure relief verification',
      'Ventilation system active',
      'Gas detector operational',
      'Emergency backup available',
    ],
    cryogenic: [
      'Cryogenic supply shutoff',
      'System warm-up verification',
      'Pressure release confirmed',
      'Ventilation adequate',
      'Temperature normalized',
    ],
  };

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // ========== LOCKOUT STEPS MANAGEMENT ==========
  const handleAddLockoutStep = () => {
    setLockoutSteps([...lockoutSteps, { stepNumber: lockoutSteps.length + 1, action: '', verifiedBy: '' }]);
  };

  const handleRemoveLockoutStep = (index) => {
    if (lockoutSteps.length > 1) {
      setLockoutSteps(lockoutSteps.filter((_, i) => i !== index));
    }
  };

  const handleLockoutStepChange = (index, field, value) => {
    const updated = [...lockoutSteps];
    updated[index] = { ...updated[index], [field]: value };
    setLockoutSteps(updated);
  };

  // ========== RESTORATION STEPS MANAGEMENT ==========
  const handleAddRestorationStep = () => {
    setRestorationSteps([...restorationSteps, { stepNumber: restorationSteps.length + 1, action: '', verifiedBy: '' }]);
  };

  const handleRemoveRestorationStep = (index) => {
    if (restorationSteps.length > 1) {
      setRestorationSteps(restorationSteps.filter((_, i) => i !== index));
    }
  };

  const handleRestorationStepChange = (index, field, value) => {
    const updated = [...restorationSteps];
    updated[index] = { ...updated[index], [field]: value };
    setRestorationSteps(updated);
  };

  // Auto-fill restoration steps as the reverse of the lockout steps.
  // Only copies non-empty lockout steps, reverses their order, renumbers them,
  // and clears verifiedBy (re-energization is done separately, later).
  const handleAutoFillRestorationFromLockout = () => {
    const filledSteps = lockoutSteps.filter(s => s.action && s.action.trim());
    if (filledSteps.length === 0) return;

    const hasExistingData = restorationSteps.some(s => s.action && s.action.trim());
    if (hasExistingData) {
      const confirmed = window.confirm(
        'Restoration steps already have data. Replace them with the reversed lockout steps?'
      );
      if (!confirmed) return;
    }

    const reversed = [...filledSteps]
      .reverse()
      .map((step, i) => ({ stepNumber: i + 1, action: step.action, verifiedBy: '' }));

    setRestorationSteps(reversed);
  };

  // ========== AFFECTED PERSONNEL MANAGEMENT ==========
  const handleAddAffectedPerson = () => {
    setAffectedPersonnel([...affectedPersonnel, { name: '', notifiedBy: '', notificationTime: '', signature: '' }]);
  };

  const handleRemoveAffectedPerson = (index) => {
    if (affectedPersonnel.length > 1) {
      setAffectedPersonnel(affectedPersonnel.filter((_, i) => i !== index));
    }
  };

  const handleAffectedPersonChange = (index, field, value) => {
    const updated = [...affectedPersonnel];
    updated[index] = { ...updated[index], [field]: value };
    setAffectedPersonnel(updated);
  };

  // ========== ENERGY VERIFICATION MANAGEMENT ==========
  const handleAddEnergyVerification = () => {
    setEnergyVerifications([
      ...energyVerifications,
      { energyType: '', isolationPoint: '', deviceUsed: '', readingBefore: '', readingAfter: '', verifiedBy: '' },
    ]);
  };

  const handleRemoveEnergyVerification = (index) => {
    setEnergyVerifications(energyVerifications.filter((_, i) => i !== index));
  };

  const handleEnergyVerificationChange = (index, field, value) => {
    const updated = [...energyVerifications];
    updated[index] = { ...updated[index], [field]: value };
    setEnergyVerifications(updated);
  };

  // ========== LOCKOUT DEVICE MANAGEMENT ==========
  const handleAddLockoutDevice = () => {
    setLockoutDevices([...lockoutDevices, { deviceType: '', serialNumber: '', location: '', installedBy: '' }]);
  };

  const handleRemoveLockoutDevice = (index) => {
    if (lockoutDevices.length > 1) {
      setLockoutDevices(lockoutDevices.filter((_, i) => i !== index));
    }
  };

  const handleLockoutDeviceChange = (index, field, value) => {
    const updated = [...lockoutDevices];
    updated[index] = { ...updated[index], [field]: value };
    setLockoutDevices(updated);
  };

  const handlePhotoCapture = useCallback((photo) => {
    setCapturedPhotos((prev) => [...prev, photo]);
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
      const draftData = {
        ...formData,
        lockoutSteps,
        restorationSteps,
        affectedPersonnel,
        energyVerifications,
        lockoutDevices,
      };
      const result = await saveDraft('loto', draftData, capturedPhotos, currentFormId);
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
    const trimmed = (val) => (typeof val === 'string' ? val.trim() : val);

    // Only require core fields - facility, equipment name, authorized person
    if (!formData.facility) newErrors.facility = 'Facility is required';
    if (!trimmed(formData.equipmentName)) newErrors.equipmentName = 'Equipment name is required';
    if (!trimmed(formData.authorizedBy)) newErrors.authorizedBy = 'Authorized person is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      const missing = [];
      if (!formData.facility) missing.push('Facility');
      if (!formData.equipmentName?.trim()) missing.push('Equipment Name');
      if (!formData.authorizedBy?.trim()) missing.push('Authorized Person');
      setErrorMessage(`Required fields missing: ${missing.join(', ')}`);
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
        energySources: formData.energySources.join(', '),
        lockoutSteps: JSON.stringify(lockoutSteps),
        restorationSteps: JSON.stringify(restorationSteps),
        affectedPersonnel: JSON.stringify(affectedPersonnel),
        energyVerifications: JSON.stringify(energyVerifications),
        lockoutDevices: JSON.stringify(lockoutDevices),
      };

      let response;
      if (currentFormId) {
        response = await submitDraft(currentFormId, submissionData, capturedPhotos);
      } else {
        response = await submitLOTO(submissionData, capturedPhotos);
      }

      setSuccessMessage(`LOTO form submitted successfully! Generating summary card...`);
      setShowPreview(false);
      const newId = response?.id || response?.formId || response?.data?.id || currentFormId;
      setCurrentFormId(newId);

      // Show cards after brief delay
      setTimeout(() => {
        setShowCardDisplay(true);
        setSuccessMessage('');
      }, 1500);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit LOTO form. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCards = () => {
    setShowCardDisplay(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Lock size={32} className="text-red-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">LOTO (Lockout/Tagout) Form</h2>
          <p className="text-sm text-gray-600">Seafood Processing Facility - Comprehensive Safety Control</p>
        </div>
      </div>
      <p className="text-gray-600 mb-6">
        Control hazardous energy during equipment maintenance - OSHA 29 CFR 1910.147 Compliant
      </p>

      {errorMessage && (
        <FormAlert type="error" title="Error" message={errorMessage} onDismiss={() => setErrorMessage('')} />
      )}

      {successMessage && <FormAlert type="success" title="Success" message={successMessage} />}

      {/* ========== FACILITY SELECTION ========== */}
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

      {/* ========== EQUIPMENT INFORMATION ========== */}
      <FormSection title="Equipment Information" icon="📋">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Work Order Number"
            name="workOrderNumber"
            value={formData.workOrderNumber}
            onChange={(e) => handleFieldChange('workOrderNumber', e.target.value)}
            placeholder="WO-12345"
          />

          <FormField
            label="Equipment Name"
            name="equipmentName"
            value={formData.equipmentName}
            onChange={(e) => handleFieldChange('equipmentName', e.target.value)}
            placeholder="e.g., Fish Processing Conveyor Line 3"
            error={errors.equipmentName}
            required
          />

          <FormField
            label="Equipment ID/Serial Number"
            name="equipmentId"
            value={formData.equipmentId}
            onChange={(e) => handleFieldChange('equipmentId', e.target.value)}
          />

          <FormField
            label="Location/Area"
            name="location"
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="Building/Processing Area"
          />

          <FormField
            label="Work Area"
            name="workArea"
            type="select"
            value={formData.workArea}
            onChange={(e) => handleFieldChange('workArea', e.target.value)}
            options={WORK_AREAS.map(a => a.label)}
            helpText="Select seafood processing work area"
          />

          {formData.workArea && (
            <FormField
              label="Equipment"
              name="equipment"
              type="select"
              value={formData.equipment}
              onChange={(e) => handleFieldChange('equipment', e.target.value)}
              options={getEquipmentOptionsLOTO()}
              helpText="Equipment in selected area"
            />
          )}

          <FormField
            label="Department"
            name="department"
            value={formData.department}
            onChange={(e) => handleFieldChange('department', e.target.value)}
            placeholder="e.g., Processing, Packaging, Cold Storage"
          />

          {formData.workArea === 'Other – Specify' && (
            <FormField
              label="Specify Work Area"
              name="workAreaOther"
              value={formData.workAreaOther}
              onChange={(e) => handleFieldChange('workAreaOther', e.target.value)}
              placeholder="Enter work area name"
              required
            />
          )}

          {formData.equipment && !getEquipmentOptionsLOTO().includes(formData.equipment) && (
            <FormField
              label="Specify Equipment"
              name="equipmentOther"
              value={formData.equipmentOther}
              onChange={(e) => handleFieldChange('equipmentOther', e.target.value)}
              placeholder="Enter equipment name"
              required
            />
          )}

          <FormField
            label="Type of Maintenance"
            name="maintenanceType"
            type="select"
            value={formData.maintenanceType}
            onChange={(e) => handleFieldChange('maintenanceType', e.target.value)}
            options={['Preventive Maintenance', 'Corrective Maintenance', 'Emergency Repair', 'Inspection', 'Cleaning/Sanitation']}
          />

          <FormField
            label="Equipment Manual Reference"
            name="equipmentManualReference"
            value={formData.equipmentManualReference}
            onChange={(e) => handleFieldChange('equipmentManualReference', e.target.value)}
            placeholder="Manual/SOP reference number"
          />

          <FormField
            label="Equipment-Specific LOTO Procedure"
            name="equipmentSpecificProcedureReference"
            value={formData.equipmentSpecificProcedureReference}
            onChange={(e) => handleFieldChange('equipmentSpecificProcedureReference', e.target.value)}
            placeholder="Reference to equipment-specific procedure"
          />
        </div>
      </FormSection>

      {/* ========== TIME TRACKING ========== */}
      <FormSection title="Time Tracking" icon="⏱️">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Lockout Start Date"
            name="lockoutStartDate"
            type="date"
            value={formData.lockoutStartDate}
            onChange={(e) => handleFieldChange('lockoutStartDate', e.target.value)}
            required
          />

          <FormField
            label="Lockout Start Time"
            name="lockoutStartTime"
            type="time"
            value={formData.lockoutStartTime}
            onChange={(e) => handleFieldChange('lockoutStartTime', e.target.value)}
            error={errors.lockoutStartTime}
            required
          />

          <FormField
            label="Total Lockout Points"
            name="totalLockoutPoints"
            type="number"
            value={formData.totalLockoutPoints}
            onChange={(e) => handleFieldChange('totalLockoutPoints', e.target.value)}
            placeholder="Number of isolation points"
          />

          <FormField
            label="Estimated Completion Date"
            name="estimatedCompletionDate"
            type="date"
            value={formData.estimatedCompletionDate}
            onChange={(e) => handleFieldChange('estimatedCompletionDate', e.target.value)}
          />

          <FormField
            label="Estimated Completion Time"
            name="estimatedCompletionTime"
            type="time"
            value={formData.estimatedCompletionTime}
            onChange={(e) => handleFieldChange('estimatedCompletionTime', e.target.value)}
          />

          <div />

          <FormField
            label="Actual Completion Date"
            name="actualCompletionDate"
            type="date"
            value={formData.actualCompletionDate}
            onChange={(e) => handleFieldChange('actualCompletionDate', e.target.value)}
          />

          <FormField
            label="Actual Completion Time"
            name="actualCompletionTime"
            type="time"
            value={formData.actualCompletionTime}
            onChange={(e) => handleFieldChange('actualCompletionTime', e.target.value)}
          />

          <FormField
            label="Total Duration (hours)"
            name="totalLockoutDuration"
            value={formData.totalLockoutDuration}
            onChange={(e) => handleFieldChange('totalLockoutDuration', e.target.value)}
            placeholder="Auto-calculated or manual entry"
          />
        </div>
      </FormSection>

      {/* ========== SEAFOOD INDUSTRY SPECIFIC ========== */}
      <FormSection title="🐟 Seafood Industry Specific Requirements" icon="🐟">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex">
            <AlertTriangle className="text-blue-600 mr-2" size={20} />
            <p className="text-sm text-blue-800">
              Food safety and sanitation requirements for seafood processing facilities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Food Contact Surface?"
            name="foodContactSurface"
            type="select"
            value={formData.foodContactSurface}
            onChange={(e) => handleFieldChange('foodContactSurface', e.target.value)}
            options={[
              { value: 'no', label: 'No - Not food contact' },
              { value: 'yes', label: 'Yes - Food contact surface' },
            ]}
          />

          <FormField
            label="Food Zone Classification"
            name="foodZoneClassification"
            type="select"
            value={formData.foodZoneClassification}
            onChange={(e) => handleFieldChange('foodZoneClassification', e.target.value)}
            options={['Zone 1 - Food Contact', 'Zone 2 - Near Food Contact', 'Zone 3 - Non-Food Areas', 'Zone 4 - Non-Production']}
          />

          {formData.foodContactSurface === 'yes' && (
            <>
              <FormField
                label="Pre-Maintenance Sanitation Status"
                name="preSanitationStatus"
                type="select"
                value={formData.preSanitationStatus}
                onChange={(e) => handleFieldChange('preSanitationStatus', e.target.value)}
                options={['Cleaned', 'Sanitized', 'Not Required']}
                error={errors.preSanitationStatus}
                required
              />

              <FormField
                label="Post-Maintenance Sanitation Required?"
                name="postSanitationRequired"
                type="select"
                value={formData.postSanitationRequired}
                onChange={(e) => handleFieldChange('postSanitationRequired', e.target.value)}
                options={[
                  { value: 'yes', label: 'Yes - Sanitation required before restart' },
                  { value: 'no', label: 'No - Not required' },
                ]}
              />
            </>
          )}

          <FormField
            label="Allergen Risk Present?"
            name="allergenRiskPresent"
            type="select"
            value={formData.allergenRiskPresent}
            onChange={(e) => handleFieldChange('allergenRiskPresent', e.target.value)}
            options={[
              { value: 'no', label: 'No allergen risk' },
              { value: 'yes', label: 'Yes - Allergen present' },
            ]}
          />

          {formData.allergenRiskPresent === 'yes' && (
            <FormField
              label="Allergen Prevention Measures"
              name="allergenPreventionMeasures"
              type="textarea"
              value={formData.allergenPreventionMeasures}
              onChange={(e) => handleFieldChange('allergenPreventionMeasures', e.target.value)}
              placeholder="Describe cross-contamination prevention measures"
              rows={2}
            />
          )}

          <FormField
            label="Product Hold/Quarantine Required?"
            name="productHoldRequired"
            type="select"
            value={formData.productHoldRequired}
            onChange={(e) => handleFieldChange('productHoldRequired', e.target.value)}
            options={[
              { value: 'no', label: 'No - No product hold' },
              { value: 'yes', label: 'Yes - Product hold required' },
            ]}
          />

          {formData.productHoldRequired === 'yes' && (
            <FormField
              label="Product Hold Details"
              name="productHoldDetails"
              type="textarea"
              value={formData.productHoldDetails}
              onChange={(e) => handleFieldChange('productHoldDetails', e.target.value)}
              placeholder="Lot numbers, quantities, hold location"
              rows={2}
            />
          )}
        </div>

        {/* Seafood-Specific Systems */}
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Seafood Processing Systems Involved</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Ammonia Refrigeration System?"
              name="ammoniaSystemInvolved"
              type="select"
              value={formData.ammoniaSystemInvolved}
              onChange={(e) => handleFieldChange('ammoniaSystemInvolved', e.target.value)}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes - CRITICAL HAZARD' },
              ]}
            />

            {formData.ammoniaSystemInvolved === 'yes' && (
              <FormField
                label="Ammonia Isolation Details"
                name="ammoniaIsolationDetails"
                type="textarea"
                value={formData.ammoniaIsolationDetails}
                onChange={(e) => handleFieldChange('ammoniaIsolationDetails', e.target.value)}
                placeholder="Valve locations, technician on standby, gas detection active"
                rows={2}
                error={errors.ammoniaIsolationDetails}
                required
              />
            )}

            <FormField
              label="Brine/Salt Solution System?"
              name="brineSystemInvolved"
              type="select"
              value={formData.brineSystemInvolved}
              onChange={(e) => handleFieldChange('brineSystemInvolved', e.target.value)}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
            />

            {formData.brineSystemInvolved === 'yes' && (
              <FormField
                label="Brine Isolation Details"
                name="brineIsolationDetails"
                value={formData.brineIsolationDetails}
                onChange={(e) => handleFieldChange('brineIsolationDetails', e.target.value)}
                placeholder="Circulation pump shutoff, valve isolation"
              />
            )}

            <FormField
              label="CO2 System Involved?"
              name="co2SystemInvolved"
              type="select"
              value={formData.co2SystemInvolved}
              onChange={(e) => handleFieldChange('co2SystemInvolved', e.target.value)}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
            />

            {formData.co2SystemInvolved === 'yes' && (
              <FormField
                label="CO2 Isolation Details"
                name="co2IsolationDetails"
                value={formData.co2IsolationDetails}
                onChange={(e) => handleFieldChange('co2IsolationDetails', e.target.value)}
                placeholder="Supply shutoff, ventilation active, gas detector operational"
              />
            )}

            <FormField
              label="High-Pressure Water System?"
              name="highPressureWaterInvolved"
              type="select"
              value={formData.highPressureWaterInvolved}
              onChange={(e) => handleFieldChange('highPressureWaterInvolved', e.target.value)}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes (>200 PSI)' },
              ]}
            />

            {formData.highPressureWaterInvolved === 'yes' && (
              <FormField
                label="High-Pressure Water Details"
                name="highPressureWaterDetails"
                value={formData.highPressureWaterDetails}
                onChange={(e) => handleFieldChange('highPressureWaterDetails', e.target.value)}
                placeholder="Pressure, isolation points, depressurization"
              />
            )}

            <FormField
              label="CIP (Clean-In-Place) System?"
              name="cipSystemInvolved"
              type="select"
              value={formData.cipSystemInvolved}
              onChange={(e) => handleFieldChange('cipSystemInvolved', e.target.value)}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
            />

            {formData.cipSystemInvolved === 'yes' && (
              <FormField
                label="CIP Isolation Details"
                name="cipIsolationDetails"
                value={formData.cipIsolationDetails}
                onChange={(e) => handleFieldChange('cipIsolationDetails', e.target.value)}
                placeholder="CIP pump shutoff, chemical supply isolated, drain valves"
              />
            )}
          </div>
        </div>
      </FormSection>

      {/* ========== ENERGY SOURCES ========== */}
      <FormSection title="Hazardous Energy Sources" icon="⚡">
        <CheckboxArray
          label="Select All Energy Sources Present (Mark All That Apply)"
          name="energySources"
          items={energySourceOptions}
          values={formData.energySources}
          onChange={(e) => handleFieldChange('energySources', e.target.value)}
          error={errors.energySources}
        />
      </FormSection>

      {/* ========== ISOLATION METHODS ========== */}
      <FormSection title="Energy Isolation Methods">
        {formData.energySources.includes('electrical') && (
          <FormField
            label="⚡ Electrical Isolation Method"
            name="isolationMethodElectrical"
            type="select"
            value={formData.isolationMethodElectrical}
            onChange={(e) => handleFieldChange('isolationMethodElectrical', e.target.value)}
            options={isolationMethods['electrical']}
          />
        )}

        {formData.energySources.includes('pneumatic') && (
          <FormField
            label="💨 Pneumatic Isolation Method"
            name="isolationMethodPneumatic"
            type="select"
            value={formData.isolationMethodPneumatic}
            onChange={(e) => handleFieldChange('isolationMethodPneumatic', e.target.value)}
            options={isolationMethods['pneumatic']}
          />
        )}

        {formData.energySources.includes('hydraulic') && (
          <FormField
            label="🔧 Hydraulic Isolation Method"
            name="isolationMethodHydraulic"
            type="select"
            value={formData.isolationMethodHydraulic}
            onChange={(e) => handleFieldChange('isolationMethodHydraulic', e.target.value)}
            options={isolationMethods['hydraulic']}
          />
        )}

        {formData.energySources.includes('thermal') && (
          <FormField
            label="🔥 Thermal Isolation Method"
            name="isolationMethodThermal"
            type="select"
            value={formData.isolationMethodThermal}
            onChange={(e) => handleFieldChange('isolationMethodThermal', e.target.value)}
            options={isolationMethods['thermal']}
          />
        )}

        {formData.energySources.includes('mechanical') && (
          <FormField
            label="⚙️ Mechanical Isolation Method"
            name="isolationMethodMechanical"
            type="select"
            value={formData.isolationMethodMechanical}
            onChange={(e) => handleFieldChange('isolationMethodMechanical', e.target.value)}
            options={isolationMethods['mechanical']}
          />
        )}

        {formData.energySources.includes('chemical') && (
          <FormField
            label="🧪 Chemical Isolation Method"
            name="isolationMethodChemical"
            type="select"
            value={formData.isolationMethodChemical}
            onChange={(e) => handleFieldChange('isolationMethodChemical', e.target.value)}
            options={isolationMethods['chemical']}
          />
        )}

        {formData.energySources.includes('gravity') && (
          <FormField
            label="⬇️ Gravity/Elevation Control Method"
            name="isolationMethodGravity"
            type="select"
            value={formData.isolationMethodGravity}
            onChange={(e) => handleFieldChange('isolationMethodGravity', e.target.value)}
            options={isolationMethods['gravity']}
          />
        )}

        {formData.energySources.includes('radiation') && (
          <FormField
            label="☢️ Radiation Isolation Method"
            name="isolationMethodRadiation"
            type="select"
            value={formData.isolationMethodRadiation}
            onChange={(e) => handleFieldChange('isolationMethodRadiation', e.target.value)}
            options={isolationMethods['radiation']}
          />
        )}

        {formData.energySources.includes('ammonia') && (
          <FormField
            label="❄️ Ammonia Refrigeration Isolation"
            name="isolationMethodAmmonia"
            type="select"
            value={formData.isolationMethodAmmonia}
            onChange={(e) => handleFieldChange('isolationMethodAmmonia', e.target.value)}
            options={isolationMethods['ammonia']}
          />
        )}

        {formData.energySources.includes('brine') && (
          <FormField
            label="🧊 Brine System Isolation"
            name="isolationMethodBrine"
            type="select"
            value={formData.isolationMethodBrine}
            onChange={(e) => handleFieldChange('isolationMethodBrine', e.target.value)}
            options={isolationMethods['brine']}
          />
        )}

        {formData.energySources.includes('co2') && (
          <FormField
            label="💨 CO2 System Isolation"
            name="isolationMethodCo2"
            type="select"
            value={formData.isolationMethodCo2}
            onChange={(e) => handleFieldChange('isolationMethodCo2', e.target.value)}
            options={isolationMethods['co2']}
          />
        )}

        {formData.energySources.includes('cryogenic') && (
          <FormField
            label="🥶 Cryogenic/Blast Freezer Isolation"
            name="isolationMethodCryogenic"
            type="select"
            value={formData.isolationMethodCryogenic}
            onChange={(e) => handleFieldChange('isolationMethodCryogenic', e.target.value)}
            options={isolationMethods['cryogenic']}
          />
        )}
      </FormSection>

      {/* ========== LOCKOUT DEVICE TRACKING ========== */}
      <FormSection title="Lockout Device Tracking" icon="🔒">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-sm text-yellow-800">
            Document all locks, tags, hasps, and devices used. Each device must be traceable to the person who installed it.
          </p>
        </div>

        {lockoutDevices.map((device, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Device #{index + 1}</h4>
              {lockoutDevices.length > 1 && (
                <button
                  onClick={() => handleRemoveLockoutDevice(index)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-semibold"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <FormField
                label="Device Type"
                name={`deviceType-${index}`}
                type="select"
                value={device.deviceType}
                onChange={(e) => handleLockoutDeviceChange(index, 'deviceType', e.target.value)}
                options={['Padlock', 'Hasp', 'Tag', 'Cable Lock', 'Valve Lock', 'Circuit Breaker Lock', 'Plug Lock']}
              />
              <FormField
                label="Serial/Lock Number"
                name={`serialNumber-${index}`}
                value={device.serialNumber}
                onChange={(e) => handleLockoutDeviceChange(index, 'serialNumber', e.target.value)}
                placeholder="e.g., LOCK-12345"
              />
              <FormField
                label="Location/Isolation Point"
                name={`location-${index}`}
                value={device.location}
                onChange={(e) => handleLockoutDeviceChange(index, 'location', e.target.value)}
                placeholder="e.g., Main disconnect panel"
              />
              <FormField
                label="Installed By"
                name={`installedBy-${index}`}
                value={device.installedBy}
                onChange={(e) => handleLockoutDeviceChange(index, 'installedBy', e.target.value)}
                placeholder="Employee name"
              />
            </div>
          </div>
        ))}

        <button
          onClick={handleAddLockoutDevice}
          className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold text-sm"
        >
          + Add Lockout Device
        </button>
      </FormSection>

      {/* ========== ENERGY VERIFICATION TABLE ========== */}
      <FormSection title="Energy Isolation Verification Table" icon="📊">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <AlertTriangle className="text-red-600 mr-2" size={20} />
            <p className="text-sm text-red-800">
              <strong>Critical:</strong> Document actual meter readings before and after isolation. Zero energy state must be verified with instruments.
            </p>
          </div>
        </div>

        {energyVerifications.map((verification, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Verification #{index + 1}</h4>
              <button
                onClick={() => handleRemoveEnergyVerification(index)}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-semibold"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <FormField
                label="Energy Type"
                name={`energyType-${index}`}
                value={verification.energyType}
                onChange={(e) => handleEnergyVerificationChange(index, 'energyType', e.target.value)}
                placeholder="e.g., Electrical"
              />
              <FormField
                label="Isolation Point"
                name={`isolationPoint-${index}`}
                value={verification.isolationPoint}
                onChange={(e) => handleEnergyVerificationChange(index, 'isolationPoint', e.target.value)}
                placeholder="e.g., Panel 3A"
              />
              <FormField
                label="Device Used"
                name={`deviceUsed-${index}`}
                value={verification.deviceUsed}
                onChange={(e) => handleEnergyVerificationChange(index, 'deviceUsed', e.target.value)}
                placeholder="e.g., Lock #123"
              />
              <FormField
                label="Reading Before"
                name={`readingBefore-${index}`}
                value={verification.readingBefore}
                onChange={(e) => handleEnergyVerificationChange(index, 'readingBefore', e.target.value)}
                placeholder="e.g., 480V"
              />
              <FormField
                label="Reading After"
                name={`readingAfter-${index}`}
                value={verification.readingAfter}
                onChange={(e) => handleEnergyVerificationChange(index, 'readingAfter', e.target.value)}
                placeholder="e.g., 0V"
              />
              <FormField
                label="Verified By"
                name={`verifiedBy-${index}`}
                value={verification.verifiedBy}
                onChange={(e) => handleEnergyVerificationChange(index, 'verifiedBy', e.target.value)}
                placeholder="Name"
              />
            </div>
          </div>
        ))}

        <button
          onClick={handleAddEnergyVerification}
          className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold text-sm"
        >
          + Add Energy Verification
        </button>
      </FormSection>

      {/* ========== STORED ENERGY RELEASE ========== */}
      <FormSection title="Stored Energy Release Verification" icon="🔋">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Capacitor Discharge Verified?"
            name="capacitorDischargeVerified"
            type="select"
            value={formData.capacitorDischargeVerified}
            onChange={(e) => handleFieldChange('capacitorDischargeVerified', e.target.value)}
            options={[
              { value: 'no', label: 'No / Not applicable' },
              { value: 'yes', label: 'Yes - Verified' },
            ]}
          />

          <FormField
            label="Spring Tension Released?"
            name="springTensionReleased"
            type="select"
            value={formData.springTensionReleased}
            onChange={(e) => handleFieldChange('springTensionReleased', e.target.value)}
            options={[
              { value: 'no', label: 'No / Not applicable' },
              { value: 'yes', label: 'Yes - Released' },
            ]}
          />

          <FormField
            label="Flywheel Coast-Down Time (minutes)"
            name="flywheelCoastDownTime"
            value={formData.flywheelCoastDownTime}
            onChange={(e) => handleFieldChange('flywheelCoastDownTime', e.target.value)}
            placeholder="Time required for complete stop"
          />

          <FormField
            label="Thermal Cooling Time (minutes)"
            name="thermalCoolingTime"
            value={formData.thermalCoolingTime}
            onChange={(e) => handleFieldChange('thermalCoolingTime', e.target.value)}
            placeholder="Cooling time to safe temperature"
          />

          <FormField
            label="Pressure Bleed-Down Value (PSI)"
            name="pressureBleedDownValue"
            value={formData.pressureBleedDownValue}
            onChange={(e) => handleFieldChange('pressureBleedDownValue', e.target.value)}
            placeholder="Final pressure after bleed-down"
          />

          <FormField
            label="Chemical Drain/Flush Required?"
            name="chemicalDrainFlushRequired"
            type="select"
            value={formData.chemicalDrainFlushRequired}
            onChange={(e) => handleFieldChange('chemicalDrainFlushRequired', e.target.value)}
            options={[
              { value: 'no', label: 'No / Not applicable' },
              { value: 'yes', label: 'Yes - Required' },
            ]}
          />

          {formData.chemicalDrainFlushRequired === 'yes' && (
            <FormField
              label="Chemical Drain/Flush Details"
              name="chemicalDrainFlushDetails"
              type="textarea"
              value={formData.chemicalDrainFlushDetails}
              onChange={(e) => handleFieldChange('chemicalDrainFlushDetails', e.target.value)}
              placeholder="Chemical type, drain location, flush procedure"
              rows={2}
            />
          )}
        </div>
      </FormSection>

      {/* ========== TRY-OUT VERIFICATION (CRITICAL OSHA REQUIREMENT) ========== */}
      <FormSection title="⚠️ Try-Out Verification (OSHA REQUIRED)" icon="⚠️">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <AlertTriangle className="text-red-600 mr-2" size={24} />
            <div>
              <p className="text-sm font-bold text-red-800">CRITICAL OSHA 1910.147 REQUIREMENT</p>
              <p className="text-sm text-red-800">
                After lockout, attempt to start equipment using normal controls to verify energy isolation. This is mandatory.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Try-Out Test Performed?"
            name="tryOutPerformed"
            type="select"
            value={formData.tryOutPerformed}
            onChange={(e) => handleFieldChange('tryOutPerformed', e.target.value)}
            options={[
              { value: 'no', label: 'No - NOT COMPLIANT' },
              { value: 'yes', label: 'Yes - Test performed' },
            ]}
            error={errors.tryOutPerformed}
            required
          />

          <FormField
            label="Try-Out Method"
            name="tryOutMethod"
            value={formData.tryOutMethod}
            onChange={(e) => handleFieldChange('tryOutMethod', e.target.value)}
            placeholder="e.g., Pressed start button, attempted to move controls"
          />

          <FormField
            label="Try-Out Results"
            name="tryOutResults"
            type="select"
            value={formData.tryOutResults}
            onChange={(e) => handleFieldChange('tryOutResults', e.target.value)}
            options={[
              { value: '', label: 'Select result...' },
              { value: 'pass', label: 'PASS - Equipment did not start' },
              { value: 'fail', label: 'FAIL - Equipment started or showed energy' },
            ]}
          />

          <FormField
            label="Try-Out Performed By"
            name="tryOutPerformedBy"
            value={formData.tryOutPerformedBy}
            onChange={(e) => handleFieldChange('tryOutPerformedBy', e.target.value)}
            placeholder="Name of person who performed test"
          />

          <FormField
            label="Try-Out Date & Time"
            name="tryOutDateTime"
            type="datetime-local"
            value={formData.tryOutDateTime}
            onChange={(e) => handleFieldChange('tryOutDateTime', e.target.value)}
          />

          <FormField
            label="Control Buttons/Switches Tested"
            name="controlButtonsTested"
            type="textarea"
            value={formData.controlButtonsTested}
            onChange={(e) => handleFieldChange('controlButtonsTested', e.target.value)}
            placeholder="List all controls tested (start button, stop button, emergency stop, etc.)"
            rows={2}
          />
        </div>
      </FormSection>

      {/* ========== ZERO ENERGY STATE VERIFICATION ========== */}
      <FormSection title="Zero Energy State Verification" icon="📏">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Zero Energy State Verified?"
            name="zeroEnergyStateVerified"
            type="select"
            value={formData.zeroEnergyStateVerified}
            onChange={(e) => handleFieldChange('zeroEnergyStateVerified', e.target.value)}
            options={[
              { value: 'no', label: 'No - NOT VERIFIED' },
              { value: 'yes', label: 'Yes - Verified with instruments' },
            ]}
            error={errors.zeroEnergyStateVerified}
            required
          />

          <FormField
            label="Voltage Reading Before (V)"
            name="voltageReadingBefore"
            value={formData.voltageReadingBefore}
            onChange={(e) => handleFieldChange('voltageReadingBefore', e.target.value)}
            placeholder="e.g., 480V"
          />

          <FormField
            label="Voltage Reading After (V)"
            name="voltageReadingAfter"
            value={formData.voltageReadingAfter}
            onChange={(e) => handleFieldChange('voltageReadingAfter', e.target.value)}
            placeholder="Should be 0V"
          />

          <FormField
            label="Pressure Reading Before (PSI)"
            name="pressureReadingBefore"
            value={formData.pressureReadingBefore}
            onChange={(e) => handleFieldChange('pressureReadingBefore', e.target.value)}
            placeholder="e.g., 120 PSI"
          />

          <FormField
            label="Pressure Reading After (PSI)"
            name="pressureReadingAfter"
            value={formData.pressureReadingAfter}
            onChange={(e) => handleFieldChange('pressureReadingAfter', e.target.value)}
            placeholder="Should be 0 PSI"
          />

          <FormField
            label="Temperature Reading Before (°F)"
            name="temperatureReadingBefore"
            value={formData.temperatureReadingBefore}
            onChange={(e) => handleFieldChange('temperatureReadingBefore', e.target.value)}
            placeholder="e.g., 350°F"
          />

          <FormField
            label="Temperature Reading After (°F)"
            name="temperatureReadingAfter"
            value={formData.temperatureReadingAfter}
            onChange={(e) => handleFieldChange('temperatureReadingAfter', e.target.value)}
            placeholder="Safe temperature"
          />

          <FormField
            label="Flow Meter Reading"
            name="flowMeterReading"
            value={formData.flowMeterReading}
            onChange={(e) => handleFieldChange('flowMeterReading', e.target.value)}
            placeholder="Should show zero flow"
          />
        </div>
      </FormSection>

      {/* ========== AUTHORIZED PERSONNEL & TRAINING ========== */}
      <FormSection title="Authorized Personnel & Training" icon="👤">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Authorized Person Name"
            name="authorizedBy"
            value={formData.authorizedBy}
            onChange={(e) => handleFieldChange('authorizedBy', e.target.value)}
            error={errors.authorizedBy}
            required
          />

          <FormField
            label="Authorized Person Type"
            name="authorizedPersonType"
            type="select"
            value={formData.authorizedPersonType}
            onChange={(e) => handleFieldChange('authorizedPersonType', e.target.value)}
            options={[
              { value: 'authorized', label: 'Authorized Employee (performs lockout)' },
              { value: 'affected', label: 'Affected Employee (notified only)' },
            ]}
          />

          <FormField
            label="LOTO Training Date"
            name="authorizedPersonTrainingDate"
            type="date"
            value={formData.authorizedPersonTrainingDate}
            onChange={(e) => handleFieldChange('authorizedPersonTrainingDate', e.target.value)}
            error={errors.authorizedPersonTrainingDate}
            required
          />

          <FormField
            label="Training Certification Number"
            name="authorizedPersonCertificationNumber"
            value={formData.authorizedPersonCertificationNumber}
            onChange={(e) => handleFieldChange('authorizedPersonCertificationNumber', e.target.value)}
            placeholder="e.g., LOTO-CERT-2025-001"
          />

          <FormField
            label="Maintenance Supervisor"
            name="maintenanceSupervisor"
            value={formData.maintenanceSupervisor}
            onChange={(e) => handleFieldChange('maintenanceSupervisor', e.target.value)}
            placeholder="Supervisor name"
          />

          <FormField
            label="Maintenance Supervisor Phone"
            name="maintenanceSupervisorPhone"
            type="tel"
            value={formData.maintenanceSupervisorPhone}
            onChange={(e) => handleFieldChange('maintenanceSupervisorPhone', e.target.value)}
            placeholder="(555) 123-4567"
          />

          <FormField
            label="Safety Manager"
            name="safetyManager"
            value={formData.safetyManager}
            onChange={(e) => handleFieldChange('safetyManager', e.target.value)}
            placeholder="Safety manager name"
          />

          <FormField
            label="Safety Manager Phone"
            name="safetyManagerPhone"
            type="tel"
            value={formData.safetyManagerPhone}
            onChange={(e) => handleFieldChange('safetyManagerPhone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
      </FormSection>

      {/* ========== GROUP LOCKOUT ========== */}
      <FormSection title="Group Lockout Provisions" icon="👥">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Group Lockout Required?"
            name="groupLockout"
            type="select"
            value={formData.groupLockout}
            onChange={(e) => handleFieldChange('groupLockout', e.target.value)}
            options={[
              { value: 'no', label: 'No - Single worker' },
              { value: 'yes', label: 'Yes - Multiple workers' },
            ]}
          />

          {formData.groupLockout === 'yes' && (
            <>
              <FormField
                label="Group Lockout Coordinator"
                name="groupLockoutCoordinator"
                value={formData.groupLockoutCoordinator}
                onChange={(e) => handleFieldChange('groupLockoutCoordinator', e.target.value)}
                placeholder="Coordinator name"
                error={errors.groupLockoutCoordinator}
                required
              />

              <FormField
                label="Number of Workers Involved"
                name="numberOfWorkersInvolved"
                type="number"
                value={formData.numberOfWorkersInvolved}
                onChange={(e) => handleFieldChange('numberOfWorkersInvolved', e.target.value)}
                placeholder="Total workers"
              />

              <FormField
                label="Group Hasp Used?"
                name="groupHaspUsed"
                type="select"
                value={formData.groupHaspUsed}
                onChange={(e) => handleFieldChange('groupHaspUsed', e.target.value)}
                options={[
                  { value: 'no', label: 'No' },
                  { value: 'yes', label: 'Yes - Group hasp in use' },
                ]}
              />
            </>
          )}
        </div>
      </FormSection>

      {/* ========== AFFECTED PERSONNEL NOTIFICATION ========== */}
      <FormSection title="Affected Personnel Notification Log" icon="📢">
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
          <div className="flex">
            <Users className="text-orange-600 mr-2" size={20} />
            <p className="text-sm text-orange-800">
              All affected employees must be notified before lockout begins. Document who was notified and when.
            </p>
          </div>
        </div>

        {affectedPersonnel.map((person, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Affected Person #{index + 1}</h4>
              {affectedPersonnel.length > 1 && (
                <button
                  onClick={() => handleRemoveAffectedPerson(index)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-semibold"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <FormField
                label="Employee Name"
                name={`affectedName-${index}`}
                value={person.name}
                onChange={(e) => handleAffectedPersonChange(index, 'name', e.target.value)}
                placeholder="Full name"
              />
              <FormField
                label="Notified By"
                name={`notifiedBy-${index}`}
                value={person.notifiedBy}
                onChange={(e) => handleAffectedPersonChange(index, 'notifiedBy', e.target.value)}
                placeholder="Who notified them"
              />
              <FormField
                label="Notification Time"
                name={`notificationTime-${index}`}
                type="time"
                value={person.notificationTime}
                onChange={(e) => handleAffectedPersonChange(index, 'notificationTime', e.target.value)}
              />
              <FormField
                label="Signature/Initials"
                name={`signature-${index}`}
                value={person.signature}
                onChange={(e) => handleAffectedPersonChange(index, 'signature', e.target.value)}
                placeholder="Initials"
              />
            </div>
          </div>
        ))}

        <button
          onClick={handleAddAffectedPerson}
          className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold text-sm"
        >
          + Add Affected Person
        </button>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="All Affected Employees Notified?"
            name="affectedEmployeesNotified"
            type="select"
            value={formData.affectedEmployeesNotified}
            onChange={(e) => handleFieldChange('affectedEmployeesNotified', e.target.value)}
            options={[
              { value: 'no', label: 'No - NOT COMPLIANT' },
              { value: 'yes', label: 'Yes - All notified' },
            ]}
            error={errors.affectedEmployeesNotified}
            required
          />

          <FormField
            label="Production Supervisor Notified?"
            name="productionSupervisorNotified"
            type="select"
            value={formData.productionSupervisorNotified}
            onChange={(e) => handleFieldChange('productionSupervisorNotified', e.target.value)}
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' },
            ]}
          />

          {formData.productionSupervisorNotified === 'yes' && (
            <>
              <FormField
                label="Production Supervisor Name"
                name="productionSupervisorName"
                value={formData.productionSupervisorName}
                onChange={(e) => handleFieldChange('productionSupervisorName', e.target.value)}
                placeholder="Supervisor name"
              />

              <FormField
                label="Notification Time"
                name="productionNotificationTime"
                type="time"
                value={formData.productionNotificationTime}
                onChange={(e) => handleFieldChange('productionNotificationTime', e.target.value)}
              />
            </>
          )}

          <FormField
            label="Area Posted with Warning Signs?"
            name="areaPostedWithSigns"
            type="select"
            value={formData.areaPostedWithSigns}
            onChange={(e) => handleFieldChange('areaPostedWithSigns', e.target.value)}
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes - Signs posted' },
            ]}
          />

          <FormField
            label="Area Barricaded?"
            name="areaBarricaded"
            type="select"
            value={formData.areaBarricaded}
            onChange={(e) => handleFieldChange('areaBarricaded', e.target.value)}
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes - Barricades in place' },
            ]}
          />
        </div>
      </FormSection>

      {/* ========== SHIFT CHANGE PROCEDURES ========== */}
      <FormSection title="Shift Change Procedures" icon="🔄">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Shift Change Expected?"
            name="shiftChangeExpected"
            type="select"
            value={formData.shiftChangeExpected}
            onChange={(e) => handleFieldChange('shiftChangeExpected', e.target.value)}
            options={[
              { value: 'no', label: 'No - Work within single shift' },
              { value: 'yes', label: 'Yes - Shift change required' },
            ]}
          />

          {formData.shiftChangeExpected === 'yes' && (
            <>
              <FormField
                label="Outgoing Shift Employee"
                name="outgoingShiftEmployee"
                value={formData.outgoingShiftEmployee}
                onChange={(e) => handleFieldChange('outgoingShiftEmployee', e.target.value)}
                placeholder="Employee ending shift"
              />

              <FormField
                label="Incoming Shift Employee"
                name="incomingShiftEmployee"
                value={formData.incomingShiftEmployee}
                onChange={(e) => handleFieldChange('incomingShiftEmployee', e.target.value)}
                placeholder="Employee starting shift"
              />

              <FormField
                label="Shift Transfer Procedure"
                name="shiftChangeTransferProcedure"
                type="textarea"
                value={formData.shiftChangeTransferProcedure}
                onChange={(e) => handleFieldChange('shiftChangeTransferProcedure', e.target.value)}
                placeholder="Describe lockout transfer procedure, verification, and sign-off"
                rows={3}
              />
            </>
          )}
        </div>
      </FormSection>

      {/* ========== PERMIT INTEGRATION ========== */}
      <FormSection title="Work Permit Integration" icon="📄">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Hot Work Permit Required?"
            name="hotWorkPermitRequired"
            type="select"
            value={formData.hotWorkPermitRequired}
            onChange={(e) => handleFieldChange('hotWorkPermitRequired', e.target.value)}
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes - Hot work permit required' },
            ]}
          />

          {formData.hotWorkPermitRequired === 'yes' && (
            <FormField
              label="Hot Work Permit Number"
              name="hotWorkPermitNumber"
              value={formData.hotWorkPermitNumber}
              onChange={(e) => handleFieldChange('hotWorkPermitNumber', e.target.value)}
              placeholder="HWP-2025-001"
            />
          )}

          <FormField
            label="Confined Space Permit Required?"
            name="confinedSpacePermitRequired"
            type="select"
            value={formData.confinedSpacePermitRequired}
            onChange={(e) => handleFieldChange('confinedSpacePermitRequired', e.target.value)}
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes - Confined space permit required' },
            ]}
          />

          {formData.confinedSpacePermitRequired === 'yes' && (
            <FormField
              label="Confined Space Permit Number"
              name="confinedSpacePermitNumber"
              value={formData.confinedSpacePermitNumber}
              onChange={(e) => handleFieldChange('confinedSpacePermitNumber', e.target.value)}
              placeholder="CSP-2025-001"
            />
          )}

          <FormField
            label="Electrical Work Permit Required?"
            name="electricalWorkPermitRequired"
            type="select"
            value={formData.electricalWorkPermitRequired}
            onChange={(e) => handleFieldChange('electricalWorkPermitRequired', e.target.value)}
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes - Electrical work permit required' },
            ]}
          />

          {formData.electricalWorkPermitRequired === 'yes' && (
            <>
              <FormField
                label="Electrical Work Permit Number"
                name="electricalWorkPermitNumber"
                value={formData.electricalWorkPermitNumber}
                onChange={(e) => handleFieldChange('electricalWorkPermitNumber', e.target.value)}
                placeholder="EWP-2025-001"
              />

              <FormField
                label="Arc Flash Boundary (feet)"
                name="arcFlashBoundary"
                value={formData.arcFlashBoundary}
                onChange={(e) => handleFieldChange('arcFlashBoundary', e.target.value)}
                placeholder="e.g., 4 feet"
              />
            </>
          )}
        </div>
      </FormSection>

      {/* ========== LOCKOUT STEPS ========== */}
      <FormSection title="Step-by-Step Lockout Procedure" icon="📝">
        {lockoutSteps.map((step, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
            <div className="flex gap-4">
              <div className="flex-none">
                <div className="text-sm font-semibold text-gray-700">Step {step.stepNumber}</div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  label="Action"
                  name={`stepAction-${index}`}
                  value={step.action}
                  onChange={(e) => handleLockoutStepChange(index, 'action', e.target.value)}
                  placeholder={`Describe action for step ${step.stepNumber}`}
                />
                <FormField
                  label="Verified By"
                  name={`stepVerifiedBy-${index}`}
                  value={step.verifiedBy}
                  onChange={(e) => handleLockoutStepChange(index, 'verifiedBy', e.target.value)}
                  placeholder="Name of person who verified"
                />
              </div>
              {lockoutSteps.length > 1 && (
                <button
                  onClick={() => handleRemoveLockoutStep(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm font-semibold"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={handleAddLockoutStep}
          className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold text-sm"
        >
          + Add Step
        </button>
      </FormSection>

      {/* ========== DE-ENERGIZATION ========== */}
      <FormSection title="De-energization Confirmation">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="De-energized By (Name)"
            name="deenergizedBy"
            value={formData.deenergizedBy}
            onChange={(e) => handleFieldChange('deenergizedBy', e.target.value)}
          />

          <FormField
            label="De-energization Date"
            name="deenergizedDate"
            type="date"
            value={formData.deenergizedDate}
            onChange={(e) => handleFieldChange('deenergizedDate', e.target.value)}
          />

          <FormField
            label="De-energization Time"
            name="deenergizedTime"
            type="time"
            value={formData.deenergizedTime}
            onChange={(e) => handleFieldChange('deenergizedTime', e.target.value)}
          />
        </div>
      </FormSection>

      {/* ========== POST-LOCKOUT VERIFICATION ========== */}
      <FormSection title="Post-Lockout Hazard Verification">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Verified By (Name)"
            name="verifiedBy"
            value={formData.verifiedBy}
            onChange={(e) => handleFieldChange('verifiedBy', e.target.value)}
          />

          <FormField
            label="Verification Date"
            name="verificationDate"
            type="date"
            value={formData.verificationDate}
            onChange={(e) => handleFieldChange('verificationDate', e.target.value)}
          />

          <FormField
            label="Verification Time"
            name="verificationTime"
            type="time"
            value={formData.verificationTime}
            onChange={(e) => handleFieldChange('verificationTime', e.target.value)}
          />
        </div>

        <FormField
          label="Verification Results"
          name="verificationResults"
          type="select"
          value={formData.verificationResults}
          onChange={(e) => handleFieldChange('verificationResults', e.target.value)}
          options={[
            { value: 'pass', label: 'PASS - No hazardous energy detected' },
            { value: 'fail', label: 'FAIL - Hazardous energy remains' },
          ]}
        />

        {formData.verificationResults === 'fail' && (
          <FormField
            label="Explain Verification Failure"
            name="residualEnergyChecks"
            type="textarea"
            value={formData.residualEnergyChecks}
            onChange={(e) => handleFieldChange('residualEnergyChecks', e.target.value)}
            placeholder="What residual energy remains and what corrective action is needed"
            rows={3}
          />
        )}
      </FormSection>

      {/* ========== MAINTENANCE NOTES ========== */}
      <FormSection title="Maintenance Work Performed">
        <FormField
          label="Maintenance Work Description"
          name="maintenanceNotes"
          type="textarea"
          value={formData.maintenanceNotes}
          onChange={(e) => handleFieldChange('maintenanceNotes', e.target.value)}
          placeholder="Describe maintenance work completed"
          rows={4}
        />

        <FormField
          label="Issues Found During Maintenance"
          name="issuesFound"
          type="textarea"
          value={formData.issuesFound}
          onChange={(e) => handleFieldChange('issuesFound', e.target.value)}
          placeholder="Any unexpected issues or problems discovered"
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Follow-Up Required?"
            name="followUpRequired"
            type="select"
            value={formData.followUpRequired}
            onChange={(e) => handleFieldChange('followUpRequired', e.target.value)}
            options={[
              { value: 'no', label: 'No follow-up needed' },
              { value: 'yes', label: 'Yes - Follow-up required' },
            ]}
          />

          {formData.followUpRequired === 'yes' && (
            <FormField
              label="Follow-Up Details"
              name="followUpDetails"
              type="textarea"
              value={formData.followUpDetails}
              onChange={(e) => handleFieldChange('followUpDetails', e.target.value)}
              placeholder="Describe required follow-up actions"
              rows={2}
            />
          )}
        </div>

        <FormField
          label="Additional Observations"
          name="additionalObservations"
          type="textarea"
          value={formData.additionalObservations}
          onChange={(e) => handleFieldChange('additionalObservations', e.target.value)}
          placeholder="Any other observations or recommended actions"
          rows={3}
        />
      </FormSection>

      {/* ========== RESTORATION/RE-ENERGIZATION CHECKLIST ========== */}
      <FormSection title="⚡ Pre-Restoration Checklist (CRITICAL)" icon="✅">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <ClipboardCheck className="text-yellow-600 mr-2" size={24} />
            <div>
              <p className="text-sm font-bold text-yellow-800">ALL ITEMS MUST BE CHECKED BEFORE REMOVING LOCKOUT</p>
              <p className="text-sm text-yellow-800">Failure to verify these items can result in injury or death.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="All Tools & Materials Removed?"
            name="allToolsRemoved"
            type="select"
            value={formData.allToolsRemoved}
            onChange={(e) => handleFieldChange('allToolsRemoved', e.target.value)}
            options={[
              { value: 'no', label: 'No - NOT SAFE TO RESTORE' },
              { value: 'yes', label: 'Yes - All tools removed' },
            ]}
          />

          <FormField
            label="All Guards/Safety Devices Reinstalled?"
            name="allGuardsReinstalled"
            type="select"
            value={formData.allGuardsReinstalled}
            onChange={(e) => handleFieldChange('allGuardsReinstalled', e.target.value)}
            options={[
              { value: 'no', label: 'No - NOT SAFE TO RESTORE' },
              { value: 'yes', label: 'Yes - Guards reinstalled' },
            ]}
          />

          <FormField
            label="Area Cleared of All Personnel?"
            name="areaClearedOfPersonnel"
            type="select"
            value={formData.areaClearedOfPersonnel}
            onChange={(e) => handleFieldChange('areaClearedOfPersonnel', e.target.value)}
            options={[
              { value: 'no', label: 'No - NOT SAFE TO RESTORE' },
              { value: 'yes', label: 'Yes - Area is clear' },
            ]}
          />

          <FormField
            label="Equipment Inspection Complete?"
            name="equipmentInspectionComplete"
            type="select"
            value={formData.equipmentInspectionComplete}
            onChange={(e) => handleFieldChange('equipmentInspectionComplete', e.target.value)}
            options={[
              { value: 'no', label: 'No - NOT SAFE TO RESTORE' },
              { value: 'yes', label: 'Yes - Inspection complete' },
            ]}
          />

          <FormField
            label="All Control Switches in OFF Position?"
            name="controlSwitchesInOff"
            type="select"
            value={formData.controlSwitchesInOff}
            onChange={(e) => handleFieldChange('controlSwitchesInOff', e.target.value)}
            options={[
              { value: 'no', label: 'No - NOT SAFE TO RESTORE' },
              { value: 'yes', label: 'Yes - Controls in OFF' },
            ]}
          />

          <FormField
            label="Sanitation Verified? (if food contact)"
            name="sanitationVerified"
            type="select"
            value={formData.sanitationVerified}
            onChange={(e) => handleFieldChange('sanitationVerified', e.target.value)}
            options={[
              { value: 'no', label: 'No / Not applicable' },
              { value: 'yes', label: 'Yes - Sanitation verified' },
            ]}
          />

          <FormField
            label="Test Run Completed?"
            name="testRunCompleted"
            type="select"
            value={formData.testRunCompleted}
            onChange={(e) => handleFieldChange('testRunCompleted', e.target.value)}
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes - Test run successful' },
            ]}
          />

          {formData.testRunCompleted === 'yes' && (
            <FormField
              label="Test Run Results"
              name="testRunResults"
              type="textarea"
              value={formData.testRunResults}
              onChange={(e) => handleFieldChange('testRunResults', e.target.value)}
              placeholder="Describe test run results and any issues"
              rows={2}
            />
          )}
        </div>
      </FormSection>

      {/* ========== RESTORATION STEPS ========== */}
      <FormSection title="Step-by-Step Restoration Procedure" icon="🔄">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <p className="text-sm text-gray-600">
            Re-energization steps are the lockout steps performed in reverse order.
            Use the button to auto-fill, then add verified-by names when each step is completed.
          </p>
          <button
            type="button"
            onClick={handleAutoFillRestorationFromLockout}
            disabled={!lockoutSteps.some(s => s.action && s.action.trim())}
            className="flex-none flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-300 rounded font-semibold text-sm whitespace-nowrap transition-colors"
          >
            ↩ Auto-fill from Lockout Steps (Reversed)
          </button>
        </div>

        {restorationSteps.map((step, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
            <div className="flex gap-4">
              <div className="flex-none">
                <div className="text-sm font-semibold text-gray-700">Step {step.stepNumber}</div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  label="Restoration Action"
                  name={`restorationAction-${index}`}
                  value={step.action}
                  onChange={(e) => handleRestorationStepChange(index, 'action', e.target.value)}
                  placeholder={`Describe restoration action for step ${step.stepNumber}`}
                />
                <FormField
                  label="Verified By"
                  name={`restorationVerifiedBy-${index}`}
                  value={step.verifiedBy}
                  onChange={(e) => handleRestorationStepChange(index, 'verifiedBy', e.target.value)}
                  placeholder="Name of person who verified"
                />
              </div>
              {restorationSteps.length > 1 && (
                <button
                  onClick={() => handleRemoveRestorationStep(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm font-semibold"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={handleAddRestorationStep}
          className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold text-sm"
        >
          + Add Restoration Step
        </button>

        <div className="mt-4">
          <FormField
            label="Re-energization Sequence Details"
            name="reEnergizationSequence"
            type="textarea"
            value={formData.reEnergizationSequence}
            onChange={(e) => handleFieldChange('reEnergizationSequence', e.target.value)}
            placeholder="Describe the complete re-energization sequence and any special precautions"
            rows={3}
          />
        </div>
      </FormSection>

      {/* ========== LOCKOUT REMOVAL ========== */}
      <FormSection title="Lockout Removal & Equipment Restart">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Removed By (Name)"
            name="removedBy"
            value={formData.removedBy}
            onChange={(e) => handleFieldChange('removedBy', e.target.value)}
          />

          <FormField
            label="Removal Date"
            name="removalDate"
            type="date"
            value={formData.removalDate}
            onChange={(e) => handleFieldChange('removalDate', e.target.value)}
          />

          <FormField
            label="Removal Time"
            name="removalTime"
            type="time"
            value={formData.removalTime}
            onChange={(e) => handleFieldChange('removalTime', e.target.value)}
          />

          <FormField
            label="Supervisor Approval Name"
            name="supervisorApproval"
            value={formData.supervisorApproval}
            onChange={(e) => handleFieldChange('supervisorApproval', e.target.value)}
            placeholder="Supervisor who approved restart"
          />

          <FormField
            label="Supervisor Approval Time"
            name="supervisorApprovalTime"
            type="time"
            value={formData.supervisorApprovalTime}
            onChange={(e) => handleFieldChange('supervisorApprovalTime', e.target.value)}
          />
        </div>
      </FormSection>

      {/* ========== EMERGENCY CONTACTS ========== */}
      <FormSection title="Emergency Contacts" icon="📞">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Emergency Contact Name"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={(e) => handleFieldChange('emergencyContactName', e.target.value)}
            placeholder="Primary emergency contact"
          />

          <FormField
            label="Emergency Contact Phone"
            name="emergencyContactPhone"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) => handleFieldChange('emergencyContactPhone', e.target.value)}
            placeholder="(555) 123-4567"
          />

          <FormField
            label="After-Hours Contact Name"
            name="afterHoursContact"
            value={formData.afterHoursContact}
            onChange={(e) => handleFieldChange('afterHoursContact', e.target.value)}
            placeholder="After-hours contact"
          />

          <FormField
            label="After-Hours Contact Phone"
            name="afterHoursContactPhone"
            type="tel"
            value={formData.afterHoursContactPhone}
            onChange={(e) => handleFieldChange('afterHoursContactPhone', e.target.value)}
            placeholder="(555) 987-6543"
          />
        </div>
      </FormSection>

      {/* ========== REGULATORY COMPLIANCE ========== */}
      <FormSection title="Regulatory Compliance Documentation" icon="📋">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="OSHA 29 CFR 1910.147 Compliant?"
            name="oshaCompliant"
            type="select"
            value={formData.oshaCompliant}
            onChange={(e) => handleFieldChange('oshaCompliant', e.target.value)}
            options={[
              { value: 'no', label: 'No - Not compliant' },
              { value: 'yes', label: 'Yes - OSHA compliant' },
            ]}
          />

          <FormField
            label="Annual LOTO Inspection Date"
            name="annualInspectionDate"
            type="date"
            value={formData.annualInspectionDate}
            onChange={(e) => handleFieldChange('annualInspectionDate', e.target.value)}
          />

          <FormField
            label="Periodic Inspection Date (Group Lockout)"
            name="periodicInspectionDate"
            type="date"
            value={formData.periodicInspectionDate}
            onChange={(e) => handleFieldChange('periodicInspectionDate', e.target.value)}
          />

          <FormField
            label="FDA/HACCP Considerations?"
            name="fdaHaccpConsidered"
            type="select"
            value={formData.fdaHaccpConsidered}
            onChange={(e) => handleFieldChange('fdaHaccpConsidered', e.target.value)}
            options={[
              { value: 'no', label: 'No / Not applicable' },
              { value: 'yes', label: 'Yes - FDA/HACCP considered' },
            ]}
          />
        </div>
      </FormSection>

      {/* ========== PREVIOUS LOTO HISTORY ========== */}
      <FormSection title="Previous LOTO History (if applicable)">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            label="Previous LOTO Date for This Equipment"
            name="previousLotoDate"
            type="date"
            value={formData.previousLotoDate}
            onChange={(e) => handleFieldChange('previousLotoDate', e.target.value)}
          />

          <FormField
            label="Previous LOTO Issues/Lessons Learned"
            name="previousLotoIssues"
            type="textarea"
            value={formData.previousLotoIssues}
            onChange={(e) => handleFieldChange('previousLotoIssues', e.target.value)}
            placeholder="Any issues from previous lockouts on this equipment"
            rows={3}
          />
        </div>
      </FormSection>

      {/* ========== PHOTO DOCUMENTATION ========== */}
      <FormSection title="Photo Documentation">
        <PhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onCaptionUpdate={handleCaptionUpdate}
          onPhotoDelete={handlePhotoDelete}
          label="Document lockout status, isolation points, and equipment condition"
          maxImages={20}
        />
      </FormSection>

      {/* ========== SUBMIT BUTTONS ========== */}
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
        formTitle="LOTO (Lockout/Tagout) Form"
        formData={formData}
        onConfirm={handleConfirmSubmit}
        onEdit={() => setShowPreview(false)}
        onClose={() => setShowPreview(false)}
        isSubmitting={isLoading}
        submitButtonText="Confirm & Submit Form"
      />

      {/* Safety Card Display Modal */}
      {showCardDisplay && (
        <SafetyCardDisplay
          lotoData={formData}
          formId={currentFormId}
          formType="loto"
          onClose={handleCloseCards}
        />
      )}
    </div>
  );
};

export default LOTOFormEnhanced;
