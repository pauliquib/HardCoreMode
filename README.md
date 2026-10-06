# HardCore Mode

A platformer game that runs entirely in the browser (vanilla JS, Canvas, Web Audio API) — no server, no data sent anywhere. It also includes a map editor for creating your own levels.

*Public snapshot — development happens in a private repository; the commit history is squashed here.*

## Screenshots

| Game | Sector selection |
|---|---|
| ![Game](docs/screenshots/game.jpg) | ![Sector selection](docs/screenshots/sectors.jpg) |

| Map editor |
|---|
| ![Map editor](docs/screenshots/editor.jpg) |

## Running

A static web server is enough, for example:

```bash
node dev-server.cjs
```

then open `http://localhost:8765/index.html` (the game) or `http://localhost:8765/editor.html` (the map editor).

## Building the published version

```bash
node build-public.cjs
```

This generates a restricted, publishable version in `public/` (see `publish-config.js`).

## License

MIT, see [LICENSE](LICENSE). Legal and privacy information for the published version: [PUBLIC_LEGAL.md](PUBLIC_LEGAL.md) (in Czech).

Author: Časomil
