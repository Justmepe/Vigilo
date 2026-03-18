/**
 * Audit Document Service
 * Generates formatted Word (.docx) documents for OSHA/NFPA audits
 * and calls Claude AI for executive summaries.
 */
const {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  Packer,
  ShadingType,
  UnderlineType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  convertInchesToTwip,
  TableLayoutType,
} = require('docx');
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Color Constants ─────────────────────────────────────────────────────────
const COLORS = {
  headerBlue:    '1e40af',
  lightBlue:     'dbeafe',
  darkBlue:      '1e3a8a',
  red:           'dc2626',
  lightRed:      'fee2e2',
  orange:        'ea580c',
  lightOrange:   'ffedd5',
  yellow:        'ca8a04',
  lightYellow:   'fefce8',
  green:         '16a34a',
  lightGreen:    'dcfce7',
  gray:          '374151',
  lightGray:     'f3f4f6',
  tableHeader:   '1e40af',
  white:         'FFFFFF',
  black:         '000000',
};

// ─── Severity → Color mapping ─────────────────────────────────────────────────
function severityColor(severity) {
  const map = {
    Critical:  { bg: COLORS.lightRed,    fg: COLORS.red    },
    High:      { bg: COLORS.lightOrange, fg: COLORS.orange  },
    Moderate:  { bg: COLORS.lightYellow, fg: COLORS.yellow  },
    Low:       { bg: COLORS.lightGreen,  fg: COLORS.green   },
    'N/A':     { bg: COLORS.lightGray,   fg: COLORS.gray    },
  };
  return map[severity] || map['N/A'];
}

// ─── Helper: Bold paragraph ───────────────────────────────────────────────────
function boldPara(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { after: opts.after ?? 100 },
    children: [new TextRun({ text, bold: true, size: opts.size || 22, color: opts.color || COLORS.black })],
  });
}

// ─── Helper: Normal paragraph ─────────────────────────────────────────────────
function normalPara(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { after: opts.after ?? 80 },
    children: [new TextRun({ text: text || '', size: opts.size || 20, color: opts.color || COLORS.gray })],
  });
}

// ─── Helper: Section heading ──────────────────────────────────────────────────
function sectionHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    shading: { type: ShadingType.SOLID, color: COLORS.headerBlue, fill: COLORS.headerBlue },
    children: [new TextRun({ text, bold: true, size: 26, color: COLORS.white })],
  });
}

// ─── Helper: Simple table cell ────────────────────────────────────────────────
function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.bg ? { type: ShadingType.SOLID, color: opts.bg, fill: opts.bg } : undefined,
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      left:   { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      right:  { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
    },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.LEFT,
        children: [new TextRun({
          text: String(text || '—'),
          bold: opts.bold || false,
          size: opts.size || 18,
          color: opts.color || COLORS.gray,
        })],
      }),
    ],
  });
}

// ─── Helper: Header cell (blue background) ────────────────────────────────────
function headerCell(text, width) {
  return cell(text, { bg: COLORS.tableHeader, bold: true, color: COLORS.white, size: 18, width });
}

// ─── Count helpers ────────────────────────────────────────────────────────────
function countBy(findings, field, value) {
  return findings.filter(f => f[field] === value).length;
}

// ─── Build Summary Statistics Table ─────────────────────────────────────────
function buildSummaryTable(findings) {
  const total       = findings.length;
  const compliant   = countBy(findings, 'condition_observed', 'Compliant');
  const nonCompliant= countBy(findings, 'condition_observed', 'Non-Compliant');
  const improvement = countBy(findings, 'condition_observed', 'Improvement Opportunity');
  const na          = countBy(findings, 'condition_observed', 'Not Applicable');
  const critical    = countBy(findings, 'severity', 'Critical');
  const high        = countBy(findings, 'severity', 'High');
  const moderate    = countBy(findings, 'severity', 'Moderate');
  const low         = countBy(findings, 'severity', 'Low');
  const repeats     = countBy(findings, 'repeat_finding', 'Yes');
  const open        = findings.filter(f => f.finding_status !== 'Closed').length;
  const closed      = findings.filter(f => f.finding_status === 'Closed').length;

  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell('METRIC', 50), headerCell('COUNT', 50)] }),
      new TableRow({ children: [cell('Total Observations', { bold: true }), cell(total)] }),
      new TableRow({ children: [cell('✓  Compliant', { color: COLORS.green }), cell(compliant)] }),
      new TableRow({ children: [cell('✗  Non-Compliant', { color: COLORS.red }), cell(nonCompliant)] }),
      new TableRow({ children: [cell('⚑  Improvement Opportunity'), cell(improvement)] }),
      new TableRow({ children: [cell('N/A  Not Applicable'), cell(na)] }),
      new TableRow({ children: [cell(''), cell('')] }), // spacer
      new TableRow({ children: [cell('🔴  Critical Severity', { color: COLORS.red }), cell(critical)] }),
      new TableRow({ children: [cell('🟠  High Severity',     { color: COLORS.orange }), cell(high)] }),
      new TableRow({ children: [cell('🟡  Moderate Severity', { color: COLORS.yellow }), cell(moderate)] }),
      new TableRow({ children: [cell('🟢  Low Severity',      { color: COLORS.green }), cell(low)] }),
      new TableRow({ children: [cell(''), cell('')] }),
      new TableRow({ children: [cell('⚠  Repeat Findings', { bold: true, color: COLORS.red }), cell(repeats)] }),
      new TableRow({ children: [cell('Open Findings'), cell(open)] }),
      new TableRow({ children: [cell('Closed Findings'), cell(closed)] }),
    ],
  });
}

// ─── Build Findings Detail Table ─────────────────────────────────────────────
function buildFindingsTable(findings) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('#',          5),
      headerCell('Location',   12),
      headerCell('Question / Observation', 22),
      headerCell('Condition',  10),
      headerCell('Hazard',     10),
      headerCell('Regulation', 10),
      headerCell('Severity',   8),
      headerCell('Repeat',     7),
      headerCell('Risk Score', 8),
      headerCell('Status',     8),
    ],
  });

  const rows = findings.map(f => {
    const sc = severityColor(f.severity);
    const rc = severityColor(f.risk_score);
    return new TableRow({
      children: [
        cell(f.finding_number, { size: 16 }),
        cell(f.location, { size: 16 }),
        cell(f.audit_question, { size: 15 }),
        cell(f.condition_observed, {
          size: 15,
          color: f.condition_observed === 'Non-Compliant' ? COLORS.red : COLORS.gray,
          bold: f.condition_observed === 'Non-Compliant',
        }),
        cell(f.hazard_type || '—', { size: 15 }),
        cell(f.regulation  || '—', { size: 15 }),
        cell(f.severity, { size: 15, bg: sc.bg, color: sc.fg, bold: true }),
        cell(f.repeat_finding, {
          size: 15,
          color: f.repeat_finding === 'Yes' ? COLORS.red : COLORS.gray,
          bold: f.repeat_finding === 'Yes',
        }),
        cell(f.risk_score || '—', { size: 15, bg: rc.bg, color: rc.fg, bold: true }),
        cell(f.finding_status, { size: 15 }),
      ],
    });
  });

  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows],
  });
}

// ─── Build Corrective Action Table ───────────────────────────────────────────
function buildCorrectiveActionTable(findings) {
  const actionable = findings.filter(
    f => f.condition_observed === 'Non-Compliant' || f.condition_observed === 'Improvement Opportunity'
  );
  if (actionable.length === 0) return normalPara('No corrective actions required.');

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('#',                  4),
      headerCell('Location',           10),
      headerCell('Finding Description', 22),
      headerCell('Immediate Action',   16),
      headerCell('Corrective Action',  18),
      headerCell('Responsible Party',  12),
      headerCell('Target Date',        10),
      headerCell('Status',             8),
    ],
  });

  const rows = actionable.map(f => new TableRow({
    children: [
      cell(f.finding_number, { size: 16 }),
      cell(f.location,       { size: 15 }),
      cell(f.description || f.audit_question, { size: 15 }),
      cell(f.immediate_action   || '—', { size: 15 }),
      cell(f.corrective_action  || 'TBD', { size: 15 }),
      cell(f.responsible_party  || 'TBD', { size: 15 }),
      cell(f.target_date        || 'TBD', { size: 15 }),
      cell(f.finding_status, {
        size: 15,
        color: f.finding_status === 'Closed' ? COLORS.green : COLORS.red,
        bold: true,
      }),
    ],
  }));

  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows],
  });
}

// ─── Build Cover / Header Info ────────────────────────────────────────────────
function buildCoverSection(audit) {
  const areas = Array.isArray(audit.audit_areas) ? audit.audit_areas.join(', ') : audit.audit_areas;
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'SMART OSHA / NFPA SAFETY AUDIT REPORT', bold: true, size: 36, color: COLORS.darkBlue }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ text: `${audit.audit_category}  •  ${audit.facility_name}`, size: 22, color: COLORS.gray }),
      ],
    }),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('AUDIT INFORMATION', 30), headerCell('DETAILS', 70)] }),
        new TableRow({ children: [cell('Facility / Plant',   { bold: true }), cell(audit.facility_name)] }),
        new TableRow({ children: [cell('Area(s) Audited',    { bold: true }), cell(areas)] }),
        new TableRow({ children: [cell('Audit Category',     { bold: true }), cell(audit.audit_category)] }),
        new TableRow({ children: [cell('Audit Date',         { bold: true }), cell(audit.audit_date)] }),
        new TableRow({ children: [cell('Auditor',            { bold: true }), cell(audit.auditor_name)] }),
        new TableRow({ children: [cell('Report Generated',   { bold: true }), cell(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))] }),
        new TableRow({ children: [cell('Audit ID',           { bold: true }), cell(`AUD-${String(audit.id).padStart(4, '0')}`)] }),
      ],
    }),
  ];
}

// ─── Main: Generate DOCX ──────────────────────────────────────────────────────
async function generateDocx(audit, findings) {
  // Split findings for repeat tracking
  const repeatFindings = findings.filter(f => f.repeat_finding === 'Yes');
  const criticalFindings = findings.filter(f => f.severity === 'Critical' && f.condition_observed === 'Non-Compliant');

  // Build AI report if available
  const aiSection = audit.ai_report
    ? [
        sectionHeading('AI-GENERATED EXECUTIVE SUMMARY'),
        ...audit.ai_report.split('\n').map(line =>
          normalPara(line, { size: 20, after: 60 })
        ),
      ]
    : [];

  // Build repeat findings alert section
  const repeatSection = repeatFindings.length > 0
    ? [
        sectionHeading('⚠  REPEAT FINDINGS — ESCALATION REQUIRED'),
        new Table({
          layout: TableLayoutType.FIXED,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell('Finding #', 8), headerCell('Location', 15), headerCell('Question', 35), headerCell('Severity', 12), headerCell('Risk Score', 15), headerCell('Status', 15)] }),
            ...repeatFindings.map(f => new TableRow({
              children: [
                cell(f.finding_number, { bg: COLORS.lightRed }),
                cell(f.location,       { bg: COLORS.lightRed }),
                cell(f.audit_question, { bg: COLORS.lightRed }),
                cell(f.severity,       { bg: COLORS.lightRed, bold: true, color: COLORS.red }),
                cell(f.risk_score,     { bg: COLORS.lightRed, bold: true, color: COLORS.red }),
                cell(f.finding_status, { bg: COLORS.lightRed }),
              ],
            })),
          ],
        }),
      ]
    : [];

  const doc = new Document({
    creator: 'Safety Manager App',
    title: `OSHA/NFPA Audit Report — ${audit.facility_name}`,
    description: `Safety audit for ${audit.facility_name} on ${audit.audit_date}`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top:    convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left:   convertInchesToTwip(1),
              right:  convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: `${audit.facility_name}  |  OSHA/NFPA Audit  |  ${audit.audit_date}`, size: 16, color: COLORS.gray }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'CONFIDENTIAL — FOR SAFETY COMPLIANCE PURPOSES ONLY  |  Page ', size: 16, color: COLORS.gray }),
                  new PageNumber({ format: NumberFormat.DECIMAL }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Cover / Header
          ...buildCoverSection(audit),

          new Paragraph({ children: [new PageBreak()] }),

          // Executive Summary (AI)
          ...aiSection,

          // Summary Statistics
          sectionHeading('AUDIT SUMMARY STATISTICS'),
          buildSummaryTable(findings),

          new Paragraph({ spacing: { after: 300 }, children: [] }),

          // Repeat Findings Alert
          ...repeatSection,

          new Paragraph({ children: findings.length > 0 ? [new PageBreak()] : [] }),

          // Detailed Findings
          sectionHeading('DETAILED FINDINGS LOG'),
          ...(findings.length > 0
            ? [buildFindingsTable(findings)]
            : [normalPara('No findings were recorded for this audit.')]),

          new Paragraph({ spacing: { after: 300 }, children: [] }),

          // Individual Finding Cards for non-compliant items with descriptions
          ...buildFindingCards(findings),

          new Paragraph({ children: [new PageBreak()] }),

          // Corrective Action Plan
          sectionHeading('CORRECTIVE ACTION PLAN'),
          buildCorrectiveActionTable(findings),

          new Paragraph({ spacing: { after: 400 }, children: [] }),

          // Signature block
          sectionHeading('SIGN-OFF'),
          buildSignatureBlock(audit),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

// ─── Individual Finding Cards (for detailed descriptions) ────────────────────
function buildFindingCards(findings) {
  const detailed = findings.filter(
    f => f.condition_observed === 'Non-Compliant' || (f.description && f.description.trim())
  );
  if (detailed.length === 0) return [];

  const elements = [sectionHeading('FINDING DETAIL CARDS')];

  detailed.forEach(f => {
    const sc = severityColor(f.severity);
    const isRepeat = f.repeat_finding === 'Yes';

    elements.push(
      new Table({
        layout: TableLayoutType.FIXED,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // Finding header row
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 4,
                shading: { type: ShadingType.SOLID, color: isRepeat ? COLORS.red : COLORS.headerBlue, fill: isRepeat ? COLORS.red : COLORS.headerBlue },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: `Finding #${f.finding_number}${isRepeat ? '  ⚠ REPEAT' : ''}  —  ${f.location}`,
                    bold: true, size: 20, color: COLORS.white,
                  })],
                })],
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
              }),
            ],
          }),
          new TableRow({ children: [cell('Question', { bold: true, width: 20 }), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: f.audit_question, size: 18 })] })], borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' } }, margins: { top: 80, bottom: 80, left: 120, right: 120 } })] }),
          new TableRow({ children: [cell('Condition', { bold: true, width: 20 }), cell(f.condition_observed, { color: f.condition_observed === 'Non-Compliant' ? COLORS.red : COLORS.green, bold: true, width: 30 }), cell('Severity', { bold: true, width: 20 }), cell(f.severity, { bg: sc.bg, color: sc.fg, bold: true, width: 30 })] }),
          new TableRow({ children: [cell('Hazard Type', { bold: true }), cell(f.hazard_type || '—'), cell('Regulation', { bold: true }), cell(f.regulation || '—')] }),
          new TableRow({ children: [cell('Repeat Finding', { bold: true }), cell(f.repeat_finding, { color: isRepeat ? COLORS.red : COLORS.gray, bold: isRepeat }), cell('Risk Score', { bold: true }), cell(f.risk_score || '—', { bold: true })] }),
          ...(f.description ? [new TableRow({ children: [cell('Description of Finding', { bold: true, width: 20 }), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: f.description, size: 18 })] })], borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' } }, margins: { top: 80, bottom: 80, left: 120, right: 120 } })] })] : []),
          ...(f.immediate_action ? [new TableRow({ children: [cell('Immediate Action', { bold: true }), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: f.immediate_action, size: 18 })] })], borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' } }, margins: { top: 80, bottom: 80, left: 120, right: 120 } })] })] : []),
          ...(f.corrective_action ? [new TableRow({ children: [cell('Corrective Action', { bold: true }), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: f.corrective_action, size: 18 })] })], borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' } }, margins: { top: 80, bottom: 80, left: 120, right: 120 } })] })] : []),
          new TableRow({ children: [cell('Responsible Party', { bold: true }), cell(f.responsible_party || 'TBD'), cell('Target Date', { bold: true }), cell(f.target_date || 'TBD')] }),
          new TableRow({ children: [cell('Status', { bold: true }), cell(f.finding_status, { color: f.finding_status === 'Closed' ? COLORS.green : COLORS.red, bold: true }), cell('Date Closed', { bold: true }), cell(f.date_closed || '—')] }),
        ],
      }),
      new Paragraph({ spacing: { after: 250 }, children: [] })
    );
  });

  return elements;
}

// ─── Signature Block ──────────────────────────────────────────────────────────
function buildSignatureBlock(audit) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell('AUDITOR SIGN-OFF', 50), headerCell('FACILITY MANAGEMENT', 50)] }),
      new TableRow({ children: [
        new TableCell({
          children: [
            normalPara(`Name: ${audit.auditor_name}`),
            new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: 'Signature: _______________________________', size: 18 })] }),
            normalPara(`Date: ${audit.audit_date}`),
          ],
          borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' } },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
        }),
        new TableCell({
          children: [
            normalPara('Name: _______________________________'),
            new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: 'Signature: _______________________________', size: 18 })] }),
            normalPara('Date: _______________________________'),
          ],
          borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' } },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
        }),
      ]}),
    ],
  });
}

// ─── AI Report Generation ─────────────────────────────────────────────────────
async function generateAIReport(audit, findings) {
  try {
    const nonCompliant = findings.filter(f => f.condition_observed === 'Non-Compliant');
    const criticals    = findings.filter(f => f.severity === 'Critical');
    const repeats      = findings.filter(f => f.repeat_finding === 'Yes');

    const prompt = `You are a certified OSHA compliance expert and safety auditor. Analyze the following safety audit and write a professional Executive Summary report.

AUDIT INFORMATION:
- Facility: ${audit.facility_name}
- Areas Audited: ${Array.isArray(audit.audit_areas) ? audit.audit_areas.join(', ') : audit.audit_areas}
- Category: ${audit.audit_category}
- Date: ${audit.audit_date}
- Auditor: ${audit.auditor_name}

FINDINGS SUMMARY:
- Total Observations: ${findings.length}
- Non-Compliant: ${nonCompliant.length}
- Critical Findings: ${criticals.length}
- Repeat Findings: ${repeats.length}

NON-COMPLIANT FINDINGS:
${nonCompliant.map(f => `• [${f.severity}] ${f.location}: ${f.audit_question}
  Description: ${f.description || 'N/A'}
  Regulation: ${f.regulation || 'N/A'}
  Hazard: ${f.hazard_type || 'N/A'}
  Repeat: ${f.repeat_finding}`).join('\n')}

${repeats.length > 0 ? `REPEAT FINDINGS (Require Escalation):
${repeats.map(f => `• ${f.location}: ${f.audit_question} [${f.severity}]`).join('\n')}` : ''}

Write a structured executive summary with these sections:
1. OVERALL ASSESSMENT (2-3 sentences with overall risk level: LOW/MODERATE/HIGH/CRITICAL)
2. KEY FINDINGS (bullet points for top 3-5 issues)
3. IMMEDIATE PRIORITIES (what must be addressed within 24-48 hours)
4. REGULATORY EXPOSURE (OSHA citations risk based on findings)
5. RECOMMENDATIONS (3-5 actionable steps for leadership)

Keep it professional, concise, and actionable. Use plain text — no markdown symbols.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0]?.text || 'AI report generation failed.';
  } catch (err) {
    logger.error('AI report generation error:', err.message);
    return `Executive summary could not be generated automatically. Manual review required.\n\nAudit: ${audit.facility_name} | ${audit.audit_category} | ${audit.audit_date}`;
  }
}

module.exports = { generateDocx, generateAIReport };
