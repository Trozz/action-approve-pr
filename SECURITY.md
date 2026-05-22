# Security Policy

## Reporting a vulnerability

Please report security issues privately, not through a public issue.

Use GitHub's [private vulnerability reporting](https://github.com/Trozz/action-approve-pr/security/advisories/new)
for this repository, or email git@leer.dev.

Include the affected version, a description of the issue, and reproduction
steps if you have them. Expect an initial response within a few days.

## Supported versions

Fixes land on the latest `v1` major tag. Older tags are not maintained.

## Token handling

When you use `org/slug` team approvers, the action reads team membership, which
needs a token with `read:org` scope. Provide a scoped PAT or a GitHub App
installation token, store it as a secret, and never hard-code tokens in
workflow files.
