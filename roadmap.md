# Hair by Gold — roadmap (frontend-only scaffold, mock data)

## Foundation
- [x] Gold/warm-neutral design system + display typography
- [x] Mock data (products, conversations, orders, notifications)
- [ ] App shell: header nav, mobile bottom nav, footer, 404
- [ ] Client store for cart / wishlist / notifications (local state only)

## Pages
- [ ] Home / landing
- [ ] Explore: search, categories, sort, filters (price range, hair type, style, availability) + skeletons
- [ ] Product detail (+ favorite toggle)
- [ ] Wishlist page + nav entry
- [ ] Cart (qty +/-, promo code mock validation, summary breakdown)
- [ ] Checkout + payment method screen
- [ ] Order confirmation with tracking timeline
- [ ] Order history with status per order
- [ ] Notifications page (read/unread, mark as read)
- [ ] Chat (conversation list, bubbles, typing indicator, read receipts) + skeletons
- [ ] Auth: Login, Signup, Forgot password (validation UI only)
- [ ] Settings: profile, addresses, change password, preferences (mock "Saved!" state)

## Round 3
- [ ] Global search with autocomplete (header + explore) linking to product detail
- [ ] Dark mode toggle with smooth transition, persisted in localStorage
- [ ] Product reviews: average rating, star ratings, mock reviews, sort controls
- [ ] Accessibility pass: keyboard nav, focus-visible, landmarks, ARIA labels

## Round 4
- [ ] Product variants (color / length / size) with mock availability + price updates
- [ ] Checkout shipping speed options affecting the order summary total
- [ ] Order tracking page with timeline + latest-update card, linked from confirmation & history
- [ ] Help Center: FAQ accordion + support form with validation and mock ticket confirmation

## Round 5
- [x] Canonical gold #d5af59 across light/dark tokens (primary, gold, rings, charts)
- [x] Fix help.tsx / payment.tsx index-signature build errors
- [x] Auth routes: Login, Signup, Forgot password
- [x] Settings route: profile, addresses, change password, preferences
- [x] Official logo asset used in header, mobile drawer, footer, auth pages, favicon
