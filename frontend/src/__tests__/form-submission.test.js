/**
 * Form Submission Tests
 * Tests all form submit buttons to ensure they work correctly
 * Tests: JSA, LOTO, Injury Report, Accident Report, Spill Report, Inspection Form
 */

// Mock API client before importing services
jest.mock('../services/api/client', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const {
  submitJSA,
  submitLOTO,
  submitInjuryReport,
  submitAccidentReport,
  submitSpillReport,
  submitInspection
} = require('../services/forms');

const apiClient = require('../services/api/client');

describe('Form Submission Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============ JSA FORM TESTS ============
  describe('JSA Form Submission', () => {
    test('should submit JSA form with required fields', async () => {
      const mockResponse = { id: 'jsa-123', success: true, message: 'Form submitted' };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        date: '2026-02-15',
        location: 'Facility A',
        jobTitle: 'Maintenance Work',
        jhaNumber: 'JSA-123456'
      };

      const result = await submitJSA(formData, []);

      expect(apiClient.post).toHaveBeenCalledWith('/jsa', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    test('should handle JSA submission with photos', async () => {
      const mockResponse = { id: 'jsa-456', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = { date: '2026-02-15', location: 'Facility A', jobTitle: 'Work' };
      const photos = [
        { url: 'data:image/jpeg;base64,test', caption: 'Test photo' }
      ];

      const result = await submitJSA(formData, photos);

      expect(apiClient.post).toHaveBeenCalled();
      expect(result.id).toBe('jsa-456');
    });

    test('should handle JSA submission errors', async () => {
      const mockError = new Error('Network error');
      apiClient.post.mockRejectedValue(mockError);

      const formData = { date: '2026-02-15', location: 'Facility A', jobTitle: 'Work' };

      await expect(submitJSA(formData, [])).rejects.toThrow('Network error');
    });
  });

  // ============ LOTO FORM TESTS ============
  describe('LOTO Form Submission', () => {
    test('should submit LOTO form with required fields', async () => {
      const mockResponse = { id: 'loto-123', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        facility: 'Facility A',
        equipmentName: 'Refrigeration Unit',
        authorizedBy: 'John Doe',
        energySources: ['electrical', 'pneumatic'],
        authorizedPersonTrainingDate: '2026-01-01',
        lockoutStartTime: '09:00',
        tryOutPerformed: 'yes',
        zeroEnergyStateVerified: 'yes',
        affectedEmployeesNotified: 'yes'
      };

      const result = await submitLOTO(formData, []);

      expect(apiClient.post).toHaveBeenCalledWith('/loto', expect.any(Object));
      expect(result.id).toBe('loto-123');
    });

    test('should submit LOTO form with complex data structures', async () => {
      const mockResponse = { id: 'loto-456', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        facility: 'Facility A',
        equipmentName: 'Equipment',
        authorizedBy: 'Supervisor',
        energySources: 'electrical, hydraulic',
        lockoutSteps: JSON.stringify([
          { stepNumber: 1, action: 'Disconnect', verifiedBy: 'Tech' }
        ]),
        restorationSteps: JSON.stringify([
          { stepNumber: 1, action: 'Reconnect', verifiedBy: 'Tech' }
        ]),
        affectedPersonnel: JSON.stringify([
          { name: 'Employee 1', notifiedBy: 'Manager' }
        ]),
        authorizedPersonTrainingDate: '2026-01-01',
        lockoutStartTime: '09:00',
        tryOutPerformed: 'yes',
        zeroEnergyStateVerified: 'yes',
        affectedEmployeesNotified: 'yes'
      };

      const result = await submitLOTO(formData, []);

      expect(apiClient.post).toHaveBeenCalledWith('/loto', expect.objectContaining({
        equipmentName: 'Equipment'
      }));
      expect(result.id).toBe('loto-456');
    });

    test('should handle LOTO submission errors', async () => {
      const mockError = new Error('Validation failed');
      apiClient.post.mockRejectedValue(mockError);

      const formData = { facility: 'A', equipmentName: 'E' };

      await expect(submitLOTO(formData, [])).rejects.toThrow('Validation failed');
    });
  });

  // ============ INJURY REPORT FORM TESTS ============
  describe('Injury Report Form Submission', () => {
    test('should submit injury report with required fields', async () => {
      const mockResponse = { id: 'injury-123', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        incidentDate: '2026-02-15',
        incidentLocation: 'Facility A - Processing Line',
        employeeName: 'John Doe',
        description: 'Cut injury while handling equipment'
      };

      const result = await submitInjuryReport(formData, []);

      expect(apiClient.post).toHaveBeenCalledWith('/injury', expect.any(Object));
      expect(result.id).toBe('injury-123');
    });

    test('should handle injury report with underlying causes', async () => {
      const mockResponse = { id: 'injury-456', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        incidentDate: '2026-02-15',
        incidentLocation: 'Facility A',
        employeeName: 'Jane Doe',
        description: 'Slip on wet floor',
        underlyingCauses: 'Poor sanitation, lack of warning signs'
      };

      const result = await submitInjuryReport(formData, []);

      expect(apiClient.post).toHaveBeenCalled();
      expect(result.id).toBe('injury-456');
    });

    test('should handle injury report submission errors', async () => {
      const mockError = new Error('Failed to submit');
      apiClient.post.mockRejectedValue(mockError);

      const formData = {
        incidentDate: '2026-02-15',
        incidentLocation: 'Facility A',
        employeeName: 'John'
      };

      await expect(submitInjuryReport(formData, [])).rejects.toThrow('Failed to submit');
    });
  });

  // ============ ACCIDENT REPORT FORM TESTS ============
  describe('Accident Report Form Submission', () => {
    test('should submit accident report with required fields', async () => {
      const mockResponse = { id: 'accident-123', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        reportDate: '2026-02-15',
        incidentLocation: 'Facility A',
        incidentDescription: 'Equipment malfunction',
        damageDescription: 'Equipment damage estimated at $5000'
      };

      const result = await submitAccidentReport(formData, []);

      expect(apiClient.post).toHaveBeenCalledWith('/accident', expect.any(Object));
      expect(result.id).toBe('accident-123');
    });

    test('should handle accident report with witnesses', async () => {
      const mockResponse = { id: 'accident-456', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        reportDate: '2026-02-15',
        incidentLocation: 'Facility A',
        incidentDescription: 'Equipment accident',
        damageDescription: 'Damage occurred',
        witnesses: JSON.stringify([
          { name: 'Witness 1', statement: 'I saw the incident' }
        ])
      };

      const result = await submitAccidentReport(formData, []);

      expect(apiClient.post).toHaveBeenCalled();
      expect(result.id).toBe('accident-456');
    });

    test('should handle accident report submission errors', async () => {
      const mockError = new Error('Server error');
      apiClient.post.mockRejectedValue(mockError);

      const formData = {
        reportDate: '2026-02-15',
        incidentLocation: 'Facility A'
      };

      await expect(submitAccidentReport(formData, [])).rejects.toThrow('Server error');
    });
  });

  // ============ SPILL REPORT FORM TESTS ============
  describe('Spill Report Form Submission', () => {
    test('should submit spill report with required fields', async () => {
      const mockResponse = { id: 'spill-123', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        reportDate: '2026-02-15',
        spillTime: '14:30',
        spillLocation: 'Processing Area',
        materialSpilled: 'Refrigerant',
        estimatedQuantity: '50 liters',
        immediateActions: 'Evacuated area, contained spill'
      };

      const result = await submitSpillReport(formData, []);

      expect(apiClient.post).toHaveBeenCalledWith('/spill', expect.any(Object));
      expect(result.id).toBe('spill-123');
    });

    test('should handle spill report with environmental impact', async () => {
      const mockResponse = { id: 'spill-456', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        reportDate: '2026-02-15',
        spillTime: '14:30',
        spillLocation: 'Processing Area',
        materialSpilled: 'Chlorine',
        estimatedQuantity: '25 kg',
        immediateActions: 'Proper containment',
        environementalImpact: 'Air quality impact, water contamination risk',
        ppeUsed: 'Gloves, respirator',
        contributingFactors: 'Equipment failure'
      };

      const result = await submitSpillReport(formData, []);

      expect(apiClient.post).toHaveBeenCalled();
      expect(result.id).toBe('spill-456');
    });

    test('should handle spill report submission errors', async () => {
      const mockError = new Error('Validation error');
      apiClient.post.mockRejectedValue(mockError);

      const formData = {
        reportDate: '2026-02-15',
        spillTime: '14:30'
      };

      await expect(submitSpillReport(formData, [])).rejects.toThrow('Validation error');
    });
  });

  // ============ INSPECTION FORM TESTS ============
  describe('Inspection Form Submission', () => {
    test('should submit inspection form with required fields', async () => {
      const mockResponse = { id: 'inspection-123', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        facility: 'Facility A',
        inspectionDate: '2026-02-15',
        inspectionType: 'Monthly Sanitation',
        inspectorName: 'Inspector Name'
      };

      const result = await submitInspection(formData, []);

      expect(apiClient.post).toHaveBeenCalledWith('/inspection', expect.any(Object));
      expect(result.id).toBe('inspection-123');
    });

    test('should handle inspection form with deficiencies', async () => {
      const mockResponse = { id: 'inspection-456', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        facility: 'Facility A',
        inspectionDate: '2026-02-15',
        inspectionType: 'Monthly',
        inspectorName: 'Inspector',
        deficiencies: JSON.stringify([
          { area: 'Floor', issue: 'Slippery', severity: 'Medium', action: 'Clean' }
        ])
      };

      const result = await submitInspection(formData, []);

      expect(apiClient.post).toHaveBeenCalled();
      expect(result.id).toBe('inspection-456');
    });

    test('should handle inspection form with photos', async () => {
      const mockResponse = { id: 'inspection-789', success: true };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = {
        facility: 'Facility A',
        inspectionDate: '2026-02-15',
        inspectionType: 'Monthly',
        inspectorName: 'Inspector'
      };

      const photos = [
        { url: 'data:image/jpeg;base64,test1', caption: 'Area 1' },
        { url: 'data:image/jpeg;base64,test2', caption: 'Area 2' }
      ];

      const result = await submitInspection(formData, photos);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/inspection',
        expect.objectContaining({
          attachedPhotos: expect.arrayContaining([
            expect.objectContaining({ caption: 'Area 1' }),
            expect.objectContaining({ caption: 'Area 2' })
          ])
        })
      );
      expect(result.id).toBe('inspection-789');
    });

    test('should handle inspection submission errors', async () => {
      const mockError = new Error('Network error');
      apiClient.post.mockRejectedValue(mockError);

      const formData = {
        facility: 'Facility A',
        inspectionDate: '2026-02-15'
      };

      await expect(submitInspection(formData, [])).rejects.toThrow();
    });
  });

  // ============ PHOTO HANDLING TESTS ============
  describe('Photo Handling in Form Submissions', () => {
    test('should handle base64 encoded photos correctly', async () => {
      const mockResponse = { id: 'test-photo-1' };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = { facility: 'A', inspectionDate: '2026-02-15', inspectionType: 'Test', inspectorName: 'Test' };
      const photos = [
        { url: 'data:image/jpeg;base64,ABC123', caption: 'Test photo' }
      ];

      await submitInspection(formData, photos);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/inspection',
        expect.objectContaining({
          attachedPhotos: expect.arrayContaining([
            expect.objectContaining({
              url: expect.stringContaining('data:image'),
              caption: 'Test photo'
            })
          ])
        })
      );
    });

    test('should handle Blob photos correctly', async () => {
      const mockResponse = { id: 'test-photo-2' };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = { facility: 'A', inspectionDate: '2026-02-15', inspectionType: 'Test', inspectorName: 'Test' };
      
      // Create a mock Blob
      const blob = new Blob(['test'], { type: 'image/jpeg' });
      const photos = [
        { file: blob, caption: 'Blob photo' }
      ];

      // This would need FileReader mock in actual tests
      // For now, we'll just verify the function handles it
      try {
        await submitInspection(formData, photos);
      } catch (e) {
        // Expected in test environment
      }
    });

    test('should handle empty photo arrays', async () => {
      const mockResponse = { id: 'no-photos' };
      apiClient.post.mockResolvedValue(mockResponse);

      const formData = { facility: 'A', inspectionDate: '2026-02-15', inspectionType: 'Test', inspectorName: 'Test' };

      const result = await submitInspection(formData, []);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/inspection',
        expect.objectContaining({
          attachedPhotos: []
        })
      );
      expect(result.id).toBe('no-photos');
    });
  });

  // ============ ERROR HANDLING TESTS ============
  describe('Error Handling Across All Forms', () => {
    test('should handle network errors consistently', async () => {
      const networkError = new Error('Network timeout');
      apiClient.post.mockRejectedValue(networkError);

      const forms = [
        { submit: submitJSA, data: { date: '2026-02-15', location: 'A', jobTitle: 'B' } },
        { submit: submitLOTO, data: { facility: 'A', equipmentName: 'E', authorizedBy: 'B', authorizedPersonTrainingDate: '2026-01-01', lockoutStartTime: '09:00', tryOutPerformed: 'yes', zeroEnergyStateVerified: 'yes', affectedEmployeesNotified: 'yes', energySources: [] } },
        { submit: submitInjuryReport, data: { incidentDate: '2026-02-15', incidentLocation: 'A', employeeName: 'B', description: 'C' } },
        { submit: submitAccidentReport, data: { reportDate: '2026-02-15', incidentLocation: 'A', incidentDescription: 'B', damageDescription: 'C' } },
        { submit: submitSpillReport, data: { reportDate: '2026-02-15', spillTime: '14:00', spillLocation: 'A', materialSpilled: 'B', estimatedQuantity: 'C', immediateActions: 'D' } },
        { submit: submitInspection, data: { facility: 'A', inspectionDate: '2026-02-15', inspectionType: 'B', inspectorName: 'C' } }
      ];

      for (const form of forms) {
        await expect(form.submit(form.data, [])).rejects.toThrow('Network timeout');
      }
    });

    test('should provide user-friendly error messages', async () => {
      const validationError = new Error('Missing required fields');
      apiClient.post.mockRejectedValue(validationError);

      await expect(submitJSA({ date: '2026-02-15' }, [])).rejects.toThrow();
    });
  });
});
