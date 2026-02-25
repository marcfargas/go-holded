/**
 * CLI-specific helpers for document create / duplicate commands.
 *
 * buildDuplicatePayload and DOCUMENT_SERVER_FIELDS live in
 * src/invoicing/duplicate-helpers.ts (shared with the library).
 * This file adds CLI-only concerns: date string parsing and the
 * two-flag approveDoc safety gate.
 */

export { buildDuplicatePayload, DOCUMENT_SERVER_FIELDS } from '../invoicing/duplicate-helpers.js';

/**
 * Parse a date argument: accepts YYYY-MM-DD (interpreted as UTC midnight)
 * or a raw Unix timestamp (integer seconds).
 */
export function parseDateArg(dateStr: string): number {
  if (/^\d+$/.test(dateStr)) {
    return parseInt(dateStr, 10);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(`Invalid --date "${dateStr}". Use YYYY-MM-DD or a Unix timestamp.`);
  }
  const ms = Date.parse(dateStr + 'T00:00:00Z');
  if (isNaN(ms)) throw new Error(`Invalid date: ${dateStr}`);
  return Math.floor(ms / 1000);
}

/**
 * Apply the approveDoc safety gate to a create/duplicate payload.
 *
 * approveDoc=true is IRREVERSIBLE — the document can no longer be edited
 * or deleted once approved. It is therefore ONLY set when the caller
 * explicitly passes both approve=true and confirm=true.
 *
 * Any approveDoc: true already in the payload is stripped; a warning
 * callback is invoked so the CLI can emit it to stderr.
 */
export function applyApproveDocGate(
  data: Record<string, unknown>,
  approve: boolean,
  confirm: boolean,
  onWarn?: (msg: string) => void,
): void {
  if (data['approveDoc'] === true) {
    onWarn?.(
      'approveDoc: true in --json was ignored. ' +
        'Pass --approve --confirm to approve a document immediately (irreversible).',
    );
  }
  data['approveDoc'] = approve && confirm ? true : false;
}
