# Matter Lab — mobile offline app

A small science game for Grade 7. Works on Android and iPhone as a home-screen web app. Once its files are saved, gameplay does not need internet. It is not an APK or an App Store / IPA package.

## 1. Publish with GitHub Pages (teacher)

1. Extract `Matter-Lab-Mobile.zip` on your computer.
2. In GitHub, create a repository, for example `matter-lab`. A public repository works with GitHub Free. The app contains no student names or private data.
3. Use **Add file → Upload files**. Upload the **extracted files**, not the ZIP. Place `index.html`, `sw.js`, `offline.js`, `manifest.webmanifest`, and the three PNG icons together at the repository root. Include `.nojekyll` when your uploader shows it; if omitted, these simple files can still be served by Pages.
4. Commit the upload to `main`.
5. Go to **Settings → Pages**. Under Source, choose **Deploy from a branch**. Choose **main** and **/(root)**, then **Save**.
6. Wait for GitHub's deployment to finish. Copy the HTTPS site link shown in Pages settings. Use the live site link, not the repository page or a `raw.githubusercontent.com` link.
7. Open the site. Wait for **Ready to play offline ✓**. Share the HTTPS site link with students.

No npm, server, build command, or API key is required. Paths are relative, so the app works at a GitHub project URL such as `https://YOUR-USERNAME.github.io/matter-lab/`. That is a URL pattern, not a published link.

GitHub instructions: [Configure a Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [HTTPS for Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

## 2. Install on Android (student)

1. While connected to the internet, open the teacher's HTTPS link in Chrome.
2. Wait for **Ready to play offline ✓**.
3. Tap **Install app**, then **Install** if available. Otherwise use Chrome's menu → **Install app** or **Add to Home screen** (wording varies).
4. Open the new **Matter Lab** icon once while still online. Confirm the offline check has completed. Menu → **Offline app status** also shows the result.
5. You can now play without Wi-Fi or mobile data.

## 3. Install on iPhone / iPad (student)

1. While connected to the internet, open the teacher's HTTPS link in **Safari**.
2. Tap **Share → Add to Home Screen**. Enable **Open as Web App** if offered, then tap **Add**.
3. Open the new **Matter Lab** icon while still online. Wait for **Ready to play offline ✓** in that installed app. The home-screen app must finish its own offline setup.
4. You can now close it and reopen it without internet.

Apple instructions: [Turn a website into an app in Safari](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios).

## What works offline?

- All nine levels and Free play.
- All three beakers, materials, heat/cool controls, and collectors.
- Animations and optional generated sound effects.
- Quizzes, teacher notes, and the notebook for the current level.
- Stars saved locally on that device.

The Science & sources links go to other websites and need internet. The game does not send students' names, scores, or notes to a server.

## Before using it in class

Test once on an actual Android phone and an actual iPhone: install, confirm offline readiness, close the app, turn on airplane mode, reopen it, finish a level, and reopen again to check the star was saved. The supplied package has browser-level offline checks; physical iPhone/Android installation still needs this check.

## If the offline copy is missing

Reconnect, launch Matter Lab, choose **Offline app status**, and use **Retry download**. Internet is required for first installation and for restoring files after app/browser data is cleared or the operating system evicts storage. Clearing data or uninstalling can remove stars. Do not use private/incognito browsing for a classroom installation.

Opening `index.html` from Files or a ZIP is not the cross-platform app installation method. Use the HTTPS GitHub Pages link.

## Updates

Keep the existing repository URL. Upload the entire newly generated package, including its versioned `sw.js`. Already installed copies keep their current offline version until the complete update is downloaded. If an update is waiting, open **Offline app status → Get new version** while online. If manually editing app files, change the `VERSION` value in `sw.js` too; otherwise the offline cache will continue serving the old version. Never change its cache prefix to one shared with another application.

## Files

- `index.html` — the complete game.
- `offline.js` — installation help and verified offline readiness.
- `sw.js` — precaching, offline loading, and update handling.
- `manifest.webmanifest` — home-screen app metadata.
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — app icons.
- `.nojekyll` — GitHub Pages static-file marker.
- `README.md` — these instructions.

Science references remain linked in the game: American Chemical Society, USGS, and OpenStax. The simplified model and its limitations remain available in Science & sources.
