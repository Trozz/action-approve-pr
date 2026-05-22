# Contributing

Thanks for helping improve approve-pr.

## How it's built

This is a composite GitHub Action defined entirely in `action.yml` as an inline
`actions/github-script`. There's no compile or bundle step, so editing
`action.yml` is the whole job.

## Before opening a PR

Run the same check CI runs on the embedded script:

```bash
node .github/scripts/check-embedded-script.js action.yml
```

The Validate workflow also runs actionlint on the workflows and checks that
`action.yml` keeps its required structure. Update the README whenever you change
inputs, outputs, or behavior.

## Commits and releases

Use [Conventional Commits](https://www.conventionalcommits.org/) for commits and
PR titles. The type sets the version bump:

- `fix:` -> patch
- `feat:` -> minor
- `feat!:` or a `BREAKING CHANGE:` footer -> major
- `chore:`, `docs:`, `refactor:`, `test:` -> no release

Releases are automated by release-please. Merging the maintained
"Release vX.Y.Z" PR tags the version, publishes the release, and moves the `v1`
major tag.

## Branching

Branch off `main` using `feature/<name>`, `bugfix/<name>`, or `hotfix/<name>`.
Don't commit directly to `main`.
