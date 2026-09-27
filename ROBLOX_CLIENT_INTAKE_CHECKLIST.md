## Roblox Client Intake Checklist

Use this when someone from Discord wants help fixing an existing Roblox game.

## What to ask for

Send this message:

```text
Send me the current project source, preferably as a Git repo or Rojo project. If you only have Studio files, send the latest .rbxlx or .rbxm. Also send:

- what system is broken
- exact repro steps
- what the correct behavior should be
- any modules/assets/plugins the game depends on
- whether you want a quick patch or a full cleanup/refactor
```

## Best file formats

Best to worst:

1. Git repo with source
2. Rojo project
3. `.rbxlx`
4. `.rbxm`
5. `.rbxl`

## Questions to ask before starting

- What is the bug or broken system?
- How do I reproduce it exactly?
- What happens right now?
- What should happen instead?
- Is this live already or still in development?
- Are there deadlines?
- Are there paid assets, private modules, or plugins involved?
- Are there DataStore, badge, gamepass, dev product, or third-party API dependencies?
- Do you want the smallest safe fix, or do you want the system cleaned up properly?

## What to request if the project is messy

- latest exported place file
- all linked models/modules
- plugin list
- screenshots or video of the bug
- console errors
- output logs
- the exact place/version they want edited

## What makes automation easy

- source files are included
- Rojo project exists
- clear repro steps
- one or two target systems at a time
- dependencies are provided
- acceptance criteria are written down

## Red flags

- only says "fix everything"
- no repro steps
- no source, only a binary file
- depends on private assets they cannot share
- game breaks only on live servers with no logs
- wants a huge rewrite for a tiny budget

## Good workflow for each paid job

1. Create a fresh Git repo for that client job.
2. Save the original files untouched.
3. Import the source or place file.
4. Document the bug and expected behavior.
5. Reproduce the issue.
6. Fix one system at a time.
7. Test after each fix.
8. Deliver either a patch, source files, or updated place file.

## Delivery options

- patch against source repo
- updated Rojo project
- updated `.rbxlx`
- short changelog
- optional video showing the fix working

## Internal note for Codex workflow

If the client gives a Rojo project or source files, Codex can help much more reliably with:

- reading the codebase
- patching systems
- refactoring modules
- adding tests and linting
- generating changelogs
- tracking fixes per client repo

If the client only gives a raw Studio file, work is still possible, but diffs, automation, and repeatability are weaker.
