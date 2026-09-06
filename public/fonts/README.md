# Brand typefaces — Grift & Rockwell

The design spec uses two licensed faces. Neither licence is redistributable, so
no font files are committed here.

| Role                            | Spec face | Free fallback in use |
| ------------------------------- | --------- | -------------------- |
| Hero headline (`--font-display`)| Rockwell  | Rokkitt              |
| Body, buttons, nav (`--font-sans`)| Grift   | Urbanist             |

Rockwell ships with Microsoft Office, so it is picked up via `local()` on many
Windows machines; everyone else sees Rokkitt, a slab serif drawn after Rockwell.
To serve the real thing to everyone, self-host it the same way as Grift below.

## Grift

### To self-host

1. Export/convert the licensed files to `woff2`.
2. Drop them in this folder using these exact names:

   - `grift-400.woff2`
   - `grift-500.woff2`
   - `grift-600.woff2`
   - `grift-700.woff2`
   - `grift-800.woff2`

3. In `src/app/globals.css`, extend each `@font-face` src, e.g.

   ```css
   src: local('Grift Bold'), url('/fonts/grift-700.woff2') format('woff2');
   ```

Nothing else needs to change — `--font-display` and `--font-sans` already list
`Grift` first, with **Urbanist** (loaded via `next/font`) as the metric-compatible
fallback in the meantime.
