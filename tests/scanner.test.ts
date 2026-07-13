import { describe, it, expect } from 'vitest';

/**
 * Tests for the scanner module.
 */

import { resolveFiles, readFileContent } from '../src/scanner';

describe('resolveFiles', () => {
  it('should find files in a directory', async () => {
    const files = await resolveFiles(__dirname, ['**/*.ts'], ['node_modules/**']);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.endsWith('.ts'))).toBe(true);
  });

  it('should exclude node_modules by default', async () => {
    const files = await resolveFiles(__dirname);
    const hasNodeModules = files.some(f => f.includes('node_modules'));
    expect(hasNodeModules).toBe(false);
  });
});

describe('readFileContent', () => {
  it('should read a text file', () => {
    const content = readFileContent(__filename);
    expect(content).not.toBeNull();
    expect(content!.length).toBeGreaterThan(0);
  });

  it('should return null for non-existent files', () => {
    const content = readFileContent('/nonexistent/file.ts');
    expect(content).toBeNull();
  });
});