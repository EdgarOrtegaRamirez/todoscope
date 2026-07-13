# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

TodoScope scans codebases for TODO/FIXME/HACK/XXX annotations. It performs all analysis locally and does not send any data over the network.

## Security Features

- **No network requests**: All scanning and analysis is performed locally
- **No dependencies with known vulnerabilities**: All dependencies are pinned to specific versions
- **Input validation**: File paths and glob patterns are validated before use
- **Safe file I/O**: Binary file detection prevents reading non-text files
- **Git blame isolation**: Git commands are scoped to the specified directory

## Best Practices

1. Always review scanned output before sharing reports
2. Use `.todosignore` to exclude sensitive directories
3. Run `todoscope` in CI to catch newly introduced annotations before merge
4. Pin `todoscope` version in CI workflows