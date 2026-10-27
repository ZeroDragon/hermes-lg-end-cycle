# hermes-lg-end-cycle 🎵

> [!WARNING]
> **⚠️ PROYECTO DESCONTINUADO**
>
> Hermes Desktop ya incluye un ajuste nativo para el sonido de finalización:
> **Settings → Sounds → "Sonido de finalización"** (*Completion Sound*), donde
> puedes elegir entre varios presets sin instalar nada.
>
> Este plugin ya **no se mantiene** y no se recomienda su instalación. El
> `dist-patch.js` además ya no funciona con las builds actuales de Hermes
> Desktop (la función que parchaba cambió de firma).

---

## Descargar el sonido

El MP3 estilo LG sigue disponible por si quieres usarlo por tu cuenta:

**[`end-cycle.mp3`](https://github.com/ZeroDragon/hermes-lg-end-cycle/raw/main/end-cycle.mp3)** (~157 KB, 128 kbps, 48 kHz, estéreo)

> "Life's Good" — el sonidito de lavadora LG que sonaba al terminar un turno
> de Hermes.

---

<details>
<summary><strong>📖 Documentación original (archivo histórico)</strong></summary>

# hermes-lg-end-cycle 🎵

Plugin auto-contenido para **Hermes Desktop** que reemplaza el chime sintetizado
de finalización de turno por un **MP3 personalizado** con estilo **LG**.

> "Life's Good" — escucha un sonido limpio y agradable cuando Hermes termina
> de procesar tu request, en vez del pitido sintético por defecto.

---

## Cómo funciona

1. **Plugin** (`plugin.js`) — se copia a `~/.hermes/desktop-plugins/lg-end-cycle/`
   y la app lo carga automáticamente. Escucha el evento `message.complete` y
   reproduce el MP3 (embebido inline como data URL — no requiere archivos
   externos).

2. **Patch al dist** (`dist-patch.js`) — silencia el chime built-in de Hermes
   Desktop parchando la función `playCompletionSound` a no-op, para que no se
   escuchen dos sonidos al mismo tiempo.

---

## Instalación

### Rápida (recomendada)

```bash
# Clona el repo
git clone https://github.com/ZeroDragon/hermes-lg-end-cycle.git
cd hermes-lg-end-cycle

# Instala plugin + patch
bash install.sh
```

### Manual

```bash
# 1. Copia el plugin
mkdir -p ~/.hermes/desktop-plugins/lg-end-cycle
cp plugin.js ~/.hermes/desktop-plugins/lg-end-cycle/

# 2. Parcha el bundle (una línea)
node dist-patch.js
```

### Sin patch (solo plugin)

Si prefieres conservar el sonido built-in (escucharás ambos):

```bash
# Solo copia el plugin
mkdir -p ~/.hermes/desktop-plugins/lg-end-cycle
cp plugin.js ~/.hermes/desktop-plugins/lg-end-cycle/
```

---

## Activación

1. Reinicia Hermes Desktop **o** abre la paleta (`⌘K`) → **Reload desktop plugins**
2. El plugin se activa automáticamente (no requiere configuración)

Para verificar que está cargado:

- `⌘K` → Settings → Plugins → deberías ver **LG End Cycle Sound** listado

---

## Desinstalación

```bash
# Quita el plugin
rm -rf ~/.hermes/desktop-plugins/lg-end-cycle

# Restaura el sonido built-in (revertir el patch del bundle)
cd ~/.hermes/hermes-agent
git checkout -- apps/desktop/dist/ apps/desktop/release/
# O si instalaste desde otra fuente, reinstala Hermes Desktop
```

---

## Archivos

| Archivo | Propósito |
| --- | --- |
| `plugin.js` | Plugin Hermes Desktop auto-contenido (~215 KB, MP3 inline) |
| `dist-patch.js` | Script Node.js que silencia el chime built-in |
| `install.sh` | Instalador todo-en-uno (plugin + patch) |
| `end-cycle.mp3` | El sonido original, extraído del plugin para descarga directa |

---

## Requisitos

- **Hermes Desktop** (la app de escritorio Electron, no el CLI ni el gateway)
- **Node.js** ≥ 18 (solo para `dist-patch.js` o `install.sh`; el plugin en sí
  no requiere Node)

---

## Compatibilidad

Probado en Hermes Desktop (macOS). El `dist-patch.js` busca el bundle en
múltiples ubicaciones conocidas:

- `~/.hermes/hermes-agent/apps/desktop/dist/assets/index-*.js` (dev build)
- `~/.hermes/hermes-agent/apps/desktop/release/mac-arm64/...` (release build)
- `/Applications/Hermes.app/Contents/Resources/...` (system install)

Si tu bundle está en otra ruta, pásala explícitamente:

```bash
node dist-patch.js /ruta/completa/a/index-XXXX.js
```

> **Nota (octubre 2026):** en las builds actuales de Hermes Desktop este patch
> ya no encuentra la función objetivo y reporta `No match`. Usa el ajuste
> nativo **Settings → Sounds → Sonido de finalización** en su lugar.

---

## Licencia

MIT — haz lo que quieras con el sonido, el plugin y los scripts.

</details>
