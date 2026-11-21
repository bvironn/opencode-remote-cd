# Design brief: `opencode-remote-cd`

## One-liner

A tiny OpenCode TUI plugin that makes `/cd` work when the client and the
OpenCode server live on different operating systems.

## TL;DR for the designer

We need a compact, credible open-source identity for a developer tool that fixes
a very specific, very annoying terminal bug: a Windows OpenCode client connected
to a Linux server turns `/root/projects` into `C:\root\projects`. The plugin
fixes navigation and adds a small interactive directory browser.

Design a terminal-native identity that feels like it belongs in the OpenCode
ecosystem without pretending to be official: a mark, a README hero, screenshot
and GIF directions, npm/social assets, and copy that explains the bug in one
line. The tone is technical, dry, and quietly funny about Windows paths.

## Product

- **Name:** `opencode-remote-cd`
- **Type:** community TUI plugin for OpenCode 2.x
- **License:** MIT
- **Status:** 0.1.0, tested against OpenCode 2.3.2
- **Repository:** `github.com/<owner>/opencode-remote-cd` (to be published)
- **Install:** copy two files into `~/.config/opencode/plugins/opencode-remote-cd/`
  or add the package to `~/.config/opencode/cli.json`

### What it is

A client-side plugin that overrides OpenCode's `session.cd` command and repairs
the directory experience when the TUI and server are on different machines:

1. `/cd <path>` resolves with POSIX rules on the server, not with the client's
   `path.resolve`.
2. `~` expands to the server user's home.
3. Directory completion lists the server's directories, including subfolders.
4. `Enter` in the completion accepts the suggestion, descends into a
   subdirectory, and reopens the next level.
5. A bare `/cd` opens a searchable directory picker with `..` and
   **Use this directory**.
6. Sessions move on the server; the home screen sets the location for the next
   session.

### What it is not

- Not an official OpenCode feature or plugin.
- Not a server-side change. It runs entirely in the TUI client.
- Not a replacement for OpenCode's project/session model. It only fixes `cd`.
- Not a general remote filesystem browser. It is scoped to changing the working
  directory.

### Why it exists

OpenCode's TUI is a client. The server owns the filesystem. When the two run on
different OSes, client-side path handling leaks the wrong semantics into the
server. The upstream issues are real and still open at the time of writing:

- `#47665` — positional directory resolved locally with `--server`.
- `#55171` — `/cd` tilde expansion uses the client home.
- `#59554` — `/cd` uses client home and completion on Windows → Linux.

This plugin is a practical bridge until the client understands server-side path
semantics natively.

## Audience

### Primary

Developers running OpenCode on a remote Linux box (VPS, home lab, Tailscale,
Docker) while using the TUI from a Windows laptop. They already know their way
around a terminal, SSH, and paths. They are mildly furious that `C:\root\projects`
exists.

### Secondary

- macOS client → Linux server users.
- WSL users whose OpenCode server lives in another distro or container.
- Anyone attaching the TUI to a headless `opencode serve` with `--server`.

### Non-goals

- Beginners who have never used a terminal.
- Users who want a full GUI file manager.
- Same-machine, same-OS setups where the built-in `/cd` already works.

## Before / after

**Before**

```text
/cd /root/projects
Failed to change directory
Location not found: C:\root\projects
```

Completion says `Could not search directories`. `Enter` on a completion looks
like a no-op. The next message does not send.

**After**

```text
/cd
Change directory: /root
Search directories…
Use this directory /root
.. /
.biome/ /root/.biome
projects/ /root/projects
```

```text
/cd pr
  projects/
  projects/api-gateway/
  projects/dotfiles/
  projects/webapp/
```

One `Enter` accepts `projects/` and shows subdirectories. Arrow or type to go
deeper. `Enter` on the current directory commits.

## Core flows (for screenshots and GIFs)

### Flow A — bare `/cd` picker

1. Home screen: `/root` in the footer.
2. Type `/cd` and `Enter`.
3. A dialog appears: `Change directory: /root`, a search field, `Use this
   directory`, `..`, and a list of directories.
4. Type `proj`; the list filters to `projects/`.
5. `Enter` descends to `/root/projects`; the dialog reopens with its children.
6. Type `webapp`; `Enter` descends.
7. `Enter` on **Use this directory** commits; the footer becomes
   `/root/projects/webapp:main`.

### Flow B — inline completion

1. Type `/cd pr`.
2. A completion popup lists `projects/`.
3. `Enter` accepts `projects/` and immediately lists its subdirectories.
4. Arrow down to `webapp/`; `Enter` descends and lists that level.
5. `Enter` on the current directory commits.

### Flow C — direct path

1. Type `/cd /root/projects/webapp`.
2. `Enter` moves immediately. No picker, no second keystroke.

### Flow D — inside a session

1. Open a session in `/root/projects`.
2. `/cd webapp` + `Enter`.
3. The session moves to `/root/projects/webapp` at the server's delivery
   boundary; the footer and session location update.

## Feature summary for the README

- Server-side `~` (home is configurable; default `/root`).
- POSIX resolution from a Windows client.
- Server directory completion with subfolders.
- Enter that completes, descends and commits.
- Searchable picker with `..` and **Use this directory**.
- Works on the home screen and inside sessions.
- Zero server changes, MIT, one small dependency.

## Technical constraints (keep the visuals honest)

- The plugin is a single TUI file plus a small path helper.
- It relies on OpenCode 2.3.2 internals: the `session.cd` id, the home route's
  `location`, autocomplete mode, and prompt submit/hide commands.
- It is a community workaround. Do not imply it is official OpenCode.
- The identity should survive a future version bump; avoid baking `2.3.2` into
  the logo.
- No heavy illustration. The product lives inside a terminal.

## Brand positioning

**Personality:** precise, dry, terminal-native, quietly amused by Windows paths.
**Promise:** “Your remote server's filesystem, without the `C:\`.”
**Enemy:** the wrong drive letter. The bug is the villain, not the user.

### Name options

The package name is already `opencode-remote-cd`. For display/branding:

- `opencode-remote-cd` (descriptive, recommended)
- `remote-cd`
- `remote cd`
- `cd, but remote`
- `Sane /cd`

### Tagline directions

Choose one primary and two alternates:

1. **“`/cd` without the `C:\`.”** (recommended: short, specific, funny)
2. **“Your remote server's filesystem, one `/cd` away.”**
3. **“Change directory, not operating systems.”**
4. **“POSIX paths for a Windows client.”**

### Voice

- Short sentences. Terminal-adjacent.
- Technical accuracy over marketing.
- One wink maximum per screen.
- Never explain the joke in the same sentence.

## Visual direction

### Mood

A small, sharp utility that belongs next to OpenCode. Think a single command in
a terminal, not a SaaS dashboard. Dark first, light supported.

### Metaphor

A path that crosses a boundary and arrives intact:

```text
C:\root\projects   →   /root/projects
```

A slash as the hero glyph. A folder that is also a prompt cursor. A drive letter
being crossed out is the one visual joke that explains the product instantly.

### Suggested palette

Use OpenCode-adjacent neutrals; do not copy OpenCode assets.

- Background: near-black with a blue/violet cast (`#191724`–`#1b1b24`).
- Primary accent: terminal cyan or mint (`#7ee7c7`, `#89ddff`).
- Secondary accent: muted lavender (`#c4a7e7`).
- Error/old behavior: soft red (`#eb6f92`).
- Success/new behavior: green (`#9ccfd8`).
- Text: warm off-white (`#e0def4`), muted gray (`#6e6a86`).

Every color must have a text or shape alternative. No color-only meaning.

### Typography

- Monospace for the wordmark and UI: JetBrains Mono, IBM Plex Mono, or the user's
  terminal font. The logo should still read if rendered in plain monospace.
- Sans-serif only for long-form site copy, never for the logo.
- The product name can be written `opencode-remote-cd`; the visual mark can use
  `/cd` as the short form.

### Logo / icon

- 1:1 mark built from `/cd` and a directory slash. Optional drive-letter
  strikethrough.
- Must work at 16×16 (favicon/terminal), 32×32, 128×128, and as a single-color
  glyph.
- Avoid tiny text. The 16px version should be recognizable as a slash/prompt.
- Provide SVG, monochrome SVG, PNG 512/1024, and a light/dark variant.
- Do not use the OpenCode logo, wordmark, or brand colors as the main mark.

### README hero

- A terminal frame with the before/after pair.
- Left: `C:\root\projects` crossed out or with a red “not found”.
- Right: `/root/projects` with a calm green footer.
- Below: a one-line pitch and three feature chips:
  `POSIX paths` · `Server completion` · `Interactive picker`.
- Keep it readable at 800px wide on GitHub.

### Screenshots / GIF

Storyboard a 10–15 second GIF:

1. `/cd` → picker opens.
2. Type `proj` → filter.
3. `Enter` → `/root/projects` children.
4. Type `webapp` → `Enter`.
5. `Enter` on **Use this directory** → footer updates to
   `/root/projects/webapp`.
6. Optional end card: `“/cd without the C:\”`.

Record at 100–120 columns, dark terminal, readable font size. Blur or replace
personal paths, hostnames, and model names. Do not include API keys or session
content.

### npm / social / site

- npm banner 1200×400: wordmark + one-liner + `/cd` motif.
- GitHub social preview 1280×640: mark on the left, before/after paths on the
  right.
- Optional one-page site: hero, 30-second demo, install block, features, “how it
  works” diagram, compatibility table, footer with MIT and upstream issue links.
- Badges: npm version, MIT, tests. Do not invent a download count.

## Copy deck

### Headline options

- `/cd` without the `C:\`
- Remote paths, local feel
- Change directory, not operating systems

### Subhead

“A tiny OpenCode TUI plugin that makes `/cd` work when your client and server
run on different operating systems.”

### Feature bullets

- **POSIX by default.** `/root/projects` stays `/root/projects`, even from
  Windows.
- **Server-side completion.** See the real subdirectories, not `C:\root`.
- **One key to go deeper.** Enter completes, descends, and commits.
- **A picker when you need it.** `/cd` opens a searchable tree with `..` and
  **Use this directory**.
- **No server changes.** Install two files, restart the TUI.

### CTAs

- “Install the plugin”
- “See the 15-second demo”
- “Read how it works”

### Alt text

- “Terminal showing the opencode-remote-cd directory picker at /root with a
  list of projects.”
- “Terminal showing `/cd pr` completing to `/cd projects/` and listing
  subdirectories.”

## README layout suggestion

1. Hero image / terminal demo.
2. One-line pitch.
3. Feature chips.
4. The bug in one code block (before/after).
5. Install (local first; package second).
6. Usage (picker, inline, direct path).
7. How it works (small diagram).
8. Compatibility and caveats.
9. Development and license.

## Success criteria

- A reader understands the bug in under 10 seconds.
- A Windows user can install it in under 2 minutes.
- The demo shows `/cd` → subdirectories → commit without a spoken explanation.
- The identity reads as a careful community utility, not an official OpenCode
  product.
- No asset implies endorsement by the OpenCode team.

## References

- OpenCode docs: <https://opencode.ai/docs/>
- OpenCode TUI plugins: <https://opencode.ai/docs/build/plugins/cli/>
- Upstream issues:
  - <https://github.com/anomalyco/opencode/issues/47665>
  - <https://github.com/anomalyco/opencode/issues/55171>
  - <https://github.com/anomalyco/opencode/issues/59554>

## Appendix — exact behavior for screenshots

- Footer path format on the home screen: `/root`, `/root/projects`,
  `/root/projects/webapp:main` (branch suffix appears when VCS detects one).
- Picker title: `Change directory: <path>`.
- Picker placeholder: `Search directories…`.
- First picker row: `Use this directory` with the current absolute path.
- Second row: `..` with the parent path (except at `/`).
- Directory rows: `<basename>/` with the absolute path as the description.
- Completion rows: relative paths such as `projects/webapp/`.
- Error copy (old behavior): `Failed to change directory — Location not found:
  C:\root\projects`.
