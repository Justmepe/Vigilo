/**
 * Form Document Service
 * Generates professional Word (.docx) documents for all regular safety form types:
 *   jsa, loto, injury, accident, spillReport (spill), monthlyInspection (inspection)
 *
 * Usage:
 *   const { generateDocx } = require('./formDocumentService');
 *   const buffer = await generateDocx(formRow, options);
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
  PageBreak,
  Header,
  Footer,
  PageNumber,
  convertInchesToTwip,
  TableLayoutType,
} = require('docx');

const logger = require('../utils/logger');

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  navy:       '1e40af',
  darkNavy:   '1e3a8a',
  gold:       'ca8a04',
  lightBlue:  'dbeafe',
  gray:       '374151',
  lightGray:  'f3f4f6',
  rowAlt:     'f8fafc',
  white:      'FFFFFF',
  black:      '000000',
  border:     'D1D5DB',
};

// ─── Form type display names ───────────────────────────────────────────────────
const FORM_LABELS = {
  jsa:               'Job Safety Analysis (JSA)',
  loto:              'Lockout / Tagout (LOTO)',
  injury:            'Injury Report',
  accident:          'Accident Report',
  spill:             'Spill / Release Report',
  spillReport:       'Spill / Release Report',
  inspection:        'Monthly Hygiene Inspection',
  monthlyInspection: 'Monthly Hygiene Inspection',
};

// ─── Fields to skip in the key-value table ────────────────────────────────────
const SKIP_KEYS = new Set([
  'attachedPhotos',
  'photos',
  'status',
  'createdAt',
  'userId',
  'companyId',
]);

// ─── Humanize camelCase field names ───────────────────────────────────────────
function humanize(key) {
  // Insert space before uppercase letters, then title-case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

// ─── Format any value for display ─────────────────────────────────────────────
function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    // Arrays of objects (e.g. jobSteps, energySources) → numbered list joined
    if (typeof value[0] === 'object') {
      return value
        .map((item, i) => {
          const parts = Object.entries(item)
            .filter(([k, v]) => v !== null && v !== undefined && v !== '')
            .map(([k, v]) => `${humanize(k)}: ${v}`)
            .join(' | ');
          return `${i + 1}. ${parts}`;
        })
        .join('\n');
    }
    return value.join(', ');
  }
  if (typeof value === 'object') {
    const parts = Object.entries(value)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${humanize(k)}: ${v}`);
    return parts.length ? parts.join(' | ') : '—';
  }
  return String(value);
}

// ─── Standard cell border definition ─────────────────────────────────────────
const STD_BORDERS = {
  top:    { style: BorderStyle.SINGLE, size: 4, color: C.border },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border },
  left:   { style: BorderStyle.SINGLE, size: 4, color: C.border },
  right:  { style: BorderStyle.SINGLE, size: 4, color: C.border },
};

const NO_BORDERS = {
  top:    { style: BorderStyle.NONE, size: 0, color: C.white },
  bottom: { style: BorderStyle.NONE, size: 0, color: C.white },
  left:   { style: BorderStyle.NONE, size: 0, color: C.white },
  right:  { style: BorderStyle.NONE, size: 0, color: C.white },
};

// ─── Helpers: paragraphs ──────────────────────────────────────────────────────
function normalPara(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before ?? 0, after: opts.after ?? 80 },
    children: [
      new TextRun({
        text: String(text || ''),
        bold: opts.bold || false,
        size: opts.size || 20,
        color: opts.color || C.gray,
      }),
    ],
  });
}

function spacer(after = 200) {
  return new Paragraph({ spacing: { after }, children: [] });
}

// ─── Helpers: table cells ─────────────────────────────────────────────────────

/**
 * Create a standard body cell.
 * opts: { bg, bold, color, size, width, align, colSpan, rowSpan }
 */
function makeCell(text, opts = {}) {
  const shading = opts.bg
    ? { fill: opts.bg, type: ShadingType.CLEAR, color: 'auto' }
    : undefined;

  const widthDef = opts.width
    ? { size: opts.width, type: WidthType.DXA }
    : undefined;

  return new TableCell({
    width: widthDef,
    shading,
    borders: STD_BORDERS,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    columnSpan: opts.colSpan,
    rowSpan: opts.rowSpan,
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.LEFT,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text: String(text ?? '—'),
            bold: opts.bold || false,
            size: opts.size || 20,
            color: opts.color || C.gray,
          }),
        ],
      }),
    ],
  });
}

/** Navy background, white bold text — column header */
function headerCell(text, width) {
  return makeCell(text, {
    bg: C.navy,
    bold: true,
    color: C.white,
    size: 20,
    width,
  });
}

/** Light-blue background, navy bold text — section row inside table */
function sectionRow(text, colSpan = 2) {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: colSpan,
        shading: { fill: C.lightBlue, type: ShadingType.CLEAR, color: 'auto' },
        borders: STD_BORDERS,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({
            spacing: { before: 0, after: 0 },
            children: [
              new TextRun({ text, bold: true, size: 20, color: C.navy }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ─── Build the header band (navy bar with company + form label) ───────────────
function buildDocHeader(formLabel, formRow, company = {}) {
  const dateStr = formRow.created_at
    ? new Date(formRow.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return new Header({
    children: [
      new Table({
        layout: TableLayoutType.FIXED,
        width: { size: 9140, type: WidthType.DXA },
        rows: [
          new TableRow({
            children: [
              // Left: company name
              new TableCell({
                width: { size: 5000, type: WidthType.DXA },
                shading: { fill: C.navy, type: ShadingType.CLEAR, color: 'auto' },
                borders: NO_BORDERS,
                margins: { top: 100, bottom: 100, left: 160, right: 80 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: company.name || 'Vigilo EHS', bold: true, size: 28, color: C.white }),
                    ],
                  }),
                ],
              }),
              // Right: form label
              new TableCell({
                width: { size: 4140, type: WidthType.DXA },
                shading: { fill: C.navy, type: ShadingType.CLEAR, color: 'auto' },
                borders: NO_BORDERS,
                margins: { top: 100, bottom: 100, left: 80, right: 160 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({ text: formLabel, bold: true, size: 20, color: C.gold }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ─── Build footer ─────────────────────────────────────────────────────────────
function buildDocFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'CONFIDENTIAL \u2014 FOR SAFETY COMPLIANCE PURPOSES ONLY  |  Page ',
            size: 16,
            color: C.gray,
          }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.gray }),
        ],
      }),
    ],
  });
}

// ─── Build the title block (form ID, date, submitted by) ─────────────────────
function buildTitleBlock(formLabel, formRow) {
  const dateStr = formRow.created_at
    ? new Date(formRow.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';
  const formId = `FORM-${String(formRow.id).padStart(5, '0')}`;
  const submittedBy = formRow.user_name || '—';

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({ text: formLabel.toUpperCase(), bold: true, size: 36, color: C.darkNavy }),
      ],
    }),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 9140, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            headerCell('Form ID',       2285),
            headerCell('Submitted Date', 3570),
            headerCell('Submitted By',   3285),
          ],
        }),
        new TableRow({
          children: [
            makeCell(formId,      { size: 20, bold: true }),
            makeCell(dateStr,     { size: 20 }),
            makeCell(submittedBy, { size: 20 }),
          ],
        }),
      ],
    }),
    spacer(240),
  ];
}

// ─── Build key-value table from form_data ─────────────────────────────────────

/**
 * For fields whose values are multi-line strings (array/object serialized),
 * we render them in a tall cell using multiple text runs.
 */
function buildMultilineCell(text) {
  const lines = text.split('\n');
  return new TableCell({
    width: { size: 6100, type: WidthType.DXA },
    shading: undefined,
    borders: STD_BORDERS,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: lines.map(line =>
      new Paragraph({
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: line, size: 20, color: C.gray })],
      })
    ),
  });
}

function buildKVTable(formData) {
  const entries = Object.entries(formData).filter(([k]) => !SKIP_KEYS.has(k));

  if (entries.length === 0) {
    return normalPara('No form data recorded.', { color: C.gray });
  }

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('Field',  3040),
      headerCell('Value',  6100),
    ],
  });

  const dataRows = entries.map(([key, value], idx) => {
    const label = humanize(key);
    const displayVal = formatValue(value);
    const isMultiline = displayVal.includes('\n');
    const rowBg = idx % 2 === 0 ? C.white : C.rowAlt;

    const labelCell = makeCell(label, {
      width: 3040,
      bold: true,
      size: 20,
      color: C.navy,
      bg: rowBg,
    });

    const valueCell = isMultiline
      ? buildMultilineCell(displayVal)
      : makeCell(displayVal, { width: 6100, size: 20, bg: rowBg });

    return new TableRow({ children: [labelCell, valueCell] });
  });

  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 9140, type: WidthType.DXA },
    rows: [headerRow, ...dataRows],
  });
}

// ─── Build AI report section ──────────────────────────────────────────────────
function buildAISection(aiReport) {
  if (!aiReport || !aiReport.trim()) return [];

  const lines = aiReport.split('\n');

  return [
    spacer(300),
    // Section heading row — full-width shaded bar
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 9140, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 1,
              shading: { fill: C.lightBlue, type: ShadingType.CLEAR, color: 'auto' },
              borders: STD_BORDERS,
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Safety Analysis Report (AI Generated)',
                      bold: true,
                      size: 24,
                      color: C.navy,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'f0f4ff', type: ShadingType.CLEAR, color: 'auto' },
              borders: STD_BORDERS,
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: lines.map(line =>
                new Paragraph({
                  spacing: { before: 0, after: line.trim() === '' ? 80 : 60 },
                  children: [
                    new TextRun({ text: line, size: 20, color: C.gray }),
                  ],
                })
              ),
            }),
          ],
        }),
      ],
    }),
  ];
}

// ─── Build signature block ────────────────────────────────────────────────────
function buildSignatureBlock() {
  const sigLine = '_______________________________';
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return [
    spacer(300),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 9140, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            headerCell('Prepared By',  3046),
            headerCell('Reviewed By',  3047),
            headerCell('Date',         3047),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3046, type: WidthType.DXA },
              borders: STD_BORDERS,
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
              children: [
                normalPara('Name: ' + sigLine),
                spacer(120),
                normalPara('Signature: ' + sigLine),
              ],
            }),
            new TableCell({
              width: { size: 3047, type: WidthType.DXA },
              borders: STD_BORDERS,
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
              children: [
                normalPara('Name: ' + sigLine),
                spacer(120),
                normalPara('Signature: ' + sigLine),
              ],
            }),
            new TableCell({
              width: { size: 3047, type: WidthType.DXA },
              borders: STD_BORDERS,
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
              children: [
                normalPara(today),
              ],
            }),
          ],
        }),
      ],
    }),
  ];
}

// ─── Form-specific section builders ───────────────────────────────────────────

/**
 * JSA: render jobSteps as a dedicated table when present.
 */
function buildJSAExtras(formData) {
  const steps = formData.jobSteps;
  if (!Array.isArray(steps) || steps.length === 0) return [];

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('#',                       460),
      headerCell('Job Step / Task',        2460),
      headerCell('Potential Hazard',       2460),
      headerCell('Preventive Measure',     2460),
      headerCell('PPE Required',           1300),
    ],
  });

  const rows = steps.map((step, idx) =>
    new TableRow({
      children: [
        makeCell(idx + 1, { width: 460,  size: 18 }),
        makeCell(step.step        || step.stepDescription || step.task || '—', { width: 2460, size: 18 }),
        makeCell(step.hazard      || step.potentialHazard  || '—',             { width: 2460, size: 18 }),
        makeCell(step.control     || step.preventiveMeasure || step.controls || '—', { width: 2460, size: 18 }),
        makeCell(step.ppe         || step.ppeRequired       || '—',             { width: 1300, size: 18 }),
      ],
    })
  );

  return [
    spacer(200),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 9140, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: C.lightBlue, type: ShadingType.CLEAR, color: 'auto' },
              borders: STD_BORDERS,
              margins: { top: 100, bottom: 100, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Job Steps / Task Hazard Analysis', bold: true, size: 22, color: C.navy })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 9140, type: WidthType.DXA },
      rows: [headerRow, ...rows],
    }),
  ];
}

/**
 * LOTO: render energySources as a dedicated table when present.
 */
function buildLOTOExtras(formData) {
  const sources = formData.energySources;
  if (!Array.isArray(sources) || sources.length === 0) return [];

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('#',               460),
      headerCell('Energy Type',    2200),
      headerCell('Location',       2200),
      headerCell('Lockout Method', 2200),
      headerCell('Verified By',    2080),
    ],
  });

  const rows = sources.map((src, idx) =>
    new TableRow({
      children: [
        makeCell(idx + 1,                                              { width: 460,  size: 18 }),
        makeCell(src.type        || src.energyType     || '—',        { width: 2200, size: 18 }),
        makeCell(src.location    || '—',                               { width: 2200, size: 18 }),
        makeCell(src.method      || src.lockoutMethod  || '—',        { width: 2200, size: 18 }),
        makeCell(src.verifiedBy  || '—',                               { width: 2080, size: 18 }),
      ],
    })
  );

  return [
    spacer(200),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 9140, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: C.lightBlue, type: ShadingType.CLEAR, color: 'auto' },
              borders: STD_BORDERS,
              margins: { top: 100, bottom: 100, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Energy Sources', bold: true, size: 22, color: C.navy })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 9140, type: WidthType.DXA },
      rows: [headerRow, ...rows],
    }),
  ];
}

/**
 * Inspection: render checklist items as a dedicated table when present.
 */
function buildInspectionExtras(formData) {
  const items =
    formData.checklistItems ||
    formData.inspectionItems ||
    formData.items;

  if (!Array.isArray(items) || items.length === 0) return [];

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('#',             460),
      headerCell('Item',         4000),
      headerCell('Status',       1800),
      headerCell('Notes',        2880),
    ],
  });

  const rows = items.map((item, idx) => {
    const statusVal = item.status || item.result || item.compliant || '—';
    const statusColor =
      String(statusVal).toLowerCase().includes('pass') ||
      String(statusVal).toLowerCase().includes('yes')  ||
      String(statusVal).toLowerCase() === 'compliant'
        ? '16a34a'
        : String(statusVal).toLowerCase().includes('fail') ||
          String(statusVal).toLowerCase().includes('no')
          ? 'dc2626'
          : C.gray;

    return new TableRow({
      children: [
        makeCell(idx + 1,                                { width: 460,  size: 18 }),
        makeCell(item.item || item.description || '—',   { width: 4000, size: 18 }),
        makeCell(statusVal,                              { width: 1800, size: 18, color: statusColor, bold: true }),
        makeCell(item.notes || item.comments || '—',     { width: 2880, size: 18 }),
      ],
    });
  });

  return [
    spacer(200),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 9140, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: C.lightBlue, type: ShadingType.CLEAR, color: 'auto' },
              borders: STD_BORDERS,
              margins: { top: 100, bottom: 100, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Inspection Checklist', bold: true, size: 22, color: C.navy })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 9140, type: WidthType.DXA },
      rows: [headerRow, ...rows],
    }),
  ];
}

// ─── Form-type extras dispatcher ──────────────────────────────────────────────
function buildFormExtras(formType, formData) {
  switch (formType) {
    case 'jsa':
      return buildJSAExtras(formData);
    case 'loto':
      return buildLOTOExtras(formData);
    case 'inspection':
    case 'monthlyInspection':
      return buildInspectionExtras(formData);
    default:
      return [];
  }
}

// ─── Section heading (standalone paragraph style) ────────────────────────────
function sectionHeadingPara(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    shading: { type: ShadingType.CLEAR, fill: C.navy, color: C.navy },
    children: [new TextRun({ text, bold: true, size: 26, color: C.white })],
  });
}

// ─── Main export: generateDocx ────────────────────────────────────────────────

/**
 * Generate a Word document for any regular safety form.
 *
 * @param {object} formRow - DB row with: id, form_type, form_data (parsed object),
 *                           created_at, ai_report (string|null), user_name (optional)
 * @param {object} [options] - Reserved for future options
 * @returns {Promise<Buffer>}
 */
async function generateDocx(formRow, options = {}) {
  try {
    const formType  = formRow.form_type || 'unknown';
    const formData  = formRow.form_data  || {};
    const formLabel = FORM_LABELS[formType] || `${formType.toUpperCase()} Form`;
    const company   = options.company || {};  // { name, industry, site_location, contact_email }

    // Build document sections
    const titleBlock   = buildTitleBlock(formLabel, formRow);
    const kvTable      = buildKVTable(formData);
    const formExtras   = buildFormExtras(formType, formData);
    const aiSection    = buildAISection(formRow.ai_report);
    const sigBlock     = buildSignatureBlock();

    const companyName = company.name || 'Vigilo EHS';
    const doc = new Document({
      creator:     companyName,
      title:       `${formLabel} — ${String(formRow.id).padStart(5, '0')}`,
      description: `Safety form document generated by ${companyName}`,
      sections: [
        {
          properties: {
            page: {
              margin: {
                top:    convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left:   convertInchesToTwip(0.75),
                right:  convertInchesToTwip(0.75),
              },
            },
          },
          headers: {
            default: buildDocHeader(formLabel, formRow, company),
          },
          footers: {
            default: buildDocFooter(),
          },
          children: [
            // Title + metadata
            ...titleBlock,

            // Section: Form Details
            sectionHeadingPara('FORM DETAILS'),
            kvTable,

            // Form-type-specific tables (jobSteps, energySources, checklist)
            ...formExtras,

            // AI report section (if present)
            ...aiSection,

            // Signature block
            ...sigBlock,
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    logger.info(`formDocumentService: generated docx for form ${formRow.id} (${formType}), size=${buffer.length}`);
    return buffer;
  } catch (err) {
    logger.error(`formDocumentService: failed to generate docx for form ${formRow?.id}`, { error: err.message });
    throw err;
  }
}

module.exports = { generateDocx };
