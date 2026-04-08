# VS Code Extension Shell — Scaffold

Status: **scaffold only**. Not built, not wired into any npm script. When ready to implement, follow the checklist below.

## What this shell will be

A VS Code extension that runs the Study app inside a webview panel. Primary use case: CS students living in VS Code who want to practice math/algorithms without leaving the editor. Pairs well with coding-homework workflows where the tool can show the math behind what they're implementing.

## Architecture

```
┌─────────────────────────────────────┐
│  VS Code extension host (Node)      │
│  - context.globalState              │
│  - fs access to bundled content/    │
│  - vscode.window commands           │
└─────────────────────────────────────┘
              │ postMessage bridge
              ▼
┌─────────────────────────────────────┐
│  Webview panel (browser runtime)    │
│  - Full Study app                   │
│  - @engines, @subjects, @core       │
│  - VS Code platform adapters        │
└─────────────────────────────────────┘
```

The webview **cannot** call Node APIs directly. Every I/O operation (read a lesson, save progress, show a notification) is an async message to the extension host.

## Build checklist

### 1. Extension host (Node side)
- [ ] `src/shells/vscode/extension.ts` — activate() registers a command that opens the webview panel; onDidReceiveMessage dispatches to handlers for `storage.get`, `storage.set`, `content.loadLesson`, etc.
- [ ] `src/shells/vscode/bridge/handlers.ts` — one handler per adapter method; reads from `context.globalState` / `fs.readFile(extensionUri)`.
- [ ] `package.json` (VS Code manifest, separate from project root) — activationEvents, contributes.commands.

### 2. Webview (browser side)
- [ ] `src/shells/vscode/webview/index.html` — CSP-compliant entry, loads main.ts via `<script src={webview.asWebviewUri(...)}>`.
- [ ] `src/shells/vscode/webview/main.ts` — composition root using `createVscodePlatform()` from `@platform/vscode/`.
- [ ] `src/shells/vscode/webview/style.css` — VS Code theme-aware (use `var(--vscode-editor-background)` etc).

### 3. Platform adapters
Replace stubs in `src/platform/vscode/` with real implementations:
- [ ] `storage.ts` — posts `{ type: 'storage.get', key }` to host, awaits response
- [ ] `content.ts` — posts `{ type: 'content.loadLesson', id }` to host
- [ ] `host.ts` — posts `{ type: 'host.openExternal', url }` to host
- [ ] `export.ts` — posts `{ type: 'export.savePNG', blob, filename }` to host; host opens save dialog
- [ ] `tts.ts` — Web Speech API if available in the webview, else subtitle-only fallback
- [ ] `bridge/client.ts` — webview-side message dispatcher with request/response matching by id
- [ ] `bridge/protocol.ts` — shared message type definitions used by both sides

### 4. Build config
- [ ] `vite.config.vscode.ts` — build webview bundle
- [ ] `tsup.config.ts` or similar — build extension.ts as CommonJS for VS Code
- [ ] Copy `content/` into extension package resources
- [ ] `package.json` script: `build:vscode`

### 5. Packaging
- [ ] Publisher ID in package.json
- [ ] `vsce package` to produce .vsix
- [ ] Icons per VS Code requirements

## Known constraints

1. **Webview CSP is strict** — no inline scripts, no eval, no external fetches. Safe under our architecture (we already have no eval).
2. **Webview ↔ host bridge is async only** — adapter calls cross this bridge and must handle latency. Our adapter contract is already fully async, so no engine changes needed.
3. **Webview state is not shared across panels** — if the user closes the webview and reopens, state is reloaded from globalState. Our storage adapter already supports this.
4. **TTS is inconsistent** — Web Speech API may or may not work depending on VS Code version and platform. Plan for no-op fallback.
5. **File system access is host-only** — the webview cannot read content/ directly. All content goes through the bridge.

## When to prioritize this shell

Only after:
- PWA is stable with real users
- Browser extension is shipped
- There is explicit demand from CS students who study math in VS Code

Don't let VS Code constraints shape engine design — if something can't work in VS Code, defer VS Code, don't compromise the core.
