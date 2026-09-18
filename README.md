# Golden Strands Showcase

Build "Hair by Gold" — a frontend-only scaffold (no backend, no auth logic, no real payments — UI/mock data only) for a wigs & hair products e-commerce platform. Focus on a beautiful, modern, aesthetically appealing design (elegant, premium beauty-brand feel — think gold accents, warm neutral palette, nice typography) with smooth navigation using React Router and skeleton loaders throughout for a polished, modern feel.

Pages/features to scaffold (UI only, static/mock data, no backend wiring):
1. Authentication screens: Login, Signup, Forgot Password (forms with validation UI, no real auth)
2. Explore page: browse/grid of wigs & hair products with categories, filters, search bar, product cards with images, skeleton loaders while "loading"
3. Communication: a Chat page/section UI (conversation list + chat window) with mock conversations/messages
4. Payments: a checkout/cart flow UI and a payment method screen (mock, no real payment processing)
5. Settings page: profile info, account settings, preferences sections (UI only)
6. Plus supporting pages as needed: Home/landing page, product detail page, navigation (header/footer or bottom nav), 404 page

Use React Router for navigation between all these pages. Add skeleton loaders on data-heavy views (explore/product grid, chat list, order/payment history) to simulate loading states. Keep everything frontend-only for now — no backend, no real authentication, no real payment integration. Use placeholder/mock data throughout.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hairbygold.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/accbcf4e-1094-44ef-a202-2015cb85d857).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
