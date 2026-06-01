# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, report them responsibly by emailing the maintainers or using GitHub's private vulnerability reporting:

1. Go to the **Security** tab of this repository
2. Click **"Report a vulnerability"**
3. Fill in the structured form

### What to Include

Please provide as much detail as possible:

- **Type of vulnerability** (e.g., XSS, CSRF, Auth bypass, Injection, Information disclosure)
- **Severity** (Critical / High / Medium / Low — use CVSS if possible)
- **Affected component** (file path, endpoint, or feature name)
- **Steps to reproduce** (detailed, reproducible steps)
- **Proof of concept** (code, screenshots, or video)
- **Impact** (what an attacker could do if this is exploited)
- **Suggested fix** (optional but appreciated)

### Severity Definitions

| Severity | Description |
|----------|-------------|
| **Critical** | Remote code execution, full auth bypass, mass data exfiltration |
| **High** | Privilege escalation, significant data exposure, CSRF on critical actions |
| **Medium** | Limited data exposure, stored XSS, missing rate limiting |
| **Low** | Information disclosure, minor logic flaws |

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Fix timeline**: Depends on severity (Critical: 24–72h, High: 1 week, Medium/Low: next release)

## Scope

In scope:
- NexaSphere website frontend
- Admin dashboard
- Backend API (Express.js)
- Authentication and session management
- File upload endpoints
- Database query logic

Out of scope:
- Third-party services (Supabase, Vercel, Render)
- Social engineering attacks
- DoS via overwhelming legitimate traffic

## Bug Bounty

This is an open-source community project and does not currently offer monetary bug bounties.
However, security contributors will be credited in the release notes and CONTRIBUTORS file.

## Credits

We thank the security researchers who responsibly disclose vulnerabilities to us.
