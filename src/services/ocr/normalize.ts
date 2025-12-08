export type NormalizedFields = {
  batchNo?: string;
  mfdDate?: string;
  expiryDate?: string;
  mrp?: string;
};

const batchRegex = /\b(?:B\.?\s*No\.?|BNO|Batch(?:\s*No\.?)?)[:\s\-]*([A-Za-z0-9\-_/]+)/gi;
const mfgRegex = /\b(?:Mfg\.?|Mfd\.?|MFD|Manufactured(?:\s*on)?)[:\s\-]*([0-9]{1,2}[\/\-.][0-9]{2,4})/gi;
const expRegex = /\b(?:Exp\.?|EXP|Use\s*Before|Best\s*Before|Expiry)[:\s\-]*([0-9]{1,2}[\/\-.][0-9]{2,4})/gi;
const mrpRegex = /\b(?:M\.?R\.?P\.?|Price|Rs\.?|₹)\s*[:\-]?\s*₹?\s*([0-9]+(?:\.[0-9]{1,2})?)/gi;

const looseBatchRegex = /\b(?:BNO|BNo|Batch|Lot)\b[:\s\-]*([A-Za-z0-9\-_/]+)/gi;
const looseMfgRegex = /\b(?:MFG|Mfd|Mfd\.?|Manufactured)\b[:\s\-]*([0-9]{1,2}[\/.\-][0-9]{2,4})/gi;
const looseExpRegex = /\b(?:EXP|Exp|Expiry|Use\s*Before|Best\s*Before)\b[:\s\-]*([0-9]{1,2}[\/.\-][0-9]{2,4})/gi;
const looseMrpRegex = /\b(?:MRP|Price|Rs|₹)\b\s*[:\-]?\s*₹?\s*([0-9]+(?:\.[0-9]{1,2})?)/gi;

const nonAlphaNum = /[^A-Za-z0-9\-_/]/g;

const toMMYYYY = (val: string): string | undefined => {
  const parts = val.replace(/\s/g, '').split(/[\/.\-]/);
  if (parts.length < 2) return undefined;
  let m = parseInt(parts[0], 10);
  let y = parts[1].length === 2 ? 2000 + parseInt(parts[1], 10) : parseInt(parts[1], 10);
  if (!Number.isFinite(m) || !Number.isFinite(y)) return undefined;
  if (m < 1 || m > 12) return undefined;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${mm}/${y}`;
};

const laterThan = (a: string, b: string): boolean => {
  const [am, ay] = a.split('/').map(Number);
  const [bm, by] = b.split('/').map(Number);
  if (!am || !ay || !bm || !by) return false;
  if (ay !== by) return ay > by;
  return am > bm;
};

export const parseAndNormalize = (rawText: string): NormalizedFields => {
  const text = rawText.replace(/\|/g, ' | ').replace(/\s+/g, ' ').trim();
  let batchNo: string | undefined;
  let mfdDate: string | undefined;
  let expiryDate: string | undefined;
  let mrp: string | undefined;

  const takeFirst = (regex: RegExp, mapper: (s: string) => string | undefined): string | undefined => {
    regex.lastIndex = 0;
    const m = regex.exec(text);
    if (m && m[1]) return mapper(m[1]);
    return undefined;
  };

  const normBatch = (s: string) => s.replace(nonAlphaNum, '').trim();
  const normDate = (s: string) => toMMYYYY(s) || undefined;
  const normMrp = (s: string) => {
    const n = Number(s);
    if (!Number.isFinite(n)) return undefined;
    if (n <= 0) return undefined;
    return n.toFixed(2);
  };

  batchNo = takeFirst(batchRegex, normBatch) || takeFirst(looseBatchRegex, normBatch);
  mfdDate = takeFirst(mfgRegex, normDate) || takeFirst(looseMfgRegex, normDate);
  expiryDate = takeFirst(expRegex, normDate) || takeFirst(looseExpRegex, normDate);
  mrp = takeFirst(mrpRegex, normMrp) || takeFirst(looseMrpRegex, normMrp);

  if (mfdDate && expiryDate && !laterThan(expiryDate, mfdDate)) {
    expiryDate = undefined;
  }

  return { batchNo, mfdDate, expiryDate, mrp };
};

export const validateNormalized = (
  normalized: NormalizedFields,
  rawText?: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (normalized.mrp && Number(normalized.mrp) < 1) errors.push('MRP must be >= 1');
  if (normalized.mfdDate && normalized.expiryDate) {
    if (!laterThan(normalized.expiryDate, normalized.mfdDate)) errors.push('EXP must be later than MFG');
  }
  if (rawText !== undefined) {
    const hasCurrency = /(?:M\.?R\.?P\.?|Price|Rs\.?|₹)/i.test(rawText);
    if (!hasCurrency) errors.push('Currency symbol missing in text');
  }
  return { isValid: errors.length === 0, errors };
};
