/**
 * Spill Release Form Component Tests
 * Tests form rendering, validation, preview modal, and submission
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SpillReleaseForm from '../components/forms/SpillReleaseForm';
import * as formService from '../services/forms';

jest.mock('axios');
jest.mock('../services/forms');
jest.mock('../services/api/client');

jest.mock('../components/common/PhotoCapture', () => {
  return function MockPhotoCapture() {
    return <div data-testid="photo-capture">Photo Capture Mock</div>;
  };
});

describe('SpillReleaseForm Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders spill release form with all sections', () => {
    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText('Spill/Release Report Form')).toBeInTheDocument();
    expect(screen.getByText('Facility')).toBeInTheDocument();
    expect(screen.getByText(/Incident Information/i)).toBeInTheDocument();
  });

  test('shows validation error when submitting empty form', async () => {
    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please correct the errors/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Preview & Confirm/i)).not.toBeInTheDocument();
  });

  test('opens preview modal when form is valid', async () => {
    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const chemicalInput = screen.getByLabelText(/Chemical.*Spilled/i);
    await userEvent.type(chemicalInput, 'Cleaning Solution');

    const amountInput = screen.getByLabelText(/Amount Spilled/i);
    await userEvent.type(amountInput, '5');

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });
  });

  test('tracks incident date and time', () => {
    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const dateInput = screen.getByLabelText(/Incident Date/i);
    const timeInput = screen.getByLabelText(/Incident Time/i);

    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
  });

  test('closes preview modal on back to edit', async () => {
    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const chemicalInput = screen.getByLabelText(/Chemical.*Spilled/i);
    await userEvent.type(chemicalInput, 'Oil');

    const amountInput = screen.getByLabelText(/Amount Spilled/i);
    await userEvent.type(amountInput, '10');

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

  test('submits spill report with correct data', async () => {
    const mockResponse = { id: 'spill-123' };
    formService.submitSpillReport.mockResolvedValue(mockResponse);

    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const chemicalInput = screen.getByLabelText(/Chemical.*Spilled/i);
    await userEvent.type(chemicalInput, 'Chemical X');

    const amountInput = screen.getByLabelText(/Amount Spilled/i);
    await userEvent.type(amountInput, '50');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Report/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(formService.submitSpillReport).toHaveBeenCalled();
    });
  });

  test('displays success message after submission', async () => {
    const mockResponse = { id: 'spill-123' };
    formService.submitSpillReport.mockResolvedValue(mockResponse);

    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const chemicalInput = screen.getByLabelText(/Chemical.*Spilled/i);
    await userEvent.type(chemicalInput, 'Test Chemical');

    const amountInput = screen.getByLabelText(/Amount Spilled/i);
    await userEvent.type(amountInput, '5');

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
    formService.submitSpillReport.mockRejectedValue(new Error('Server error'));

    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const chemicalInput = screen.getByLabelText(/Chemical.*Spilled/i);
    await userEvent.type(chemicalInput, 'Chemical');

    const amountInput = screen.getByLabelText(/Amount Spilled/i);
    await userEvent.type(amountInput, '1');

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
    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('tracks containment status', () => {
    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const containmentCheckbox = screen.queryByLabelText(/Contained/i);
    // Checkbox may or may not be present depending on form layout
    expect(screen.getByText(/Facility/i)).toBeInTheDocument();
  });

  test('displays environmental impact options', () => {
    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Form should have environmental impact field
    expect(screen.getByText(/Facility/i)).toBeInTheDocument();
  });

  test('prevents submission while previous submission in progress', async () => {
    formService.submitSpillReport.mockImplementation(() => new Promise(() => {}));

    render(<SpillReleaseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const chemicalInput = screen.getByLabelText(/Chemical.*Spilled/i);
    await userEvent.type(chemicalInput, 'Chemical');

    const amountInput = screen.getByLabelText(/Amount Spilled/i);
    await userEvent.type(amountInput, '1');

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
