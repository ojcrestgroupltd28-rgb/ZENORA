# ZENORA — e-commerce starter

A responsive, black-and-gold storefront inspired by the supplied ZENORA logo. This is a **working starter/MVP**, not a claim that every enterprise feature in the specification is already production-ready.

## Requirements
- Node.js 20+
- PostgreSQL database
- Paystack test account for checkout testing

## Run locally
1. Install Node.js and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. In this folder run:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed
   npm run dev
   ```
4. Open `http://localhost:3000`.

If you do not have a database configured yet, the storefront and cart UI still render; database-backed product and checkout endpoints need a valid `DATABASE_URL`.

## Push to GitHub
Create a repository on GitHub, then:
```bash
git init
git add .
git commit -m "Build ZENORA ecommerce starter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zenora-ecommerce.git
git push -u origin main
```
Never commit `.env` or real secret keys.

## Included
- Responsive storefront with logo branding, search, categories, hero banner, deals, product cards, cart drawer, wishlist toggles and newsletter UI.
- Product API backed by Prisma/PostgreSQL.
- Database schema for users, categories, products, variants, carts, orders, order items, coupons, reviews, wishlists and support tickets.
- Server-side Paystack transaction initialization and server-side verification endpoints.
- Server-side price lookup before checkout initialization.
- Seed products for local UI development.

## Important production work before accepting real orders
This starter is not a complete audited marketplace. Before launch, add and test:
- Real authentication (e.g. Auth.js or a vetted identity provider), email verification, password reset, rate limiting and session management.
- Server-side inventory reservation and atomic order/payment state transitions; idempotency and webhook signature verification.
- Fulfilment/shipping integrations, tax rules, refund workflows, customer emails/SMS/push, image uploads/CDN, moderation and customer support operations.
- Admin dashboard with role-based access controls and audit logs.
- Privacy policy, terms, returns policy, cookie/privacy controls and security review.
- Production database backups, monitoring, logging, error reporting and load testing.

## Paystack safety
Only `PAYSTACK_SECRET_KEY` belongs in server environment variables. Do not expose it with a `NEXT_PUBLIC_` prefix. This project initializes payments on the server and provides a verification endpoint. Verify transactions server-side and use Paystack webhooks for reliable asynchronous payment status updates before marking orders paid. Test with Paystack test credentials first.


## Admin dashboard preview
Once the app is running, visit `http://localhost:3000/admin`.

The dashboard includes overview cards, illustrative sales charts, recent orders, order status controls, product list management, CSV export, category overview, and an add-product modal. The dashboard's sample data is currently local UI state and is not persisted. It is **not protected by authentication yet**; do not expose `/admin` publicly or use it for live store operations until you implement server-side admin authentication, role checks, and database-backed CRUD endpoints. Dashboard KPI figures are sample display data, not live analytics.
