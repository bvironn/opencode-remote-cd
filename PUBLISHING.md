# Publishing

## First release (manual)

```bash
bun install
bun test
bunx tsc --noEmit
npm pack --dry-run        # check the tarball: src/, README, CHANGELOG, LICENSE
npm login
npm publish --access public
```

`prepublishOnly` runs the tests and the typecheck again before uploading.

Then create the GitHub release:

```bash
git tag v0.1.0
git push origin main --tags
```

## Later releases (CI)

`.github/workflows/release.yml` publishes to npm with provenance when a tag
`v<version>` is pushed and the tag matches `package.json`.

One-time setup, either:

- **Trusted publishing (preferred):** on npmjs.com → package → Settings →
  Trusted publishing, add this GitHub repository and `release.yml`. No secret
  needed.
- **Token:** create an npm automation token and save it as the `NPM_TOKEN`
  repository secret.

Release steps:

```bash
npm version patch          # or minor; updates package.json and tags
# update CHANGELOG.md
git push origin main --follow-tags
```

## Assets

Logo, hero, demo GIF, npm banner and social preview live in `assets/` (see
[assets/README.md](assets/README.md)). Upload `assets/social/social-preview.png`
in GitHub → Settings → Social preview.

## Release checklist

- [ ] `bun test` and `bunx tsc --noEmit` pass.
- [ ] Tested against the current OpenCode TUI version (Windows client → Linux
      server at minimum).
- [ ] `npm pack --dry-run` lists only `src/`, README, CHANGELOG, LICENSE,
      package.json.
- [ ] README install steps work from a clean `~/.config/opencode`.
- [ ] No personal paths, hostnames, API keys or session content in assets.
- [ ] CHANGELOG updated.
- [ ] GitHub Actions `test` workflow is green.
