# TodoScope

[![CI](https://github.com/EdgarOrtegaRamirez/todoscope/actions/workflows/ci.yml/badge.svg)](https://github.com/EdgarOrtegaRamirez/todoscope/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/todoscope)](https://www.npmjs.com/package/todoscope)

**Scan, track, and manage TODO/FIXME/HACK/XXX code annotations across your codebase.**

Every codebase has technical debt buried in TODO and FIXME comments. TodoScope is a CLI tool that finds them all, tracks them over time, identifies who wrote them, and helps you prioritize what to fix first.

## Features

- 🔍 **Scan** — Find TODO, FIXME, HACK, XXX, NOTE, OPTIMIZE, and REVIEW comments in your codebase
- 🎯 **Filter by type** — Focus on just FIXMEs, or exclude NOTE annotations
- 👤 **Git blame integration** — See who wrote each annotation and how long ago
- 📊 **Multiple output formats** — Text (terminal), JSON (CI/CD), Markdown (reports)
- 🔧 **Flexible filtering** — Filter by age, author, or annotation type
- 🚦 **CI/CD ready** — JSON output for automated pipelines
- 📁 **Smart defaults** — Automatically excludes binary files, node_modules, build artifacts

## Installation

```bash
npm install -g todoscope
```

Or run directly with npx:

```bash
npx todoscope scan .
```

## Quick Start

```bash
# Scan the current directory
todoscope scan .

# Scan with git blame info (default when in a git repo)
todoscope scan .

# Scan and output as JSON
todoscope scan . --format json

# Scan and save report to a file
todoscope scan . --format markdown --output TODO-report.md

# Create a .todosignore file
todoscope init
```

## Usage

```
Usage: todoscope [options] [command]

Commands:
  scan [options] [directory]  Scan a directory for code annotations
  init                        Create a .todosignore file with sensible defaults

Options:
  -V, --version               output the version number
  -h, --help                  display help for command
```

### Scan Options

| Option | Description |
|--------|-------------|
| `-i, --include <patterns...>` | Glob patterns to include (default: common source file types) |
| `-e, --exclude <patterns...>` | Glob patterns to exclude (default: node_modules, .git, dist, build, etc.) |
| `--no-git-blame` | Disable git blame integration |
| `-t, --types <types...>` | Annotation types to scan for (default: all) |
| `--min-age <days>` | Minimum age in days (requires git) |
| `--max-age <days>` | Maximum age in days (requires git) |
| `-a, --author <pattern>` | Filter by author (regex pattern, requires git) |
| `-f, --format <format>` | Output format: `text`, `json`, `markdown` (default: `text`) |
| `-q, --quiet` | Suppress non-essential output |
| `-o, --output <file>` | Write output to a file |

### Examples

```bash
# Find all FIXMEs (critical issues)
todoscope scan . --types FIXME

# Find old TODOs (older than 90 days)
todoscope scan . --types TODO --min-age 90

# Find annotations by a specific author
todoscope scan . --author "alice"

# Find HACKs and FIXMEs in src/ directory only
todoscope scan ./src --types HACK FIXME

# Output as JSON for CI/CD
todoscope scan . --format json --output todo-report.json

# Exclude additional directories
todoscope scan . --exclude "vendor" "generated"
```

## Annotation Types

| Type | Severity | Description |
|------|----------|-------------|
| `TODO` | 🔵 Info | Something that needs to be done |
| `FIXME` | 🔴 Critical | A known bug or issue that needs fixing |
| `HACK` | 🟡 Warning | A workaround or temporary solution |
| `XXX` | 🟡 Warning | Dangerous or problematic code |
| `NOTE` | 🔵 Info | Important note for developers |
| `OPTIMIZE` | 🔵 Info | Code that could be optimized |
| `REVIEW` | 🟡 Warning | Code that needs review |

## Output Formats

### Text (default)
```
╔══════════════════════════════════════════╗
║           TodoScope Report              ║
╚══════════════════════════════════════════╝

  Scanned: 127 files in 450ms
  Found:   23 annotations
```

### JSON
```json
{
  "metadata": {
    "totalFiles": 127,
    "totalAnnotations": 23,
    "scannedAt": "2026-07-13T03:00:00Z"
  },
  "annotations": [
    {
      "type": "FIXME",
      "text": "race condition in shutdown",
      "file": "src/server.ts",
      "line": 128,
      "severity": "critical",
      "author": "bob",
      "ageDays": 114
    }
  ]
}
```

### Markdown
Generates a full Markdown report with tables, summaries, and all annotations.

## Configuration

Create a `.todosignore` file in your project root to exclude files and directories:

```
# .todosignore
vendor
generated
*.min.js
```

Or use `todoscope init` to generate a default `.todosignore` file.

## Integration with CI/CD

```yaml
# .github/workflows/todo-check.yml
name: TODO Check
on: [pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install -g todoscope
      - run: todoscope scan . --format json --output todo-report.json
      - uses: actions/upload-artifact@v4
        with:
          name: todo-report
          path: todo-report.json
```

## How It Works

TodoScope uses language-aware comment detection to find annotation markers (TODO, FIXME, HACK, etc.) in source code comments. It supports the most common comment syntaxes:

- `//` — C-style line comments (JavaScript, TypeScript, Go, Rust, C, C++, Java, etc.)
- `#` — Shell-style line comments (Python, Ruby, Shell, YAML, etc.)
- `--` — SQL-style line comments (SQL, Lua, etc.)
- `/* */` — C-style block comments
- `<!-- -->` — HTML-style comments

When run inside a git repository, TodoScope uses `git blame` to determine the author and age of each annotation, enabling you to track who introduced technical debt and how long it's been there.

## License

MIT