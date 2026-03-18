/**
 * Comprehensive AI Report Generation Test
 * Tests AI report generation for ALL form types
 * Generates actual reports you can view
 */

// Load environment variables FIRST
require('dotenv').config();

const AIReportGenerator = require('./src/services/aiReportGenerator');
const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

// Test data for each form type
const testForms = {
  jsa: {
    formId: 1001,
    formType: 'jsa',
    formData: {
      date: '2026-02-15',
      location: 'Processing Line 3 - Filleting Station',
      jobTitle: 'Salmon Filleting and Packaging',
      jhaNumber: 'JHA-2026-015',
      responsibleSupervisor: 'Mike Johnson',
      jobDescription: 'Manual filleting of fresh salmon with automated packaging',
      contactNumber: '(206) 555-0199',
      preparedBy: 'Sarah Chen, Safety Coordinator',
      reviewedBy: 'Mike Johnson, Production Supervisor',
      approvedBy: 'David Martinez, Plant Manager',
      jobSteps: JSON.stringify([
        {
          jobStep: 'Retrieve salmon from cold storage (-20°F)',
          hazardsIdentified: 'Cold exposure, slip hazard from ice, manual lifting (40-50 lbs)',
          controlMeasures: 'Insulated gloves, anti-slip boots, team lift for heavy loads'
        },
        {
          jobStep: 'Position fish on filleting table and activate cutting machinery',
          hazardsIdentified: 'Sharp blades, moving equipment, pinch points, noise >85dB',
          controlMeasures: 'Machine guarding, LOTO during maintenance, hearing protection required'
        },
        {
          jobStep: 'Manual filleting with filleting knives',
          hazardsIdentified: 'Laceration hazard, repetitive motion injury, wet/slippery handles',
          controlMeasures: 'Cut-resistant gloves, ergonomic knives, frequent breaks, knife safety training'
        },
        {
          jobStep: 'Package fillets and move to blast freezer',
          hazardsIdentified: 'Extreme cold (-40°F), frost bite risk, slippery floor',
          controlMeasures: 'Full arctic PPE, time limits in freezer (15 min max), buddy system'
        }
      ]),
      workTeamMembers: JSON.stringify([
        {
          classification: 'Fish Processor - Lead',
          personalProtection: 'Cut-resistant gloves (ANSI Level 5), insulated coat, safety boots',
          plantEquipmentTools: 'Filleting knives, cutting board, packaging station'
        },
        {
          classification: 'Fish Processor - Assistant',
          personalProtection: 'Waterproof gloves, hearing protection, slip-resistant boots',
          plantEquipmentTools: 'Conveyor controls, quality inspection tools'
        }
      ]),
      commonHazards: ['Sharp knife lacerations', 'Cold exposure/hypothermia', 'Slip and fall on wet surface', 'Repetitive motion strain', 'Machinery contact injuries'],
      commonControls: ['Machine guarding per OSHA 1910.212', 'LOTO procedures 1910.147', 'Anti-slip flooring', 'Ergonomic training', 'Time limits in cold areas'],
      ppeRequired: ['Cut-resistant gloves (Level 5)', 'Insulated thermal coat', 'Safety boots with metatarsal guards', 'Hearing protection (NRR 25+)', 'Safety glasses', 'Waterproof apron'],
      permitConditionsAcknowledged: true
    }
  },

  loto: {
    formId: 2001,
    formType: 'loto',
    formData: {
      date: '2026-02-15',
      equipmentName: 'Industrial Fish Grinder #3 (Model FG-5000)',
      authorizedBy: 'James Wilson',
      authorizedPersonTrainingDate: '2026-01-10',
      lockoutStartTime: '2026-02-15T08:30:00',
      energySources: 'Electrical (480V 3-phase), Hydraulic (2000 PSI), Pneumatic (120 PSI)',
      tryOutPerformed: 'Yes - attempted start after lockout, machine did not energize',
      zeroEnergyStateVerified: 'Yes - tested with multimeter, hydraulic gauges at zero, air pressure released',
      lockoutDevices: '3x padlocks (red), electrical panel lockout, hydraulic valve lockout',
      tagoutInfo: 'Danger tags applied to all energy sources with date/name/department',
      restoreDate: '2026-02-15T14:30:00',
      maintenancePerformed: 'Replaced worn grinding blades, inspected hydraulic seals, cleaned pneumatic filters'
    }
  },

  injury: {
    formId: 3001,
    formType: 'injury',
    formData: {
      employeeName: 'Robert Garcia',
      employeeId: 'EMP-4456',
      incidentDate: '2026-02-14',
      incidentDateTime: '2026-02-14T14:45:00',
      incidentLocation: 'Packaging Department - Line 2',
      locationOfIncident: 'Packaging Department - Line 2',
      bodyPartAffected: 'Left hand - index finger',
      bodyPartInjured: 'Left hand - index finger',
      injuryType: 'Laceration (2-inch cut)',
      typeOfInjury: 'Laceration requiring stitches',
      description: 'Employee was cleaning packaging machinery during production when left index finger contacted moving conveyor belt mechanism. Suffered 2-inch laceration requiring 8 stitches at urgent care.',
      incidentDescription: 'Employee was cleaning packaging machinery during production when left index finger contacted moving conveyor belt mechanism. Suffered 2-inch laceration requiring 8 stitches at urgent care.',
      treatmentProvided: 'First aid on-site (pressure bandage, wound cleaning), transported to SeaMed Urgent Care for evaluation and stitches',
      witnesses: 'Maria Lopez (Line Supervisor), Tom Chen (Quality Inspector)',
      rootCause: 'Cleaning performed while equipment was energized - LOTO not followed',
      preventativeMeasures: 'Mandatory LOTO retraining for all packaging staff, disciplinary action per policy'
    }
  },

  accident: {
    formId: 4001,
    formType: 'accident',
    formData: {
      accidentDate: '2026-02-13',
      date: '2026-02-13',
      accidentLocation: 'I-5 Southbound, Exit 165 (Seattle)',
      location: 'I-5 Southbound, Exit 165 (Seattle)',
      driverName: 'Kevin Anderson',
      name: 'Kevin Anderson',
      accidentDescription: 'Company delivery truck (Unit #12) was rear-ended by private vehicle while stopped at red light. Driver Kevin Anderson was uninjured. Truck sustained minor rear bumper damage. Other driver cited for following too closely.',
      description: 'Company delivery truck (Unit #12) was rear-ended by private vehicle while stopped at red light. Driver Kevin Anderson was uninjured. Truck sustained minor rear bumper damage. Other driver cited for following too closely.',
      vehicleInfo: 'Ford F-550 Box Truck, Unit #12, License WA-ABC1234',
      damageDescription: 'Rear bumper dented, taillight assembly cracked, estimated $1,200 repair',
      injuries: 'None - driver uninjured',
      policeReportNumber: 'SPD-2026-023456',
      atFault: 'Other driver (following too closely)',
      insuranceClaim: 'Filed with State Farm - Claim #SF-2026-789456'
    }
  },

  spill: {
    formId: 5001,
    formType: 'spill',
    formData: {
      incidentDate: '2026-02-12',
      date: '2026-02-12',
      incidentAddress: '4019 21st Ave W',
      city: 'Seattle, WA 98199',
      location: 'Maintenance Shop - East Bay',
      materialName: 'Hydraulic Fluid (ISO 68)',
      chemicalName: 'Hydraulic Fluid (ISO 68)',
      quantity: '15 gallons',
      quantityReleased: '15 gallons',
      reportedBy: 'Maintenance Technician - Alex Rivera',
      containmentActions: 'Immediate containment with absorbent booms, spill pads deployed, area cordoned off',
      cleanupStatus: 'Completed - absorbed material disposed as hazardous waste, area cleaned with degreaser',
      environmentalImpact: 'Contained to sealed concrete floor - no soil or water contamination',
      causeOfSpill: 'Hydraulic line rupture during equipment maintenance - age-related failure',
      regulatoryNotification: 'Not required (below reportable quantity, fully contained)'
    }
  },

  inspection: {
    formId: 6001,
    formType: 'inspection',
    formData: {
      inspectionDate: '2026-02-11',
      date: '2026-02-11',
      inspectionArea: 'Cold Storage Facility - Zones A, B, C',
      area: 'Cold Storage Facility',
      inspectorName: 'Patricia Wong, Safety Manager',
      inspector: 'Patricia Wong',
      inspectionType: 'Monthly Safety & Hygiene Inspection',
      deficienciesCount: '3 minor deficiencies found',
      deficiencies: JSON.stringify([
        {
          item: 'Fire extinguisher #12 - inspection tag expired',
          description: 'Monthly inspection tag shows last check was 45 days ago',
          responsible: 'Facilities Manager - John Smith',
          correctionDate: '2026-02-13',
          status: 'Open'
        },
        {
          item: 'Emergency lighting - Zone B southeast corner',
          description: 'Emergency exit light bulb burned out',
          responsible: 'Maintenance - Electrical Team',
          correctionDate: '2026-02-12',
          status: 'Completed'
        },
        {
          item: 'Floor drain grate - Zone C',
          description: 'Drain grate loose, trip hazard',
          responsible: 'Maintenance - Facilities',
          correctionDate: '2026-02-14',
          status: 'In Progress'
        }
      ]),
      overallRating: 'Satisfactory with minor improvements needed',
      inspectorNotes: 'Overall facility in good condition. All major safety systems operational. Minor deficiencies identified are being addressed promptly.'
    }
  }
};

/**
 * Run AI report generation test for all form types
 */
async function runComprehensiveTest() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   COMPREHENSIVE AI REPORT GENERATION TEST - ALL FORMS       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const results = [];

  for (const [formType, testData] of Object.entries(testForms)) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📋 Testing: ${formType.toUpperCase()} Form`);
    console.log(`${'='.repeat(70)}\n`);

    try {
      console.log(`⏳ Generating AI report for ${formType}...`);
      const startTime = Date.now();

      // Generate AI report
      const report = await AIReportGenerator.generateReportAsync(
        testData.formId,
        testData
      );

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (report) {
        console.log(`✅ SUCCESS! AI report generated in ${duration}s`);
        console.log(`📊 Report length: ${report.length} characters\n`);

        // Save report to file
        const reportDir = path.join(__dirname, 'test-reports');
        if (!fs.existsSync(reportDir)) {
          fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportPath = path.join(reportDir, `${formType}-report-${testData.formId}.txt`);
        fs.writeFileSync(reportPath, report);
        console.log(`💾 Report saved to: ${reportPath}\n`);

        // Display first 500 characters
        console.log('📄 REPORT PREVIEW (first 500 chars):');
        console.log('─'.repeat(70));
        console.log(report.substring(0, 500) + '...\n');
        console.log('─'.repeat(70));

        results.push({
          formType,
          formId: testData.formId,
          status: 'SUCCESS',
          duration,
          reportLength: report.length,
          reportPath
        });
      } else {
        console.log(`❌ FAILED: No report generated for ${formType}`);
        results.push({
          formType,
          formId: testData.formId,
          status: 'FAILED',
          error: 'No report returned'
        });
      }

      // Wait 2 seconds between API calls to avoid rate limiting
      if (Object.keys(testForms).indexOf(formType) < Object.keys(testForms).length - 1) {
        console.log('\n⏸️  Waiting 2 seconds before next test...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.log(`❌ ERROR generating ${formType} report:`);
      console.log(`   ${error.message}\n`);
      results.push({
        formType,
        formId: testData.formId,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  // Print summary
  console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const failCount = results.filter(r => r.status !== 'SUCCESS').length;

  console.log(`Total Forms Tested: ${results.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}\n`);

  console.log('Detailed Results:');
  console.log('─'.repeat(70));
  results.forEach(result => {
    const statusIcon = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${statusIcon} ${result.formType.padEnd(15)} | ID: ${result.formId} | ${result.status}`);
    if (result.reportPath) {
      console.log(`   📁 ${result.reportPath}`);
    }
    if (result.error) {
      console.log(`   ⚠️  ${result.error}`);
    }
  });

  // Save summary to file
  const summaryPath = path.join(__dirname, 'test-reports', 'TEST-SUMMARY.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Summary saved to: ${summaryPath}\n`);

  // Close database
  db.close();

  console.log('✨ Test complete!\n');
}

// Run the test
runComprehensiveTest().catch(error => {
  console.error('Fatal error running test:', error);
  process.exit(1);
});
