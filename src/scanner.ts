/**
 * File scanner module — crawls directories and reads files using glob patterns.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

/** Default glob patterns to exclude */
const DEFAULT_EXCLUDE = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  'target/**',
  '.next/**',
  '.nuxt/**',
  'coverage/**',
  '__pycache__/**',
  '*.min.*',
  'vendor/**',
  '.venv/**',
  'env/**',
  '.env/**',
  '*.lock',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '*.svg',
  '*.png',
  '*.jpg',
  '*.jpeg',
  '*.gif',
  '*.ico',
  '*.woff',
  '*.woff2',
  '*.ttf',
  '*.eot',
  '*.pdf',
  '*.zip',
  '*.tar.gz',
  '*.gz',
  '*.o',
  '*.so',
  '*.dylib',
  '*.exe',
  '*.dll',
  '*.obj',
  '*.class',
  '*.pyc',
  '*.pyo',
];

/** Default glob patterns to include */
const DEFAULT_INCLUDE = [
  '**/*.{js,ts,jsx,tsx,py,rb,go,rs,java,kt,scala,swift,c,cpp,h,hpp,cs,php,pl,pm,sh,bash,zsh,fish,m,mm,erl,ex,exs,clj,cljs,cljc,fs,fsx,vue,svelte,astro,css,scss,sass,less,html,htm,xml,yaml,yml,json,tf,toml,cfg,conf,ini,env,dockerfile,makefile,cmake,gradle,sql,graphql,gql,r,rkt,scm,lisp,zig,elm,purs,dart,nim,crystal,coffee,pug,jade,styl,md,mkd,adoc,asciidoc,tex,bib,proto,prisma,sol,vy,cairo,mojo,luau,lua,tcl,ml,mli}',
  'Dockerfile',
  'Makefile',
  '**/Dockerfile',
  '**/*.env',
  '**/*.cfg',
  '**/*.conf',
  '**/*.ini',
];

/**
 * Resolve file paths by glob patterns, with defaults.
 */
export async function resolveFiles(
  directory: string,
  include?: string[],
  exclude?: string[]
): Promise<string[]> {
  const patterns = include && include.length > 0 ? include : DEFAULT_INCLUDE;
  const ignore = exclude && exclude.length > 0 ? exclude : DEFAULT_EXCLUDE;

  const files: string[] = [];
  for (const pattern of patterns) {
    // If the pattern doesn't contain a glob, convert it
    const fullPattern = pattern.includes('*') || pattern.includes('?') || pattern.includes('{')
      ? path.resolve(directory, pattern)
      : path.resolve(directory, pattern, '**/*');

    const matches = await glob(fullPattern, {
      ignore,
      nodir: true,
      dot: false,
      follow: false,
    });
    files.push(...matches);
  }

  // Deduplicate
  return [...new Set(files)].sort();
}

/**
 * Read the content of a file at the given path.
 * Returns null if the file can't be read (binary, permission, etc.).
 */
export function readFileContent(filePath: string): string | null {
  try {
    const stat = fs.statSync(filePath);
    // Skip files larger than 5MB
    if (stat.size > 5 * 1024 * 1024) {
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    // Check if it's likely binary (null bytes)
    if (buffer.includes(0)) {
      return null;
    }

    return buffer.toString('utf-8');
  } catch {
    return null;
  }
}

/**
 * Check if a file is likely source code based on extension.
 */
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.bmp', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.pdf', '.zip', '.tar', '.gz', '.bz2', '.7z', '.rar',
  '.o', '.so', '.dylib', '.exe', '.dll', '.obj', '.class',
  '.pyc', '.pyo', '.pyd',
  '.mp3', '.mp4', '.avi', '.mov', '.webm', '.mkv', '.flac',
  '.db', '.sqlite', '.sqlite3',
  '.ttf', '.otf',
]);

export function isSourceFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return !BINARY_EXTENSIONS.has(ext);
}