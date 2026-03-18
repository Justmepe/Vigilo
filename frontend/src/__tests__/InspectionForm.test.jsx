/**
 * Inspection Form Component Tests
 * Tests form rendering, validation, preview modal, and submission
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InspectionForm from '../components/forms/InspectionForm';
import * as formService from '../services/forms';

jest.mock('axios');
jest.mock('../services/forms');
jest.mock('../services/api/client');

jest.mock('../components/common/PhotoCapture', () => {
  return function MockPhotoCapture() {
    return <div data-testid="photo-capture">Photo Capture Mock</div>;
  };
});

describe('InspectionForm Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders inspection form with all sections', () => {
    render(<InspectionForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText('Monthly Facility Inspection Form')).toBeInTheDocument();
    expect(screen.getByText('Facility')).toBeInTheDocument();
    expect(screen.getByText(/Inspection Info/i)).toBeInTheDocument();
  });

  test('shows validation error when submitting empty form', async () => {
    render(<InspectionForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please correct the errors/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Preview & Confirm/i)).not.toBeInTheDocument();
  });

  test('opens preview modal when form is valid', async () => {
    render(<InspectionForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const inspectorInput = screen.getByLabelText(/Inspector Name/i);
    await userEvent.type(inspectorInput, 'John Inspector');

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });
  });

  test('displays inspection date field', () => {
    render(<InspectionForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const dateInput = screen.getByLabelText(/Inspection Date/i);
    expect(dateInput).toBeInTheDocument();
  });

  test('closes preview modal on back to edit', async () => {
    render(<InspectionForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const inspectorInput = screen.getByLabelText(/Inspector Name/i);
    await userEvent.type(inspectorInput, 'John Inspector');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Back to Edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.queryByText(/Preview & Confirm/i)).not.toBeInTheDocument();
    });
  });

  test('submits inspection form with correct data', async () => {
    const mockResponse = { id: 'inspection-123' };
    formService.submitInspection.mockResolvedValue(mockResponse);

    render(<InspectionForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const inspectorInput = screen.getByLabelText(/Inspector Name/i);
    await userEvent.type(inspectorInput, 'Jane Inspector');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Report/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(formService.submitInspection).toHaveBeenCalled();
    });
  });

  test('displays success message after submission', async () => {
    const mockResponse = { id: 'inspection-123' };
    formService.submitInspection.mockResolvedValue(mockResponse);

    render(<InspectionForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const inspectorInput = screen.getByLabelText(/Inspector Name/i);
    await userEvent.type(inspectorInput, 'Test Inspector');

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

  test('handles submission errors', async () => {
    formService.submitInspection.mockRejectedValue(new Error('Network error'));

    render(<InspectionForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const inspectorInput = screen.getByLabelText(/Inspector Name/i);
    await userEvent.type(inspectorInput, 'Inspector');

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

  test('calls onCancel when cancel button is clicked', async () => {
    render(<InspectionForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('prevents submission while previous submission is in progress', async () => {
    formService.submitInspection.mockImplementation(() => new Promise(() => {}));

    render(<InspectionForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const inspectorInput = screen.getByLabelText(/Inspector Name/i);
    await userEvent.type(inspectorInput, 'Inspector');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Report/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submitting/i })).toBeDisabled();
    });
  });
});
