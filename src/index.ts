/**
 * Main entry point — scans directories for TODO/FIXME/HACK/XXX comments.
 */

import * as path from 'path';
import { Annotation, AnnotationType, ScanOptions, ScanResult, ScanStats, Severity } from './types';
import { resolveFiles, readFileContent } from './scanner';
import { parseAnnotations } from './parser';
import { getBlameInfo, isGitRepo } from './git';
import { generateTextReport, generateJsonReport, generateMarkdownReport } from './reporter';

/**
 * Scan a directory for code annotations.
 */
export async function scan(options: ScanOptions): Promise<ScanResult> {
  const startTime = Date.now();
  const directory = options.directory || process.cwd();
  const enableGitBlame = options.gitBlame !== false && isGitRepo(directory);
  const typesFilter = options.types || ['TODO', 'FIXME', 'HACK', 'XXX', 'NOTE', 'OPTIMIZE', 'REVIEW'];

  // Resolve files
  const filePaths = await resolveFiles(directory, options.include, options.exclude);

  const annotations: Annotation[] = [];

  // Scan each file
  for (const filePath of filePaths) {
    const content = readFileContent(filePath);
    if (content === null) {
      continue;
    }

    const parsed = parseAnnotations(content, filePath);

    for (const raw of parsed) {
      // Filter by type
      if (!typesFilter.includes(raw.type as AnnotationType)) {
        continue;
      }

      const annotation: Annotation = {
        type: raw.type as AnnotationType,
        text: raw.text,
        file: path.relative(directory, raw.file),
        line: raw.line,
        column: raw.column,
        lineContent: raw.lineContent,
        severity: raw.severity as Severity,
      };

      // Get git blame info if available
      if (enableGitBlame) {
        const blameInfo = getBlameInfo(directory, raw.file, raw.line);
        if (blameInfo) {
          annotation.author = blameInfo.author;
          annotation.date = blameInfo.date;
          annotation.ageDays = blameInfo.ageDays;
          annotation.commitHash = blameInfo.commitHash;
        }
      }

      // Filter by age
      if (options.minAge !== undefined && (annotation.ageDays === undefined || annotation.ageDays < options.minAge)) {
        continue;
      }
      if (options.maxAge !== undefined && (annotation.ageDays === undefined || annotation.ageDays > options.maxAge)) {
        continue;
      }

      // Filter by author
      if (options.author && annotation.author) {
        try {
          const authorRegex = new RegExp(options.author, 'i');
          if (!authorRegex.test(annotation.author)) {
            continue;
          }
        } catch {
          // Invalid regex, ignore filter
        }
      }

      annotations.push(annotation);
    }
  }

  // Compute statistics
  const stats = computeStats(annotations, filePaths.length);

  const endTime = Date.now();

  return {
    annotations,
    stats,
    options,
    scanTimeMs: endTime - startTime,
  };
}

/**
 * Compute aggregated statistics from annotations.
 */
function computeStats(annotations: Annotation[], totalFiles: number): ScanStats {
  const byType: Record<string, number> = {
    TODO: 0, FIXME: 0, HACK: 0, XXX: 0, NOTE: 0, OPTIMIZE: 0, REVIEW: 0,
  };
  const bySeverity: Record<string, number> = { info: 0, warning: 0, critical: 0 };
  const byAuthor: Record<string, number> = {};
  const fileCounts: Record<string, number> = {};

  let totalAge = 0;
  let ageCount = 0;
  let oldestAnnotation: Annotation | undefined;
  let newestAnnotation: Annotation | undefined;

  for (const ann of annotations) {
    // By type
    if (byType[ann.type] !== undefined) {
      byType[ann.type]++;
    }

    // By severity
    bySeverity[ann.severity]++;

    // By author
    if (ann.author) {
      byAuthor[ann.author] = (byAuthor[ann.author] || 0) + 1;
    }

    // File counts
    fileCounts[ann.file] = (fileCounts[ann.file] || 0) + 1;

    // Age tracking
    if (ann.ageDays !== undefined) {
      totalAge += ann.ageDays;
      ageCount++;

      if (!oldestAnnotation || (ann.ageDays > (oldestAnnotation.ageDays || 0))) {
        oldestAnnotation = ann;
      }
      if (!newestAnnotation || (ann.ageDays < (newestAnnotation.ageDays || Infinity))) {
        newestAnnotation = ann;
      }
    }
  }

  // Files sorted by annotation count
  const filesWithMost = Object.entries(fileCounts)
    .map(([file, count]) => ({ file, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalFiles,
    totalAnnotations: annotations.length,
    byType: byType as any,
    bySeverity: bySeverity as any,
    byAuthor: Object.fromEntries(
      Object.entries(byAuthor).sort((a, b) => b[1] - a[1])
    ),
    oldestAnnotation,
    newestAnnotation,
    averageAgeDays: ageCount > 0 ? totalAge / ageCount : undefined,
    filesWithMost,
  };
}

/**
 * Print the scan result in the specified format.
 */
export function printReport(result: ScanResult, format: string = 'text'): void {
  switch (format) {
    case 'json':
      console.log(generateJsonReport(result));
      break;
    case 'markdown':
      console.log(generateMarkdownReport(result));
      break;
    case 'text':
    default:
      console.log(generateTextReport(result));
      break;
  }
}

export { Annotation, AnnotationType, ScanOptions, ScanResult, ScanStats, Severity };
export { generateTextReport, generateJsonReport, generateMarkdownReport } from './reporter';