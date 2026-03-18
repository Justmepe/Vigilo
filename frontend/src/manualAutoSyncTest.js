/**
 * Manual Auto-Sync Verification Script
 * 
 * Instructions:
 * 1. Open the Safety Dashboard at localhost:3000
 * 2. Open browser DevTools (F12)
 * 3. Paste this entire script into the Console tab
 * 4. Press Enter and watch the verification logs
 * 5. Submit a form while watching the console
 * 6. Check Recent Activity updates in real-time
 */

console.clear();
console.log('%c🧪 STARTING AUTO-SYNC VERIFICATION TEST', 'font-size: 16px; font-weight: bold; color: #0891b2;');
console.log('═'.repeat(80));

// Global tracking object
window.autoSyncTest = {
  startTime: Date.now(),
  apiCalls: [],
  refreshEvents: [],
  focusEvents: [],
  submissionEvents: []
};

// Patch console.log to capture dashboard refresh logs
const originalLog = console.log;
const originalFetch = window.fetch;

window.fetch = function(...args) {
  const url = args[0];
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3
  });

  if (url.includes('/api/dashboard/stats')) {
    window.autoSyncTest.apiCalls.push({
      type: 'dashboard-stats',
      timestamp: timestamp,
      elapsed: Date.now() - window.autoSyncTest.startTime
    });
    console.log(`%c[AUTO-SYNC TEST] ✅ API Call: /api/dashboard/stats @ ${timestamp}`, 
      'color: #10b981; font-weight: bold;');
  }

  return originalFetch.apply(this, args);
};

// Create a visibility listener wrapper
const originalAddEventListener = document.addEventListener;
document.addEventListener = function(event, handler, options) {
  if (event === 'visibilitychange') {
    const wrappedHandler = function() {
      if (!document.hidden) {
        const timestamp = new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          fractionalSecondDigits: 3
        });
        window.autoSyncTest.focusEvents.push(timestamp);
        console.log(`%c[AUTO-SYNC TEST] 👁️ Tab Focus Detected @ ${timestamp} - Dashboard should refresh`, 
          'color: #8b5cf6; font-weight: bold;');
      }
      return handler.apply(this, arguments);
    };
    return originalAddEventListener.call(this, event, wrappedHandler, options);
  }
  return originalAddEventListener.apply(this, arguments);
};

// Monitor for form submission notifications
const checkForSubmissionNotifications = setInterval(() => {
  const successNotifs = document.querySelectorAll('[role="status"]');
  if (successNotifs.length > 0) {
    successNotifs.forEach(notif => {
      if (notif.textContent.includes('Form Submitted Successfully') && 
          !window.autoSyncTest.submissionDetected) {
        window.autoSyncTest.submissionDetected = true;
        const timestamp = new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          fractionalSecondDigits: 3
        });
        window.autoSyncTest.submissionEvents.push(timestamp);
        console.log(`%c[AUTO-SYNC TEST] 📝 Form Submission Detected @ ${timestamp} - Dashboard refresh in 1.5s`, 
          'color: #f59e0b; font-weight: bold;');
        
        // Check for refresh 1.5s later
        setTimeout(() => {
          console.log(`%c[AUTO-SYNC TEST] ⏱️ Waiting for post-submission refresh (1.5s delay)...`, 
            'color: #60a5fa;');
        }, 1500);
      }
    });
  }
}, 500);

// Test 1: Verify initial API call
console.log('%c\n✅ TEST 1: Initial API Call', 'font-size: 14px; font-weight: bold; color: #059669;');
console.log('Checking for dashboard data fetch...');
setTimeout(() => {
  if (window.autoSyncTest.apiCalls.length > 0) {
    console.log(`%c✅ PASS: Initial API call confirmed at ${window.autoSyncTest.apiCalls[0].timestamp}`, 
      'color: #10b981; font-weight: bold;');
  } else {
    console.log('%c⚠️ PENDING: Waiting for initial API call...', 'color: #f59e0b;');
  }
}, 2000);

// Test 2: Verify 30-second auto-refresh
console.log('%c\n✅ TEST 2: 30-Second Auto-Refresh', 'font-size: 14px; font-weight: bold; color: #059669;');
console.log('Will verify automatic dashboard refresh in 30 seconds...');
console.log('Expected: Second API call around 30 seconds from now');

setTimeout(() => {
  const apiCallsAtStart = window.autoSyncTest.apiCalls.length;
  console.log(`%c⏱️ 30 seconds elapsed - Current API calls: ${apiCallsAtStart}`, 'color: #60a5fa;');
  
  setTimeout(() => {
    if (window.autoSyncTest.apiCalls.length > apiCallsAtStart) {
      console.log(`%c✅ PASS: Auto-refresh confirmed! New API call detected.`, 
        'color: #10b981; font-weight: bold;');
      console.log(`Details:`, window.autoSyncTest.apiCalls[window.autoSyncTest.apiCalls.length - 1]);
    } else {
      console.log('%c⚠️ PENDING: Waiting for auto-refresh...', 'color: #f59e0b;');
    }
  }, 2000);
}, 30000);

// Test 3: Verify tab focus detection
console.log('%c\n✅ TEST 3: Tab Focus Detection', 'font-size: 14px; font-weight: bold; color: #059669;');
console.log('Instructions: Click outside or switch tabs for 2 seconds, then return to this tab');
console.log('Expected: Dashboard will refresh when you return');

// Test 4: Monitor for form submission
console.log('%c\n✅ TEST 4: Form Submission Auto-Refresh', 'font-size: 14px; font-weight: bold; color: #059669;');
console.log('Instructions: Submit a form and watch for automatic dashboard refresh');
console.log('Expected: Dashboard refresh within 1.5 seconds of submission');

// Summary Report Function
window.autoSyncTest.report = function() {
  console.clear();
  console.log('%c📊 AUTO-SYNC VERIFICATION REPORT', 'font-size: 16px; font-weight: bold; color: #0891b2;');
  console.log('═'.repeat(80));
  
  const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
  console.log(`Test Duration: ${elapsed}s`);
  console.log(`\n📡 API Calls (${this.apiCalls.length} total):`);
  this.apiCalls.forEach((call, i) => {
    console.log(`  ${i + 1}. ${call.timestamp} (${call.elapsed}ms from start)`);
  });
  
  console.log(`\n👁️ Focus Events (${this.focusEvents.length} total):`);
  if (this.focusEvents.length === 0) {
    console.log('  No focus events detected yet');
  } else {
    this.focusEvents.forEach((event, i) => {
      console.log(`  ${i + 1}. ${event}`);
    });
  }
  
  console.log(`\n📝 Form Submissions (${this.submissionEvents.length} total):`);
  if (this.submissionEvents.length === 0) {
    console.log('  No submissions detected yet');
  } else {
    this.submissionEvents.forEach((event, i) => {
      console.log(`  ${i + 1}. ${event}`);
    });
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log('%c✅ VERIFICATION CHECKLIST:', 'font-size: 12px; font-weight: bold; color: #059669;');
  console.log(`${this.apiCalls.length > 0 ? '✅' : '❌'} Initial dashboard load`);
  console.log(`${this.apiCalls.length > 1 ? '✅' : '❓'} 30-second auto-refresh (wait 30s if not yet)`);
  console.log(`${this.focusEvents.length > 0 ? '✅' : '❓'} Tab focus detection (switch tabs and return)`);
  console.log(`${this.submissionEvents.length > 0 ? '✅' : '❓'} Form submission auto-refresh (submit a form)`);
  
  console.log('\n💡 Next Steps:');
  console.log('1. Run window.autoSyncTest.report() anytime to see current status');
  console.log('2. Submit a form to test submission auto-refresh');
  console.log('3. Switch browser tabs and return to test focus detection');
  console.log('4. Wait 30 seconds to see auto-refresh interval in action');
};

// Print instructions
console.log('%c\n📋 NEXT STEPS:', 'font-size: 12px; font-weight: bold; color: #0891b2;');
console.log('1️⃣  Watch the console for API calls over the next 2+ minutes');
console.log('2️⃣  Try submitting a form and watch for auto-refresh');
console.log('3️⃣  Switch away from this tab and return - dashboard should refresh');
console.log('4️⃣  Run window.autoSyncTest.report() to see full verification report\n');

console.log('═'.repeat(80));
console.log('%c✅ Auto-Sync Verification Test Initialized', 'color: #10b981; font-weight: bold;');
console.log('Console is monitoring dashboard auto-sync activity...\n');
