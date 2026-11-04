# STARWAVE Studio

A K-pop-inspired, installable music library and player built with HTML, CSS, and vanilla JavaScript.

## Features
- Upload and play audio files stored locally in your browser (IndexedDB)
- Add direct audio URLs for music you own or are licensed to stream
- Search your library, like tracks, create playlists, and manage a queue
- Responsive desktop and mobile layout
- PWA installation on supported Android and Windows browsers
- Basic offline app shell caching

## Run locally
This project uses browser APIs and must be served over `localhost` or HTTPS (not opened as a `file://` page).

### Option A: VS Code
1. Extract this ZIP.
2. Open the `starwave-studio` folder in VS Code.
3. Install the **Live Server** extension.
4. Right-click `index.html` and choose **Open with Live Server**.

### Option B: Python
Run in the project folder:
```bash
python -m http.server 8000
```
Open http://localhost:8000

## Publish on GitHub + Vercel
1. Create a GitHub repository named `starwave-studio`.
2. Upload all files and folders in this project (keep `index.html` in the repository root).
3. In Vercel, choose **Add New → Project**, import the repository.
4. Framework preset: **Other**. Build command: leave empty. Output directory: `.`.
5. Deploy. Your site will be available at a public HTTPS URL.

## Install on Android
1. Open the deployed HTTPS website in Chrome.
2. Open the browser menu (⋮).
3. Choose **Install app** or **Add to Home screen**.

## Install on Windows
1. Open the deployed HTTPS website in Microsoft Edge or Chrome.
2. Use the browser menu → **Apps → Install this site as an app** (Edge), or the install icon in the address bar (Chrome).
3. Pin it to Start or taskbar if desired.

This is a PWA, not a native APK or a standalone Windows Setup.exe. Native packaging can be added later with Capacitor (Android) and Electron or Tauri (Windows).

## Music source and storage notes
- Uploaded files are stored in the browser's IndexedDB on that device. They do not automatically sync to another device and are not uploaded to a server.
- Audio links must be direct, publicly reachable audio file URLs. Some hosts block playback through CORS or hotlink restrictions.
- Use music you created, own, or have permission to stream. This starter does not scrape or redistribute copyrighted songs.
- For real multi-device accounts and cloud music storage, connect a backend such as Supabase and implement authentication, storage policies, and a database. This starter intentionally works without API keys.