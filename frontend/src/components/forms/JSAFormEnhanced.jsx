/* eslint-disable no-unused-vars, react/function-component-definition, react-hooks/exhaustive-deps */
/**
 * Job Safety Analysis (JSA) Form
 * Professional JSA/JHA form matching industry standards
 * Based on Westscan and OSHA requirements
 */

import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import PhotoCapture from '../common/PhotoCapture';
import { FormPreviewModal } from '../common/FormPreviewModal';
import SafetyCardDisplay from '../cards/SafetyCardDisplay';
import {
  FormSection,
  FormField,
  CheckboxArray,
  FormButtonGroup,
  FormDivider,
  FormAlert,
  FormIndicator
} from './FormComponents';
import { submitJSA, saveDraft, submitDraft } from '../../services/forms';
import { getFacilityOptions } from '../../constants/facilities';
import {
  SEAFOOD_SPECIES,
  WORK_AREAS,
  EQUIPMENT_BY_AREA,
  HAZARDS_BY_AREA,
  PPE_MATRIX,
  PPE_OPTIONS,
  PLANT_OFFICE_NUMBERS
} from '../../data/seafoodOperationsData';

const JSAFormEnhanced = ({ onSuccess, onCancel, formId: initialFormId = null, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(initialData?._step || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showCardDisplay, setShowCardDisplay] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(initialFormId);

  const [formData, setFormData] = useState(() => ({
    // Facility
    facility: '',

    // Header Information (matching professional JSA)
    date: new Date().toISOString().split('T')[0],
    location: '',
    jhaNumber: `JSA-${Date.now()}`, // Auto-generated
    revisionNumber: '0',
    contactNumber: '',
    responsibleSupervisor: '',
    jhaTeamMembers: '',

    // Job Description
    jobDescription: '',
    jobTitle: '',
    species: '',
    speciesOther: '',
    workArea: '',
    workAreaOther: '',
    equipment: '',
    equipmentOther: '',
    department: '',

    // Work Team Member Classifications (can add multiple)
    workTeamMembers: [{
      classification: '',
      personalProtection: [],
      plantEquipmentTools: '',
      isolationTaggingCommunication: ''
    }],

    // Permit Conditions (important notice)
    permitConditionsAcknowledged: false,

    // Job Steps Analysis (matching professional JSA table)
    jobSteps: [{
      stepNumber: 1,
      jobStep: '',
      hazardsIdentified: '',
      controlMeasures: ''
    }],

    // Additional hazards checklist (complementary)
    commonHazards: [],
    commonControls: [],
    ppeRequired: [],

    // Review & Approval
    preparedBy: '',
    preparedDate: new Date().toISOString().split('T')[0],
    reviewedBy: '',
    reviewDate: '',
    approvedBy: '',
    approvalDate: '',
    notes: '',
    ...(initialData ? {
      ...initialData,
      workTeamMembers: Array.isArray(initialData.workTeamMembers)
        ? initialData.workTeamMembers
        : (typeof initialData.workTeamMembers === 'string' && initialData.workTeamMembers
          ? (() => { try { return JSON.parse(initialData.workTeamMembers); } catch { return [{ classification: '', personalProtection: [], plantEquipmentTools: '', isolationTaggingCommunication: '' }]; } })()
          : [{ classification: '', personalProtection: [], plantEquipmentTools: '', isolationTaggingCommunication: '' }]),
      jobSteps: Array.isArray(initialData.jobSteps)
        ? initialData.jobSteps
        : (typeof initialData.jobSteps === 'string' && initialData.jobSteps
          ? (() => { try { return JSON.parse(initialData.jobSteps); } catch { return [{ stepNumber: 1, jobStep: '', hazardsIdentified: '', controlMeasures: '' }]; } })()
          : [{ stepNumber: 1, jobStep: '', hazardsIdentified: '', controlMeasures: '' }]),
    } : {}),
  }));

  // Dropdown Options
  const jobTitles = [
    // Production & Processing
    'Fish Processor',
    'Fillet Operator',
    'Header Operator',
    'Trim / Inspection Worker',
    'Roe Technician',
    'Egg House Technician',
    'Crab Processor / Picker',
    'Baader Technician',
    'Ryco Operator',
    'Case-Up Personnel',
    'Packaging Technician',
    'Freezer Personnel',
    // Warehouse & Logistics
    'Forklift Operator',
    'Shipping / Receiving Clerk',
    'Dock Personnel',
    'Crane Operator',
    'Warehouse Worker',
    // Sanitation & Quality
    'Sanitation Worker',
    'Quality Control Technician',
    'QA Supervisor',
    // Maintenance & Engineering
    'Maintenance Technician',
    'Refrigeration Technician',
    'Electrician',
    'Welder',
    'Boiler Engineer',
    'Chief Engineer',
    // Leadership & Support
    'Production Lead',
    'Supervisor',
    'Safety Manager',
    'Safety Coordinator',
    'Office / Administrative Staff',
    'Other'
  ];

  // Map imported work areas to dropdown format
  const workAreas = WORK_AREAS.map(area => area.label);
  
  // Get equipment options based on selected work area
  const getEquipmentOptions = () => {
    if (!formData.workArea) return [];
    const selectedArea = WORK_AREAS.find(a => a.label === formData.workArea);
    if (!selectedArea || !EQUIPMENT_BY_AREA[selectedArea.id]) return [];
    return EQUIPMENT_BY_AREA[selectedArea.id].map(eq => eq.label);
  };
  
  // Get auto-populated hazards based on species and work area
  const getAutoPopulatedHazards = () => {
    const hazards = [];
    
    // Add hazards from selected species
    if (formData.species) {
      const species = SEAFOOD_SPECIES.find(s => s.label === formData.species);
      if (species && species.hazards) {
        hazards.push(...species.hazards);
      }
    }
    
    // Add hazards from selected work area
    if (formData.workArea) {
      const area = WORK_AREAS.find(a => a.label === formData.workArea);
      if (area && area.hazards) {
        hazards.push(...area.hazards);
      }
    }
    
    // Remove duplicates
    return [...new Set(hazards)];
  };
  
  // Get auto-populated PPE based on job title (from matrix)
  const getAutoPopulatedPPE = () => {
    if (!formData.jobTitle || !PPE_MATRIX[formData.jobTitle]) return [];
    return PPE_MATRIX[formData.jobTitle] || [];
  };

  const workerClassifications = [
    'Locating Technician',
    'Cable Locator',
    'Equipment Operator',
    'Site Supervisor',
    'Safety Officer',
    'Maintenance Worker',
    'Production Worker',
    'Quality Inspector',
    'Forklift Operator',
    'Machine Operator',
    'General Laborer'
  ];

  const ppeOptions = [
    { id: 'hard-hat', label: 'Hard Hat' },
    { id: 'bump-cap', label: 'Bump Cap' },
    { id: 'safety-glasses', label: 'Safety Glasses' },
    { id: 'goggles', label: 'Safety Goggles' },
    { id: 'face-shield', label: 'Face Shield' },
    { id: 'hearing-protection', label: 'Hearing Protection' },
    { id: 'respirator', label: 'Respirator' },
    { id: 'dust-mask', label: 'Dust Mask' },
    { id: 'cut-resistant-gloves', label: 'Cut-Resistant Gloves' },
    { id: 'thermal-gloves', label: 'Thermal Gloves' },
    { id: 'rubber-gloves', label: 'Rubber Gloves' },
    { id: 'long-pants', label: 'Long Pants' },
    { id: 'long-shirt', label: 'Long Shirt/Sleeves' },
    { id: 'safety-boots', label: 'Steel-Toed Safety Boots' },
    { id: 'rubber-boots', label: 'Rubber Boots' },
    { id: 'safety-vest', label: 'High-Visibility Safety Vest' },
    { id: 'apron', label: 'Cut-Resistant Apron' },
    { id: 'cold-gear', label: 'Cold Weather Gear' },
    { id: 'sunscreen', label: 'Sunscreen' }
  ];

  const commonHazards = [
    { id: 'unauthorized-access', label: 'Unauthorized Access' },
    { id: 'unaware-procedures', label: 'Not Inducted/Unaware of Site Procedures' },
    { id: 'misunderstanding-work', label: 'Misunderstanding of Work to be Performed' },
    { id: 'tripping', label: 'Tripping on Uneven Ground' },
    { id: 'traffic', label: 'Working in Traffic/Though Way' },
    { id: 'straining-back', label: 'Straining Back When Lifting' },
    { id: 'faulty-equipment', label: 'Faulty Equipment' },
    { id: 'tracing-multiple-lines', label: 'Tracing Multiple Lines' },
    { id: 'single-scan', label: 'Single Scan (Missing Services)' },
    { id: 'muscle-strain-lifting', label: 'Muscle Strain When Lifting' },
    { id: 'leaving-without-notice', label: 'Leaving Without Notification' },
    { id: 'sharp-objects', label: 'Sharp Objects (Knives, Blades)' },
    { id: 'cold-exposure', label: 'Cold Exposure' },
    { id: 'hot-surfaces', label: 'Hot Surfaces/Equipment' },
    { id: 'chemical-exposure', label: 'Chemical Exposure' },
    { id: 'electrical', label: 'Electrical Hazards' },
    { id: 'noise', label: 'Excessive Noise' },
    { id: 'slip-fall', label: 'Slip/Fall Hazards' },
    { id: 'moving-machinery', label: 'Moving Machinery' },
    { id: 'confined-space', label: 'Confined Spaces' }
  ];

  const commonControls = [
    { id: 'confirm-client', label: 'Confirm with Client' },
    { id: 'follow-site-requirements', label: 'Follow Site Requirements' },
    { id: 'review-scope', label: 'Review Scope and Confirm' },
    { id: 'mindful-holes', label: 'Be Mindful of Holes and High Spots' },
    { id: 'setup-witches-hat', label: 'Setup Witches Hat and/or Spotter to Direct Traffic if Required' },
    { id: 'use-correct-lifting', label: 'Use Correct Lifting Technique' },
    { id: 'review-startup-confirm', label: 'Review Setup and Confirm Correct' },
    { id: 'work-clear-pattern', label: 'Work in a Clear Pattern and Trace Out Each Line' },
    { id: 'reverse-scan', label: 'Reverse Scan' },
    { id: 'use-correct-lifting-technique', label: 'Use Correct Lifting Technique' },
    { id: 'confirm-work-complete', label: 'Confirm Client Works Complete, Sign Out' },
    { id: 'equipment-guards', label: 'Equipment Guards' },
    { id: 'employee-training', label: 'Employee Training' },
    { id: 'ppe-required', label: 'Personal Protective Equipment (PPE)' },
    { id: 'regular-inspection', label: 'Regular Inspection' },
    { id: 'equipment-maintenance', label: 'Equipment Maintenance' },
    { id: 'warning-signage', label: 'Warning Signs/Labels' },
    { id: 'safe-work-procedures', label: 'Safe Work Procedures' },
    { id: 'ventilation', label: 'Ventilation System' },
    { id: 'lockout-tagout', label: 'Equipment Isolation/Lockout-Tagout' },
    { id: 'supervision', label: 'Adequate Supervision' }
  ];

  // Handlers
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Auto-populate hazards when species or workArea changes
      if (field === 'species' || field === 'workArea') {
        const autoHazards = getAutoPopulatedHazards();
        updated.commonHazards = autoHazards;
      }
      
      // Auto-populate PPE when jobTitle changes
      if (field === 'jobTitle') {
        const autoPPE = getAutoPopulatedPPE();
        updated.ppeRequired = autoPPE;
      }
      
      // Clear "Other" field when dropdown selection changes
      if (field === 'species') updated.speciesOther = '';
      if (field === 'workArea') updated.workAreaOther = '';
      if (field === 'equipment') updated.equipmentOther = '';
      
      return updated;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleWorkTeamMemberChange = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      workTeamMembers: prev.workTeamMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      )
    }));
  }, []);

  const addWorkTeamMember = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      workTeamMembers: [
        ...prev.workTeamMembers,
        {
          classification: '',
          personalProtection: [],
          plantEquipmentTools: '',
          isolationTaggingCommunication: ''
        }
      ]
    }));
  }, []);

  const removeWorkTeamMember = useCallback((index) => {
    if (formData.workTeamMembers.length > 1) {
      setFormData(prev => ({
        ...prev,
        workTeamMembers: prev.workTeamMembers.filter((_, i) => i !== index)
      }));
    }
  }, [formData.workTeamMembers.length]);

  const handleJobStepChange = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      jobSteps: prev.jobSteps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      )
    }));
  }, []);

  const addJobStep = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      jobSteps: [
        ...prev.jobSteps,
        {
          stepNumber: prev.jobSteps.length + 1,
          jobStep: '',
          hazardsIdentified: '',
          controlMeasures: ''
        }
      ]
    }));
  }, []);

  const removeJobStep = useCallback((index) => {
    if (formData.jobSteps.length > 1) {
      setFormData(prev => ({
        ...prev,
        jobSteps: prev.jobSteps.filter((_, i) => i !== index).map((step, i) => ({
          ...step,
          stepNumber: i + 1
        }))
      }));
    }
  }, [formData.jobSteps.length]);

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
      const draftData = { ...formData, _step: currentStep };
      const result = await saveDraft('jsa', draftData, capturedPhotos, currentFormId);
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

  const validateStep = useCallback((step) => {
    const newErrors = {};

    // Only require facility on step 1, no other blocking validations
    if (step === 1) {
      if (!formData.facility) newErrors.facility = 'Facility is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateStep(4)) {
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

      // Prepare submission data
      const submissionData = {
        ...formData,
        workTeamMembers: JSON.stringify(formData.workTeamMembers),
        jobSteps: JSON.stringify(formData.jobSteps),
        commonHazards: formData.commonHazards.join(', '),
        commonControls: formData.commonControls.join(', '),
        ppeRequired: formData.ppeRequired.join(', ')
      };

      let response;
      if (currentFormId) {
        response = await submitDraft(currentFormId, submissionData, capturedPhotos);
      } else {
        response = await submitJSA(submissionData, capturedPhotos);
      }

      setSuccessMessage(`JSA submitted successfully! Generating safety cards...`);
      setShowPreview(false);
      const newId = response?.id || response?.formId || response?.data?.id || currentFormId;
      setCurrentFormId(newId);

      // Show cards after brief delay
      setTimeout(() => {
        setShowCardDisplay(true);
        setSuccessMessage('');
      }, 1500);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit JSA. Please try again.');
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

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
      {/* Professional Header */}
      <div className="border-b-4 border-blue-600 pb-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Job Safety Analysis</h2>
            <p className="text-sm text-gray-600">JHA/JSA - Comprehensive Hazard Assessment</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">JHA No: {formData.jhaNumber}</p>
            <p className="text-xs text-gray-500">Revision: {formData.revisionNumber}</p>
          </div>
        </div>
      </div>

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

      <FormIndicator currentStep={currentStep} totalSteps={4} />

      {/* Step 1: Header Information & Job Description */}
      {currentStep === 1 && (
        <div>
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

          <FormSection title="Step 1: Header Information" description="Essential project and contact details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                required
              />

              <FormField
                label="Location"
                name="location"
                placeholder="e.g., Boat Ramp, Processing Floor A"
                value={formData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                error={errors.location}
                required
              />

              <FormField
                label="Managing Department or Supervisor"
                name="responsibleSupervisor"
                placeholder="e.g., Joe Blogs"
                value={formData.responsibleSupervisor}
                onChange={(e) => handleFieldChange('responsibleSupervisor', e.target.value)}
                error={errors.responsibleSupervisor}
                required
              />

              <FormField
                label="Plant Office Number"
                name="contactNumber"
                type="select"
                value={formData.contactNumber}
                onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                options={PLANT_OFFICE_NUMBERS}
                error={errors.contactNumber}
                required
              />
            </div>

            <FormField
              label="JHA Team Members"
              name="jhaTeamMembers"
              placeholder="e.g., Bill Friend, John Smith, Mary Johnson"
              value={formData.jhaTeamMembers}
              onChange={(e) => handleFieldChange('jhaTeamMembers', e.target.value)}
              helpText="Enter names of all team members involved in this analysis"
            />

            <FormDivider label="Job Information" />

            <FormField
              label="Job Description"
              name="jobDescription"
              type="textarea"
              placeholder="e.g., Locate the boat ramp car park street light cabling"
              value={formData.jobDescription}
              onChange={(e) => handleFieldChange('jobDescription', e.target.value)}
              error={errors.jobDescription}
              rows={3}
              required
              helpText="Provide a clear, comprehensive description of the work to be performed"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Job Title"
                name="jobTitle"
                type="select"
                value={formData.jobTitle}
                onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                options={jobTitles}
                error={errors.jobTitle}
                required
              />

              <FormField
                label="Seafood Species"
                name="species"
                type="select"
                value={formData.species}
                onChange={(e) => handleFieldChange('species', e.target.value)}
                options={SEAFOOD_SPECIES.map(s => s.label)}
                helpText="Selects species-specific hazards"
              />

              <FormField
                label="Work Area"
                name="workArea"
                type="select"
                value={formData.workArea}
                onChange={(e) => handleFieldChange('workArea', e.target.value)}
                options={workAreas}
                required
              />

              {formData.workArea && (
                <FormField
                  label="Equipment"
                  name="equipment"
                  type="select"
                  value={formData.equipment}
                  onChange={(e) => handleFieldChange('equipment', e.target.value)}
                  options={getEquipmentOptions()}
                  helpText="Equipment specific to selected area"
                />
              )}

              <FormField
                label="Department"
                name="department"
                value={formData.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
              />

              <FormField
                label="Revision Number"
                name="revisionNumber"
                value={formData.revisionNumber}
                onChange={(e) => handleFieldChange('revisionNumber', e.target.value)}
                helpText="Update when JSA is revised"
              />
            </div>

            {/* "Other - Specify" fields */}
            {formData.species === 'Other – Specify' && (
              <FormField
                label="Specify Species"
                name="speciesOther"
                value={formData.speciesOther}
                onChange={(e) => handleFieldChange('speciesOther', e.target.value)}
                placeholder="Enter species name"
                required
              />
            )}

            {formData.workArea && !Object.keys(EQUIPMENT_BY_AREA).some(k => WORK_AREAS.find(a => a.label === formData.workArea && a.id === k)) && (
              <FormField
                label="Specify Work Area"
                name="workAreaOther"
                value={formData.workAreaOther}
                onChange={(e) => handleFieldChange('workAreaOther', e.target.value)}
                placeholder="Enter work area name"
              />
            )}

            {formData.equipment && !getEquipmentOptions().includes(formData.equipment) && (
              <FormField
                label="Specify Equipment"
                name="equipmentOther"
                value={formData.equipmentOther}
                onChange={(e) => handleFieldChange('equipmentOther', e.target.value)}
                placeholder="Enter equipment name"
              />
            )}
          </FormSection>
        </div>
      )}

      {/* Step 2: Work Team Member Classifications */}
      {currentStep === 2 && (
        <div>
          <FormSection
            title="Step 2: Work Team Member Classifications"
            description="Define roles, protection requirements, equipment, and communication needs"
          >
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> For each team member or role, specify their classification,
                required personal protection, equipment/tools, and isolation/communication requirements.
              </p>
            </div>

            {formData.workTeamMembers.map((member, index) => (
              <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Team Member #{index + 1}</h4>
                  {formData.workTeamMembers.length > 1 && (
                    <button
                      onClick={() => removeWorkTeamMember(index)}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>

                <FormField
                  label="Work Team Member Classification"
                  name="classification"
                  type="select"
                  value={member.classification}
                  onChange={(e) => handleWorkTeamMemberChange(index, 'classification', e.target.value)}
                  options={workerClassifications}
                  error={errors[`workTeamMember_${index}_classification`]}
                  required
                />

                <FormField
                  label="Personal Protection Requirements"
                  name="personalProtection"
                  type="textarea"
                  placeholder="e.g., Long Pants, Long shirt, Hat, Sunscreen, Safety boots"
                  value={member.personalProtection}
                  onChange={(e) => handleWorkTeamMemberChange(index, 'personalProtection', e.target.value)}
                  rows={2}
                  helpText="List all PPE and protective clothing required for this role"
                />

                <FormField
                  label="Required Tools & Equipment"
                  name="plantEquipmentTools"
                  type="textarea"
                  placeholder="e.g., Cable locate"
                  value={member.plantEquipmentTools}
                  onChange={(e) => handleWorkTeamMemberChange(index, 'plantEquipmentTools', e.target.value)}
                  rows={2}
                  helpText="List all equipment, tools, and machinery needed"
                />

                <FormField
                  label="Specific Considerations and Procedures"
                  name="isolationTaggingCommunication"
                  type="textarea"
                  placeholder="e.g., Witches hats"
                  value={member.isolationTaggingCommunication}
                  onChange={(e) => handleWorkTeamMemberChange(index, 'isolationTaggingCommunication', e.target.value)}
                  rows={2}
                  helpText="Specify safety signs, barriers, communication devices, lockout/tagout requirements"
                />
              </div>
            ))}

            <button
              onClick={addWorkTeamMember}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded transition flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Another Team Member
            </button>
          </FormSection>
        </div>
      )}

      {/* Step 3: Job Steps & Hazard Analysis */}
      {currentStep === 3 && (
        <div>
          {/* Important Warning Banner */}
          <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  READ & UNDERSTAND PERMIT CONDITIONS - IF IN DOUBT ASK!
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="permitAcknowledged"
                    checked={formData.permitConditionsAcknowledged}
                    onChange={(e) => handleFieldChange('permitConditionsAcknowledged', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="permitAcknowledged" className="text-sm text-gray-900">
                    I have read and understood all permit conditions and site requirements
                  </label>
                </div>
                {errors.permitConditionsAcknowledged && (
                  <p className="text-sm text-red-600 mt-1">{errors.permitConditionsAcknowledged}</p>
                )}
              </div>
            </div>
          </div>

          <FormSection
            title="Step 3: Job Steps & Hazard Analysis"
            description="Break down the job into steps and identify hazards and controls for each"
          >
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Instructions:</strong> For each step of the job:
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Describe what the worker does in this step</li>
                <li>Identify all potential hazards in this step</li>
                <li>Specify the control measures to eliminate or minimize each hazard</li>
              </ol>
            </div>

            {formData.jobSteps.map((step, index) => (
              <div key={index} className="mb-6 p-4 border-2 border-gray-300 rounded-lg bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-900 text-lg">Step {step.stepNumber}</h4>
                  {formData.jobSteps.length > 1 && (
                    <button
                      onClick={() => removeJobStep(index)}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Remove Step
                    </button>
                  )}
                </div>

                <FormField
                  label="Job Step"
                  name="jobStep"
                  type="textarea"
                  placeholder="e.g., Site access, Site induction, Commence work scope"
                  value={step.jobStep}
                  onChange={(e) => handleJobStepChange(index, 'jobStep', e.target.value)}
                  error={errors[`jobStep_${index}_jobStep`]}
                  rows={2}
                  required
                />

                <FormField
                  label="Hazards Identified"
                  name="hazardsIdentified"
                  type="textarea"
                  placeholder="e.g., Unauthorised access, Not inducted/unaware of site procedures"
                  value={step.hazardsIdentified}
                  onChange={(e) => handleJobStepChange(index, 'hazardsIdentified', e.target.value)}
                  error={errors[`jobStep_${index}_hazards`]}
                  rows={2}
                  required
                  helpText="List all potential hazards specific to this step"
                />

                <FormField
                  label="Control Measure"
                  name="controlMeasures"
                  type="textarea"
                  placeholder="e.g., Confirm with client, Follow site requirements"
                  value={step.controlMeasures}
                  onChange={(e) => handleJobStepChange(index, 'controlMeasures', e.target.value)}
                  error={errors[`jobStep_${index}_controls`]}
                  rows={2}
                  required
                  helpText="Describe how to perform this step safely and control each hazard"
                />
              </div>
            ))}

            <button
              onClick={addJobStep}
              className="w-full bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-4 rounded transition flex items-center justify-center gap-2 mb-6"
            >
              <Plus size={18} />
              Add Another Job Step
            </button>

            <FormDivider label="Additional Hazards & Controls Checklist" />

            <p className="text-sm text-gray-600 mb-4">
              Select common hazards and controls that apply to this job (optional supplement to step-by-step analysis):
            </p>

            <CheckboxArray
              label="Common Hazards"
              name="commonHazards"
              items={commonHazards}
              values={formData.commonHazards}
              onChange={(e) => handleFieldChange('commonHazards', e.target.value)}
            />

            <CheckboxArray
              label="Common Control Measures"
              name="commonControls"
              items={commonControls}
              values={formData.commonControls}
              onChange={(e) => handleFieldChange('commonControls', e.target.value)}
            />

            <CheckboxArray
              label="Personal Protective Equipment (PPE) Required"
              name="ppeRequired"
              items={ppeOptions}
              values={formData.ppeRequired}
              onChange={(e) => handleFieldChange('ppeRequired', e.target.value)}
            />
          </FormSection>
        </div>
      )}

      {/* Step 4: Review, Approval & Photos */}
      {currentStep === 4 && (
        <div>
          <FormSection title="Step 4: Review, Approval & Evidence">
            <FormDivider label="Form Preparation" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Prepared By (Name)"
                name="preparedBy"
                value={formData.preparedBy}
                onChange={(e) => handleFieldChange('preparedBy', e.target.value)}
                error={errors.preparedBy}
                required
              />

              <FormField
                label="Prepared Date"
                name="preparedDate"
                type="date"
                value={formData.preparedDate}
                onChange={(e) => handleFieldChange('preparedDate', e.target.value)}
              />
            </div>

            <FormDivider label="Review & Approval" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Reviewed By (Name)"
                name="reviewedBy"
                value={formData.reviewedBy}
                onChange={(e) => handleFieldChange('reviewedBy', e.target.value)}
                error={errors.reviewedBy}
                required
              />

              <FormField
                label="Review Date"
                name="reviewDate"
                type="date"
                value={formData.reviewDate}
                onChange={(e) => handleFieldChange('reviewDate', e.target.value)}
              />

              <FormField
                label="Approved By (Name)"
                name="approvedBy"
                value={formData.approvedBy}
                onChange={(e) => handleFieldChange('approvedBy', e.target.value)}
                error={errors.approvedBy}
                required
              />

              <FormField
                label="Approval Date"
                name="approvalDate"
                type="date"
                value={formData.approvalDate}
                onChange={(e) => handleFieldChange('approvalDate', e.target.value)}
              />
            </div>

            <FormField
              label="Additional Notes/Comments"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Any additional safety information, recommendations, or special considerations"
              rows={4}
              maxLength={1000}
            />

            <FormDivider label="Photo Evidence" />

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-900">
                Capture photos of the work area, equipment, hazards, and controls to document site conditions.
              </p>
            </div>

            <PhotoCapture
              onPhotoCapture={handlePhotoCapture}
              onCaptionUpdate={handleCaptionUpdate}
              onPhotoDelete={handlePhotoDelete}
              label="Capture Work Site Photos"
              maxImages={10}
            />

            {capturedPhotos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {capturedPhotos.length} photo(s) captured
                </p>
              </div>
            )}
          </FormSection>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 1 || isLoading || isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800 rounded transition"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <button
          onClick={handleSaveDraft}
          disabled={isLoading || isSaving}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold rounded transition whitespace-nowrap"
        >
          {isSaving ? 'Saving…' : currentFormId ? 'Update Draft' : 'Save Draft'}
        </button>

        {currentStep < 4 ? (
          <button
            onClick={handleNextStep}
            disabled={isLoading || isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition"
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading || isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded transition"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Preview & Submit
              </>
            )}
          </button>
        )}

        <button
          onClick={onCancel}
          disabled={isLoading || isSaving}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800 rounded transition"
        >
          Cancel
        </button>
      </div>

      {/* Form Preview Modal */}
      <FormPreviewModal
        isOpen={showPreview}
        formTitle="Job Safety Analysis (JSA)"
        formData={formData}
        onConfirm={handleConfirmSubmit}
        onEdit={() => setShowPreview(false)}
        onClose={() => setShowPreview(false)}
        isSubmitting={isLoading}
        submitButtonText="Confirm & Submit JSA"
      />

      {/* Safety Card Display Modal */}
      {showCardDisplay && (
        <SafetyCardDisplay
          jsaData={formData}
          formId={currentFormId}
          formType="jsa"
          onClose={handleCloseCards}
        />
      )}
    </div>
  );
};

export default JSAFormEnhanced;
