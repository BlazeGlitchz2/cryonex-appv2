#!/usr/bin/env bash

set -euo pipefail

STUDIO_MCP="/Applications/RobloxStudio.app/Contents/MacOS/StudioMCP"
CODEX_CONFIG="$HOME/.codex/config.toml"
SERVER_BLOCK='[mcp_servers."Roblox_Studio"]
command = "/Applications/RobloxStudio.app/Contents/MacOS/StudioMCP"'

if [[ ! -x "$STUDIO_MCP" ]]; then
  echo "Roblox Studio MCP binary was not found at:"
  echo "  $STUDIO_MCP"
  echo
  echo "Install Roblox Studio first, then enable:"
  echo "  Assistant > ... > Manage MCP Servers > Enable Studio as MCP server"
  exit 1
fi

if [[ ! -f "$CODEX_CONFIG" ]]; then
  echo "Codex config was not found at $CODEX_CONFIG"
  exit 1
fi

if rg -n 'mcp_servers\."?Roblox_Studio"?|mcp_servers\.roblox_studio' "$CODEX_CONFIG" >/dev/null 2>&1; then
  echo "Roblox Studio MCP already appears to be configured in $CODEX_CONFIG"
  exit 0
fi

cp "$CODEX_CONFIG" "$CODEX_CONFIG.bak.$(date +%Y%m%d%H%M%S)"
printf '\n%s\n' "$SERVER_BLOCK" >> "$CODEX_CONFIG"

echo "Added Roblox Studio MCP server to $CODEX_CONFIG"
echo "Restart Codex after enabling the MCP server in Studio."
