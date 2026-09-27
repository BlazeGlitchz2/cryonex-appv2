## Roblox Dev Setup for Codex

This Mac is now mostly ready for Roblox client work.

Installed and verified:

- `Codex CLI`
- `Rokit`
- `Rojo`
- `StyLua`
- `Selene`
- `Wally`
- `Lune`
- `Antigravity IDE.app`
- `Roblox.app` (player only, not Studio)

Current blocker:

- `Roblox Studio` is not installed yet, so the built-in Studio MCP server is not available on disk.
- The Rojo Studio plugin also cannot be installed until Studio exists locally.
- The Antigravity CLI symlink is currently broken, even though the app is installed.

## What changed

Use these helpers from this repo:

- [`scripts/bootstrap_roblox_job.sh`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/scripts/bootstrap_roblox_job.sh)
- [`scripts/setup_codex_roblox_mcp.sh`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/scripts/setup_codex_roblox_mcp.sh)

## Bootstrap a new client repo

Create a fresh Roblox job repo with standard Luau tooling:

```bash
./scripts/bootstrap_roblox_job.sh ~/Code/client-game-name
```

That script will:

- create the repo directory
- initialize Git if needed
- initialize Rokit if needed
- add `rojo`, `stylua`, `selene`, `wally`, and `lune`
- write a minimal `default.project.json`
- write `wally.toml`
- write `selene.toml`
- write `stylua.toml`
- write a Roblox-friendly `.gitignore`

## Finish the Studio side

As of May 26, 2026, Roblox documents the MCP server as built into Roblox Studio, so we do not need a separate custom MCP server if we use current Studio.

After you install Roblox Studio:

1. Open Studio.
2. Open `Assistant`.
3. Go to `...` > `Manage MCP Servers`.
4. Turn on `Enable Studio as MCP server`.
5. Run:

```bash
./scripts/setup_codex_roblox_mcp.sh
```

6. Restart Codex.

## Install the Rojo Studio plugin

After Studio is installed, run:

```bash
rojo plugin install
```

Then in Studio, confirm the plugin appears under the Plugins tab.

## Antigravity note

The Antigravity app is installed, but the shell launcher at `~/.antigravity/antigravity/bin/antigravity` points to a missing target. If you want, we can fix that next and wire Roblox Studio into Antigravity too.

## Why no custom MCP server

Roblox's current Creator Hub docs say Studio already ships the MCP server on macOS at:

```text
/Applications/RobloxStudio.app/Contents/MacOS/StudioMCP
```

That is the path the Codex helper script configures.
