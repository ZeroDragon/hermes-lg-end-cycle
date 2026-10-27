# hermes-lg-end-cycle 🎵

Plugin auto-contenido para **Hermes Desktop** que reproduce un sonido de
finalización personalizado (por defecto, el MP3 estilo **LG**) al terminar
cada turno del agente.

> "Life's Good" — escucha un sonido limpio y agradable cuando Hermes termina
> de procesar tu request.

**v3** — sin huella visual: nada anclado al sidebar. Todo se maneja desde la
paleta de comandos (`⌘K`).

---

## Qué hace

- Reproduce tu MP3 cuando se emite el evento `message.complete`.
- El MP3 estilo LG viene **embebido** en el plugin (data URL), funciona
  out-of-the-box.
- Comando `⌘K` → **"Sonido de finalización: configurar MP3…"**: abre una
  página interna (solo existe mientras la usas) donde puedes:
  - **Cargar MP3…** — elige cualquier MP3 de tu equipo (máx. 2 MB).
    Queda guardado en el storage del plugin y sobrevive reinicios.
  - **Probar** — preview del sonido actual.
  - **Restaurar** — volver al MP3 LG incluido.

## Instalación

```bash
git clone https://github.com/ZeroDragon/hermes-lg-end-cycle.git
mkdir -p ~/.hermes/desktop-plugins/lg-end-cycle
cp hermes-lg-end-cycle/plugin.js ~/.hermes/desktop-plugins/lg-end-cycle/
```

Luego, en Hermes Desktop: `⌘K` → **Reload desktop plugins**.

## Importante: silenciar el chime nativo

Si no haces esto escucharás **dos** sonidos. No hay que parchear nada:
Hermes Desktop incluye el preset **None** para su sonido nativo.

**Settings → Sounds → Sonido de finalización → None**

## Requisitos

- **Hermes Desktop** (la app de escritorio Electron, no el CLI ni el gateway).
- No requiere Node.js: el plugin es un solo archivo ESM que la app carga
  directamente.

## Desinstalación

```bash
rm -rf ~/.hermes/desktop-plugins/lg-end-cycle
```

Y en `⌘K` → **Reload desktop plugins**. (Opcionalmente regresa el sonido
nativo en Settings → Sounds.)

## Archivos

| Archivo | Propósito |
| --- | --- |
| `plugin.js` | Plugin Hermes Desktop auto-contenido (~220 KB, MP3 inline + picker) |
| `end-cycle.mp3` | El sonido LG original, para descarga directa |
| `dist-patch.js` | ⚠️ Obsoleto: ya no aplica en builds recientes (la app ahora trae el preset "None") |
| `install.sh` | ⚠️ Obsoleto: instala la v1 con patch; usa la copia manual de arriba |

## Notas técnicas

- La página de configuración se registra en el área `routes` y el comando en
  `palette` — cero paneles, chips o navegación permanente.
- El storage del plugin (`ctx.storage`) guarda el MP3 custom como data URL;
  el límite práctico es de ~2 MB de audio.
- Probado en Hermes Desktop (macOS), octubre 2026.

## Historial

- **v1** — plugin + patch al bundle para silenciar el chime sintetizado.
- **v2** — panel de configuración (pane) para cargar MP3 custom.
- **v3** — sin huella visual: comando en `⌘K` + página bajo demanda; sin
  patch gracias al preset nativo "None".

## Licencia

MIT — haz lo que quieras con el sonido, el plugin y los scripts.
