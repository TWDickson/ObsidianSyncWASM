# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 0.2.x   | :white_check_mark: | Active development |
| 0.1.x   | :x:                | Deprecated - please upgrade |
| < 0.1   | :x:                | Not supported |

**Note**: As this plugin is in early development (0.x versions), we recommend always using the latest release.

## Reporting a Vulnerability

**Security is taken seriously.** If you discover a security vulnerability, please help protect users by reporting it responsibly.

**Note**: This is an independently maintained project by a solo developer. All responses and fixes are provided on a best-effort basis.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. **DO** report privately:
   - Use GitHub's [Security Advisories](https://github.com/TWDickson/ObsidianSyncWASM/security/advisories/new) (private disclosure)

### What to Include

Please provide as much information as possible:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact (what could an attacker do?)
- Affected versions
- Suggested fix (if you have one)

### What to Expect

**Note**: This is an independently maintained project. Response times are best-effort.

- **Initial Response**: Typically within 3-5 business days
- **Status Updates**: As progress is made
- **Fix Timeline**:
  - Critical vulnerabilities: Prioritized for immediate attention
  - High severity: Addressed as soon as possible
  - Medium/Low severity: Addressed in next scheduled release

### If Accepted

1. We'll work with you to understand and validate the issue
2. We'll develop and test a fix
3. We'll coordinate a disclosure timeline with you
4. We'll credit you in the security advisory (unless you prefer to remain anonymous)
5. We'll release a patched version and publish a security advisory

### If Declined

If we determine the report is not a security vulnerability, we'll:
1. Explain our reasoning
2. Suggest alternative channels if appropriate (e.g., feature request, bug report)
3. Thank you for your contribution

## Security Best Practices for Users

### Installation
- Only install this plugin from the official Obsidian Community Plugins directory
- Verify the plugin ID matches: `obsidian-sync-wasm`
- Check for unexpected permission requests

### Updates
- Keep the plugin updated to the latest version
- Review release notes for security-related fixes
- Enable Obsidian's automatic update checks

### Data Privacy
- This plugin syncs vault data to **your self-hosted sync server**
- No data is sent to third-party services or cloud providers
- You maintain full control over your sync server and data
- No telemetry or analytics are collected
- All network communication happens only with your configured sync server

### Reporting Suspicious Behavior
If you notice unexpected behavior that might indicate a security issue:
- Network requests to destinations other than your configured sync server
- Unauthorized file access outside your vault
- Performance degradation or crashes
- Unusual permission requests

Please report it following the vulnerability reporting process above.

## Security Features

### Current Measures
- ✅ All dependencies monitored via Dependabot
- ✅ Signed commits required for all releases
- ✅ CI/CD security checks on all PRs
- ✅ Minimal GitHub Actions permissions (`contents: read`)
- ✅ CodeQL security scanning enabled
- ✅ Rust/WASM memory safety guarantees

### Future Enhancements
- [ ] Automated security scanning in CI
- [ ] Regular security audits
- [ ] Penetration testing for sync functionality

## Acknowledgments

We appreciate responsible security researchers and will acknowledge contributions in our security advisories (with permission).

---

**Last Updated**: 2025-10-19
**Contact**: Create a private [Security Advisory](https://github.com/TWDickson/ObsidianSyncWASM/security/advisories/new)
