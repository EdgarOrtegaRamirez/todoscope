/**
 * Report generator — produces text, JSON, and Markdown output.
 */

import { Annotation, ScanResult, ScanStats } from './types';

/**
 * Generate a human-readable text report.
 */
export function generateTextReport(result: ScanResult): string {
  const { annotations, stats, scanTimeMs } = result;
  const lines: string[] = [];

  lines.push(`╔══════════════════════════════════════════╗`);
  lines.push(`║           TodoScope Report              ║`);
  lines.push(`╚══════════════════════════════════════════╝`);
  lines.push('');
  lines.push(`  Scanned: ${stats.totalFiles} files in ${scanTimeMs}ms`);
  lines.push(`  Found:   ${stats.totalAnnotations} annotations`);
  lines.push('');

  // Summary by type
  lines.push('  ── By Type ──');
  for (const [type, count] of Object.entries(stats.byType)) {
    if (count > 0) {
      const severity = type === 'FIXME' ? '🔴' : type === 'HACK' || type === 'XXX' ? '🟡' : '🔵';
      lines.push(`    ${severity} ${type}: ${count}`);
    }
  }
  lines.push('');

  // Summary by severity
  lines.push('  ── By Severity ──');
  for (const [severity, count] of Object.entries(stats.bySeverity)) {
    if (count > 0) {
      const icon = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '🔵';
      lines.push(`    ${icon} ${severity}: ${count}`);
    }
  }
  lines.push('');

  // Files with most annotations
  if (stats.filesWithMost.length > 0) {
    lines.push('  ── Top Files ──');
    for (const f of stats.filesWithMost.slice(0, 10)) {
      lines.push(`    ${f.file}: ${f.count} annotations`);
    }
    lines.push('');
  }

  // By author
  if (Object.keys(stats.byAuthor).length > 0) {
    lines.push('  ── By Author ──');
    for (const [author, count] of Object.entries(stats.byAuthor).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
      lines.push(`    ${author}: ${count}`);
    }
    lines.push('');
  }

  // Average age
  if (stats.averageAgeDays !== undefined) {
    lines.push(`  Average age: ${stats.averageAgeDays.toFixed(1)} days`);
    if (stats.oldestAnnotation) {
      lines.push(`  Oldest:      ${stats.oldestAnnotation.ageDays} days — ${stats.oldestAnnotation.file}:${stats.oldestAnnotation.line}`);
    }
    lines.push('');
  }

  // All annotations
  lines.push('  ── All Annotations ──');
  lines.push('');
  for (const ann of annotations) {
    const icon = ann.severity === 'critical' ? '🔴' : ann.severity === 'warning' ? '🟡' : '🔵';
    const age = ann.ageDays !== undefined ? ` [${ann.ageDays}d]` : '';
    const author = ann.author ? ` (${ann.author})` : '';
    lines.push(`  ${icon} [${ann.type}]${age} ${ann.file}:${ann.line}`);
    if (ann.text) {
      lines.push(`     ${ann.text}`);
    }
    if (author) {
      lines.push(`     → ${author}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate a JSON report.
 */
export function generateJsonReport(result: ScanResult): string {
  return JSON.stringify({
    metadata: {
      scanTimeMs: result.scanTimeMs,
      totalFiles: result.stats.totalFiles,
      totalAnnotations: result.stats.totalAnnotations,
      scannedAt: new Date().toISOString(),
    },
    stats: result.stats,
    annotations: result.annotations.map((a) => ({
      type: a.type,
      text: a.text,
      file: a.file,
      line: a.line,
      column: a.column,
      severity: a.severity,
      author: a.author || null,
      ageDays: a.ageDays ?? null,
      date: a.date || null,
    })),
  }, null, 2);
}

/**
 * Generate a Markdown report.
 */
export function generateMarkdownReport(result: ScanResult): string {
  const { annotations, stats } = result;
  const lines: string[] = [];

  lines.push('# TodoScope Report');
  lines.push('');
  lines.push(`- **Files scanned**: ${stats.totalFiles}`);
  lines.push(`- **Total annotations**: ${stats.totalAnnotations}`);
  if (stats.averageAgeDays !== undefined) {
    lines.push(`- **Average age**: ${stats.averageAgeDays.toFixed(1)} days`);
  }
  lines.push('');

  // Summary table
  lines.push('## Summary by Type');
  lines.push('');
  lines.push('| Type | Count | Severity |');
  lines.push('|------|-------|----------|');
  for (const [type, count] of Object.entries(stats.byType)) {
    if (count > 0) {
      const severity = type === 'FIXME' ? 'Critical' : type === 'HACK' || type === 'XXX' ? 'Warning' : 'Info';
      lines.push(`| ${type} | ${count} | ${severity} |`);
    }
  }
  lines.push('');

  // Files with most annotations
  if (stats.filesWithMost.length > 0) {
    lines.push('## Files with Most Annotations');
    lines.push('');
    lines.push('| File | Count |');
    lines.push('|------|-------|');
    for (const f of stats.filesWithMost.slice(0, 15)) {
      lines.push(`| ${f.file} | ${f.count} |`);
    }
    lines.push('');
  }

  // Author breakdown
  if (Object.keys(stats.byAuthor).length > 0) {
    lines.push('## By Author');
    lines.push('');
    lines.push('| Author | Count |');
    lines.push('|--------|-------|');
    for (const [author, count] of Object.entries(stats.byAuthor).sort((a, b) => b[1] - a[1])) {
      lines.push(`| ${author} | ${count} |`);
    }
    lines.push('');
  }

  // All annotations
  lines.push('## All Annotations');
  lines.push('');
  lines.push('| # | Type | Severity | Age | File | Line | Text | Author |');
  lines.push('|---|------|----------|-----|------|------|------|--------|');
  annotations.forEach((ann, i) => {
    const age = ann.ageDays !== undefined ? `${ann.ageDays}d` : '-';
    const author = ann.author || '-';
    const text = ann.text.replace(/\|/g, '\\|');
    lines.push(`| ${i + 1} | ${ann.type} | ${ann.severity} | ${age} | ${ann.file} | ${ann.line} | ${text} | ${author} |`);
  });

  return lines.join('\n');
}