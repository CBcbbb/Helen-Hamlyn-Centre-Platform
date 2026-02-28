/**
 * Converts CSV files from /data into public/data/graphData.json.
 * Nodes only (links array is always empty).
 * Run: npm run data:build
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'graphData.json');
const REPORT_PATH = path.join(__dirname, '..', 'reports', 'data-report.json');

/**
 * Per-file header mapping: exact CSV header -> app key.
 * id and name are required; others optional.
 */
const PEOPLE_HEADERS = {
  ID: 'id',
  'Name [text]': 'name',
  'Bio [text]': 'bio',
  'Website [link]': 'websites',
  'Social [link]': 'social',
  'Connections to institution [text]': 'connections'
};

const PROJECTS_HEADERS = {
  ID: 'id',
  'Name [text]': 'name',
  'Description [text]': 'description',
  'Who was involved (eg. creatives/communities) - who is being acted upon [text]': 'who_involved',
  'Legacy / Impacts [text]': 'legacy_impacts',
  'Challenges the project faced [text]': 'challenges',
  'What kind of budget was it? [text]': 'budget',
  'What methods were used? [text]': 'methods',
  'Website / Links to videos [link]': 'website',
  'Who was involved (Institutions: funded / presented / supported ) [text]': 'involved_institutions'
};

const INSTITUTIONS_HEADERS = {
  ID: 'id',
  'Name [text]': 'name',
  'Bio [text]': 'bio',
  'Website [link]': 'websites',
  'Social [link]': 'social'
};

const METHODS_HEADERS = {
  ID: 'id',
  'Name [text]': 'name',
  'Description [text]': 'description',
  'Step-by-step guide [Numbered list text ]': 'steps',
  'Challenges of this method [text]': 'challenges',
  'What conditions / materials are needed? [text]': 'conditions',
  'Links to reports / publications [link]': 'publications',
  'Downloadable Templates you might need [link]': 'templates',
  'Category [text]': 'category'
};

const FILE_CONFIG = [
  { file: 'PEOPLE.csv', type: 'People', headers: PEOPLE_HEADERS },
  { file: 'PROJECTS.csv', type: 'Projects', headers: PROJECTS_HEADERS },
  { file: 'INSTITUTIONS.csv', type: 'Institutions', headers: INSTITUTIONS_HEADERS },
  { file: 'METHODS.csv', type: 'Methods', headers: METHODS_HEADERS }
];

const ARRAY_APP_KEYS = ['websites', 'social', 'website'];

/**
 * Process value: empty -> undefined, "a|b|c" -> ["a","b","c"].
 * For array-type app keys (websites, social, website), single values become [val].
 */
function processValue(val, appKey) {
  if (val === null || val === undefined) return undefined;
  const str = String(val).trim();
  if (str === '') return undefined;
  if (str.includes('|')) {
    return str.split('|').map((s) => s.trim()).filter(Boolean);
  }
  if (ARRAY_APP_KEYS.includes(appKey)) {
    return [str];
  }
  return str;
}

/**
 * Build node from row using explicit header mapping.
 */
function rowToNode(row, type, headerMap) {
  const node = { type };

  for (const [csvHeader, appKey] of Object.entries(headerMap)) {
    const val = row[csvHeader];
    const processed = processValue(val, appKey);
    if (processed === undefined) continue;

    if (appKey === 'id') {
      node.id = String(processed).trim();
    } else if (appKey === 'name') {
      node.name = String(processed).trim();
    } else if (node[appKey] !== undefined) {
      const existing = Array.isArray(node[appKey]) ? node[appKey] : [node[appKey]];
      const addition = Array.isArray(processed) ? processed : [processed];
      node[appKey] = [...existing, ...addition];
    } else {
      node[appKey] = processed;
    }
  }

  return node;
}

/**
 * Read CSV file. Returns [] if file missing (with warning).
 */
function readCSV(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: ${filename} not found at ${filepath}`);
    return [];
  }
  const content = fs.readFileSync(filepath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true
  });
}

function main() {
  console.log('Converting CSVs to graphData.json (nodes only)...\n');

  const allNodes = [];
  const seenIds = new Map();
  const report = {
    counts: {},
    skipped_rows: [],
    duplicate_ids: [],
    missing_required_fields: []
  };

  for (const { file, type, headers } of FILE_CONFIG) {
    const rows = readCSV(file);
    let parsed = 0;
    const fileCount = { total: rows.length, parsed: 0, skipped: 0 };
    report.counts[file] = fileCount;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const node = rowToNode(row, type, headers);

      const missing = [];
      if (!node.id || String(node.id).trim() === '') missing.push('id');
      if (!node.name || String(node.name).trim() === '') missing.push('name');

      if (missing.length > 0) {
        fileCount.skipped++;
        report.skipped_rows.push({
          file,
          row: i + 2,
          reason: `missing: ${missing.join(', ')}`
        });
        report.missing_required_fields.push({
          file,
          row: i + 2,
          missing
        });
        continue;
      }

      const id = String(node.id).trim();
      if (seenIds.has(id)) {
        const first = seenIds.get(id);
        if (!report.duplicate_ids.includes(id)) report.duplicate_ids.push(id);
        fileCount.skipped++;
        report.skipped_rows.push({
          file,
          row: i + 2,
          reason: `duplicate id "${id}" (first seen in ${first.file} row ${first.row})`
        });
        continue;
      }
      seenIds.set(id, { file, row: i + 2 });

      allNodes.push(node);
      parsed++;
    }
    fileCount.parsed = parsed;
    console.log(`  ${file}: ${parsed} nodes (${fileCount.skipped} skipped)`);
  }

  if (report.duplicate_ids.length > 0) {
    throw new Error(
      `Duplicate node IDs found: ${report.duplicate_ids.join(', ')}. IDs must be unique across all files.`
    );
  }

  const output = { nodes: allNodes, links: [] };

  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  const reportDir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\nDone. Output: ${OUTPUT_PATH}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main();
