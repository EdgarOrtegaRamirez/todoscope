/**
 * Core type definitions for TodoScope.
 */

/** Categories of code annotations that TodoScope scans for */
export type AnnotationType = 'TODO' | 'FIXME' | 'HACK' | 'XXX' | 'NOTE' | 'OPTIMIZE' | 'REVIEW';

/** Severity level for annotation types */
export type Severity = 'info' | 'warning' | 'critical';

/** A single annotation found in a source file */
export interface Annotation {
  /** The annotation type (TODO, FIXME, etc.) */
  type: AnnotationType;
  /** The text of the annotation (after the type marker) */
  text: string;
  /** The file path relative to the scan root */
  file: string;
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** The full line content */
  lineContent: string;
  /** Severity based on type */
  severity: Severity;
  /** Git author who last touched this line (if available) */
  author?: string;
  /** Git commit date of the last modification to this line (ISO string) */
  date?: string;
  /** Age in days since the line was last modified */
  ageDays?: number;
  /** Git commit hash of the last modification */
  commitHash?: string;
}

/** Scan options */
export interface ScanOptions {
  /** Directory to scan (default: cwd) */
  directory?: string;
  /** Glob patterns to include */
  include?: string[];
  /** Glob patterns to exclude */
  exclude?: string[];
  /** Whether to include git blame information */
  gitBlame?: boolean;
  /** Annotation types to scan for */
  types?: AnnotationType[];
  /** Minimum age in days to filter by */
  minAge?: number;
  /** Maximum age in days to filter by */
  maxAge?: number;
  /** Filter by author (regex pattern) */
  author?: string;
  /** Enable quiet mode */
  quiet?: boolean;
  /** Output format: text, json, markdown */
  format?: 'text' | 'json' | 'markdown';
}

/** Aggregated statistics */
export interface ScanStats {
  totalFiles: number;
  totalAnnotations: number;
  byType: Record<AnnotationType, number>;
  bySeverity: Record<Severity, number>;
  byAuthor: Record<string, number>;
  oldestAnnotation?: Annotation;
  newestAnnotation?: Annotation;
  averageAgeDays?: number;
  filesWithMost: { file: string; count: number }[];
}

/** Scan result */
export interface ScanResult {
  annotations: Annotation[];
  stats: ScanStats;
  options: ScanOptions;
  scanTimeMs: number;
}