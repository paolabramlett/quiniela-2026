# Payments Feature Design

## Goal

Gate group creation behind a one-time Stripe payment while keeping the rest of the app (predictions, joining groups, leaderboard) completely free.

## Access Model

| User type | Join groups | Create groups |
|-----------|-------------|---------------|
| Free user | ✓ Up to 10 | ✗ Must purchase |
| Paying user | ✓ Up to 10 | ✓ Up to purchased slots |
| Whitelisted (admin-granted) | ✓ Up to 10 | ✓ 3 free slots |
| Admin (paolabramlett@gmail.com) | ✓ Unlimited | ✓ Unlimited |

## Pricing

All prices are MXN, one-time payments — no subscriptions, no renewals.

- **Pack Inicial — $299 MXN**: Unlocks 3 group creation slots.
- **Grupo Adicional — $99 MXN**: Unlocks 1 extra slot. Can be purchased multiple times.

Stripe Mexico fee: ~3.6% + $3 MXN per transaction.

## User Flow

1. User clicks **+ Crear Grupo** with no available slots.
2. **Paywall modal** appears in-app showing the two pricing options.
3. User clicks **Comprar** → frontend calls `create-checkout` edge function.
4. Edge function creates a Stripe Checkout session and returns the URL.
5. User is redirected to **Stripe hosted checkout**.
6. On success, Stripe sends a webhook to the `stripe-webhook` edge function.
7. Webhook verifies the Stripe signature and upserts `group_credits` in the DB.
8. Stripe redirects user back to `/groups?payment=success`.
9. App shows a **success screen**: "¡Listo! Ya tienes X grupos disponibles."
10. User proceeds to create their group normally.

On payment failure or cancellation, Stripe redirects to `/groups?payment=cancelled` and the paywall modal reopens.

## Database

### New table: `group_credits`

```sql
create table public.group_credits (
  user_id uuid primary key references public.users(id) on delete cascade,
  slots_purchased int not null default 0,
  granted_free boolean not null default false,
  updated_at timestamptz default now()
);
```

- `slots_purchased`: total slots bought via Stripe (3 for pack, +1 per add-on).
- `granted_free`: true if admin manually granted free access (gives 3 slots, no charge).
- Slots used = `count(*) from groups where created_by = user_id`.
- Slots available = `slots_purchased - slots_used` (unlimited if admin or `granted_free`).

### RLS

- Users can read their own row only.
- No user can write directly — only edge functions (service role) write to this table.

## Backend: Edge Functions

### `create-checkout`

- **Auth**: Requires valid JWT (user must be logged in).
- **Input**: `{ product: 'pack' | 'addon' }` in request body.
- **Logic**:
  1. Decode user from JWT.
  2. Create a Stripe Checkout session with the correct price (pack = $299 MXN, addon = $99 MXN).
  3. Set `metadata.user_id` and `metadata.product` on the session.
  4. Set `success_url` = `https://quiniela-2026.netlify.app/groups?payment=success` and `cancel_url` = `.../groups?payment=cancelled`.
  5. Return `{ url: session.url }`.

### `stripe-webhook`

- **Auth**: No JWT — verified via Stripe webhook signature (`STRIPE_WEBHOOK_SECRET`).
- **Input**: Raw Stripe event body + `stripe-signature` header.
- **Logic**:
  1. Verify signature using `STRIPE_WEBHOOK_SECRET`.
  2. On event `checkout.session.completed`:
     - Read `metadata.user_id` and `metadata.product`.
     - Upsert `group_credits`: add 3 slots for `pack`, add 1 slot for `addon`.
  3. Return `200 OK` immediately to Stripe (important — prevents retries).

### Secrets required

| Secret | Description |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_... or sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from Stripe dashboard |
| `STRIPE_PRICE_PACK` | Stripe Price ID for the $299 MXN pack |
| `STRIPE_PRICE_ADDON` | Stripe Price ID for the $99 MXN add-on |

## Frontend Changes

### `useGroups.js`

- Add `fetchCredits()`: reads `group_credits` for current user.
- Expose `slotsAvailable` (int) and `canCreateGroup` (bool) from the hook.
- `createGroup()` checks `canCreateGroup` before proceeding (defense in depth).

### `GroupsPage.jsx`

- Read `slotsAvailable` and `canCreateGroup` from `useGroups`.
- If `canCreateGroup`: clicking **+ Crear Grupo** opens `CreateGroupModal` as before.
- If `!canCreateGroup`: clicking **+ Crear Grupo** opens `PaywallModal` instead.
- Handle `?payment=success` query param: show `PaymentSuccessScreen`.
- Handle `?payment=cancelled` query param: reopen `PaywallModal` with a soft error message.

### New components

#### `PaywallModal`

- Shows both pricing options (pack $299 MXN, addon $99 MXN).
- Addon option is disabled/greyed out if user has 0 slots (must buy pack first).
- "Comprar" button calls `create-checkout` edge function, then redirects to returned URL.
- Loading state while waiting for checkout URL.

#### `PaymentSuccessScreen`

- Brief full-page overlay: "¡Listo! Ya tienes X grupos disponibles."
- Auto-dismisses after 3 seconds or on tap, then opens `CreateGroupModal`.

### Admin panel: Accesos tab

- New tab in the existing admin panel alongside the current results tabs.
- Search field: enter user email to look up their `users` row.
- Shows current credit status (slots purchased, granted_free).
- **Grant free access** button: sets `granted_free = true`, `slots_purchased = max(slots_purchased, 3)`.
- **Revoke access** button: sets `granted_free = false`, `slots_purchased = 0`.

## Error Handling

- If `create-checkout` fails (Stripe API down, invalid product), show an in-modal error: "No pudimos conectar con el sistema de pagos. Intenta de nuevo."
- If webhook arrives but user not found: log and return 200 (don't retry).
- If user navigates to `/groups?payment=success` without a matching DB update (webhook delay): show success screen optimistically; credits will appear within seconds once webhook fires.

## Stripe Configuration

- Create two Products in Stripe dashboard: "Pack Inicial" and "Grupo Adicional".
- Set currency to MXN for both.
- Payment method: card (Stripe handles OXXO, SPEI automatically for MX customers if enabled).
- No recurring billing — one-time payment mode only.

## Out of Scope

- Refunds (handled manually via Stripe dashboard if needed).
- Purchase history UI (Stripe dashboard covers this for now).
- Multiple currency support.
- Promo codes (can be added via Stripe dashboard without code changes if desired).
