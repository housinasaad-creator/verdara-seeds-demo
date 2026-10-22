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

## Hero: live 3D again (2026-10-22)
The hero is the live 3D scene again, a little lighter (lower resolution cap, fewer particles, simpler parts) and released from memory when far away. Devices with 4 cores or fewer, or 2 GB of RAM or less, skip the 3D hero: it becomes one still screen so the first scroll leaves it. Add `?hero=on` or `?hero=off` to force either way. The pre-rendered video version of the hero is kept in `_video_hero_version` (not deployed).
