# Contributing

Thanks for trying `opencode-remote-cd`.

## Reporting a bug

Include:

- OpenCode client version (`opencode --version`).
- Client OS and server OS.
- How the TUI is attached (`--server`, SSH tunnel, Tailscale, WSL, etc.).
- The exact `/cd` input and the toast/error text.
- Relevant lines from `~/.local/share/opencode/log/opencode.log`.

Redact hostnames, paths, keys and session content.

## Development

```bash
bun install
bun test
bun run typecheck
```

The pure path logic lives in `src/path.ts` and is covered by
`test/path.test.ts`. To exercise the TUI plugin itself, copy `src/tui.tsx` and
`src/path.ts` into `~/.config/opencode/plugins/opencode-remote-cd/` and start the
TUI against a server.

## Scope

- Keep the plugin client-side. It must not require server changes.
- Keep the dependency footprint small.
- Do not imply that this is an official OpenCode plugin.
- Update `README.md` and `CHANGELOG.md` for user-visible changes.
