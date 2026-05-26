# Sharing & Recruiting Design

## Goal

Let users share their score and group invite code to WhatsApp, Instagram Stories, and any other app via the native share sheet. Tapping "Compartir" generates a branded image card and opens the OS share dialog — one tap to brag and recruit.

## Placement

Share button appears in three places:

1. **Dashboard** — next to the rank/points display, score-only card
2. **LeaderboardPage** — on the current user's highlighted row, score-only card
3. **GroupLeaderboard** — on the current user's row inside a group, card includes group name + invite code

## Share Card Design

Fixed dimensions: **400 × 600 px**, vertical format (Instagram Stories / WhatsApp friendly).

**Visual style:** Colorful gradient background (`linear-gradient(135deg, #2563EB, #7C3AED, #E8351E, #F59E0B)`) with decorative geometric blobs (colored circles and a rotated square at the corners). White card (`border-radius: 14px`, drop shadow) floats in the center. Bold black text inside the card. **QUINIELA 26** wordmark (black pill, white "QUINIELA", red "26") anchors the bottom of the card. Matches the brand's social media aesthetic.

### Score-only variant (Dashboard + global Leaderboard)

```
¿Crees que me puedes ganar?

[display_name] lleva
[points] pts
Lugar #[rank]  ·  [correct] de [total] ✓

Quiniela 2026
```

### Group variant (Group Leaderboard)

```
¿Crees que me puedes ganar?

[display_name] lleva
[points] pts
Lugar #[rank]  ·  [correct] de [total] ✓

──────────────────────
Únete con el código
[INVITE-CODE]
──────────────────────

Quiniela 2026
```

## Share Action

When the user taps "Compartir":

1. `useShareCard` renders `<ShareCard />` off-screen (position absolute, outside viewport)
2. `html2canvas` captures the card div as a PNG blob
3. Try `navigator.share({ files: [pngFile], text, url })` — works on iOS Safari + Android Chrome
4. If `canShare({ files })` is false, fall back to `navigator.share({ text, url })` — text + link only
5. If `navigator.share` is not available at all, fall back to `navigator.clipboard.writeText(text)` with a "¡Copiado!" toast

Share text: `"¿Crees que me puedes ganar? Llevo [points] puntos en el lugar #[rank]. Juega Quiniela 2026 — [url]"`

URL shared: `https://quiniela-2026.netlify.app` (or the app's production URL)

## New Files

| File | Responsibility |
|---|---|
| `src/components/Sharing/ShareCard.jsx` | Off-screen card component, renders both variants based on props |
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
  rank={2}
  points={30}
  correctPredictions={3}
  totalMatches={5}
  groupName="Los Amigos de Paola"   // optional — triggers group variant
  inviteCode="ABC-123"               // optional — triggers group variant
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

## Data Sources

- **Dashboard**: `useLeaderboard()` already returns `{ userEntry: { rank, total_points, correct_predictions } }` and `useAuth()` returns `display_name`. `correct_predictions` is used for the "X de Y" display; `total_predictions` (total matches the user has predicted on) comes from `userEntry` as well — if unavailable, the "de Y" portion is omitted from the card.
- **LeaderboardPage**: same hooks, already rendered on that page.
- **GroupLeaderboard**: member list already loaded; current user's row has rank, points, correct count. `inviteCode` comes from the group object passed from `GroupsPage`.

## Dependencies

- `html2canvas` (npm install) — client-side DOM-to-canvas capture
- Web Share API — native, no install required
- Clipboard API — native fallback

## Testing

- `ShareCard` renders correctly for both variants (score-only and group)
- `ShareButton` calls `share()` on click
- `useShareCard` falls back gracefully when `navigator.share` is unavailable (mock in tests)
- No regressions in Dashboard, LeaderboardPage, GroupLeaderboard

## Empty / Loading States

- If `rank` is null (user has no predictions yet), ShareButton is hidden — nothing to brag about
- `sharing: true` disables the button and shows a spinner to prevent double-taps
