import { describe, expect, test } from "bun:test"
import {
  cdArgument,
  compareDirectoryNames,
  completionCommits,
  enterIntent,
  expandHome,
  inferServerHome,
  isCdCommand,
  isWindowsAbsolutePath,
  resolveDirectory,
  translateWindowsPath,
} from "../src/path.js"

describe("expandHome", () => {
  test("expands ~ to the server home", () => {
    expect(expandHome("~", "/home/opencode")).toBe("/home/opencode")
  })

  test("expands ~/ prefixes", () => {
    expect(expandHome("~/projects", "/home/opencode")).toBe("/home/opencode/projects")
  })

  test("leaves other paths alone", () => {
    expect(expandHome("projects/webapp", "/root")).toBe("projects/webapp")
  })
})

describe("resolveDirectory", () => {
  test("resolves a relative path against the server directory", () => {
    expect(resolveDirectory("/root", "projects", "/root")).toBe("/root/projects")
  })

  test("keeps an absolute POSIX path", () => {
    expect(resolveDirectory("/root", "/root/projects", "/root")).toBe("/root/projects")
  })

  test("resolves ~ on a non-root server", () => {
    expect(resolveDirectory("/home/opencode/code", "~/projects", "/home/opencode")).toBe("/home/opencode/projects")
  })

  test("walks up with ..", () => {
    expect(resolveDirectory("/root/projects/webapp", "..", "/root")).toBe("/root/projects")
  })
})

describe("isWindowsAbsolutePath", () => {
  test("accepts drive-letter paths with either separator", () => {
    expect(isWindowsAbsolutePath("C:\\root\\projects")).toBe(true)
    expect(isWindowsAbsolutePath("D:/data")).toBe(true)
  })

  test("rejects POSIX and relative paths", () => {
    expect(isWindowsAbsolutePath("/root/projects")).toBe(false)
    expect(isWindowsAbsolutePath("projects")).toBe(false)
  })
})

describe("translateWindowsPath", () => {
  const clientHome = "C:\\Users\\admin"

  test("restores a POSIX path mangled by win32.resolve", () => {
    expect(translateWindowsPath("C:\\root\\projects", clientHome, "/root")).toBe("/root/projects")
  })

  test("maps the client home to the server home", () => {
    expect(translateWindowsPath("C:\\Users\\admin", clientHome, "/root")).toBe("/root")
    expect(translateWindowsPath("C:\\Users\\admin\\projects", clientHome, "/root")).toBe("/root/projects")
  })

  test("strips any drive letter", () => {
    expect(translateWindowsPath("D:\\data\\repo", clientHome, "/root")).toBe("/data/repo")
  })

  test("normalizes separators", () => {
    expect(translateWindowsPath("C:/root/projects", clientHome, "/root")).toBe("/root/projects")
  })
})

describe("cd command helpers", () => {
  test("detects /cd with no argument, with a space, and with an argument", () => {
    expect(isCdCommand("/cd")).toBe(true)
    expect(isCdCommand("/cd ")).toBe(true)
    expect(isCdCommand("/cd projects")).toBe(true)
  })

  test("does not match other commands", () => {
    expect(isCdCommand("/cdp")).toBe(false)
    expect(isCdCommand("hello")).toBe(false)
  })

  test("returns the raw argument", () => {
    expect(cdArgument("/cd")).toBe("")
    expect(cdArgument("/cd ")).toBe("")
    expect(cdArgument("/cd projects/webapp")).toBe("projects/webapp")
  })
})

describe("inferServerHome", () => {
  test("recognizes root, Linux and macOS homes", () => {
    expect(inferServerHome("/root")).toBe("/root")
    expect(inferServerHome("/root/projects/webapp")).toBe("/root")
    expect(inferServerHome("/home/dev/code")).toBe("/home/dev")
    expect(inferServerHome("/Users/dev")).toBe("/Users/dev")
  })

  test("gives up on other directories", () => {
    expect(inferServerHome("/srv/app")).toBeUndefined()
    expect(inferServerHome("/rootless")).toBeUndefined()
    expect(inferServerHome("/home")).toBeUndefined()
    expect(inferServerHome("C:\\Users\\dev")).toBeUndefined()
    expect(inferServerHome(undefined)).toBeUndefined()
  })
})

describe("compareDirectoryNames", () => {
  test("puts dot-directories last and sorts naturally, ignoring case", () => {
    const names = [".cache/", "webapp/", "API/", ".config/", "app10/", "app2/"]
    expect(names.sort(compareDirectoryNames)).toEqual(["API/", "app2/", "app10/", "webapp/", ".cache/", ".config/"])
  })
})

describe("enterIntent", () => {
  test("submits plain text and a bare /cd", () => {
    expect(enterIntent("hello")).toBe("submit")
    expect(enterIntent("/cd")).toBe("submit")
    expect(enterIntent("/cd ")).toBe("submit")
  })

  test("selects a /cd completion", () => {
    expect(enterIntent("/cd pr")).toBe("select")
    expect(enterIntent("  /cd projects/")).toBe("select")
  })

  test("leaves other triggers to the built-in handler", () => {
    expect(enterIntent("/model")).toBe("pass")
    expect(enterIntent("look at @src/ma")).toBe("pass")
  })
})

describe("completionCommits", () => {
  test("commits when nothing new was completed", () => {
    expect(completionCommits("/cd projects", "/cd projects")).toBe(true)
    expect(completionCommits("/cd projects", "/cd projects/")).toBe(true)
    expect(completionCommits("/cd projects//", "/cd projects/")).toBe(true)
  })

  test("descends when a deeper directory was completed", () => {
    expect(completionCommits("/cd pr", "/cd projects/")).toBe(false)
    expect(completionCommits("/cd projects/", "/cd projects/webapp/")).toBe(false)
  })
})
