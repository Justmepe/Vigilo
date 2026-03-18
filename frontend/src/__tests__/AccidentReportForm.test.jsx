/**
 * Accident Report Form Component Tests
 * Tests form rendering, validation, preview modal, and submission
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccidentReportForm from '../components/forms/AccidentReportForm';
import * as formService from '../services/forms';

jest.mock('axios');
jest.mock('../services/forms');
jest.mock('../services/api/client');

jest.mock('../components/common/PhotoCapture', () => {
  return function MockPhotoCapture() {
    return <div data-testid="photo-capture">Photo Capture Mock</div>;
  };
});

describe('AccidentReportForm Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders accident report form with all sections', () => {
    render(<AccidentReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText('Accident Report Form')).toBeInTheDocument();
    expect(screen.getByText('Facility')).toBeInTheDocument();
    expect(screen.getByText(/Accident Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Vehicle Information/i)).toBeInTheDocument();
  });

  test('shows validation error when submitting empty form', async () => {
    render(<AccidentReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please correct the errors/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Preview & Confirm/i)).not.toBeInTheDocument();
  });

  test('opens preview modal when form is valid', async () => {
    render(<AccidentReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const vehicleNameInput = screen.getByLabelText(/Vehicle Plate/i);
    await userEvent.type(vehicleNameInput, 'ABC123');

    const descriptionInput = screen.getByLabelText(/Description of Accident/i);
    await userEvent.type(descriptionInput, 'Minor collision');

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });
  });

  test('tracks accident date and time', async () => {
    render(<AccidentReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const dateInput = screen.getByLabelText(/Date of Accident/i);
    const timeInput = screen.getByLabelText(/Time of Accident/i);

    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
  });

  test('closes preview modal on back to edit', async () => {
    render(<AccidentReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const vehicleNameInput = screen.getByLabelText(/Vehicle Plate/i);
    await userEvent.type(vehicleNameInput, 'ABC123');

    const descriptionInput = screen.getByLabelText(/Description of Accident/i);
    await userEvent.type(descriptionInput, 'Minor collision');

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

  test('submits accident report with correct data', async () => {
    const mockResponse = { id: 'accident-123' };
    formService.submitAccidentReport.mockResolvedValue(mockResponse);

    render(<AccidentReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const vehicleNameInput = screen.getByLabelText(/Vehicle Plate/i);
    await userEvent.type(vehicleNameInput, 'ABC123');

    const descriptionInput = screen.getByLabelText(/Description of Accident/i);
    await userEvent.type(descriptionInput, 'Parking lot accident');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Report/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(formService.submitAccidentReport).toHaveBeenCalled();
    });
  });

  test('displays success message after submission', async () => {
    const mockResponse = { id: 'accident-123' };
    formService.submitAccidentReport.mockResolvedValue(mockResponse);

    render(<AccidentReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const vehicleInput = screen.getByLabelText(/Vehicle Plate/i);
    await userEvent.type(vehicleInput, 'XYZ789');

    const descInput = screen.getByLabelText(/Description of Accident/i);
    await userEvent.type(descInput, 'Test accident');

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

  test('handles submission errors gracefully', async () => {
    formService.submitAccidentReport.mockRejectedValue(new Error('API Error'));

    render(<AccidentReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const vehicleInput = screen.getByLabelText(/Vehicle Plate/i);
    await userEvent.type(vehicleInput, 'XYZ789');

    const descInput = screen.getByLabelText(/Description of Accident/i);
    await userEvent.type(descInput, 'Error test');

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
    render(<AccidentReportForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
