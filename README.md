# Metronome

An offline metronome web app for iPhone. You add it to your Home Screen from Safari,
so it doesn't need the App Store, an Apple ID or a developer account.

## Install on your iPhone

**Easiest: from the web.** Open **https://tz0fm.github.io/metronome/** in Safari,
tap **Share → Add to Home Screen**, and open it once from the new icon. After that it
works offline.

**Alternative: from your Mac on the local network** (no internet needed):

1. On the Mac: `npm start` (or `node serve.mjs`). Your iPhone needs to be on the same Wi-Fi.
2. On the iPhone, in Safari, open the setup URL the server prints, e.g. `http://YourMac.local:8080`.
3. Follow the steps on that page: install and trust the local certificate, open the app
   over HTTPS, then **Share → Add to Home Screen**.
4. Open it once from the Home Screen icon. After that it works offline, and the Mac
   doesn't need to be running.

**Why a certificate?** iOS only allows offline web apps on HTTPS. On first run,
`serve.mjs` creates a private certificate authority in `.certs/`. That CA is
name-constrained to `*.local`, `localhost` and private IP ranges, so it can't be used
for other websites. Keep `.certs/ca.key` private. If you delete `.certs/`, a new CA
is generated and you have to install it on the phone again.

## Features

- Accurate timing: clicks are scheduled ahead on the Web Audio clock, not with JS timers
- 20–300 BPM via slider, ± buttons (hold to repeat), dragging the number, or tap tempo
- 1–12 beats per bar; tap a beat dot to cycle **accent → normal → muted**
- Subdivisions: quarter notes, eighths, triplets, sixteenths
- Three sounds (Click, Wood, Beep) and a volume control
- Plays even with the ring/silent switch on (iOS 17+), keeps the screen awake while running
- Settings are saved on the device
- **Rhythms** tab: a rhythm guide with 18 food-word rhythms. Tap one to loop it at the
  current tempo, with the syllables and notes highlighted in time and an optional beat click.
  The rhythms are defined in the `RHYTHMS` table in `app.js` (durations in sixteenths)
  and the notation is drawn from that data, so adding a rhythm is one line.
- **Practice** tab: play along on your instrument, in one of two views (switch with **View**;
  the tab reopens the one used last). Listening, Calibrate and Timing work in both.
  **Now & Next** view: after a 4-click count-in, random rhythms
  follow each other. It shows the pattern to play **now** (notes light up when to play them)
  and the **next** one. You only hear the beat click (accented on each new pattern) unless
  **Guide** is on. Options: repeat each pattern 1×/2×/4×/8×, and level (Easy = no sixteenths,
  Medium = no runs of four sixteenths, dotted, syncopated or triplet rhythms, All).
  **Listen to my strumming** uses the microphone to time your strums against the notes and
  shows a live percentage (last 16 notes), how early or late each strum was, and a session score.
  **Timing** sets how strict: Strict (full marks within 20 ms of the note, none from 100 ms),
  Normal (30 / 150 ms, the default) or Relaxed (40 / 200 ms). Missed notes and extra strums count as 0.
  Tap **Calibrate** once (strum on 8 clicks) so the phone's audio delay is measured and subtracted.
  Calibration ignores clicks the microphone picks up itself (measured during its count-in) and
  picks the strum's onset with the same rule as scoring, so the two can't disagree.
  Below the session score, the average offset is shown separately for notes **on clicks** and
  **between** them: late everywhere suggests recalibrating; late only between clicks is your timing.
  Strum detection (spectral flux) runs in an AudioWorklet, `onset-worklet.js`. If the microphone
  hears the app's own click (machine-exact timing in the count-in), those onsets are filtered out.
  Tap the Timing card (Details) to show a diagnostic list of the onsets heard in the current or last run and how each was classified.
- **Scroll** view (Practice tab): sight-reading. Random one-beat food groups (Cheese, French Toast, Apple
  Juice, Hamburger, Watermelon, Chocolate (triplet), Bacon, Eggs and, Waffles and) scroll past a
  playhead. Each beat reaches the line exactly when it's due, and the notes light up as they
  sound. It shows at most one bar ahead, with the emoji centred above each beat. Options: meter 2/4 / 3/4 / 4/4, level, Guide, and a Notes only checkbox (hides the emoji and labels). The groups are defined in `CELLS`
  in `app.js`, in ticks of 1/12 beat so triplets and dotted notes fit.

## Updating the app

Edit the files in `public/`, bump `VERSION` in `public/sw.js`, commit, then publish:

```
git push            # save the source on GitHub
npm run deploy      # publish public/ to GitHub Pages (live within a minute or two)
```

Phones check for a new version whenever the app is opened or brought back to the front
with internet access. Once it has downloaded, the app reloads itself (or, if it's playing,
right after Stop). The running version is shown at the bottom of the Metronome tab.

## Files

- `public/`: the app (`index.html`, `app.js`, service worker, manifest, icons)
- `serve.mjs`: local HTTPS server and one-time setup page (Node 18+, no dependencies)
- `tools/make_icons.py`: regenerates the icons (Python stdlib + macOS `sips`)

## Limitations

- Each bar is rendered into an audio buffer that loops on the audio thread, so timing
  stays exact in the background even though iOS throttles JavaScript there. The beat
  display and tempo changes only update while the app is in the foreground.
- If you install from the `.local` address, the app keeps working when your Mac's IP changes.
