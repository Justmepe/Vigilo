/**
 * Form Preview Modal Component Tests
 * Tests modal rendering, data display, and user interactions
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormPreviewModal, FormPreviewDisplay } from '../components/common/FormPreviewModal';

jest.mock('axios');
jest.mock('../services/forms');
jest.mock('../services/api/client');

describe('FormPreviewModal Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnClose = jest.fn();

  const mockFormData = {
    facility: 'Facility A',
    incidentDate: '2026-02-16',
    incidentTime: '10:30',
    description: 'Test incident',
    severity: 'moderate',
    employeeName: 'John Doe',
    employeeId: 'E123',
    department: 'Operations',
    injuryType: 'Cut',
    bodyPartAffected: 'Hand',
    medicalAttention: true,
    treatmentAtWork: false,
    witnesses: 'Jane Smith',
    immediateActor: 'Sharp object',
    preventiveMeasures: 'Better tool maintenance'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal when isOpen is true', () => {
    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Preview & Confirm')).toBeInTheDocument();
  });

  test('does not render modal when isOpen is false', () => {
    render(
      <FormPreviewModal
        isOpen={false}
        formTitle="Test Form"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Preview & Confirm')).not.toBeInTheDocument();
  });

  test('displays form title in preview', () => {
    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Injury Report"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Injury Report/i)).toBeInTheDocument();
  });

  test('displays form data in preview', () => {
    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Facility A')).toBeInTheDocument();
    expect(screen.getByText(/Operations/i)).toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', async () => {
    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  test('calls onEdit when back to edit button is clicked', async () => {
    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    const editButton = screen.getByRole('button', { name: /Back to Edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalled();
  });

  test('calls onClose when close button is clicked', async () => {
    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' }).closest('button');
    // Find the X button in the header
    const allButtons = screen.getAllByRole('button');
    const xButton = allButtons[0]; // Usually the close button is first
    fireEvent.click(xButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('shows loading state when submitting', () => {
    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
        isSubmitting={true}
      />
    );

    expect(screen.getByText(/Submitting/i)).toBeInTheDocument();
  });

  test('disables buttons when submitting', () => {
    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
        isSubmitting={true}
      />
    );

    const editButton = screen.getByRole('button', { name: /Back to Edit/i });
    expect(editButton).toBeDisabled();
  });

  test('displays custom submit button text', () => {
    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
        submitButtonText="Save & Process"
      />
    );

    expect(screen.getByText(/Save & Process/i)).toBeInTheDocument();
  });

  test('separates important fields from additional details', () => {
    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={mockFormData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    // Important fields should always be visible
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();

    // Additional details should be in collapsible section
    const additionalDetails = screen.getByText(/Additional Details/i);
    expect(additionalDetails).toBeInTheDocument();
  });

  test('displays boolean values as Yes/No', () => {
    const dataWithBooleans = {
      ...mockFormData,
      medicalAttention: true,
      treatmentAtWork: false
    };

    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={dataWithBooleans}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    // Boolean values should be displayed as Yes/No
    const content = screen.getByText(/Preview & Confirm/).closest('div').textContent;
    expect(content).toMatch(/Yes|No/);
  });

  test('handles empty field values gracefully', () => {
    const incompleteData = {
      facility: 'Facility A',
      employeeName: '',
      description: null,
      severity: undefined
    };

    render(
      <FormPreviewModal
        isOpen={true}
        formTitle="Test Form"
        formData={incompleteData}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
        onClose={mockOnClose}
      />
    );

    // Should display "Not provided" for empty fields
    expect(screen.queryByText(/Not provided|Not Provided/)).toBeInTheDocument();
  });
});

describe('FormPreviewDisplay Component', () => {
  const mockFormData = {
    facility: 'Facility B',
    incidentDate: '2026-02-15',
    employeeName: 'Jane Smith',
    description: 'Test description',
    severity: 'low',
    medicalAttention: true,
    witnesses: 'John, Sarah'
  };

  test('renders form data in preview display', () => {
    render(<FormPreviewDisplay data={mockFormData} />);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Facility B')).toBeInTheDocument();
  });

  test('formats field labels correctly', () => {
    render(<FormPreviewDisplay data={mockFormData} />);

    // Should convert camelCase to proper labels
    expect(screen.getByText(/Incident Date/i)).toBeInTheDocument();
    expect(screen.getByText(/Employee Name/i)).toBeInTheDocument();
  });

  test('handles missing data gracefully', () => {
    const incompleteData = {
      facility: 'Facility C',
      employeeName: '' // Empty
    };

    render(<FormPreviewDisplay data={incompleteData} />);

    expect(screen.getByText('Facility C')).toBeInTheDocument();
  });

  test('displays array values as comma-separated string', () => {
    const dataWithArray = {
      ...mockFormData,
      witnesses: ['John', 'Sarah', 'Mike']
    };

    render(<FormPreviewDisplay data={dataWithArray} />);

    expect(screen.getByText(/John.*Sarah.*Mike|Mike.*John.*Sarah/)).toBeInTheDocument();
  });

  test('filters out technical fields from display', () => {
    const dataWithTechnical = {
      ...mockFormData,
      id: 'form-123',
      createdAt: '2026-02-16T10:00:00Z',
      userId: 'user-456'
    };

    render(<FormPreviewDisplay data={dataWithTechnical} />);

    // Technical fields should not be displayed
    expect(screen.queryByText('form-123')).not.toBeInTheDocument();
    expect(screen.queryByText('user-456')).not.toBeInTheDocument();
  });
});
