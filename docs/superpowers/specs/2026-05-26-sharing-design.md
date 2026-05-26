# Sharing & Recruiting Design

## Goal

Let users share their score and group invite code to WhatsApp, Instagram Stories, and any other app via the native share sheet. Tapping "Compartir" generates a branded image card and opens the OS share dialog — one tap to brag and recruit. Also works before the World Cup starts as a pure group recruit card.

## Placement

Share button appears in three places:

1. **Dashboard** — next to the rank/points display
2. **LeaderboardPage** — on the current user's highlighted row
3. **GroupLeaderboard** — on the current user's row inside a group

## Share Card Design

Fixed dimensions: **400 × 600 px**, vertical format (Instagram Stories / WhatsApp friendly).

**Typography:** Bebas Neue for large display text (points, group name, invite code); Noto Sans for body labels and taglines — same fonts as the app.

**Visual style:** Colorful gradient background (`linear-gradient(135deg, #2563EB, #7C3AED, #E8351E, #F59E0B)`) with decorative geometric blobs (colored circles and a rotated square at the corners). White card (`border-radius: 14px`, drop shadow) floats in the center. Bold black text inside the card. **QUINIELA 26** wordmark (black pill, white "QUINIELA", red "26") anchors the bottom of the card. Matches the brand's social media aesthetic.

### Three variants

#### 1. Score-only (Dashboard + global Leaderboard, after matches played)

```
¿Crees que me puedes ganar?      ← tagline, small uppercase

[display_name] lleva
[points] pts                      ← Bebas Neue, large
Lugar #[rank]  ·  [correct] de [total] ✓

[QUINIELA 26 wordmark]
```

#### 2. Score + invite (Group Leaderboard, after matches played)

```
¿Crees que me puedes ganar?

[display_name] lleva
[points] pts
Lugar #[rank]  ·  [correct] de [total] ✓

┌─ Únete con el código ─┐
│       ABC-123         │   ← Bebas Neue
└───────────────────────┘

[QUINIELA 26 wordmark]
```

#### 3. Pre-match recruit (Group Leaderboard, before any matches played — points === 0 or null)

```
¿Te animas a la quiniela?        ← different tagline

Únete a
[Group Name]                     ← Bebas Neue, large

┌─ Código de grupo ─┐
│     ABC-123       │
└───────────────────┘

[QUINIELA 26 wordmark]
```

**Variant selection logic:**
- `groupName` + `inviteCode` present, `points > 0` → Score + invite (variant 2)
- `groupName` + `inviteCode` present, `points === 0 or null` → Pre-match recruit (variant 3)
- No `groupName` / `inviteCode` → Score-only (variant 1)

## Share Action

When the user taps "Compartir":

1. `useShareCard` renders `<ShareCard />` off-screen (position absolute, outside viewport)
2. `html2canvas` captures the card div as a PNG blob
3. Try `navigator.share({ files: [pngFile], text, url })` — works on iOS Safari + Android Chrome
4. If `canShare({ files })` is false, fall back to `navigator.share({ text, url })` — text + link only
5. If `navigator.share` is not available at all, fall back to `navigator.clipboard.writeText(text)` with a "¡Copiado!" toast

**Share text (with score):** `"¿Crees que me puedes ganar? Llevo [points] puntos en el lugar #[rank]. Juega Quiniela 2026 — [url]"`

**Share text (pre-match):** `"¿Te animas a la quiniela? Únete a [groupName] con el código [inviteCode]. Juega Quiniela 2026 — [url]"`

URL shared: the app's production URL (`https://quiniela-2026.netlify.app`)

## New Files

| File | Responsibility |
|---|---|
| `src/components/Sharing/ShareCard.jsx` | Off-screen card component, renders all three variants based on props |
| `src/hooks/useShareCard.js` | html2canvas capture + Web Share API + fallback chain |
| `src/components/Sharing/ShareButton.jsx` | Button UI, wires hook + card, shows loading state and toast |

## Modified Files

| File | Change |
|---|---|
| `src/components/Dashboard/Dashboard.jsx` | Add `<ShareButton>` with score data from `useLeaderboard` |
| `src/components/Leaderboard/LeaderboardPage.jsx` | Add `<ShareButton>` on the current user's row |
| `src/components/Groups/GroupLeaderboard.jsx` | Add `<ShareButton>` on the current user's row, pass `groupName` + `inviteCode` |

## Component Props

### ShareCard

```jsx
<ShareCard
  displayName="Paola"
  rank={2}                              // null before any matches
  points={30}                           // 0 or null before any matches
  correctPredictions={3}
  totalMatches={5}
  groupName="Los Amigos de Paola"       // optional — enables group variants
  inviteCode="ABC-123"                  // optional — enables group variants
/>
```

Card is rendered off-screen: `position: absolute; left: -9999px; top: -9999px`.

### ShareButton

```jsx
<ShareButton
  displayName="Paola"
  rank={2}
  points={30}
  correctPredictions={3}
  totalMatches={5}
  groupName="Los Amigos de Paola"   // optional
  inviteCode="ABC-123"               // optional
/>
```

Shows a 📤 icon button. While capturing/sharing, shows a spinner. On clipboard fallback, briefly shows "¡Copiado!" tooltip.

**Visibility rules:**
- On Dashboard/Leaderboard: always visible (pre-match users just won't have a score, but the button is hidden if `rank` is null and no group context)
- On GroupLeaderboard: always visible — pre-match shows recruit variant, post-match shows score+invite variant

## Data Sources

- **Dashboard**: `useLeaderboard()` returns `{ userEntry: { rank, total_points, correct_predictions } }`. `useAuth()` returns `display_name`. If `userEntry` is null, ShareButton is hidden.
- **LeaderboardPage**: same hooks, already rendered on that page.
- **GroupLeaderboard**: member list already loaded; current user's row has rank, points, correct count. `inviteCode` and `groupName` come from the group object passed down from `GroupsPage`.

## Dependencies

- `html2canvas` (npm install) — client-side DOM-to-canvas capture
- Web Share API — native, no install required
- Clipboard API — native fallback

## Testing

- `ShareCard` renders correctly for all three variants
- `ShareButton` calls `share()` on click
- `useShareCard` falls back gracefully when `navigator.share` is unavailable (mock in tests)
- No regressions in Dashboard, LeaderboardPage, GroupLeaderboard

## Empty / Loading States

- ShareButton hidden on Dashboard/Leaderboard if `userEntry` is null (user has made no predictions)
- ShareButton on GroupLeaderboard always visible (shows pre-match recruit card if no score yet)
- `sharing: true` disables the button and shows a spinner to prevent double-taps
