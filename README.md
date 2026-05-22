# approve-pr

A GitHub composite action that gates a job on a human approval given as a
**reaction on a pull request comment**.

When it runs it posts (or reuses) an approval comment on the PR and polls its
reactions:

- the configured approve reaction (default `:+1:`) from a listed approver approves,
- the configured reject reaction (default `:-1:`) from a listed approver rejects (fails the job),
- reactions from anyone not in `approvers` are ignored,
- no reaction within `timeout-minutes` fails the job.

Approvers can be GitHub usernames or **org teams** (`org/slug`); a team is
shorthand for its members.

The approval is **bound to the PR head commit SHA**. Pushing a new commit posts
a fresh approval comment, so an approval never carries over to changed code. The
comment's status line records who approved which commit and when.

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `approvers` | yes | | Comma/whitespace separated approvers. Each entry is a GitHub username or an org team as `org/slug` (leading `@` optional). |
| `label` | no | (empty) | Identifier shown in the comment and used (with the SHA) to key it. Set distinct labels when running more than one gate on the same PR. |
| `message` | no | (empty) | Optional free text shown near the top of the approval comment. |
| `approve-reaction` | no | `+1` | Reaction that counts as approval (see allowed values below). |
| `reject-reaction` | no | `-1` | Reaction that counts as rejection. Must differ from `approve-reaction`. |
| `min-approvals` | no | `1` | Distinct approver approval reactions required. |
| `timeout-minutes` | no | `5` | Minutes to wait before failing. |
| `poll-seconds` | no | `30` | Polling interval. |
| `token` | no | `${{ github.token }}` | Token used to comment and read reactions. Org teams require `read:org` scope (see below). |

Allowed reaction values for `approve-reaction` / `reject-reaction`:
`+1`, `-1`, `laugh`, `confused`, `heart`, `hooray`, `rocket`, `eyes`.

## Outputs

| Output | Description |
|--------|-------------|
| `approved-by` | Comma separated logins that approved (empty if not approved). |

## Usage

Must run on a `pull_request` event. The job needs permission to comment:

```yaml
permissions:
  pull-requests: write
  issues: write
  contents: read

jobs:
  approve:
    runs-on: ubuntu-latest
    steps:
      - uses: trozz/action-approve-pr@v1
        with:
          label: terraform/envs/prod
          approvers: alice,bob
          min-approvals: 1
          timeout-minutes: 5
```

### Custom reactions and message

```yaml
- uses: trozz/action-approve-pr@v1
  with:
    label: deploy/prod
    approvers: alice,bob
    message: |
      Deploying **v2.4.0** to production.
      Please confirm the release notes before approving.
    approve-reaction: rocket
    reject-reaction: eyes
```

### Approving by team

Listing a team (`org/slug`) lets any of its members approve. Reading team
membership needs a token with `read:org` scope. The default `GITHUB_TOKEN`
doesn't have it, so you'll need a PAT or a GitHub App installation token.

Using a GitHub App token (recommended): mint it in a prior step with the
official action and pass it as `token`.

```yaml
- uses: actions/create-github-app-token@v1
  id: app-token
  with:
    app-id: ${{ vars.APP_ID }}
    private-key: ${{ secrets.APP_PRIVATE_KEY }}
    owner: ${{ github.repository_owner }}

- uses: trozz/action-approve-pr@v1
  with:
    label: deploy/prod
    approvers: my-org/platform, my-org/security, alice
    min-approvals: 2
    token: ${{ steps.app-token.outputs.token }}
```

A team is shorthand for its members. `min-approvals` counts distinct people
across everyone listed, named directly or pulled in via a team, so the same
person in two teams still counts once. The status line shows which team an
approver came from, like `Approved by @alice (my-org/platform)`.

## Notes

- If the job times out it fails; a reaction added afterwards does not resume the
  stopped run. Because the comment is keyed by SHA, **Re-run failed jobs** reuses
  the same comment, so an approve reaction added after the timeout is picked up on
  re-run without a new commit.
- Re-running the same commit reuses its approval comment (and any approval
  reaction already on it). A new commit always requires a fresh approval.
- Team membership is resolved once when the action starts. If a listed team
  cannot be read (missing `read:org` scope or the team does not exist), the
  action fails with a clear error rather than silently ignoring the team.
