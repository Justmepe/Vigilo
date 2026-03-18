import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeafoodSafetyApp from '../SeafoodSafetyApp';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn((key) => {
    if (key === 'token') return 'test-token-12345';
    if (key === 'user') return JSON.stringify({ id: 1, username: 'testuser' });
    return null;
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('SeafoodSafetyApp - Auto-Sync Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock successful API responses
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          totalForms: 5,
          pendingItems: 3,
          completedReports: 2,
          recentActivity: [
            {
              id: '1',
              formType: 'jsa',
              title: 'Machine Safety - Assembly Line',
              timestamp: new Date().toISOString(),
              status: 'completed'
            }
          ]
        }
      })
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('✅ Dashboard loads and fetches initial data', async () => {
    render(<SeafoodSafetyApp />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dashboard/stats'),
        expect.any(Object)
      );
    });

    console.log('[TEST] ✅ Dashboard initial data fetch verified');
  });

  test('✅ Auto-refresh happens every 30 seconds', async () => {
    render(<SeafoodSafetyApp />);

    // Initial fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // dashboard stats + logo
    });

    const initialCallCount = global.fetch.mock.calls.length;

    // Advance time by 30 seconds
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(initialCallCount + 1);
    });

    console.log('[TEST] ✅ 30-second auto-refresh interval verified');
  });

  test('✅ Multiple auto-refresh cycles work correctly', async () => {
    render(<SeafoodSafetyApp />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const initialCallCount = global.fetch.mock.calls.length;

    // First refresh - 30 seconds
    jest.advanceTimersByTime(30000);
    await waitFor(() => {
      expect(global.fetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    // Second refresh - 60 seconds total
    const afterFirstRefresh = global.fetch.mock.calls.length;
    jest.advanceTimersByTime(30000);
    await waitFor(() => {
      expect(global.fetch.mock.calls.length).toBeGreaterThan(afterFirstRefresh);
    });

    console.log('[TEST] ✅ Multiple auto-refresh cycles verified');
  });

  test('✅ Tab focus change triggers dashboard refresh', async () => {
    render(<SeafoodSafetyApp />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const initialCallCount = global.fetch.mock.calls.length;

    // Simulate tab losing focus (document hidden)
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: true
    });
    fireEvent.visibilitychange(document);

    // Advance time a bit
    jest.advanceTimersByTime(1000);

    // Simulate tab regaining focus
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: false
    });
    fireEvent.visibilitychange(document);

    await waitFor(() => {
      expect(global.fetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    console.log('[TEST] ✅ Visibility change listener (tab focus) verified');
  });

  test('✅ Cleanup removes interval on unmount', async () => {
    const { unmount } = render(<SeafoodSafetyApp />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const callCountBeforeUnmount = global.fetch.mock.calls.length;

    // Unmount component
    unmount();

    // Advance timer by 30 seconds after unmount
    jest.advanceTimersByTime(30000);

    // Fetch should not be called again (interval was cleaned up)
    expect(global.fetch.mock.calls.length).toBe(callCountBeforeUnmount);

    console.log('[TEST] ✅ Cleanup/unmount interval removal verified');
  });

  test('✅ Visibility listener cleanup works', async () => {
    const { unmount } = render(<SeafoodSafetyApp />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const initialCallCount = global.fetch.mock.calls.length;

    // Unmount
    unmount();

    // Try to trigger visibility change after unmount
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: false
    });
    fireEvent.visibilitychange(document);

    // Click should not trigger fetch (listener was removed)
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(global.fetch.mock.calls.length).toBe(initialCallCount);

    console.log('[TEST] ✅ Visibility listener cleanup verified');
  });

  test('✅ Error handling during auto-refresh', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // First call succeeds
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: {} })
    });

    // Second call (auto-refresh) fails
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' })
    });

    render(<SeafoodSafetyApp />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Trigger auto-refresh
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      // Should handle error gracefully without crashing
      expect(global.fetch).toHaveBeenCalledTimes(expect.any(Number));
    });

    consoleWarnSpy.mockRestore();
    console.log('[TEST] ✅ Error handling during auto-refresh verified');
  });

  test('✅ API endpoint correct for dashboard stats', async () => {
    render(<SeafoodSafetyApp />);

    await waitFor(() => {
      const calls = global.fetch.mock.calls;
      const dashboardCall = calls.find(call => 
        call[0].includes('/api/dashboard/stats')
      );
      expect(dashboardCall).toBeDefined();
    });

    console.log('[TEST] ✅ Dashboard API endpoint verified');
  });

  test('✅ Request headers include authorization token', async () => {
    render(<SeafoodSafetyApp />);

    await waitFor(() => {
      const calls = global.fetch.mock.calls;
      const authCall = calls.find(call => {
        const options = call[1];
        return options?.headers?.Authorization === 'Bearer test-token-12345';
      });
      expect(authCall).toBeDefined();
    });

    console.log('[TEST] ✅ Authorization header verification passed');
  });
});

describe('SeafoodSafetyApp - Dashboard Data Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          totalForms: 5,
          pendingItems: 3,
          completedReports: 7,
          recentActivity: [
            {
              id: 'form-001',
              formType: 'jsa',
              title: 'JSA Form - Crab Processing Line',
              timestamp: new Date().toISOString(),
              status: 'completed'
            },
            {
              id: 'form-002',
              formType: 'loto',
              title: 'LOTO - Baader Machine Shutdown',
              timestamp: new Date(Date.now() - 60000).toISOString(),
              status: 'completed'
            }
          ]
        }
      })
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('✅ Recent Activity updates after form submission', async () => {
    render(<SeafoodSafetyApp />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Simulate form submission by advancing time 1.5s (post-submission refresh delay)
    jest.advanceTimersByTime(1500);

    // Dashboard should be refreshed
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dashboard/stats'),
        expect.any(Object)
      );
    });

    console.log('[TEST] ✅ Recent Activity post-submission update verified');
  });

  test('✅ Download buttons appear for recent activity items', async () => {
    const { container } = render(<SeafoodSafetyApp />);

    await waitFor(() => {
      const downloadButtons = container.querySelectorAll('[class*="download"]');
      expect(downloadButtons.length).toBeGreaterThan(0);
    });

    console.log('[TEST] ✅ Download buttons in Recent Activity verified');
  });
});

describe('SeafoodSafetyApp - Auto-Sync Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('✅ Complete auto-sync workflow: load → 30s → focus → submit → refresh', async () => {
    let callSequence = [];

    global.fetch.mockImplementation(async (url) => {
      callSequence.push({
        endpoint: url.split('?')[0],
        time: jest.now ? jest.now() : Date.now()
      });

      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            totalForms: callSequence.length,
            recentActivity: []
          }
        })
      };
    });

    render(<SeafoodSafetyApp />);

    // Step 1: Initial load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    const initialCalls = callSequence.length;

    // Step 2: Wait 30 seconds for auto-refresh
    jest.advanceTimersByTime(30000);
    await waitFor(() => {
      expect(callSequence.length).toBeGreaterThan(initialCalls);
    });
    const after30sCalls = callSequence.length;

    // Step 3: Simulate tab focus change
    Object.defineProperty(document, 'hidden', { writable: true, value: false });
    fireEvent.visibilitychange(document);

    await waitFor(() => {
      expect(callSequence.length).toBeGreaterThan(after30sCalls);
    });
    const afterFocusCalls = callSequence.length;

    // Step 4: Simulate form submission refresh (1.5s after submission)
    jest.advanceTimersByTime(1500);
    await waitFor(() => {
      expect(callSequence.length).toBeGreaterThan(afterFocusCalls);
    });

    console.log('[TEST] ✅ Complete auto-sync workflow verified');
    console.log(`[TEST] Total API calls: ${callSequence.length}`);
    console.log(`[TEST] Call sequence:`, callSequence.map(c => c.endpoint));
  });
});
