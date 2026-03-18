/* eslint-disable no-console */
/**
 * Form Service - Handles form submission and API communication
 */

import apiClient from './api/client';

/**
 * Upload photos to server
 */
export const uploadPhotos = async (photos, formType, formId) => {
  try {
    const formData = new FormData();

    photos.forEach((photo, index) => {
      formData.append('files', photo.file);
      formData.append(`captions[${index}]`, photo.caption);
    });

    formData.append('type', formType);
    formData.append('formId', formId);

    return await apiClient.post('/uploads/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Submit JSA form
 */
export const submitJSA = async (formData, photos = []) => {
  try {
    // Convert photos to base64 for inclusion in form data
    const photosWithBase64 = await Promise.all(photos.map(async (photo) => {
      let base64Data = null;
      
      if (photo.url?.startsWith('data:image')) {
        base64Data = photo.url;
      } else if (photo.file instanceof Blob) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(photo.file);
        });
      }
      
      return {
        url: base64Data,
        caption: photo.caption || '',
        fileName: photo.fileName || 'photo'
      };
    }));

    // Add photos to form data
    const submissionData = {
      ...formData,
      attachedPhotos: photosWithBase64
    };

    const response = await apiClient.post('/jsa', submissionData);
    return response;
  } catch (error) {
    console.error('JSA submission error:', error);
    throw error;
  }
};

/**
 * Submit LOTO form
 */
export const submitLOTO = async (formData, photos = []) => {
  try {
    // Convert photos to base64 for inclusion in form data
    const photosWithBase64 = await Promise.all(photos.map(async (photo) => {
      let base64Data = null;
      
      if (photo.url?.startsWith('data:image')) {
        base64Data = photo.url;
      } else if (photo.file instanceof Blob) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(photo.file);
        });
      }
      
      return {
        url: base64Data,
        caption: photo.caption || '',
        fileName: photo.fileName || 'photo'
      };
    }));

    // Add photos to form data
    const submissionData = {
      ...formData,
      attachedPhotos: photosWithBase64
    };

    const response = await apiClient.post('/loto', submissionData);
    return response;
  } catch (error) {
    console.error('LOTO submission error:', error);
    throw error;
  }
};

/**
 * Submit Injury/Illness Report
 */
export const submitInjuryReport = async (formData, photos = []) => {
  try {
    // Convert photos to base64 for inclusion in form data
    const photosWithBase64 = await Promise.all(photos.map(async (photo) => {
      let base64Data = null;
      
      if (photo.url?.startsWith('data:image')) {
        base64Data = photo.url;
      } else if (photo.file instanceof Blob) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(photo.file);
        });
      }
      
      return {
        url: base64Data,
        caption: photo.caption || '',
        fileName: photo.fileName || 'photo'
      };
    }));

    // Add photos to form data
    const submissionData = {
      ...formData,
      attachedPhotos: photosWithBase64
    };

    const response = await apiClient.post('/injury', submissionData);
    return response;
  } catch (error) {
    console.error('Injury submission error:', error);
    throw error;
  }
};

/**
 * Submit Accident Report
 */
export const submitAccidentReport = async (formData, photos = []) => {
  try {
    // Convert photos to base64 for inclusion in form data
    const photosWithBase64 = await Promise.all(photos.map(async (photo) => {
      let base64Data = null;
      
      if (photo.url?.startsWith('data:image')) {
        base64Data = photo.url;
      } else if (photo.file instanceof Blob) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(photo.file);
        });
      }
      
      return {
        url: base64Data,
        caption: photo.caption || '',
        fileName: photo.fileName || 'photo'
      };
    }));

    // Add photos to form data
    const submissionData = {
      ...formData,
      attachedPhotos: photosWithBase64
    };

    const response = await apiClient.post('/accident', submissionData);
    return response;
  } catch (error) {
    console.error('Accident submission error:', error);
    throw error;
  }
};

/**
 * Submit Spill/Release Report
 */
export const submitSpillReport = async (formData, photos = []) => {
  try {
    // Convert photos to base64 for inclusion in form data
    const photosWithBase64 = await Promise.all(photos.map(async (photo) => {
      let base64Data = null;
      
      if (photo.url?.startsWith('data:image')) {
        base64Data = photo.url;
      } else if (photo.file instanceof Blob) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(photo.file);
        });
      }
      
      return {
        url: base64Data,
        caption: photo.caption || '',
        fileName: photo.fileName || 'photo'
      };
    }));

    // Add photos to form data
    const submissionData = {
      ...formData,
      attachedPhotos: photosWithBase64
    };

    const response = await apiClient.post('/spill', submissionData);
    return response;
  } catch (error) {
    console.error('Spill submission error:', error);
    throw error;
  }
};

/**
 * Submit Monthly Inspection
 */
export const submitInspection = async (formData, photos = []) => {
  try {
    console.log(`[INSPECTION] Submitting with ${photos.length} photo(s)`);
    
    // Convert photos to base64 for inclusion in form data
    const photosWithBase64 = await Promise.all(photos.map(async (photo, index) => {
      // Validate photo object
      if (!photo || typeof photo !== 'object') {
        console.warn(`[INSPECTION] Photo ${index} is invalid, skipping`);
        return null;
      }

      console.log(`[INSPECTION] Processing photo ${index + 1}: caption="${photo.caption || '[empty]'}"`);
      
      let base64Data = null;
      
      if (photo.url?.startsWith('data:image')) {
        // Already base64
        base64Data = photo.url;
      } else if (photo.file instanceof Blob) {
        // Convert blob to base64
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (_e) => reject(new Error('Failed to read file'));
          reader.readAsDataURL(photo.file);
        });
      }
      
      // Only include photo if we have base64 data
      if (!base64Data) {
        console.warn(`[INSPECTION] Photo ${index + 1}: No base64 data, skipping`);
        return null;
      }
      
      const photoWithBase64 = {
        url: base64Data,
        caption: (photo.caption && typeof photo.caption === 'string') ? photo.caption.trim() : '',
        fileName: photo.fileName || 'photo'
      };
      
      console.log(`[INSPECTION] Photo ${index + 1}: ✅ base64 ready, caption="${photoWithBase64.caption}"`);
      
      return photoWithBase64;
    }));

    // Filter out null/invalid entries
    const validPhotos = photosWithBase64.filter(p => p !== null);
    console.log(`[INSPECTION] Valid photos after processing: ${validPhotos.length}/${photos.length}`);

    // Add photos to form data before submission
    const submissionData = {
      ...formData,
      attachedPhotos: validPhotos
    };

    console.log(`[INSPECTION] Sending to server...`);
    
    const response = await apiClient.post('/inspection', submissionData);
    
    // Validate response has expected structure
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response from server: expected JSON object');
    }
    
    console.log(`[INSPECTION] ✅ Submitted successfully, Form ID: ${response.id || response.formId || 'unknown'}`);
    
    return response;
  } catch (error) {
    console.error('[INSPECTION] Submission error:', error);
    
    // Provide user-friendly error message
    let userMessage = error.message || 'Failed to submit inspection report';
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      userMessage = 'Network error: Could not connect to server. Check your connection and try again.';
    } else if (error.status >= 500) {
      userMessage = 'Server error: The server encountered an issue. Please try again later.';
    }
    
    throw new Error(userMessage);
  }
};

/**
 * Convert an array of photo objects to base64-encoded format for API submission.
 * Reused by all submit functions and saveDraft.
 */
export const convertPhotosToBase64 = async (photos = []) => {
  const results = await Promise.all(photos.map(async (photo) => {
    if (!photo || typeof photo !== 'object') return null;
    let base64Data = null;
    if (photo.url?.startsWith('data:image')) {
      base64Data = photo.url;
    } else if (photo.file instanceof Blob) {
      base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(photo.file);
      });
    }
    if (!base64Data) return null;
    return { url: base64Data, caption: photo.caption || '', fileName: photo.fileName || 'photo' };
  }));
  return results.filter(Boolean);
};

/**
 * Save or update a draft form.
 * If formId is null → creates a new draft record (POST to /{formType}).
 * If formId is set → updates the existing record (PUT /forms/{formId}).
 */
export const saveDraft = async (formType, formData, photos = [], formId = null) => {
  try {
    const photosWithBase64 = await convertPhotosToBase64(photos);
    const payload = { ...formData, attachedPhotos: photosWithBase64, status: 'draft' };
    if (formId) {
      return await apiClient.put(`/forms/${formId}`, { formData: payload, status: 'draft' });
    }
    // Map frontend type keys to backend routes
    const routeMap = { spillReport: 'spill', monthlyInspection: 'inspection' };
    const route = routeMap[formType] || formType;
    return await apiClient.post(`/${route}`, payload);
  } catch (error) {
    console.error('Save draft error:', error);
    throw error;
  }
};

/**
 * Submit a previously-saved draft as a final submission.
 * Uses PUT /forms/{formId} with status='submitted' so AI report triggers.
 */
export const submitDraft = async (formId, formData, photos = []) => {
  try {
    const photosWithBase64 = await convertPhotosToBase64(photos);
    const payload = { ...formData, attachedPhotos: photosWithBase64 };
    return await apiClient.put(`/forms/${formId}`, { formData: payload, status: 'submitted' });
  } catch (error) {
    console.error('Submit draft error:', error);
    throw error;
  }
};

/**
 * Get the current user's forms list.
 * Optional filters: { type, status, page, limit }
 */
export const getMyForms = async ({ type, status, page = 1, limit = 20 } = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (type)   params.set('type', type);
    if (status) params.set('status', status);
    return await apiClient.get(`/forms?${params}`);
  } catch (error) {
    console.error('Get my forms error:', error);
    throw error;
  }
};

/**
 * Load a single form by ID (for resuming a draft or revising a submission).
 */
export const loadForm = async (formId) => {
  try {
    return await apiClient.get(`/forms/${formId}`);
  } catch (error) {
    console.error('Load form error:', error);
    throw error;
  }
};

/**
 * Get form data (for editing)
 */
export const getFormData = async (formType, formId) => {
  try {
    return await apiClient.get(`/${formType}/${formId}`);
  } catch (error) {
    console.error('Get form error:', error);
    throw error;
  }
};

/**
 * Update form data
 */
export const updateFormData = async (formType, formId, formData) => {
  try {
    return await apiClient.put(`/${formType}/${formId}`, formData);
  } catch (error) {
    console.error('Update form error:', error);
    throw error;
  }
};

/**
 * Export form as PDF
 */
export const exportFormPDF = async (formType, formId) => {
  try {
    // Map frontend form type IDs to backend route names
    const formTypeToRoute = {
      'jsa': 'jsa',
      'loto': 'loto',
      'injury': 'injury',
      'accident': 'accident',
      'spillReport': 'spill',
      'monthlyInspection': 'inspection'
    };
    
    // Get the correct backend route for this form type
    const backendRoute = formTypeToRoute[formType] || formType;
    
    const response = await apiClient.get(`/${backendRoute}/${formId}/export-pdf`, {
      responseType: 'blob'
    });

    // Map form types to professional document names
    const formTypeNames = {
      'jsa': 'Job_Safety_Analysis',
      'loto': 'Lockout_Tagout_Procedure',
      'injury': 'Injury_Illness_Report',
      'accident': 'Accident_Report',
      'spillReport': 'Emergency_Spill_Release_Report',
      'monthlyInspection': 'Monthly_Hygiene_Inspection'
    };

    // Generate professional document name
    const docName = formTypeNames[formType] || 'Safety_Form';
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `${docName}_${formId}_${timestamp}.pdf`;

    // Create download link
    const url = window.URL.createObjectURL(response);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log(`[PDF Export] Downloaded: ${fileName}`);

    return response;
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
};

/**
 * Get list of forms
 */
export const getFormsList = async (formType, page = 1, limit = 10, filters = {}) => {
  try {
    const params = { page, limit, ...filters };
    return await apiClient.get(`/${formType}`, { params });
  } catch (error) {
    console.error('Get forms list error:', error);
    throw error;
  }
};

/**
 * Delete form
 */
export const deleteForm = async (formType, formId) => {
  try {
    return await apiClient.delete(`/${formType}/${formId}`);
  } catch (error) {
    console.error('Delete form error:', error);
    throw error;
  }
};

/**
 * Validate form data
 */
export const validateFormData = (formData, requiredFields) => {
  const errors = {};

  requiredFields.forEach(field => {
    if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
      errors[field] = `${field} is required`;
    }
  });

  return errors;
};

export default {
  uploadPhotos,
  convertPhotosToBase64,
  saveDraft,
  submitDraft,
  getMyForms,
  loadForm,
  submitJSA,
  submitLOTO,
  submitInjuryReport,
  submitAccidentReport,
  submitSpillReport,
  submitInspection,
  getFormData,
  updateFormData,
  exportFormPDF,
  getFormsList,
  deleteForm,
  validateFormData
};
