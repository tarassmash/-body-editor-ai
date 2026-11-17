# BodyEdit AI

AI body & style photo editor powered by [fal.ai](https://fal.ai) (FLUX.1 Kontext Pro), built to pass App Store / Google Play review.

## Features
Slim & tone · Muscles (arms / chest / upper body / legs) · Fit waist · Outfit try-on (8 styles) · Height & proportions · Posture · Skin retouch · Tattoo try-on · Tattoo removal. Before/after slider, "keep editing" chaining, EN / UA / RU UI.

## Review-readiness built in
| Requirement | How it's handled |
|---|---|
| No sexual content (Apple 1.1.4, Google Play inappropriate content) | No free-text prompts — only whitelisted presets; every prompt forces "fully clothed, non-sexual"; FLUX `safety_tolerance: 1`; NSFW classifier on input **and** output (fail-closed) |
| User-generated content (Apple 1.2, Google Play UGC) | Content Guidelines, in-app ⚑ Report, support form, 24h review promise, rate limits |
| Age rating / minors | 18+ age gate, consent checkbox before every edit, ban on photos of minors |
| Privacy (Apple 5.1, Play Data safety) | Privacy Policy, photos not stored, EXIF stripped on device, no trackers, data deletion page |
| Account deletion (Apple 5.1.1(v)) | No accounts → not required; `/delete-data` explains deletion of logs/messages |
| Deepfake / deception | "AI-edited" label on downloads, identity-preserving prompts, terms forbid deceptive use |
| Payments (Apple 3.1.1) | Free; terms say future paid features use IAP / Play Billing only |
| Minimum functionality (Apple 4.2) | Real editor, PWA with offline shell — wrap with Capacitor (iOS) or Bubblewrap TWA (Android) |

## Env vars
| Var | Default | |
|---|---|---|
| `FAL_KEY` | — | **required** for real edits (without it the app runs in mock mode) |
| `SUPPORT_EMAIL` | support@example.com | shown on legal pages — set a real one before review |
| `APP_NAME`, `COMPANY_NAME` | BodyEdit AI | |
| `DAILY_LIMIT` | 20 | edits per IP per day |
| `NSFW_THRESHOLD` | 0.3 | block above this probability |
| `EDIT_MODEL` | fal-ai/flux-pro/kontext | |

## Run
```
npm install
FAL_KEY=... npm start   # http://localhost:3000
npm test                # smoke tests in mock mode
```

Pages: `/`, `/privacy`, `/terms`, `/guidelines`, `/support`, `/delete-data` — use these URLs in App Store Connect and Play Console.
