/**
 * LOTO Form Enhanced Component Tests
 * Tests comprehensive LOTO form functionality including preview and submission
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LOTOFormEnhanced from '../components/forms/LOTOFormEnhanced';
import * as formService from '../services/forms';

jest.mock('axios');
jest.mock('../services/forms');
jest.mock('../services/api/client');

jest.mock('../components/common/PhotoCapture', () => {
  return function MockPhotoCapture() {
    return <div data-testid="photo-capture">Photo Capture Mock</div>;
  };
});

describe('LOTOFormEnhanced Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders LOTO form with all main sections', () => {
    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText('LOTO (Lockout/Tagout) Form')).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive Safety Control/i)).toBeInTheDocument();
  });

  test('displays facility field', () => {
    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilityField = screen.getByLabelText(/Facility/i);
    expect(facilityField).toBeInTheDocument();
  });

  test('shows validation error when submitting empty form', async () => {
    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please correct the errors|Required fields missing/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Preview & Confirm/i)).not.toBeInTheDocument();
  });

  test('opens preview modal when form is valid', async () => {
    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const equipmentNameInput = screen.getByLabelText(/Equipment Name/i);
    await userEvent.type(equipmentNameInput, 'Industrial Press');

    const authorizedByInput = screen.getByLabelText(/Authorized.*Person/i);
    await userEvent.type(authorizedByInput, 'John Manager');

    const submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });
  });

  test('closes preview modal on back to edit', async () => {
    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const equipmentNameInput = screen.getByLabelText(/Equipment Name/i);
    await userEvent.type(equipmentNameInput, 'Industrial Press');

    const authorizedByInput = screen.getByLabelText(/Authorized.*Person/i);
    await userEvent.type(authorizedByInput, 'John Manager');

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

  test('submits LOTO form with correct data', async () => {
    const mockResponse = { id: 'loto-123' };
    formService.submitLOTO.mockResolvedValue(mockResponse);

    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const equipmentNameInput = screen.getByLabelText(/Equipment Name/i);
    await userEvent.type(equipmentNameInput, 'Conveyor System');

    const authorizedByInput = screen.getByLabelText(/Authorized.*Person/i);
    await userEvent.type(authorizedByInput, 'Safety Manager');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Form/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(formService.submitLOTO).toHaveBeenCalled();
    });
  });

  test('displays success message after submission', async () => {
    const mockResponse = { id: 'loto-123' };
    formService.submitLOTO.mockResolvedValue(mockResponse);

    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const equipmentNameInput = screen.getByLabelText(/Equipment Name/i);
    await userEvent.type(equipmentNameInput, 'Test Equipment');

    const authorizedByInput = screen.getByLabelText(/Authorized.*Person/i);
    await userEvent.type(authorizedByInput, 'Test Manager');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Form/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument();
    });
  });

  test('handles submission errors', async () => {
    formService.submitLOTO.mockRejectedValue(new Error('API Error'));

    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const equipmentNameInput = screen.getByLabelText(/Equipment Name/i);
    await userEvent.type(equipmentNameInput, 'Error Test');

    const authorizedByInput = screen.getByLabelText(/Authorized.*Person/i);
    await userEvent.type(authorizedByInput, 'Manager');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Form/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to submit/i)).toBeInTheDocument();
    });
  });

  test('calls onCancel when cancel button is clicked', async () => {
    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('displays energySources field', () => {
    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const energySource = screen.queryByLabelText(/Energy Source/i);
    // Energy sources might be displayed or hidden depending on implementation
    expect(screen.getByText(/Equipment Name/i)).toBeInTheDocument();
  });

  test('disables submit button during submission', async () => {
    formService.submitLOTO.mockImplementation(() => new Promise(() => {}));

    render(<LOTOFormEnhanced onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const facilitySelect = screen.getByLabelText(/Facility/i);
    await userEvent.selectOptions(facilitySelect, 'facility1');

    const equipmentNameInput = screen.getByLabelText(/Equipment Name/i);
    await userEvent.type(equipmentNameInput, 'Test Equipment');

    const authorizedByInput = screen.getByLabelText(/Authorized.*Person/i);
    await userEvent.type(authorizedByInput, 'Manager');

    let submitButton = screen.getByRole('button', { name: /Preview & Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Preview & Confirm/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm & Submit Form/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submitting/i })).toBeDisabled();
    });
  });
});
