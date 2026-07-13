#!/usr/bin/env node

/**
 * TodoScope CLI — scan codebases for TODO/FIXME/HACK/XXX comments.
 */

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { scan } from './index';
import { generateTextReport, generateJsonReport, generateMarkdownReport } from './reporter';

const program = new Command();

program
  .name('todoscope')
  .description('Scan codebases for TODO/FIXME/HACK/XXX annotations')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan a directory for code annotations')
  .argument('[directory]', 'Directory to scan (default: current directory)', process.cwd())
  .option('-i, --include <patterns...>', 'Glob patterns to include')
  .option('-e, --exclude <patterns...>', 'Glob patterns to exclude')
  .option('--no-git-blame', 'Disable git blame integration')
  .option('-t, --types <types...>', 'Annotation types to scan for (default: all)')
  .option('--min-age <days>', 'Minimum age in days (requires git)', parseInt)
  .option('--max-age <days>', 'Maximum age in days (requires git)', parseInt)
  .option('-a, --author <pattern>', 'Filter by author (regex pattern, requires git)')
  .option('-f, --format <format>', 'Output format: text, json, markdown', 'text')
  .option('-q, --quiet', 'Suppress non-essential output')
  .option('-o, --output <file>', 'Write output to a file')
  .action(async (directory, options) => {
    try {
      if (!options.quiet) {
        console.error(`TodoScope: Scanning ${directory}...`);
      }

      const result = await scan({
        directory: path.resolve(directory),
        include: options.include,
        exclude: options.exclude,
        gitBlame: options.gitBlame,
        types: options.types as any,
        minAge: options.minAge,
        maxAge: options.maxAge,
        author: options.author,
        quiet: options.quiet,
        format: options.format as any,
      });

      let output: string;
      switch (options.format) {
        case 'json':
          output = generateJsonReport(result);
          break;
        case 'markdown':
          output = generateMarkdownReport(result);
          break;
        case 'text':
        default:
          output = generateTextReport(result);
          break;
      }

      if (options.output) {
        fs.writeFileSync(options.output, output, 'utf-8');
        if (!options.quiet) {
          console.error(`TodoScope: Report written to ${options.output}`);
        }
      } else {
        console.log(output);
      }

      // Exit with error code if annotations found
      if (result.stats.totalAnnotations > 0) {
        process.exitCode = 0; // Info only, not an error
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Create a .todosignore file with sensible defaults')
  .action(() => {
    const content = `# .todosignore — patterns to exclude from todoscope scans
node_modules
.git
dist
build
target
.next
.nuxt
coverage
__pycache__
*.min.*
vendor
.venv
env
*.lock
package-lock.json
yarn.lock
pnpm-lock.yaml
*.svg
*.png
*.jpg
*.jpeg
*.gif
*.ico
*.pdf
*.zip
*.gz
*.tar.gz
`;
    const targetPath = path.resolve(process.cwd(), '.todosignore');
    if (fs.existsSync(targetPath)) {
      console.error('.todosignore already exists');
      process.exit(1);
    }
    fs.writeFileSync(targetPath, content, 'utf-8');
    console.log(`Created ${targetPath}`);
  });

program.parse(process.argv);

// If no command, show help
if (process.argv.length < 3) {
  program.help();
}