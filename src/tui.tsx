// Remote-safe /cd for the OpenCode TUI.
//
// The built-in `session.cd` command resolves its argument with the *client's*
// path rules before talking to the server. On Windows that turns `/root/foo`
// into `C:\root\foo`, so a Linux server can never find it.
//
// This plugin registers a command with the same id (`session.cd`) and a higher
// layer priority, which shadows the built-in command:
//   - inside a session: send the raw argument to the server, which resolves it
//     on the server filesystem (`~` included).
//   - on the home screen: resolve with POSIX rules against the current server
//     location, then set the home route location (the same shape the internal
//     project picker uses).
//   - without an argument: open an interactive directory picker.
//
// The server home used for `~` comes from the plugin option `home`, otherwise
// it is inferred from the server's default directory (/root, /home/<user> or
// /Users/<user>), otherwise /root.

import { Plugin } from "@opencode/plugin/tui"
import os from "node:os"
import path from "node:path"
import {
  DEFAULT_SERVER_HOME,
  compareDirectoryNames,
  completionCommits,
  enterIntent,
  inferServerHome,
  isWindowsAbsolutePath,
  resolveDirectory,
  translateWindowsPath,
} from "./path.js"

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string" && error.message) return error.message
    if ("data" in error && typeof error.data === "object" && error.data !== null) {
      const data = error.data as Record<string, unknown>
      if (typeof data.message === "string" && data.message) return data.message
    }
  }
  const text = String(error)
  return text && text !== "[object Object]" ? text : "unknown error"
}

export default Plugin.define({
  id: "opencode-remote-cd",
  setup(context) {
    const configuredHome =
      typeof context.options.home === "string" && context.options.home.startsWith("/")
        ? context.options.home.replace(/(.)\/+$/, "$1")
        : undefined
    let inferredHome: string | undefined
    const serverHome = () => {
      if (configuredHome) return configuredHome
      if (!inferredHome) {
        try {
          inferredHome = inferServerHome(context.data.location.default().directory)
        } catch {
          // The location store may not be ready during setup; retry next time.
        }
      }
      return inferredHome ?? DEFAULT_SERVER_HOME
    }
    const cleanups: Array<() => void> = []

    const commit = async (directory: string) => {
      const route = context.ui.router.current()
      try {
        if (route.type === "session") {
          await context.client.session.move({ sessionID: route.sessionID, directory })
          return
        }
        const location = await context.client.location.get({ location: { directory } })
        // HomeRoute carries a location internally; the 2.3.2 plugin type omits it.
        context.ui.router.navigate({ type: "home", location: { directory: location.directory } } as any)
      } catch (error) {
        context.ui.toast.show({
          title: "Failed to change directory",
          message: errorMessage(error),
          variant: "error",
        })
      }
    }

    const startDirectory = () => {
      const route = context.ui.router.current()
      const fallback = context.location?.directory ?? context.data.location.default().directory
      if (route.type !== "session") return fallback
      return context.data.session.get(route.sessionID)?.location.directory ?? fallback
    }

    // Interactive tree used by a bare /cd. The dialog closes on every choice,
    // so the loop reopens it at the selected directory.
    const pickDirectory = async (start: string) => {
      const location = context.location ?? context.data.location.default()
      const base = location.directory
      let directory = start || base
      let previous: string | undefined
      while (true) {
        let entries
        try {
          const response = await context.client.file.list({ location: { directory: base }, path: directory })
          entries = response.data
        } catch (error) {
          context.ui.toast.show({
            title: `Cannot open ${directory}`,
            message: errorMessage(error),
            variant: "error",
          })
          // Stay in the picker at the last directory that could be listed.
          if (previous === undefined || previous === directory) return
          directory = previous
          previous = undefined
          continue
        }
        const directories = entries
          .filter((entry) => entry.type === "directory")
          .map((entry) => {
            const absolute = entry.path.startsWith("/") ? entry.path : path.posix.resolve(base, entry.path)
            return {
              title: path.posix.basename(absolute.replace(/\/+$/, "")) + "/",
              value: absolute,
              description: absolute,
            }
          })
          .sort((a, b) => compareDirectoryNames(a.title, b.title))
        const selected = await context.ui.dialog.select<string>({
          title: `Change directory: ${directory}`,
          placeholder: "Search directories…",
          options: [
            { title: "Use this directory", value: "__use__", description: directory },
            ...(directory === "/"
              ? []
              : [{ title: "..", value: "__up__", description: path.posix.dirname(directory) }]),
            ...directories,
          ],
        })
        if (selected === undefined) return
        if (selected === "__use__") {
          await commit(directory)
          return
        }
        previous = directory
        if (selected === "__up__") {
          directory = path.posix.dirname(directory)
          continue
        }
        directory = selected
      }
    }

    // The built-in /cd completion builds its file.list path with the client's
    // win32 rules (e.g. "/root/foo" becomes "C:\root\foo"), so the Linux server
    // cannot list subdirectories. Translate those paths back to POSIX while the
    // attached location is POSIX. Local Windows servers are left untouched.
    if (process.platform === "win32") {
      const file = (context.client as any).file
      if (file && typeof file.list === "function") {
        const original = file.list
        const list = original.bind(file)
        const clientHome = os.homedir()
        const wrapper = (input: any, requestOptions?: any) => {
          const base = context.location?.directory ?? context.data.location.default().directory
          const value = input?.path
          if (typeof base !== "string" || !base.startsWith("/") || typeof value !== "string")
            return list(input, requestOptions)
          if (!isWindowsAbsolutePath(value)) return list(input, requestOptions)
          return list({ ...input, path: translateWindowsPath(value, clientHome, serverHome()) }, requestOptions)
        }
        file.list = wrapper
        cleanups.push(() => {
          if (file.list === wrapper) file.list = original
        })
      }
    }

    context.keymap.layer(() => ({
      mode: "global",
      // Higher than the built-in prompt layer so this command wins dispatch.
      priority: 10,
      commands: [
        {
          id: "session.cd",
          title: "Change working directory",
          description: "Change the server working directory",
          slash: { name: "cd", arguments: true },
          run: async (input) => {
            const value = input?.trim()
            if (!value) {
              await pickDirectory(startDirectory())
              return
            }

            const route = context.ui.router.current()
            if (route.type === "session") {
              // The server owns the path semantics here: relative paths resolve
              // against the session directory and `~` expands to the server home.
              await commit(value)
              return
            }

            await commit(resolveDirectory(startDirectory(), value, serverHome()))
          },
        },
      ],
    }))

    // The built-in directory completion consumes Enter to select an item. For
    // "/cd pr" the selected completion ("projects/") used to be applied but the
    // command was not submitted, and for an exact value the key press looked
    // like a no-op. Accept the highlighted completion, then:
    //   - commit when the typed path was already complete (or only a trailing
    //     slash was added),
    //   - otherwise keep the popup open at the completed directory so the next
    //     level can be browsed without typing /cd again.
    context.keymap.layer(() => ({
      mode: "autocomplete",
      priority: 20,
      commands: [
        {
          id: "opencode-remote-cd.enter",
          bind: "enter",
          run: () => {
            const editor = context.renderer.currentFocusedEditor as any
            const before = typeof editor?.plainText === "string" ? editor.plainText : ""
            const intent = enterIntent(before)
            if (intent === "pass") return false
            // Plain text submits; a bare /cd opens the picker instead of letting
            // the directory completion insert its first match.
            if (intent === "submit") {
              context.keymap.dispatch("prompt.autocomplete.hide")
              context.keymap.dispatch("prompt.submit")
              return
            }

            context.keymap.dispatch("prompt.autocomplete.select")
            const after = typeof editor?.plainText === "string" ? editor.plainText : before
            if (completionCommits(before, after)) {
              context.keymap.dispatch("prompt.autocomplete.hide")
              context.keymap.dispatch("prompt.submit")
              return
            }

            // Selecting a deeper directory hides the completion and remembers
            // the new text as dismissed. Bounce one cell to reopen it at the
            // completed path, so the next level is listed immediately. The
            // removal runs on the next tick so the inserted value is observed
            // as a separate input change before the original text returns.
            if (typeof editor?.insertText !== "function") return
            const offset = editor.cursorOffset
            editor.insertText(" ")
            setTimeout(() => {
              if (!editor || editor.isDestroyed) return
              const from = editor.editBuffer.offsetToPosition(offset)
              const to = editor.editBuffer.offsetToPosition(offset + 1)
              if (from && to) editor.deleteRange(from.row, from.col, to.row, to.col)
              editor.cursorOffset = offset
            }, 0)
            return
          },
        },
      ],
    }))

    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  },
})
