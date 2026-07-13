import { describe, it, expect } from 'vitest';

/**
 * Tests for the annotation parser.
 */

import { parseAnnotations } from '../src/parser';

describe('parseAnnotations', () => {
  it('should parse // TODO comments', () => {
    const content = '// TODO: implement this feature\nconst x = 1;';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('TODO');
    expect(results[0].text).toBe('implement this feature');
    expect(results[0].line).toBe(1);
  });

  it('should parse # FIXME comments', () => {
    const content = '# FIXME This is broken\nimport os';
    const results = parseAnnotations(content, 'test.py');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('FIXME');
    expect(results[0].text).toBe('This is broken');
  });

  it('should parse -- HACK comments', () => {
    const content = '-- HACK: workaround for bug\nSELECT * FROM users;';
    const results = parseAnnotations(content, 'test.sql');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('HACK');
  });

  it('should parse /* TODO */ comments', () => {
    const content = '/* TODO: add error handling */\nfunction foo() {}';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('TODO');
  });

  it('should parse multiple annotations on different lines', () => {
    const content = '// TODO: first\nconst a = 1;\n// FIXME: second\nconst b = 2;\n// HACK: third';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(3);
    expect(results.map(r => r.type)).toEqual(['TODO', 'FIXME', 'HACK']);
  });

  it('should return empty array for clean code', () => {
    const content = 'const x = 1;\nconst y = 2;\nconsole.log("hello");';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(0);
  });

  it('should handle NOTE annotations', () => {
    const content = '// NOTE: this is important\nfunction bar() {}';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('NOTE');
  });

  it('should handle XXX annotations', () => {
    const content = '// XXX: this is dangerous\n';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('XXX');
  });

  it('should handle OPTIMIZE annotations', () => {
    const content = '// OPTIMIZE: slow loop\n';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('OPTIMIZE');
  });

  it('should handle REVIEW annotations', () => {
    const content = '// REVIEW: check logic\n';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('REVIEW');
  });

  it('should handle annotations without colons', () => {
    const content = '// TODO implement this\n';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(1);
    expect(results[0].text).toBe('implement this');
  });

  it('should handle annotations with semicolons', () => {
    const content = '// TODO; implement this\n';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(1);
    expect(results[0].text).toBe('implement this');
  });

  it('should assign correct severity', () => {
    const content = '// TODO\n// FIXME\n// HACK\n// XXX\n// NOTE\n// OPTIMIZE\n// REVIEW';
    const results = parseAnnotations(content, 'test.ts');
    expect(results).toHaveLength(7);
    expect(results.find(r => r.type === 'TODO')?.severity).toBe('info');
    expect(results.find(r => r.type === 'FIXME')?.severity).toBe('critical');
    expect(results.find(r => r.type === 'HACK')?.severity).toBe('warning');
    expect(results.find(r => r.type === 'XXX')?.severity).toBe('warning');
    expect(results.find(r => r.type === 'NOTE')?.severity).toBe('info');
    expect(results.find(r => r.type === 'OPTIMIZE')?.severity).toBe('info');
    expect(results.find(r => r.type === 'REVIEW')?.severity).toBe('warning');
  });
});