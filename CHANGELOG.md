# Changelog

## 0.1.0

First public release.

- `/cd <path>` resolves with POSIX rules against the server on the home
  screen; inside a session the raw argument is sent to the server.
- `~` uses the server home: the `home` option, or a home inferred from the
  server's default directory (`/root`, `/home/<user>`, `/Users/<user>`), or
  `/root`.
- Built-in directory completion is translated back to POSIX on Windows
  clients, so it lists the server's subdirectories.
- `Enter` in the completion accepts, descends and commits.
- A bare `/cd` opens a searchable directory picker with `..` and
  **Use this directory**. Entries are sorted, dot-directories last. A
  directory that cannot be listed shows an error and keeps the picker open.
- `@opencode/plugin` is a peer dependency: the published package has no
  runtime dependencies.
