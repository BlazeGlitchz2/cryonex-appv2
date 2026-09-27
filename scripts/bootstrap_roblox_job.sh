#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /absolute/or/relative/path-to-new-roblox-job"
  exit 1
fi

TARGET_DIR="$1"
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

for tool in git rokit; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Missing required tool: $tool"
    exit 1
  fi
done

if [[ ! -d .git ]]; then
  git init
fi

if [[ ! -f rokit.toml ]]; then
  rokit init
fi

ensure_tool() {
  local tool="$1"
  if ! rokit list | rg -F "$tool" >/dev/null 2>&1; then
    rokit add "$tool"
  fi
}

ensure_tool "rojo-rbx/rojo"
ensure_tool "JohnnyMorganz/StyLua"
ensure_tool "Kampfkarren/selene"
ensure_tool "UpliftGames/wally"
ensure_tool "lune-org/lune"

rokit install

if [[ ! -f default.project.json ]]; then
  cat > default.project.json <<'EOF'
{
  "name": "game",
  "tree": {
    "$className": "DataModel",
    "ReplicatedStorage": {
      "Shared": {
        "$path": "src/shared"
      }
    },
    "ServerScriptService": {
      "Server": {
        "$path": "src/server"
      }
    },
    "StarterPlayer": {
      "StarterPlayerScripts": {
        "Client": {
          "$path": "src/client"
        }
      }
    }
  }
}
EOF
fi

if [[ ! -f wally.toml ]]; then
  cat > wally.toml <<'EOF'
[package]
name = "client/game"
version = "0.1.0"
registry = "https://github.com/UpliftGames/wally-index"
realm = "shared"

[dependencies]
EOF
fi

if [[ ! -f selene.toml ]]; then
  cat > selene.toml <<'EOF'
std = "roblox"

[config]
empty_if = { comments_count = true }
EOF
fi

if [[ ! -f stylua.toml ]]; then
  cat > stylua.toml <<'EOF'
column_width = 100
line_endings = "Unix"
indent_type = "Spaces"
indent_width = 4
quote_style = "AutoPreferDouble"
call_parentheses = "Always"
EOF
fi

if [[ ! -f .gitignore ]]; then
  cat > .gitignore <<'EOF'
*.rbxl
*.rbxlx
*.rbxm
*.rbxmx

Packages/
ServerPackages/
package-lock.json
node_modules/

.DS_Store
.luaurc
sourcemap.json
EOF
fi

mkdir -p src/client src/server src/shared

echo "Roblox job repo is ready at: $TARGET_DIR"
echo "Next steps:"
echo "  cd \"$TARGET_DIR\""
echo "  rojo serve"
echo "  rojo build -o game.rbxlx"
