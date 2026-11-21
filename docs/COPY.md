# Copy deck — `opencode-remote-cd`

English is the primary language (README, npm, site). Spanish follows each
block for posts and talks. Voice: short, dry, terminal-close. One wink per
screen at most; never explain the joke.

## Name

- Package and repo: `opencode-remote-cd`
- Short mark: `/cd`
- In prose: "opencode-remote-cd" on first mention, "the plugin" afterwards.
  Never "OpenCode Remote CD" (implies an official product).

## Taglines

| | English | Español |
| --- | --- | --- |
| **Primary** | `/cd` without the `C:\`. | `/cd` sin el `C:\`. |
| Alt 1 | POSIX paths for a Windows client. | Rutas POSIX para un cliente Windows. |
| Alt 2 | Change directories, not operating systems. | Cambia de directorio, no de sistema operativo. |

Promise: "Your remote server's filesystem, without the `C:\`." /
"El filesystem de tu servidor remoto, sin el `C:\`."

## Headline + subhead

**`/cd` without the `C:\`**
A small plugin for the OpenCode TUI that makes `/cd` work when your client and
your server run different operating systems.

**`/cd` sin el `C:\`**
Un plugin chico para la TUI de OpenCode que hace que `/cd` funcione cuando tu
cliente y tu servidor corren en sistemas operativos distintos.

## The bug in one line

- EN: On Windows, `/root/projects` becomes `C:\root\projects`, and the server
  never finds it.
- ES: En Windows, `/root/projects` se convierte en `C:\root\projects`, y el
  servidor nunca lo encuentra.

## Chips

`POSIX paths` · `Server completion` · `Interactive picker`

## Bullets

| English | Español |
| --- | --- |
| **POSIX by default.** `/root/projects` stays `/root/projects`, even from Windows. | **POSIX por defecto.** `/root/projects` sigue siendo `/root/projects`, incluso desde Windows. |
| **Server completion.** You see the real subdirectories, not `C:\root`. | **Autocompletado del servidor.** Ves las subcarpetas reales, no `C:\root`. |
| **One key to descend.** `Enter` completes, descends and commits. | **Una tecla para bajar.** Enter completa, baja y confirma. |
| **A picker when you want one.** `/cd` opens a searchable tree with `..` and **Use this directory**. | **Selector cuando lo necesitas.** `/cd` abre un árbol con búsqueda, `..` y **Use this directory**. |
| **Server `~`.** The tilde means the server home. Configurable. | **`~` del servidor.** La tilde es el home del servidor. Configurable. |
| **No server changes.** Copy two files, restart the TUI. | **Sin cambios en el servidor.** Copias dos archivos y reinicias la TUI. |

## CTAs

| English | Español |
| --- | --- |
| Install the plugin | Instalar el plugin |
| Watch the 15-second demo | Ver el demo de 15 segundos |
| Read how it works | Leer cómo funciona |

## Disclaimer (use on every surface that shows the mark)

- EN: Community plugin. Not affiliated with or endorsed by OpenCode.
- ES: Plugin comunitario. No está afiliado ni respaldado por OpenCode.

## npm / GitHub

- **npm description (≤ 120 chars):** Remote-safe /cd for the OpenCode TUI:
  POSIX paths, server completion and a directory picker.
- **GitHub "About":** `/cd` without the `C:\` — community OpenCode TUI plugin
  for Windows clients on Linux servers.
- **Topics:** `opencode` `opencode-plugin` `tui` `remote` `ssh` `wsl`
  `windows` `posix` `cd`

## Launch post

> **EN** — Running OpenCode on a Linux box and the TUI on Windows? `/cd
> /root/projects` turns into `C:\root\projects` and goes nowhere.
> opencode-remote-cd fixes `/cd`, `~` and completion from the client side, and
> adds a directory picker. Two files, no server changes, MIT.
>
> **ES** — ¿OpenCode en un Linux y la TUI en Windows? `/cd /root/projects` se
> convierte en `C:\root\projects` y no va a ningún lado. opencode-remote-cd
> arregla `/cd`, `~` y el autocompletado desde el cliente, y agrega un
> selector de directorios. Dos archivos, sin cambios en el servidor, MIT.

## Alt text

| Asset | Alt text |
| --- | --- |
| `readme/hero-*.png` | Before and after: the built-in /cd fails with "Location not found: C:\root\projects"; with opencode-remote-cd, /cd /root/projects resolves on the server and the footer shows /root/projects:main. |
| `demo/demo.gif` | Terminal demo: /cd opens a directory picker at /root, typing proj filters to projects/, Enter descends, typing web and Enter descends into webapp, Enter on Use this directory moves the footer to /root/projects/webapp:main. |
| `social/social-preview.png` | opencode-remote-cd: /cd without the C:\. Before: C:\root\projects, location not found. After: /root/projects, resolved on the server. |
| `social/npm-banner.png` | opencode-remote-cd logo and wordmark. C:\root\projects struck through, then /root/projects. |
| `brand/logo*.svg` | opencode-remote-cd |
| Picker screenshot (EN) | Terminal showing the opencode-remote-cd picker at /root with a list of projects. |
| Completion screenshot (EN) | Terminal showing /cd pr completing to /cd projects/ and listing subdirectories. |
| Picker screenshot (ES) | Terminal mostrando el selector de opencode-remote-cd en /root con una lista de proyectos. |
| Completion screenshot (ES) | Terminal mostrando `/cd pr` completando a `/cd projects/` y listando subcarpetas. |

## Words to avoid

"Official", "the OpenCode remote plugin", "seamless", "blazing", "magic",
download counts we don't have, and the version number in anything but the
compatibility section.
