import { describe, it, expect } from 'vitest';

/**
 * Tests for the reporter module.
 */

import { generateTextReport, generateJsonReport, generateMarkdownReport } from '../src/reporter';
import { ScanResult } from '../src/types';

function createMockResult(): ScanResult {
  return {
    annotations: [
      {
        type: 'TODO',
        text: 'implement error handling',
        file: 'src/main.ts',
        line: 42,
        column: 5,
        lineContent: '  // TODO: implement error handling',
        severity: 'info',
        author: 'alice',
        date: '2026-01-15T10:00:00Z',
        ageDays: 179,
      },
      {
        type: 'FIXME',
        text: 'race condition in shutdown',
        file: 'src/server.ts',
        line: 128,
        column: 7,
        lineContent: '    // FIXME: race condition in shutdown',
        severity: 'critical',
        author: 'bob',
        date: '2026-03-20T14:30:00Z',
        ageDays: 114,
      },
      {
        type: 'HACK',
        text: 'workaround for API limit',
        file: 'src/api.ts',
        line: 55,
        column: 5,
        lineContent: '  // HACK: workaround for API limit',
        severity: 'warning',
        author: 'alice',
        ageDays: 60,
      },
    ],
    stats: {
      totalFiles: 15,
      totalAnnotations: 3,
      byType: { TODO: 1, FIXME: 1, HACK: 1, XXX: 0, NOTE: 0, OPTIMIZE: 0, REVIEW: 0 },
      bySeverity: { info: 1, warning: 1, critical: 1 },
      byAuthor: { alice: 2, bob: 1 },
      averageAgeDays: 117.7,
      filesWithMost: [
        { file: 'src/main.ts', count: 1 },
        { file: 'src/server.ts', count: 1 },
        { file: 'src/api.ts', count: 1 },
      ],
    },
    options: {},
    scanTimeMs: 150,
  };
}

describe('generateTextReport', () => {
  it('should include totals in the report', () => {
    const result = createMockResult();
    const report = generateTextReport(result);
    expect(report).toContain('3 annotations');
    expect(report).toContain('15 files');
    expect(report).toContain('TODO');
    expect(report).toContain('FIXME');
    expect(report).toContain('HACK');
  });
});

describe('generateJsonReport', () => {
  it('should produce valid JSON', () => {
    const result = createMockResult();
    const report = generateJsonReport(result);
    const parsed = JSON.parse(report);
    expect(parsed.metadata.totalAnnotations).toBe(3);
    expect(parsed.annotations).toHaveLength(3);
    expect(parsed.annotations[0].type).toBe('TODO');
  });
});

describe('generateMarkdownReport', () => {
  it('should include a table of annotations', () => {
    const result = createMockResult();
    const report = generateMarkdownReport(result);
    expect(report).toContain('| TODO |');
    expect(report).toContain('| FIXME |');
    expect(report).toContain('| HACK |');
    expect(report).toContain('src/main.ts');
  });
});