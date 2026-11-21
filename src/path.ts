import path from "node:path"

/**
 * The home directory used for `~` on the server when it cannot be discovered.
 * Override with the plugin option `home` if the server user is not root.
 */
export const DEFAULT_SERVER_HOME = "/root"

/** Expand `~` and `~/...` against the server home. */
export function expandHome(value: string, serverHome: string) {
  if (value === "~") return serverHome
  if (value.startsWith("~/")) return path.posix.join(serverHome, value.slice(2))
  return value
}

/** Resolve a `/cd` argument with POSIX rules on top of the current server directory. */
export function resolveDirectory(base: string, value: string, serverHome: string) {
  return path.posix.resolve(base, expandHome(value, serverHome))
}

/** True for absolute Windows paths such as `C:\root` or `D:/data`. */
export function isWindowsAbsolutePath(value: string) {
  return /^[A-Za-z]:[\\/]/.test(value)
}

/**
 * Turn a path produced by the client's win32 resolver into a POSIX path.
 *
 * `path.win32.resolve("/root", "projects")` returns `C:\root\projects`, so a
 * Linux server cannot use it. Stripping the drive restores `/root/projects`.
 * Paths under the client home are mapped to the server home, which makes `~`
 * completion work as well.
 */
export function translateWindowsPath(value: string, clientHome: string, serverHome: string) {
  const withoutDrive = value.replaceAll("\\", "/").slice(2)
  const home = clientHome.replaceAll("\\", "/").replace(/^[A-Za-z]:/, "").toLowerCase()
  const lower = withoutDrive.toLowerCase()
  if (home && (lower === home || lower.startsWith(home + "/")))
    return serverHome + withoutDrive.slice(home.length)
  return "/" + withoutDrive.replace(/^\/+/, "")
}

/** True when the composer text starts with the `/cd` command. */
export function isCdCommand(value: string) {
  return /^\/cd(?:\s|$)/.test(value.trimStart())
}

/** The raw argument after `/cd`, or an empty string. */
export function cdArgument(value: string) {
  return value.trimStart().replace(/^\/cd\s*/, "")
}

/**
 * Guess the server user's home from a server directory, for when the `home`
 * option is not set. Recognizes `/root`, `/home/<user>` and `/Users/<user>`.
 */
export function inferServerHome(directory: string | undefined) {
  if (!directory || !directory.startsWith("/")) return undefined
  if (directory === "/root" || directory.startsWith("/root/")) return "/root"
  return directory.match(/^\/(?:home|Users)\/[^/]+/)?.[0]
}

/** Sort picker entries: visible directories first, then dot-directories, each case-insensitively. */
export function compareDirectoryNames(a: string, b: string) {
  const hiddenA = a.startsWith("."), hiddenB = b.startsWith(".")
  if (hiddenA !== hiddenB) return hiddenA ? 1 : -1
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
}

/**
 * What Enter should do while the prompt's autocomplete popup is open.
 *
 * - `pass`: another trigger (`/command`, `@file`) owns the popup; let the
 *   built-in handler run.
 * - `submit`: hide the popup and submit the prompt (plain text, or a bare `/cd`
 *   that opens the picker).
 * - `select`: a `/cd <path>` completion; select it, then use
 *   {@link completionCommits} to decide whether to commit or descend.
 */
export function enterIntent(text: string): "pass" | "submit" | "select" {
  const trimmed = text.trimStart()
  if (isCdCommand(trimmed)) return cdArgument(text) === "" ? "submit" : "select"
  if (trimmed.startsWith("/") || /(^|\s)@\S*$/.test(text)) return "pass"
  return "submit"
}

/**
 * After selecting a `/cd` completion: true when the typed path was already
 * complete (nothing new, or only a trailing slash added), so Enter commits.
 */
export function completionCommits(before: string, after: string) {
  if (after === before) return true
  const a = cdArgument(before), b = cdArgument(after)
  return b === a || b === a.replace(/\/+$/, "") + "/"
}
