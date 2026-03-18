/**
 * Injury Report Form Component Tests
 * Tests form rendering, validation, preview modal, and submission
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InjuryReportForm from '../components/forms/InjuryReportForm';
import * as formService from '../services/forms';

// Mock axios and services
jest.mock('axios');
jest.mock('../services/forms');
jest.mock('../services/api/client');

// Mock PhotoCapture component
jest.mock('../components/common/PhotoCapture', () => {
  return function MockPhotoCapture({ onPhotoCapture }) {
    return (
      <div data-testid="photo-capture">
        <button onClick={() => onPhotoCapture([])}>Capture Photo</button>
      </div>
    );
  };
});

describe('InjuryReportForm Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders injury report form with all sections', () => {
    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText('Injury/Incident Report Form')).toBeInTheDocument();
    expect(screen.getByText('Facility')).toBeInTheDocument();
    expect(screen.getByText('Incident Details')).toBeInTheDocument();
    expect(screen.getByText('Injured Person')).toBeInTheDocument();
    expect(screen.getByText('Injury Details')).toBeInTheDocument();
  });

  test('displays all required form fields', () => {
    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/Facility/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Incident/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
  });

  test('shows validation error when submitting empty form', async () => {
    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please correct the errors/i)).toBeInTheDocument();
    });

    // Preview modal should NOT open
    expect(screen.queryByText(/Preview & Confirm/i)).not.toBeInTheDocument();
  });

  test('opens preview modal when form is valid', async () => {
    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Fill in required fields
    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const employeeNameInput = screen.getByLabelText(/Employee Name/i);
    await userEvent.type(employeeNameInput, 'John Doe');

    const descriptionInput = screen.getByLabelText(/Description of Incident/i);
    await userEvent.type(descriptionInput, 'Minor cut on finger');

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });
  });

  test('closes preview modal on back to edit', async () => {
    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Fill form to show preview
    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const employeeNameInput = screen.getByLabelText(/Employee Name/i);
    await userEvent.type(employeeNameInput, 'John Doe');

    const descriptionInput = screen.getByLabelText(/Description of Incident/i);
    await userEvent.type(descriptionInput, 'Minor cut on finger');

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    // Click back to edit
    const editButton = screen.getByRole('button', { name: /Back to Edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.queryByText(/Preview & Confirm/i)).not.toBeInTheDocument();
    });
  });

  test('submits form data correctly on confirmation', async () => {
    const mockResponse = { id: 'injury-123' };
    formService.submitInjuryReport.mockResolvedValue(mockResponse);

    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Fill form
    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const employeeNameInput = screen.getByLabelText(/Employee Name/i);
    await userEvent.type(employeeNameInput, 'John Doe');

    const descriptionInput = screen.getByLabelText(/Description of Incident/i);
    await userEvent.type(descriptionInput, 'Minor cut on finger');

    // Open preview
    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    // Confirm submission
    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Report/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(formService.submitInjuryReport).toHaveBeenCalled();
    });
  });

  test('displays success message after submission', async () => {
    const mockResponse = { id: 'injury-123' };
    formService.submitInjuryReport.mockResolvedValue(mockResponse);

    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Fill and submit form
    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const employeeNameInput = screen.getByLabelText(/Employee Name/i);
    await userEvent.type(employeeNameInput, 'John Doe');

    const descriptionInput = screen.getByLabelText(/Description of Incident/i);
    await userEvent.type(descriptionInput, 'Minor cut on finger');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Report/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument();
    });
  });

  test('calls onCancel when cancel button is clicked', async () => {
    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('handles form submission error', async () => {
    formService.submitInjuryReport.mockRejectedValue(new Error('Network error'));

    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Fill and submit
    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const employeeNameInput = screen.getByLabelText(/Employee Name/i);
    await userEvent.type(employeeNameInput, 'John Doe');

    const descriptionInput = screen.getByLabelText(/Description of Incident/i);
    await userEvent.type(descriptionInput, 'Minor cut on finger');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Report/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to submit/i)).toBeInTheDocument();
    });
  });

  test('updates field values on user input', async () => {
    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const employeeNameInput = screen.getByLabelText(/Employee Name/i);
    await userEvent.type(employeeNameInput, 'Jane Smith');

    expect(employeeNameInput.value).toBe('Jane Smith');
  });

  test('displays injury severity options', () => {
    render(<InjuryReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const severitySelect = screen.getByLabelText(/Severity/i);
    expect(severitySelect).toBeInTheDocument();
  });
});
