# Brief de diseño: `opencode-remote-cd`

> Este documento es autocontenido. Se puede pasar tal cual a un diseñador o a
> otro modelo para trabajar la identidad, el README, el logo, el sitio y los
> assets del proyecto.

## Una línea

Un plugin pequeño para la TUI de OpenCode que hace que `/cd` funcione cuando el
cliente y el servidor corren en sistemas operativos distintos.

## Resumen para diseño

Necesitamos una identidad compacta y creíble para una herramienta open source
muy específica: un cliente OpenCode en Windows conectado a un servidor Linux
convierte `/root/projects` en `C:\root\projects`, y el servidor no encuentra
nada. El plugin arregla la navegación y agrega un selector de directorios.

Diseñar una identidad terminal-native, que se sienta parte del ecosistema
OpenCode sin pretender ser oficial: marca, hero del README, guion de screenshots
y GIF, assets para npm/redes y copy que explique el bug en una línea. Tono
técnico, seco, con humor suave sobre las rutas de Windows.

## Producto

- **Nombre:** `opencode-remote-cd`
- **Tipo:** plugin comunitario de TUI para OpenCode 2.x
- **Licencia:** MIT
- **Estado:** 0.1.0, probado con OpenCode 2.3.2
- **Repo:** `github.com/<owner>/opencode-remote-cd` (a publicar)
- **Instalación:** copiar dos archivos a
  `~/.config/opencode/plugins/opencode-remote-cd/` o agregar el paquete a
  `~/.config/opencode/cli.json`

### Qué es

Un plugin del lado del cliente que reemplaza el comando `session.cd` de OpenCode
y arregla la experiencia de directorios cuando la TUI y el servidor están en
máquinas distintas:

1. `/cd <ruta>` resuelve con reglas POSIX en el servidor, no con el
   `path.resolve` del cliente.
2. `~` se expande al home del usuario del servidor.
3. El autocompletado lista los directorios del servidor, incluidas subcarpetas.
4. `Enter` en el autocompletado acepta la sugerencia, baja a una subcarpeta y
   vuelve a abrir el siguiente nivel.
5. Un `/cd` vacío abre un selector de directorios con búsqueda, `..` y
   **Use this directory**.
6. En una sesión, la mueve en el servidor; en la pantalla home, deja preparada
   la ubicación para la próxima sesión.

### Qué no es

- No es oficial de OpenCode.
- No modifica el servidor: corre entero en el cliente TUI.
- No reemplaza el modelo de proyectos/sesiones; solo arregla `cd`.
- No es un explorador de archivos genérico. Está acotado a cambiar el
  directorio de trabajo.

### Por qué existe

La TUI de OpenCode es un cliente; el servidor es dueño del filesystem. Cuando
corren en sistemas distintos, la resolución de rutas del cliente mete la
semántica equivocada. Los issues upstream están abiertos:

- `#47665` — directorio posicional resuelto localmente con `--server`.
- `#55171` — `/cd` expande `~` con el home del cliente.
- `#59554` — `/cd` usa el home y el autocompletado del cliente en Windows →
  Linux.

Este plugin es un puente práctico hasta que el cliente entienda las rutas del
servidor de forma nativa.

## Público

### Primario

Desarrolladores que corren OpenCode en un Linux remoto (VPS, home lab,
Tailscale, Docker) y usan la TUI desde un notebook Windows. Ya saben de
terminal, SSH y rutas. Están moderadamente furiosos de que exista
`C:\root\projects`.

### Secundario

- Cliente macOS → servidor Linux.
- Usuarios de WSL con el servidor en otra distro o contenedor.
- Quienes conectan la TUI a un `opencode serve` headless con `--server`.

### No objetivos

- Gente que nunca usó una terminal.
- Quienes buscan un administrador de archivos gráfico.
- Setups en la misma máquina y mismo OS, donde el `/cd` built-in ya funciona.

## Antes / después

**Antes**

```text
/cd /root/projects
Failed to change directory
Location not found: C:\root\projects
```

El autocompletado dice `Could not search directories`. `Enter` sobre una
sugerencia parece no hacer nada. El mensaje siguiente no se envía.

**Después**

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

Un `Enter` acepta `projects/` y muestra las subcarpetas. Con flechas o typing se
baja más. `Enter` sobre el directorio actual confirma.

## Flujos principales (para screenshots y GIF)

### Flujo A — `/cd` vacío y selector

1. Pantalla home: footer en `/root`.
2. Escribir `/cd` y `Enter`.
3. Aparece el diálogo: `Change directory: /root`, campo de búsqueda,
   `Use this directory`, `..` y la lista de directorios.
4. Escribir `proj`; la lista filtra a `projects/`.
5. `Enter` baja a `/root/projects`; el diálogo se reabre con sus hijos.
6. Escribir `webapp`; `Enter` baja.
7. `Enter` en **Use this directory** confirma; el footer queda en
   `/root/projects/webapp:main`.

### Flujo B — autocompletado inline

1. Escribir `/cd pr`.
2. El popup lista `projects/`.
3. `Enter` acepta `projects/` y lista sus subcarpetas.
4. Flecha abajo a `webapp/`; `Enter` baja y lista ese nivel.
5. `Enter` sobre el directorio actual confirma.

### Flujo C — ruta directa

1. Escribir `/cd /root/projects/webapp`.
2. `Enter` mueve de inmediato. Sin selector ni segundo Enter.

### Flujo D — dentro de una sesión

1. Abrir una sesión en `/root/projects`.
2. `/cd webapp` + `Enter`.
3. La sesión se mueve a `/root/projects/webapp` en el próximo límite de entrega
   del servidor; el footer y la ubicación de la sesión se actualizan.

## Lista de funciones para el README

- `~` del servidor (home configurable; default `/root`).
- Resolución POSIX desde un cliente Windows.
- Autocompletado de directorios del servidor, con subcarpetas.
- Enter que completa, baja y confirma.
- Selector con búsqueda, `..` y **Use this directory**.
- Funciona en home y en sesiones.
- Cero cambios en el servidor, MIT, una dependencia chica.

## Restricciones técnicas (para no mentir en el diseño)

- El plugin es un archivo de TUI más un helper de rutas.
- Depende de internals de OpenCode 2.3.2: el id `session.cd`, el campo
  `location` de la ruta home, el modo `autocomplete` y los comandos
  `prompt.submit`/`prompt.hide`.
- Es un workaround comunitario. No insinuar que es oficial de OpenCode.
- La identidad debe sobrevivir un cambio de versión; no meter `2.3.2` en el
  logo.
- Nada de ilustración pesada. El producto vive dentro de una terminal.

## Posicionamiento de marca

**Personalidad:** precisa, seca, terminal-native, con humor suave por las rutas
de Windows.
**Promesa:** “El filesystem de tu servidor remoto, sin el `C:\`.”
**Enemigo:** la letra de unidad equivocada. El villano es el bug, no el usuario.

### Opciones de nombre

El paquete ya se llama `opencode-remote-cd`. Para mostrar/marca:

- `opencode-remote-cd` (descriptivo, recomendado)
- `remote-cd`
- `remote cd`
- `cd, but remote`
- `Sane /cd`

### Taglines

Elegir una principal y dos alternativas:

1. **“`/cd` sin el `C:\`.”** (recomendada: corta, específica, con gracia)
2. **“El filesystem de tu servidor remoto, a un `/cd`.”**
3. **“Cambia de directorio, no de sistema operativo.”**
4. **“Rutas POSIX para un cliente Windows.”**

### Voz

- Frases cortas. Cercana a la terminal.
- Precisión técnica antes que marketing.
- Un guiño máximo por pantalla.
- Nunca explicar el chiste en la misma frase.

## Dirección visual

### Mood

Una utilidad chica y filosa que pertenece al lado de OpenCode. Pensar en un
comando en una terminal, no en un dashboard SaaS. Dark first, light soportado.

### Metáfora

Una ruta que cruza una frontera y llega intacta:

```text
C:\root\projects   →   /root/projects
```

El slash como glifo héroe. Una carpeta que también es cursor de prompt. Una
letra de unidad tachada es el único chiste visual que explica el producto al
instante.

### Paleta sugerida

Usar neutros adyacentes a OpenCode; no copiar assets de OpenCode.

- Fondo: casi negro con tinte azul/violeta (`#191724`–`#1b1b24`).
- Acento primario: cyan o mint de terminal (`#7ee7c7`, `#89ddff`).
- Acento secundario: lavanda apagada (`#c4a7e7`).
- Error/comportamiento viejo: rojo suave (`#eb6f92`).
- Éxito/comportamiento nuevo: verde (`#9ccfd8`).
- Texto: blanco cálido (`#e0def4`), gris apagado (`#6e6a86`).

Todo color debe tener alternativa por texto o forma. Nada de significado solo
por color.

### Tipografía

- Monoespaciada para el wordmark y la UI: JetBrains Mono, IBM Plex Mono o la
  fuente de terminal del usuario. El logo debe leerse incluso en monoespaciada
  plana.
- Sans-serif solo para copy largo del sitio, nunca para el logo.
- El nombre puede escribirse `opencode-remote-cd`; la marca visual puede usar
  `/cd` como forma corta.

### Logo / ícono

- Marca 1:1 construida con `/cd` y un slash de directorio. Opcional: letra de
  unidad tachada.
- Debe funcionar a 16×16 (favicon/terminal), 32×32, 128×128 y como glifo de un
  solo color.
- Evitar texto chico. La versión de 16px debe reconocerse como slash/prompt.
- Entregar SVG, SVG monocromo, PNG 512/1024 y variante light/dark.
- No usar el logo, wordmark ni colores principales de OpenCode como marca
  principal.

### Hero del README

- Un marco de terminal con el par antes/después.
- Izquierda: `C:\root\projects` tachado o con un “not found” rojo.
- Derecha: `/root/projects` con un footer verde tranquilo.
- Abajo: pitch de una línea y tres chips:
  `POSIX paths` · `Server completion` · `Interactive picker`.
- Debe leerse a 800px de ancho en GitHub.

### Screenshots / GIF

Storyboard de un GIF de 10–15 segundos:

1. `/cd` → se abre el selector.
2. Escribir `proj` → filtra.
3. `Enter` → hijos de `/root/projects`.
4. Escribir `webapp` → `Enter`.
5. `Enter` en **Use this directory** → footer
   `/root/projects/webapp`.
6. Opcional, end card: `“/cd sin el C:\”`.

Grabar a 100–120 columnas, terminal oscura, fuente legible. Difuminar o
reemplazar rutas personales, hostnames y nombres de modelos. No incluir API keys
ni contenido de sesiones.

### npm / redes / sitio

- Banner npm 1200×400: wordmark + one-liner + motivo `/cd`.
- Social preview de GitHub 1280×640: marca a la izquierda, rutas antes/después a
  la derecha.
- Sitio de una página opcional: hero, demo de 30 segundos, bloque de
  instalación, features, diagrama de “cómo funciona”, tabla de compatibilidad,
  footer con MIT y links a los issues upstream.
- Badges: versión npm, MIT, tests. No inventar descargas.

## Copy deck

### Headlines

- `/cd` sin el `C:\`
- Rutas remotas, sensación local
- Cambia de directorio, no de sistema operativo

### Subhead

“Un plugin chico para la TUI de OpenCode que hace que `/cd` funcione cuando tu
cliente y tu servidor corren en sistemas operativos distintos.”

### Bullets

- **POSIX por defecto.** `/root/projects` sigue siendo `/root/projects`,
  incluso desde Windows.
- **Autocompletado del servidor.** Ves las subcarpetas reales, no `C:\root`.
- **Una tecla para bajar.** Enter completa, baja y confirma.
- **Selector cuando lo necesitas.** `/cd` abre un árbol con búsqueda, `..` y
  **Use this directory**.
- **Sin cambios en el servidor.** Instalas dos archivos y reinicias la TUI.

### CTAs

- “Instalar el plugin”
- “Ver el demo de 15 segundos”
- “Leer cómo funciona”

### Alt text

- “Terminal mostrando el selector de opencode-remote-cd en /root con una lista
  de proyectos.”
- “Terminal mostrando `/cd pr` completando a `/cd projects/` y listando
  subcarpetas.”

## Layout sugerido del README

1. Hero / demo de terminal.
2. Pitch de una línea.
3. Chips de features.
4. El bug en un bloque de código (antes/después).
5. Instalación (local primero; paquete después).
6. Uso (selector, inline, ruta directa).
7. Cómo funciona (diagrama chico).
8. Compatibilidad y limitaciones.
9. Desarrollo y licencia.

## Criterios de éxito

- Un lector entiende el bug en menos de 10 segundos.
- Un usuario de Windows lo instala en menos de 2 minutos.
- El demo muestra `/cd` → subcarpetas → confirmar sin explicación hablada.
- La identidad se lee como una utilidad comunitaria cuidadosa, no como un
  producto oficial de OpenCode.
- Ningún asset insinúa endorsement del equipo de OpenCode.

## Referencias

- Docs de OpenCode: <https://opencode.ai/docs/>
- Plugins de TUI: <https://opencode.ai/docs/build/plugins/cli/>
- Issues upstream:
  - <https://github.com/anomalyco/opencode/issues/47665>
  - <https://github.com/anomalyco/opencode/issues/55171>
  - <https://github.com/anomalyco/opencode/issues/59554>

## Apéndice — comportamiento exacto para screenshots

- Footer en home: `/root`, `/root/projects`,
  `/root/projects/webapp:main` (el sufijo de branch aparece cuando hay VCS).
- Título del selector: `Change directory: <ruta>`.
- Placeholder: `Search directories…`.
- Primera fila: `Use this directory` con la ruta absoluta actual.
- Segunda fila: `..` con la ruta padre (salvo en `/`).
- Filas de directorio: `<basename>/` con la ruta absoluta como descripción.
- Filas de autocompletado: rutas relativas como `projects/webapp/`.
- Copy de error (comportamiento viejo): `Failed to change directory — Location
  not found: C:\root\projects`.
