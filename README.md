# Shawarma – React Native (Expo) food ordering app

Expo SDK 58 · Expo Router · TypeScript · Reanimated · Zustand (persisted to AsyncStorage)

## Run it

```bash
npm install
npx expo start        # press i / a, or scan the QR with Expo Go
```

Demo login: `demo@shawarma.app` / `demo1234` (or sign up, or "Browse as guest").
Promo codes: `SHAWARMA10` (10%), `FIRSTWRAP` (15%).

## What's in it

| Area | Details |
|---|---|
| Onboarding | 3-slide pager, shown once |
| Auth | Login (validation, keep-me-signed-in, loading state), sign up, forgot password, Google/Apple buttons, guest mode |
| Home | Address picker entry, live search, arc category chips, staggered product grid, quick-add |
| Product detail | Size, extras, note, quantity, price with discount, save |
| Cart | Quantity stepper (trash at 1), promo code, delivery fee/free-delivery rule, tab badge, checkout |
| Checkout | Requires login (guests are sent to login, cart is kept), order confirmation, order history with demo status |
| Saved | Bookmarked items |
| Support chat | Scripted demo bot (knows your latest order) |
| Profile | Account, addresses, orders, notifications, log out |
| Address picker | Select / add / remove, Home / Work / Other |

## What is mocked (swap before shipping)

- `src/services/auth.ts` – on-device accounts in AsyncStorage. Replace each function with a call to your Express API, keep the signatures. Google/Apple sign-in are stubs: use `expo-auth-session` / `expo-apple-authentication` and send the token to your API.
- `src/data/menu.ts` – local menu. Move to an API when ready.
- Order placement (`app/(tabs)/cart.tsx`) and order status (`orderStatus` in `src/store/index.ts`) are simulated.
- Chat replies (`reply()` in `app/(tabs)/chat.tsx`) are keyword-based.
- Food photos: plates use emoji. Add images to `assets/` and set `image: require(...)` on a product.
- No "use my current location" in the address picker (needs `expo-location` + reverse geocoding).

## Structure

```
app/            routes (Expo Router)
  (tabs)/       home, chat, cart, saved, profile
  product/[id]  detail
src/components  shared UI (CategoryArc, FloatingTabBar, ProductCard, ...)
src/store       zustand stores (auth, cart, favs, addresses, orders, chat)
src/utils       pricing, validation, money (change CURRENCY here)
```
