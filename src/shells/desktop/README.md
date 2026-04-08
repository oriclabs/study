# Desktop Shell (Tauri) — Scaffold

Status: **scaffold only**. Not built, not wired into any npm script. When ready to implement, follow the checklist below.

## What this shell will be

A native desktop app for Windows (primary), macOS, and Linux, built with **Tauri** (preferred) or Electron (fallback). Wraps essentially the same code as the PWA in a native window with real file system access.

## Why desktop matters

- **Schools block web apps and extensions** — many school networks aggressively filter `.app` domains and extension stores. A native install sidesteps this entirely.
- **True offline-first** — no service worker gymnastics, no IndexedDB quotas.
- **Teacher-authored content** — real fs access means teachers can drop custom lesson JSON files into a local folder and the app picks them up.
- **Bulk export** — PDF worksheets and formula sheets can be batch-generated and saved to a chosen directory.
- **File associations** — double-click a `.study.json` file to open it in the app.

## Tauri vs. Electron

| | Tauri | Electron |
|---|---|---|
| Installer size | ~10 MB | ~100 MB |
| Memory footprint | Low | High |
| Webview engine | OS native (WebView2 on Windows) | Bundled Chromium |
| Compatibility risk | WebView2 must be present | None |
| Backend language | Rust | Node |
| Code sharing with PWA | Very high | Very high |

**Recommendation:** Tauri first. Fall back to Electron only if WebView2 compatibility on target school machines is a blocker.

## Architecture

```
┌─────────────────────────────────────┐
│  Tauri Rust backend (src-tauri/)    │
│  - File system                      │
│  - SQLite (optional)                │
│  - OS notifications                 │
│  - Native save/open dialogs         │
└─────────────────────────────────────┘
              │ Tauri command bridge
              ▼
┌─────────────────────────────────────┐
│  WebView (same code as PWA)         │
│  - Full Study app                   │
│  - @engines, @subjects, @core       │
│  - Desktop platform adapters        │
└─────────────────────────────────────┘
```

Most of the PWA shell (`src/shells/pwa/`) can be reused directly — only the platform adapters change. Start by symlinking or extending the PWA shell code.

## Build checklist

### 1. Tauri backend (Rust)
- [ ] `src-tauri/Cargo.toml`
- [ ] `src-tauri/tauri.conf.json` — windows, menus, allowlist for fs + dialog + notification + shell
- [ ] `src-tauri/src/main.rs` — Tauri setup, command handlers
- [ ] `src-tauri/resources/content/` — bundle content at build time
- [ ] `src-tauri/icons/` — platform-specific icons (ico, icns, png)

### 2. Frontend adapters
Replace stubs in `src/platform/desktop/` with real implementations using `@tauri-apps/api`:
- [ ] `storage.ts` — `@tauri-apps/api/fs` writing JSON files under `appDataDir()/study/kv/`, or SQLite via a command
- [ ] `content.ts` — `@tauri-apps/api/fs` + `@tauri-apps/api/path.resolveResource('content/...')`
- [ ] `host.ts` — `@tauri-apps/api/shell.open()`, `@tauri-apps/api/notification`, `@tauri-apps/api/os.locale`
- [ ] `export.ts` — `@tauri-apps/api/dialog.save()` + `@tauri-apps/api/fs.writeBinaryFile()`
- [ ] `tts.ts` — Web Speech API (works in WebView2 on Windows; reuse PWA implementation)

### 3. Shell
- [ ] `src/shells/desktop/index.html` — entry point (copy/extend from PWA shell)
- [ ] `src/shells/desktop/main.ts` — composition root using `createDesktopPlatform()`
- [ ] `src/shells/desktop/style.css` — reuse or extend PWA CSS

### 4. Build config
- [ ] `vite.config.desktop.ts` — build the frontend for Tauri to consume
- [ ] `package.json` scripts: `dev:desktop` (tauri dev), `build:desktop` (tauri build)
- [ ] `@tauri-apps/cli` in devDependencies

### 5. Distribution
- [ ] Windows code signing certificate
- [ ] MSI installer config in `tauri.conf.json`
- [ ] Auto-update setup (Tauri updater with signing keys)
- [ ] macOS: notarization if shipping outside Mac App Store
- [ ] Linux: AppImage or .deb

### 6. Teacher content folder feature (desktop-exclusive)
- [ ] Add a "custom content folder" setting in the shell
- [ ] `content.ts` merges bundled resources + user-chosen folder
- [ ] File watcher reloads on changes

## When to prioritize this shell

Build this **third**, after PWA and extension are stable. Reasons:
- Desktop is mostly the PWA code in a native shell — low marginal cost per feature
- Unblocks the school/offline market that PWA + extension can't reach
- File system access enables teacher workflows that other targets can't

Don't build this first — it's the least constraining environment so it won't surface architectural problems the way the extension does.
