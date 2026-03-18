/**
 * AI Report Generator Service
 * Generates professional safety analysis reports using Claude API
 * Runs asynchronously after form submission
 */

const Anthropic = require('@anthropic-ai/sdk');
const db = require('../config/database');
const logger = require('../utils/logger');

class AIReportGenerator {
  /**
   * Generate AI report asynchronously after form submission
   * Does NOT block form submission - runs in background
   */
  static async generateReportAsync(formId, formData) {
    try {
      logger.debug(`Starting AI report generation for form ${formId}`);

      // 1. Build structured prompt from form data
      const prompt = AIReportGenerator.buildPrompt(formData);

      // 2. Call Claude API
      const report = await AIReportGenerator.callClaudeAPI(prompt);

      // 3. Save report to database
      await AIReportGenerator.saveReportToDB(formId, report);

      logger.info(`✓ AI report generated successfully for form ${formId}`, {
        formId,
        reportLength: report.length,
        provider: 'claude'
      });

      return report;
    } catch (error) {
      logger.error(`✗ AI report generation failed for form ${formId}`, {
        error: error.message,
        code: error.code
      });
      // Don't throw - form still works without AI report
      return null;
    }
  }

  /**
   * Build professional prompt from form data
   * Guides Claude to write like a SENIOR SAFETY MANAGER in fish processing industry
   * Supports all form types: JSA, LOTO, Injury, Accident, Spill, Inspection
   */
  static buildPrompt(formData) {
    const content = formData.formData || formData;
    const formType = formData.formType || 'jsa';

    // Route to appropriate prompt builder based on form type
    switch(formType) {
      case 'jsa':
        return AIReportGenerator.buildJSAPrompt(formData);
      case 'loto':
        return AIReportGenerator.buildLOTOPrompt(formData);
      case 'injury':
        return AIReportGenerator.buildInjuryPrompt(formData);
      case 'accident':
        return AIReportGenerator.buildAccidentPrompt(formData);
      case 'spill':
      case 'spillReport':
        return AIReportGenerator.buildSpillPrompt(formData);
      case 'inspection':
      case 'monthlyInspection':
        return AIReportGenerator.buildInspectionPrompt(formData);
      default:
        return AIReportGenerator.buildJSAPrompt(formData);
    }
  }

  /**
   * Build JSA-specific prompt
   */
  static buildJSAPrompt(formData) {
    const content = formData.formData || formData;

    // Format job steps
    let jobStepsText = 'None provided';
    if (content.jobSteps) {
      try {
        const steps = typeof content.jobSteps === 'string'
          ? JSON.parse(content.jobSteps)
          : content.jobSteps;

        if (Array.isArray(steps) && steps.length > 0) {
          jobStepsText = steps
            .map((s, i) => `STEP ${i + 1}: ${s.jobStep || 'N/A'}\n  └─ Hazards: ${s.hazardsIdentified || 'N/A'}\n  └─ Controls: ${s.controlMeasures || 'N/A'}`)
            .join('\n\n');
        }
      } catch (e) {
        jobStepsText = String(content.jobSteps).substring(0, 500);
      }
    }

    // Format team members
    let teamsText = 'None provided';
    if (content.workTeamMembers) {
      try {
        const members = typeof content.workTeamMembers === 'string'
          ? JSON.parse(content.workTeamMembers)
          : content.workTeamMembers;

        if (Array.isArray(members) && members.length > 0) {
          teamsText = members
            .map(m => `[${m.classification || 'Staff'}] PPE: ${m.personalProtection || 'Standard'}; Equipment: ${m.plantEquipmentTools || 'Standard equipment'}`)
            .join('\n  • ');
        }
      } catch (e) {
        teamsText = String(content.workTeamMembers).substring(0, 500);
      }
    }

    // Format arrays with fish processing context
    const hazardsText = AIReportGenerator.formatArray(content.commonHazards) || 'Not identified';
    const controlsText = AIReportGenerator.formatArray(content.commonControls) || 'Not specified';
    const ppeText = AIReportGenerator.formatArray(content.ppeRequired) || 'Not specified';

    return `You are a SENIOR SAFETY MANAGER with 15+ years of experience in fish processing and seafood operations. Your role is to conduct a thorough, professional Job Safety Analysis (JSA) and provide an executive-level safety assessment.

CONTEXT:
- Industry: Commercial Fish Processing & Seafood Operations
- Company: Silver Bay Seafoods (Seattle, WA)
- Your Goal: Analyze work procedures, identify critical hazards, evaluate control measures, and authorize or condition work authorization
- Tone: Professional, authoritative, industry-knowledgeable, focused on worker protection

=== SUBMISSION DETAILS ===
Form Type: ${formData.formType === 'jsa' ? 'Job Safety Analysis' : formData.formType}
Submission ID: ${formData.formId || 'Unknown'}
Job/Task: ${content.jobTitle || 'Not specified'}
Location: ${content.location || 'Not specified'}
Submission Date: ${content.date || 'Not specified'}
Prepared By: ${content.preparedBy || 'Not specified'}
Supervisor: ${content.supervisor || 'Not identified'}

=== DETAILED JOB BREAKDOWN ===
${jobStepsText}

=== PERSONNEL & PROTECTIVE EQUIPMENT ===
Team Composition:
  • ${teamsText}

Required PPE:
  • ${ppeText.split(',').map(p => p.trim()).slice(0, 6).join('\n  • ')}

=== HAZARD INVENTORY ===
Identified Hazards (Raw Materials):
  • ${hazardsText.split(',').map(h => h.trim()).slice(0, 6).join('\n  • ')}

Implemented Controls:
  • ${controlsText.split(',').map(c => c.trim()).slice(0, 6).join('\n  • ')}

=== FISH PROCESSING INDUSTRY CONTEXT ===
Common Fish Processing Hazards (for reference):
  • Sharp instrument injuries (knives, cutters, deheaders, filleting machines)
  • Slip/fall hazards (wet floors, fish blood/slime)
  • Thermal burns (hot water, steam, cooking equipment)
  • Refrigeration/cold exposure (deep freezers, insulated rooms)
  • Chemical exposure (cleaning agents, preservatives, additives)
  • Ergonomic strain (repetitive motions, lifting frozen product)
  • Machine crush/amputation (grinders, conveyors, saws)
  • Airborne fish particulates and allergens
  • Drainage system hazards and sanitation issues

Relevant OSHA Standards:
  • 29 CFR 1910.147 - Lockout/Tagout (LOTO) for equipment maintenance
  • 29 CFR 1910.1030 - Bloodborne Pathogens (fish blood exposure)
  • 29 CFR 1910 Subpart H - Machine Guarding (processing equipment)
  • 29 CFR 1910 Subpart I - Personal Protective Equipment
  • FDA Food Safety Modernization Act (FSMA) - Sanitation controls

=== YOUR ANALYSIS TASK ===
Provide a professional safety assessment with these REQUIRED sections:

1. EXECUTIVE SUMMARY (2-3 sentences)
   - Concise overview of the job task and overall risk profile
   - Assessment readiness for execution

2. RISK CLASSIFICATION
   - Overall Risk Level: HIGH / MEDIUM / LOW (Bold)
   - Clear justification based on hazard severity and control effectiveness
   - Consider frequency of exposure and consequence severity

3. CRITICAL HAZARDS ASSESSMENT (Top 3-4)
   - List each hazard with:
     * Hazard Description & Mechanism
     * Potential Consequence (injury type, severity)
     * Current Control Measure Effectiveness (0-100% scale)
     * Residual Risk Level (Still Present: Yes/No)

4. CONTROL MEASURES EVALUATION
   - Assess adequacy of Engineering Controls (5-100%)
   - Assess adequacy of Administrative Controls (5-100%)
   - Assess adequacy of PPE (5-100%)
   - Identify control gaps or weaknesses
   - Recommend enhancement measures where applicable

5. COMPLIANCE & REGULATORY STATUS
   - Reference applicable OSHA standards (cite specific CFR sections)
   - Reference FDA/FSMA requirements if sanitation-related
   - Assessment of standard compliance (Compliant/Non-compliant/Conditional)

6. ACTIONABLE RECOMMENDATIONS (Prioritized 1-3)
   - Priority 1: Critical action (must do before work authorization)
   - Priority 2: Recommended action (implement within 2 weeks)
   - Priority 3: Enhancement action (implement within 30 days)
   - Include specific, implementable steps

7. WORK AUTHORIZATION DECISION
   - AUTHORIZED: Work may proceed as described
   - CONDITIONAL: Work may proceed with specific conditions listed
   - DENIED: Work must not proceed; prohibited until conditions met
   - Provide clear rationale and any mandatory conditions

=== FORMATTING REQUIREMENTS ===
- Use professional, authoritative language
- Include specific regulatory references where applicable
- Use clear section breaks and bullet points
- Quantify risk assessments (e.g., "85% effective control")
- Be specific to fish processing operations - avoid generic safety language
- Write as an executive-level report, not a checklist
- Total length: 800-1200 words for comprehensive analysis
- Format percentages and ratings clearly
- Keep language professional and concise
- Be specific and actionable
- Include risk ratings where appropriate
- Total length: 400-600 words maximum`;
  }

  /**
   * Build LOTO-specific prompt
   */
  static buildLOTOPrompt(formData) {
    const content = formData.formData || formData;

    return `You are a SENIOR SAFETY MANAGER with 15+ years of experience in fish processing and industrial safety. Your role is to analyze Lockout/Tagout (LOTO) procedures and provide an executive-level safety assessment.

CONTEXT:
- Industry: Commercial Fish Processing & Seafood Operations
- Company: Silver Bay Seafoods (Seattle, WA)
- Your Goal: Evaluate LOTO procedure compliance, identify energy control gaps, and authorize safe equipment servicing
- Tone: Professional, authoritative, focused on worker protection from hazardous energy

=== LOTO PROCEDURE DETAILS ===
Form ID: ${formData.formId || 'Unknown'}
Equipment: ${content.equipmentName || 'Not specified'}
Authorized By: ${content.authorizedBy || 'Not specified'}
Date: ${content.date || content.lockoutStartTime || 'Not specified'}
Energy Sources: ${content.energySources || 'Not specified'}
Training Date: ${content.authorizedPersonTrainingDate || 'Not specified'}
Lockout Start: ${content.lockoutStartTime || 'Not specified'}
Try-Out Performed: ${content.tryOutPerformed || 'Not specified'}
Zero Energy State Verified: ${content.zeroEnergyStateVerified || 'Not specified'}

=== YOUR ANALYSIS TASK ===
Provide a professional LOTO safety assessment with these sections:

1. EXECUTIVE SUMMARY (2-3 sentences)
   - Overview of equipment and lockout procedure
   - Compliance status

2. ENERGY HAZARD ASSESSMENT
   - Identify all energy sources (electrical, mechanical, hydraulic, pneumatic, thermal, chemical)
   - Severity of each energy source
   - Adequacy of isolation methods

3. PROCEDURE COMPLIANCE EVALUATION
   - OSHA 29 CFR 1910.147 compliance
   - Training verification status
   - Zero energy state confirmation
   - Try-out procedure adequacy

4. CRITICAL SAFETY CONCERNS (if any)
   - Missing energy sources
   - Inadequate isolation methods
   - Training deficiencies

5. RECOMMENDATIONS
   - Required improvements (Priority 1-3)
   - Additional protective measures

6. AUTHORIZATION DECISION
   - AUTHORIZED / CONDITIONAL / DENIED
   - Specific conditions or restrictions

Length: 400-600 words. Professional, specific to fish processing equipment.`;
  }

  /**
   * Build Injury Report prompt
   */
  static buildInjuryPrompt(formData) {
    const content = formData.formData || formData;

    return `You are a SENIOR SAFETY MANAGER with 15+ years of experience in fish processing and occupational health. Your role is to analyze workplace injury reports and provide an executive-level investigation assessment.

CONTEXT:
- Industry: Commercial Fish Processing & Seafood Operations
- Company: Silver Bay Seafoods (Seattle, WA)
- Your Goal: Investigate injury causation, identify systemic failures, prevent recurrence
- Tone: Professional, empathetic, focused on root cause analysis

=== INJURY REPORT DETAILS ===
Form ID: ${formData.formId || 'Unknown'}
Employee: ${content.employeeName || 'Not specified'}
Incident Date: ${content.incidentDate || content.date || 'Not specified'}
Location: ${content.incidentLocation || content.location || 'Not specified'}
Body Part Affected: ${content.bodyPartAffected || content.bodyPartInjured || 'Not specified'}
Injury Type: ${content.injuryType || content.typeOfInjury || 'Not specified'}
Description: ${content.description || content.incidentDescription || 'Not provided'}
Treatment: ${content.treatmentProvided || 'Not specified'}
Witnesses: ${content.witnesses || 'None listed'}

=== YOUR ANALYSIS TASK ===
Provide a professional injury investigation report with these sections:

1. EXECUTIVE SUMMARY
   - Injury overview and severity
   - Immediate response actions

2. ROOT CAUSE ANALYSIS
   - Direct cause of injury
   - Contributing factors (human, environmental, equipment, procedural)
   - Systemic failures

3. REGULATORY IMPLICATIONS
   - OSHA recordability (29 CFR 1904)
   - Required reporting timeline
   - Potential citations

4. CORRECTIVE ACTIONS
   - Immediate corrections (Priority 1)
   - Short-term improvements (Priority 2)
   - Long-term systemic changes (Priority 3)

5. PREVENTION STRATEGY
   - Similar hazard identification
   - Training requirements
   - Engineering controls needed

6. CASE CLOSURE RECOMMENDATION
   - Investigation completeness
   - Follow-up actions required

Length: 500-700 words. Empathetic yet analytical.`;
  }

  /**
   * Build Accident Report prompt
   */
  static buildAccidentPrompt(formData) {
    const content = formData.formData || formData;

    return `You are a SENIOR SAFETY MANAGER with 15+ years of experience in transportation safety and accident investigation. Your role is to analyze accident reports and provide an executive-level investigation assessment.

CONTEXT:
- Industry: Commercial Fish Processing & Seafood Operations
- Company: Silver Bay Seafoods (Seattle, WA)
- Your Goal: Investigate accident causation, assess liability, prevent future incidents
- Tone: Professional, objective, focused on facts and prevention

=== ACCIDENT REPORT DETAILS ===
Form ID: ${formData.formId || 'Unknown'}
Date: ${content.accidentDate || content.date || 'Not specified'}
Location: ${content.location || content.accidentLocation || 'Not specified'}
Driver: ${content.driverName || content.name || 'Not specified'}
Description: ${content.accidentDescription || content.description || 'Not provided'}
Vehicle Info: ${content.vehicleInfo || 'Not specified'}
Damage: ${content.damageDescription || 'Not specified'}
Injuries: ${content.injuries || 'None reported'}
Police Report: ${content.policeReportNumber || 'Not available'}

=== YOUR ANALYSIS TASK ===
Provide a professional accident investigation report with these sections:

1. EXECUTIVE SUMMARY
   - Accident overview and severity
   - Parties involved

2. CAUSATION ANALYSIS
   - Primary cause
   - Contributing factors
   - Environmental conditions
   - Human factors

3. COMPLIANCE & LIABILITY
   - DOT regulations compliance
   - Company policy adherence
   - Liability assessment

4. CORRECTIVE ACTIONS
   - Driver retraining requirements
   - Vehicle maintenance needs
   - Policy revisions

5. PREVENTION MEASURES
   - Fleet safety improvements
   - Additional driver training
   - Technology solutions (dashcams, telematics)

6. CLAIM MANAGEMENT
   - Insurance notification
   - Documentation requirements

Length: 500-700 words. Objective and factual.`;
  }

  /**
   * Build Spill Report prompt
   */
  static buildSpillPrompt(formData) {
    const content = formData.formData || formData;

    return `You are a SENIOR SAFETY MANAGER with 15+ years of experience in environmental compliance and hazardous materials management. Your role is to analyze spill/release incidents and provide an executive-level environmental assessment.

CONTEXT:
- Industry: Commercial Fish Processing & Seafood Operations
- Company: Silver Bay Seafoods (Seattle, WA)
- Your Goal: Assess environmental impact, ensure regulatory compliance, prevent recurrence
- Tone: Professional, urgent, focused on environmental protection

=== SPILL/RELEASE DETAILS ===
Form ID: ${formData.formId || 'Unknown'}
Date: ${content.incidentDate || content.date || 'Not specified'}
Location: ${content.location || content.incidentAddress || 'Not specified'}
Material: ${content.materialName || content.chemicalName || 'Not specified'}
Quantity: ${content.quantity || content.quantityReleased || 'Not specified'}
Reported By: ${content.reportedBy || 'Not specified'}
Containment Actions: ${content.containmentActions || 'Not specified'}
Cleanup Status: ${content.cleanupStatus || 'Not specified'}
Environmental Impact: ${content.environmentalImpact || 'Unknown'}

=== YOUR ANALYSIS TASK ===
Provide a professional spill investigation report with these sections:

1. EXECUTIVE SUMMARY
   - Spill overview and severity
   - Immediate response effectiveness

2. ENVIRONMENTAL IMPACT ASSESSMENT
   - Material hazard classification
   - Quantity significance
   - Soil/water contamination risk
   - Wildlife/ecosystem impact

3. REGULATORY COMPLIANCE
   - EPA reporting requirements (CERCLA/RCRA)
   - State environmental agency notification
   - Required response timeline
   - Potential fines

4. RESPONSE EFFECTIVENESS
   - Containment adequacy
   - Cleanup procedure compliance
   - Personal protective equipment used

5. ROOT CAUSE & PREVENTION
   - Why the spill occurred
   - Systemic failures
   - Engineering controls needed
   - Training requirements

6. CLOSURE REQUIREMENTS
   - Regulatory reporting status
   - Documentation needs
   - Follow-up monitoring

Length: 500-700 words. Environmental focus with regulatory specifics.`;
  }

  /**
   * Build Inspection Report prompt
   */
  static buildInspectionPrompt(formData) {
    const content = formData.formData || formData;

    return `You are a SENIOR SAFETY MANAGER with 15+ years of experience in food safety and facility inspections. Your role is to analyze safety inspection findings and provide an executive-level compliance assessment.

CONTEXT:
- Industry: Commercial Fish Processing & Seafood Operations
- Company: Silver Bay Seafoods (Seattle, WA)
- Your Goal: Assess facility safety compliance, identify deficiencies, ensure FDA/OSHA standards
- Tone: Professional, thorough, focused on continuous improvement

=== INSPECTION DETAILS ===
Form ID: ${formData.formId || 'Unknown'}
Date: ${content.inspectionDate || content.date || 'Not specified'}
Area: ${content.inspectionArea || content.area || 'Not specified'}
Inspector: ${content.inspectorName || content.inspector || 'Not specified'}
Type: ${content.inspectionType || 'Safety Inspection'}
Deficiencies Found: ${content.deficienciesCount || 'Not specified'}

=== YOUR ANALYSIS TASK ===
Provide a professional inspection assessment report with these sections:

1. EXECUTIVE SUMMARY
   - Inspection scope and findings
   - Overall compliance status

2. COMPLIANCE ASSESSMENT
   - OSHA standards compliance
   - FDA/FSMA requirements (if food safety related)
   - Company policy adherence
   - Overall rating: Excellent/Satisfactory/Needs Improvement/Critical

3. CRITICAL FINDINGS
   - Immediate hazards identified
   - Severity ratings
   - Required immediate actions

4. DEFICIENCY ANALYSIS
   - Systemic issues
   - Recurring problems
   - Resource deficiencies

5. CORRECTIVE ACTION PLAN
   - Priority 1: Critical (within 24 hours)
   - Priority 2: Important (within 7 days)
   - Priority 3: Improvements (within 30 days)

6. FOLLOW-UP REQUIREMENTS
   - Re-inspection needed (Yes/No)
   - Timeline for corrections
   - Verification methods

Length: 500-700 words. Constructive and specific to fish processing facilities.`;
  }

  /**
   * Format array data from form
   */
  static formatArray(arr) {
    if (!arr) return '';

    if (Array.isArray(arr)) {
      return arr.filter(item => item && String(item).trim()).join(', ');
    }

    if (typeof arr === 'string') {
      try {
        const parsed = JSON.parse(arr);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && String(item).trim()).join(', ');
        }
        return String(arr);
      } catch (e) {
        return arr.split(',').map(item => item.trim()).filter(i => i).join(', ');
      }
    }

    return String(arr);
  }

  /**
   * Generate Document Control Number (DCN)
   * Format: F-[FORM_CODE]-[FORM_ID] V[YEAR].[VERSION]
   * Example: F-JSA-1001 V26.1
   */
  static generateDCN(formId, formType) {
    const pdfConfig = require('../config/pdfConfig');
    const dcnConfig = pdfConfig.dcn;
    
    // Get form code from configuration
    const formCode = dcnConfig.formCodes[formType] || 'UNK';
    
    // Extract year from current date (2026 -> 26)
    const currentYear = new Date().getFullYear();
    const yearSuffix = String(currentYear).slice(-2);
    
    // Generate DCN with format: F-[CODE]-[FORMID] V[YY].[VERSION]
    const dcn = `${dcnConfig.prefix}-${formCode}-${formId} V${yearSuffix}.${dcnConfig.defaultVersion}`;
    
    return dcn;
  }

  /**
   * Get form type readable name
   */
  static getFormTypeName(formType) {
    const names = {
      'jsa': 'Job Safety Analysis (JSA)',
      'loto': 'Lockout/Tagout (LOTO)',
      'injury': 'Employee Injury Report',
      'accident': 'Accident Report',
      'spillReport': 'Emergency Spill/Release Report',
      'inspection': 'Safety Inspection Report',
      'monthlyInspection': 'Monthly Hygiene Inspection'
    };
    return names[formType] || 'Safety Form';
  }

  /**
   * Call Claude API using official Anthropic SDK
   */
  static async callClaudeAPI(prompt) {
    const apiKey = process.env.CLAUDE_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY not configured in environment');
    }

    try {
      logger.debug('Calling Claude API for report generation');

      // Initialize Anthropic client
      const client = new Anthropic({
        apiKey: apiKey
      });

      // Call Claude API
      // Using Claude 3 Haiku (verified working model for this API key)
      const message = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,  // Increased for comprehensive reports
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      if (!message.content || message.content.length === 0) {
        throw new Error('Empty response from Claude API');
      }

      const reportText = message.content[0].text;
      logger.debug('Received report from Claude API', { length: reportText.length });

      return reportText;
    } catch (error) {
      logger.error('Claude API call failed', {
        error: error.message,
        status: error.status,
        type: error.type
      });

      throw new Error(`Claude API request failed: ${error.message}`);
    }
  }

  /**
   * Save report to database
   */
  static async saveReportToDB(formId, report) {
    await db.runAsync(
      `UPDATE forms SET ai_report = ?, ai_report_generated_at = ?, ai_provider = ? WHERE id = ?`,
      [report, new Date().toISOString(), 'claude', formId]
    );
    logger.debug('AI report saved to database', { formId });
  }

  /**
   * Get report from database
   */
  static async getReport(formId) {
    return db.getAsync(
      `SELECT ai_report, ai_report_generated_at, ai_provider FROM forms WHERE id = ?`,
      [formId]
    );
  }

  /**
   * Check if report exists for form
   */
  static async hasReport(formId) {
    const result = await this.getReport(formId);
    return result && result.ai_report ? true : false;
  }
}

module.exports = AIReportGenerator;
