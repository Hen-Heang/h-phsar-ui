// 체크리스트 JSON -> .xlsx (OOXML 직접 생성, Excel/COM/외부 패키지 불필요)
//
// 왜 스크립트인가: 시트 순서·컬럼 폭·결과 드롭다운·개발자 전용 행 배경은 모두 "매번 같아야"
// 쓸모가 있다. 모델이 매번 다시 그리면 점검자가 파일마다 규격을 다시 익혀야 하고, 배포 직전에
// 그걸 확인할 사람은 없다. 규격은 checklist-schema.md 가 정하고, 이 파일이 그대로 집행한다.
//
// 입력 계약: .claude/docs/agents/checklist-generator/references/checklist-schema.md §4
// 호출: node make-checklist-xlsx.mjs --json-path in.json --out-path out.xlsx
// 종료: 0 성공 + "OK {절대경로}" / 1 검증 위반 / 2 오류 (호출측 CSV 폴백 트리거는 비 0)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

class ValidationError extends Error {}
process.on('uncaughtException', error => {
  console.error(`make-checklist-xlsx: ${error.message}`);
  process.exit(error instanceof ValidationError ? 1 : 2);
});

const rest = process.argv.slice(2);
const args = {};
for (let index = 0; index < rest.length; index += 2) {
  const key = rest[index];
  if (!key?.startsWith('--') || rest[index + 1] === undefined) {
    throw new ValidationError('arguments must use --kebab-case value pairs');
  }
  args[key.slice(2)] = rest[index + 1];
}
if (!args['json-path'] || !args['out-path']) {
  throw new ValidationError('usage: make-checklist-xlsx.mjs --json-path <in.json> --out-path <out.xlsx>');
}

const jsonPath = path.resolve(args['json-path']);
const outPath = path.resolve(args['out-path']);
if (!fs.existsSync(jsonPath)) throw new ValidationError(`JSON not found: ${jsonPath}`);

let doc;
try {
  doc = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (error) {
  throw new ValidationError(`invalid JSON: ${error.message}`);
}
const sheets = Array.isArray(doc?.sheets) ? doc.sheets : [];
if (sheets.length === 0) throw new ValidationError('no sheets in JSON');

// ---- XML 조각 ----

const escapeXml = value => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  // 셀 내 개행: JSON "\n" -> 실제 LF -> XML 엔티티 (wrapText 스타일과 조합)
  .replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '&#10;');

const columnLetter = index => {
  let letter = '';
  while (index > 0) {
    const rem = (index - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    index = (index - rem - 1) / 26;
  }
  return letter;
};

const sanitizeSheetName = (name, ordinal) => {
  let out = String(name ?? '').trim() === '' ? `Sheet${ordinal}` : String(name);
  out = out.replace(/[:\\/?*[\]]/g, '_');
  return out.length > 31 ? out.slice(0, 31) : out;
};

/** row 는 배열(일반 행) 또는 {cells, dev} 객체(개발자 전용 행 → 노란 배경). */
const rowCells = row => {
  if (Array.isArray(row)) return { cells: row, style: 2 };
  if (row && typeof row === 'object' && Array.isArray(row.cells)) {
    return { cells: row.cells, style: row.dev ? 3 : 2 };
  }
  throw new ValidationError('row must be an array or {"cells": [...], "dev": true}');
};

const contentTypes = () => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
  + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
  + '<Default Extension="xml" ContentType="application/xml"/>'
  + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
  + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
  + sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
  + '</Types>';

// cellXfs: 0=기본 / 1=헤더(굵게·흰글씨·짙은 채움·중앙·테두리) / 2=본문(테두리·wrap·상단정렬) / 3=본문+노란 배경(개발자 전용 행)
const styles = () => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
  + '<fonts count="2">'
  + '<font><sz val="10"/><name val="Malgun Gothic"/></font>'
  + '<font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Malgun Gothic"/></font>'
  + '</fonts>'
  + '<fills count="4">'
  + '<fill><patternFill patternType="none"/></fill>'
  + '<fill><patternFill patternType="gray125"/></fill>'
  + '<fill><patternFill patternType="solid"><fgColor rgb="FF44546A"/><bgColor indexed="64"/></patternFill></fill>'
  + '<fill><patternFill patternType="solid"><fgColor rgb="FFFFEB9C"/><bgColor indexed="64"/></patternFill></fill>'
  + '</fills>'
  + '<borders count="2">'
  + '<border><left/><right/><top/><bottom/><diagonal/></border>'
  + '<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right><top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border>'
  + '</borders>'
  + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
  + '<cellXfs count="4">'
  + '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
  + '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>'
  + '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'
  + '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'
  + '</cellXfs>'
  + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
  + '</styleSheet>';

const worksheet = sheet => {
  const columns = Array.isArray(sheet?.columns) ? sheet.columns : [];
  if (columns.length < 1) throw new ValidationError(`sheet "${sheet?.name ?? '?'}" has no columns`);
  const rows = Array.isArray(sheet.rows) ? sheet.rows : [];
  const widths = Array.isArray(sheet.widths) ? sheet.widths : [];
  const colCount = columns.length;
  const lastCol = columnLetter(colCount);
  const lastRow = rows.length + 1;

  const out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    `<dimension ref="A1:${lastCol}${lastRow}"/>`,
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>',
    '<sheetFormatPr defaultRowHeight="15"/>', '<cols>'];
  for (let c = 1; c <= colCount; c++) {
    const width = Number(widths[c - 1]) > 0 ? Number(widths[c - 1]) : 20;
    out.push(`<col min="${c}" max="${c}" width="${width}" customWidth="1"/>`);
  }
  out.push('</cols>', '<sheetData>', '<row r="1">');
  for (let c = 1; c <= colCount; c++) {
    out.push(`<c r="${columnLetter(c)}1" s="1" t="inlineStr"><is><t xml:space="preserve">${escapeXml(columns[c - 1])}</t></is></c>`);
  }
  out.push('</row>');
  rows.forEach((row, index) => {
    const { cells, style } = rowCells(row);
    const rowNum = index + 2;
    out.push(`<row r="${rowNum}">`);
    for (let c = 1; c <= colCount; c++) {
      const ref = `${columnLetter(c)}${rowNum}`;
      const value = cells[c - 1];
      if (value === null || value === undefined || String(value) === '') {
        out.push(`<c r="${ref}" s="${style}"/>`);
      } else if (typeof value === 'number' && Number.isFinite(value)) {
        out.push(`<c r="${ref}" s="${style}"><v>${value}</v></c>`);
      } else {
        out.push(`<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`);
      }
    }
    out.push('</row>');
  });
  out.push('</sheetData>');

  // autoFilter — 3컬럼 이상 시트만 (Summary 류 2열 표지 제외 목적)
  if (colCount >= 3 && rows.length > 0) out.push(`<autoFilter ref="A1:${lastCol}${lastRow}"/>`);
  // 결과 컬럼 드롭다운
  const resultCol = Number(sheet.resultCol);
  if (Number.isInteger(resultCol) && resultCol >= 1 && resultCol <= colCount && rows.length > 0) {
    const rc = columnLetter(resultCol);
    out.push(`<dataValidations count="1"><dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="${rc}2:${rc}${lastRow}"><formula1>&quot;OK,NG,N.A&quot;</formula1></dataValidation></dataValidations>`);
  }
  out.push('<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>', '</worksheet>');
  return out.join('');
};

const sheetTags = sheets.map((s, i) => `<sheet name="${escapeXml(sanitizeSheetName(s?.name, i + 1))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('');
const relTags = sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('');

const parts = [
  ['[Content_Types].xml', contentTypes()],
  ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
    + '</Relationships>'],
  ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
    + `<sheets>${sheetTags}</sheets></workbook>`],
  ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + relTags
    + `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`
    + '</Relationships>'],
  ['xl/styles.xml', styles()],
  ...sheets.map((sheet, i) => [`xl/worksheets/sheet${i + 1}.xml`, worksheet(sheet)]),
];

// ---- zip 라이터 (Node 에 zip 쓰기 API 가 없다 — 저장 포맷을 직접 쓴다) ----

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();
const crc32 = buffer => {
  let crc = -1;
  for (const byte of buffer) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  return (crc ^ -1) >>> 0;
};

// 고정 타임스탬프(1980-01-01). 같은 입력이면 같은 바이트가 나와야 재생성 diff 가 의미를 갖는다.
const DOS_TIME = 0;
const DOS_DATE = 0x0021;

const local = [];
const central = [];
let offset = 0;
for (const [name, text] of parts) {
  const nameBuf = Buffer.from(name, 'utf8');
  const raw = Buffer.from(text, 'utf8');
  const deflated = zlib.deflateRawSync(raw, { level: 9 });
  const crc = crc32(raw);

  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);            // version needed
  header.writeUInt16LE(0, 6);             // flags
  header.writeUInt16LE(8, 8);             // deflate
  header.writeUInt16LE(DOS_TIME, 10);
  header.writeUInt16LE(DOS_DATE, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(deflated.length, 18);
  header.writeUInt32LE(raw.length, 22);
  header.writeUInt16LE(nameBuf.length, 26);
  header.writeUInt16LE(0, 28);            // extra len
  local.push(header, nameBuf, deflated);

  const entry = Buffer.alloc(46);
  entry.writeUInt32LE(0x02014b50, 0);
  entry.writeUInt16LE(20, 4);             // version made by
  entry.writeUInt16LE(20, 6);             // version needed
  entry.writeUInt16LE(0, 8);              // flags
  entry.writeUInt16LE(8, 10);             // deflate
  entry.writeUInt16LE(DOS_TIME, 12);
  entry.writeUInt16LE(DOS_DATE, 14);
  entry.writeUInt32LE(crc, 16);
  entry.writeUInt32LE(deflated.length, 20);
  entry.writeUInt32LE(raw.length, 24);
  entry.writeUInt16LE(nameBuf.length, 28);
  entry.writeUInt16LE(0, 30);             // extra len
  entry.writeUInt16LE(0, 32);             // comment len
  entry.writeUInt16LE(0, 34);             // disk start
  entry.writeUInt16LE(0, 36);             // internal attrs
  entry.writeUInt32LE(0, 38);             // external attrs
  entry.writeUInt32LE(offset, 42);        // local header offset
  central.push(entry, nameBuf);

  offset += header.length + nameBuf.length + deflated.length;
}
const centralBuf = Buffer.concat(central);
const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);
eocd.writeUInt16LE(0, 4);
eocd.writeUInt16LE(0, 6);
eocd.writeUInt16LE(parts.length, 8);
eocd.writeUInt16LE(parts.length, 10);
eocd.writeUInt32LE(centralBuf.length, 12);
eocd.writeUInt32LE(offset, 16);
eocd.writeUInt16LE(0, 20);

try {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.concat([...local, centralBuf, eocd]));
} catch (error) {
  try { fs.rmSync(outPath, { force: true }); } catch {}
  throw error;
}

console.log(`OK ${outPath}`);
