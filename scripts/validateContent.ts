/**
 * CI / pre-commit content validator.
 *
 * Usage: `npm run validate-content` (or `tsx scripts/validateContent.ts`).
 * Exits 0 on a clean report, 1 if any Zod or cross-reference issue is
 * found. Designed for plain Node — no DOM, no Zustand, no React.
 */

import { validateContent } from '../src/persistence/contentLoader';

function main(): number {
  const report = validateContent();
  if (report.ok) {
    console.log(`✓ content validation passed`);
    return 0;
  }

  console.error(
    `✗ content validation failed — ${report.issues.length} issue${
      report.issues.length === 1 ? '' : 's'
    }`,
  );
  for (const issue of report.issues) {
    console.error(`  [${issue.kind}] ${issue.entityId}: ${issue.message}`);
  }
  return 1;
}

process.exit(main());
