/**
 * Annotation parser — extracts TODO/FIXME/HACK/XXX/etc. comments from source code.
 */

const SEVERITY_MAP: Record<string, 'info' | 'warning' | 'critical'> = {
  TODO: 'info',
  FIXME: 'critical',
  HACK: 'warning',
  XXX: 'warning',
  NOTE: 'info',
  OPTIMIZE: 'info',
  REVIEW: 'warning',
};

/**
 * Parse annotations from a single file's content.
 */
export function parseAnnotations(
  content: string,
  filePath: string
): Array<{
  type: string;
  text: string;
  file: string;
  line: number;
  column: number;
  lineContent: string;
  severity: 'info' | 'warning' | 'critical';
}> {
  const results: Array<{
    type: string;
    text: string;
    file: string;
    line: number;
    column: number;
    lineContent: string;
    severity: 'info' | 'warning' | 'critical';
  }> = [];

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineContent = lines[i];
    // Match annotation patterns in comments
    const typeMatch = lineContent.match(
      /(?:\/\/|#|--|%|;\s*|\/\*|\*|<!--)\s*(TODO|FIXME|HACK|XXX|NOTE|OPTIMIZE|REVIEW)\s*[:;]?\s*(.*?)(?:\*\/|-->)?$/i
    );

    if (typeMatch) {
      const rawType = typeMatch[1].toUpperCase();
      const text = typeMatch[2]?.trim() || '';
      const column = (typeMatch.index || 0) + 1;

      results.push({
        type: rawType,
        text,
        file: filePath,
        line: i + 1,
        column,
        lineContent: lineContent.trimEnd(),
        severity: SEVERITY_MAP[rawType] || 'info',
      });
    }
  }

  return results;
}