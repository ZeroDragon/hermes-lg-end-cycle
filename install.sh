#!/usr/bin/env bash
set -euo pipefail

# hermes-lg-end-cycle — Installer
# Copies the plugin and patches the built-in completion sound to no-op.

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_SRC="$REPO_DIR/plugin.js"
PLUGIN_DEST="$HOME/.hermes/desktop-plugins/lg-end-cycle/plugin.js"

echo "▸ Installing plugin to $PLUGIN_DEST"
mkdir -p "$(dirname "$PLUGIN_DEST")"
cp "$PLUGIN_SRC" "$PLUGIN_DEST"
echo "  ✓ Plugin installed"

# ── Patch built-in completion sound ──────────────────────────────────────
# The function playCompletionSound is minified. We find it by searching for
# its unique pattern across all known Hermes Desktop bundle locations.

# Known bundle locations (in priority order)
BUNDLE_CANDIDATES=(
  # Dev build (npm run dev)
  "$HOME/.hermes/hermes-agent/apps/desktop/dist/assets/index-*.js"
  # Packaged (unpacked from asar)
  "$HOME/.hermes/hermes-agent/apps/desktop/release/mac-arm64/Hermes.app/Contents/Resources/app.asar.unpacked/dist/assets/index-*.js"
  # System install
  "/Applications/Hermes.app/Contents/Resources/app.asar.unpacked/dist/assets/index-*.js"
  # Any HERMES_DESKTOP_WEB_DIST override
)

PATCHED=0
for pattern in "${BUNDLE_CANDIDATES[@]}"; do
  for bundle in $pattern; do
    [ -f "$bundle" ] || continue

    echo "  ? Checking $bundle"

    # The playCompletionSound function. In the minified bundle it looks like:
    #   function <shortName>(e){if(<hapticsAtom>.get())return;let t=()=><playFn>(<variantAtom>.get());...
    #
    # We patch it to a no-op: function <shortName>(e){}
    #
    # Strategy: find the function that starts with "function " and contains
    # "sound:" inside a template literal right after a ".then(" — the unique
    # signature of the ambient-cue dedupe path.

    # Try to find the exact pattern from the known build
    # The mangled name varies per build, so we search structurally.
    PATCH=$(perl -e '
      local $/;
      my $s = <>;
      # Match: function <name>(<param>){if(<atom>.get())return;let <var>=()=><play>(<variant>.get());if(!<param>)return <var>();<ambient>(`sound:...)
      # and replace with: function <name>(<param>){}
      if ($s =~ /(function \w+)\((\w)\)\{if\(\w+\.get\(\)\)return;let \w+=\(\)=>\w+\(\w+\.get\(\)\);if\(!\2\)return \w+\(\);\w+\(`sound:\$\{\w+\}`\)\.then\(\w+=>\w+&&\w+\(\)\)\}/) {
        my $full = $1 . "(" . $2 . "){}";
        my $orig = $&;
        $s =~ s/\Q$orig/$full/;
        print $s;
        exit 0;
      }
      exit 1;
    ' "$bundle") && rc=$? || rc=$?

    if [ "$rc" = "0" ] && [ -n "$PATCH" ]; then
      echo "$PATCH" > "$bundle"
      echo "  ✓ Patched $bundle"
      PATCHED=1
    fi
  done
done

if [ "$PATCHED" = "0" ]; then
  echo "  ⚠ Could not locate Hermes Desktop bundle to patch."
  echo "    The plugin will still run, but you may hear TWO sounds"
  echo "    (the built-in chime + your custom MP3)."
  echo "    To fix: after installing, manually open the desktop app's"
  echo "    dist and search for 'playCompletionSound' to identify the"
  echo "    minified function name, then patch it to a no-op."
fi

echo ""
echo "✔ Done. Reload your Hermes Desktop plugins:"
echo "    ⌘K → type 'Reload desktop plugins'"
echo "  Or restart Hermes Desktop entirely."
