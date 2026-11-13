# Write and create an English PR

## Establish the scope

- Read applicable `AGENTS.md` files and repository PR templates and contribution guidelines. Prefer the repository template; use the format below when none exists.
- Check the repository, current branch, remotes, and working tree. Determine the base from the user's instruction, an existing PR, or the repository default branch, in that order. Do not assume `main`. Resolve an ambiguous target remote before creating the PR.
- Read all commits and the diff from the merge-base of base and head. Do not summarize only the latest commit. Report uncommitted changes separately because they are excluded from the PR; do not commit them automatically.
- Check for an existing PR for the same head and base to avoid duplicates. Report its URL and state; update it only when the user requests an update.

## Title and body

Write a concise English title describing the purpose or observable result. Follow repository title conventions when present. Preserve code identifiers and commands as written.

Describe the final diff for a reviewer who has not seen the conversation. Lead with the problem and resulting behavior, using a concrete before/after example when useful. Include conversational history or abandoned approaches only when they explain a relevant tradeoff.

```markdown
## Changes

<The problem solved and resulting behavior, with detail proportional to the change>

## Validation

- <Commands actually run and their results>
- <Checks not run and why, when applicable>
```

Add linked issues, compatibility impact, risks, or screenshots only when relevant and supported by evidence. Use issue-closing keywords only when the relationship is verified and closure is intended. Never infer passing checks or report unexecuted checks as passed. Avoid unnecessary sections for small changes.

## Execution scope

- For a writing-only request, return the title and body without remote mutations. A request to create a PR authorizes creation; do not add a ceremonial approval step.
- Prefer available GitHub connector tools. Use authenticated `gh` when the required capability is unavailable. Verify the final repository, base, head, and content before publishing.
- A normal push of the current branch needed to create the requested PR is within scope when the remote and target branch are clear. Do not force-push, rewrite history, make unsolicited commits, merge, or assign reviewers without a separate request.
- Honor requests for a draft PR. Do not impose a fixed draft setting regardless of readiness or user preference.
- With the CLI, write multiline content to a temporary UTF-8 file and pass it through `gh pr create --body-file`. Do not allow special characters in titles or bodies to become shell code.
- If creation has an uncertain outcome, look up the PR for that head before deciding whether to retry. On authentication or permission failure, report the cause and prepared title and body instead of repeatedly attempting creation.
- After creation, verify and report the URL, title, base, head, and draft status. Include relevant validation results and excluded scope such as uncommitted changes.
