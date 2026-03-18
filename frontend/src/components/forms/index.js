/**
 * Forms Module - Main Export
 * Centralized export for all form-related components
 */

// Core Components
export { default as FormContainer } from './FormContainer';
export { default as FormSelector } from './FormSelector';
export { default as FormComponents } from './FormComponents';

// Registry
export {
  FORM_REGISTRY,
  getFormConfig,
  getFormsByCategory,
  getAllFormIds,
  getFormComponent,
  formExists
} from './FormRegistry';

// Individual Form Components
export { default as JSAForm } from './JSAForm';
export { default as LOTOForm } from './LOTOForm';
export { default as InjuryReportForm } from './InjuryReportForm';
export { default as AccidentReportForm } from './AccidentReportForm';
export { default as SpillReleaseForm } from './SpillReleaseForm';
export { default as InspectionForm } from './InspectionForm';

/**
 * USAGE EXAMPLES:
 *
 * 1. Use FormContainer for complete form management:
 *    import { FormContainer } from './components/forms';
 *    <FormContainer
 *      selectedFormId={selectedForm}
 *      onFormSelect={setSelectedForm}
 *      onFormSubmit={handleSubmit}
 *    />
 *
 * 2. Use FormRegistry to get form metadata:
 *    import { getFormConfig, FORM_REGISTRY } from './components/forms';
 *    const formConfig = getFormConfig('jsa');
 *
 * 3. Import individual form components:
 *    import { JSAForm, LOTOForm } from './components/forms';
 */
