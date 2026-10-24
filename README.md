# VERDARA · seed company website (design demo)

A multi-page concept site for a wholesale seed supplier. The brand, products and texts are invented samples; swap them for a real company later.

**Pages:** home (scroll-driven 3D story: seed, roots, shoot, harvest, with the weather of the current month), catalogue (176 crops and 427 sample varieties in 11 broad groups: leafy greens, cabbage family, fruit vegetables, fruits and nuts, roots and bulbs, cereals, legumes, oil and industrial crops, forage, herbs and spices, flowers), product page (light 3D packet, sowing guide), sowing calendar (3 climate zones), about, quote request, privacy policy.

**The season engine** (`js/season.js`): it reads today's month (or a month picked in the preview selector, or `?month=1..12` in the address) and, for the chosen climate zone, works out which crops are to be sown, started under cover, in harvest or about to be sown. The featured varieties on the home page, the counters, the "Sow now" badges on every card, the calendar highlights and the hero weather (snow, petals, pollen, falling leaves) all follow it, so the site changes by itself every month.

**Quote flow:** no prices and no online payment. Every product has a "Request price" button that adds its name to the quote box; the visitor can also type any product name freely. "Send on WhatsApp" opens a prepared message.

**Languages:** Turkish, English, French, Arabic. The layout never mirrors: it stays left-to-right in every language (Arabic text itself still reads right-to-left inside its blocks).

**Light by design:** the colours never follow the device's or browser's dark mode (`color-scheme: only light`, dark-reader lock, forced-colors off).

## Make it a real client's site
- `js/brand.js`: name, WhatsApp number, e-mail.
- `js/crops.js`: the crop table (names in four languages, varieties, colours, sowing profile).
- `js/data.js`: groups, traits, planting windows.
- `js/i18n.js`: all texts in four languages. `privacy.html` text lives there too (keys `pv.*`) and must be reviewed by the company's legal advisor.

## Run locally
Static files only: `python -m http.server 4310` and open http://localhost:4310

## Performance notes
- three.js is vendored; everything in 3D is procedural (no model files).
- The hero scene mounts when it is near the viewport, stops rendering when hidden, and is fully disposed (GPU memory freed) when far away.
- The catalogue adds cards in chunks while scrolling; seed-packet pictures are drawn on demand and their memory is released when scrolled far past.
- Reduced-motion or no-WebGL visitors get a static layout.

Built by MOHAMMED Web Studio.

## Hero: looping video, one screen (2026-10-24)
The hero is one screen: the first headline over a light looping video (`assets/hero/loop-desktop.mp4` 1920x1080, `assets/hero/loop-phone.mp4` 720 wide, about 15 s, roughly 1-6 MB), rendered offline from the live 3D scene at constant speed (no stops, no easing) and looped with a short cross-dissolve from the end of the journey back into its start, so it repeats with no cut. It has nothing to do with scrolling: `js/hero-video.js` sets it to `loop`, plays it while the hero is on screen, pauses it as soon as the hero leaves the viewport and removes the source (frees the memory) when the visitor is far from the hero. Scrolling is plain native scrolling. The poster (first frame of the loop) stays until the video plays (and on browsers that block autoplay, such as iPhone Low Power Mode, until the first touch). `?hero=off`, data-saver and reduced motion keep the still poster. Earlier versions: tall pinned story with the looping video, four-stop clips (`_clips_four_stop_version/`), image sequence, live 3D (`_live3d_version/`, git history). Re-render with `_hero_video_tools/capture_loop.py` (original 3D versions are extracted to C:\l3d\<site> with git archive) then `encode_loop2.py`.
