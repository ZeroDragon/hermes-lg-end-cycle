#!/usr/bin/env node
/**
 * dist-patch.js — Patches the Hermes Desktop bundle to silence the built-in
 * synthesized completion chime.
 *
 * The Hermes Desktop app plays a Web Audio API synthesized chime at the end
 * of every agent turn.  This patch replaces the `playCompletionSound`
 * function with a no-op so only the plugin's custom MP3 plays.
 *
 * Usage:
 *   node dist-patch.js                          # auto-detect bundle
 *   node dist-patch.js /path/to/index-XXXX.js   # explicit path
 *
 * The patched function has this minified shape:
 *   function <name>(e){if(<atom>.get())return;let t=()=><fn>(<atom>.get());if(!e)return t();<ambient>(`sound:${e}`).then(e=>e&&t())}
 *
 * This is the only function in the bundle that uses a template literal with
 * `sound:` inside a .then() chain — structurally unique enough to match
 * across mangled-rename boundaries.
 */

const fs = require('fs')
const path = require('path')

// Known bundle globe patterns
const CANDIDATE_PATTERNS = [
  // Hermes repo dev build
  process.env.HOME + '/.hermes/hermes-agent/apps/desktop/dist/assets/index-*.js',
  // Packaged release (unpacked from asar)
  process.env.HOME + '/.hermes/hermes-agent/apps/desktop/release/mac-arm64/Hermes.app/Contents/Resources/app.asar.unpacked/dist/assets/index-*.js',
  // System / Applications install
  '/Applications/Hermes.app/Contents/Resources/app.asar.unpacked/dist/assets/index-*.js',
  // HERMES_DESKTOP_WEB_DIST override
  process.env.HERMES_DESKTOP_WEB_DIST ? process.env.HERMES_DESKTOP_WEB_DIST + '/assets/index-*.js' : null,
].filter(Boolean)

/**
 * Regex that matches the minified playCompletionSound function structurally.
 *
 * The function always:
 *  1. Starts with `function <name>(<param>)`
 *  2. Checks an atom with `.get()` and returns if truthy  (the hapticsMuted guard)
 *  3. Creates a thunk that calls a function with another atom's .get()
 *  4. Returns the thunk if no argument
 *  5. Otherwise calls an ambient-cue function with a `` sound:${e} `` template literal
 *     followed by `.then(e=>e&&t())`
 *
 * We match the OUTER function body from the `function` keyword through the
 * closing `}` — which for the simple thunk+ambient pattern is one level deep.
 */
const PLAY_COMPLETION_SOUND_RE =
  /function\s+\w+\s*\(\s*(\w)\s*\)\s*\{\s*if\s*\(\s*\w+\.get\(\s*\)\s*\)\s*return\s*;\s*let\s+\w+\s*=\s*\(\s*\)\s*=>\s*\w+\s*\(\s*\w+\.get\(\s*\)\s*\)\s*;\s*if\s*\(\s*!\s*\1\s*\)\s*return\s*\w+\(\s*\);\s*\w+\(`sound:\${?\1}?`\)\.then\(\w+=>\w+&&\w+\(\)\)\s*\}/s

function findAndPatch(content) {
  const match = content.match(PLAY_COMPLETION_SOUND_RE)
  if (!match) return null

  const [origFunc] = match

  // Extract the function signature to preserve it
  const sigMatch = origFunc.match(/^(function\s+\w+\s*\(\s*\w\s*\))/)
  if (!sigMatch) return null

  const paramName = origFunc.match(/function\s+\w+\s*\(\s*(\w)\s*\)/)[1]
  const noopPatch = `function ${sigMatch[0].match(/function\s+(\w+)/)[1]}(${paramName}){}`

  return { origFunc, noopPatch }
}

function patchBundle(bundlePath) {
  const original = fs.readFileSync(bundlePath, 'utf-8')
  const result = findAndPatch(original)

  if (!result) {
    console.error(`  ✗ No match in ${path.basename(bundlePath)}`)
    return false
  }

  const patched = original.replace(result.origFunc, result.noopPatch)

  if (original === patched) {
    console.error(`  ✗ Patch was a no-op in ${path.basename(bundlePath)}`)
    return false
  }

  fs.writeFileSync(bundlePath, patched, 'utf-8')
  console.log(`  ✓ Patched ${path.basename(bundlePath)}`)
  return true
}

async function main() {
  const explicitPath = process.argv[2]

  if (explicitPath) {
    if (!fs.existsSync(explicitPath)) {
      console.error(`File not found: ${explicitPath}`)
      process.exit(1)
    }
    const ok = patchBundle(explicitPath)
    process.exit(ok ? 0 : 1)
  }

  // Glob for candidates
  const { globSync } = require('fs') // Node 22+ has globSync, fallback
  let glob = null
  try {
    glob = require('glob')
  } catch {
    // simple fallback
  }

  const files = new Set()
  for (const pattern of CANDIDATE_PATTERNS) {
    if (pattern.includes('*')) {
      // Manual glob for node 18 compat
      const dir = pattern.substring(0, pattern.lastIndexOf('/'))
      const filePattern = new RegExp('^' + pattern.substring(pattern.lastIndexOf('/') + 1).replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
      try {
        const entries = fs.readdirSync(dir)
        for (const entry of entries) {
          if (filePattern.test(entry)) {
            files.add(path.join(dir, entry))
          }
        }
      } catch { /* try next */ }
    } else {
      if (fs.existsSync(pattern)) files.add(pattern)
    }
  }

  if (files.size === 0) {
    console.error(
      'No Hermes Desktop bundle found. Pass the path explicitly:\n' +
      '  node dist-patch.js /path/to/index-XXXX.js\n\n' +
      'Tried patterns:\n' +
      CANDIDATE_PATTERNS.map(p => `  ${p}`).join('\n')
    )
    process.exit(1)
  }

  let patched = 0
  for (const f of files) {
    if (patchBundle(f)) patched++
  }

  console.log(`\n✔ ${patched} file(s) patched. Reload or restart Hermes Desktop.`)
  process.exit(patched > 0 ? 0 : 1)
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
