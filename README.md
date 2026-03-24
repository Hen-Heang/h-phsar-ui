# Getting Started with H-Phsar Commerce

H-Phsar Commerce is currently running on Next.js (App Router shell) with a legacy React Router app mounted inside.

## Introduction of H-Phsar Commerce
H-Phsar Commerce is a stock and order management platform for distributors and retailers.

## Technologies
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/docs/installation)
- [React Redux](https://redux.js.org/)
- [React Router DOM](https://reactrouter.com/) (legacy in-app routing during migration)

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` (or the next available port shown in terminal).

## Build

```bash
npm run build
npm run start
```

## Features
H-Phsar Commerce has two main account roles: Distributor and Retailer.

- Authentication: users can register and log in using email verification/OTP flow.

### Distributor features
- Search distributors and products, and manage stock efficiently.
- Create/update store profile.
- Create categories and products.
- Import product quantities.
- Manage order lifecycle (accept/reject, preparing, dispatching, confirmation).
- Update/delete/list products.

### Retailer features
- Browse distributors and products.
- Bookmark products and stores.
- Create draft carts and checkout later.
- Track order status and order history.

## Pending tasks
- Implement real-time notifications.

## Branch strategy
- Main branch: `main`

## Notes
This project originated as a collaborative team project and is now maintained and extended as **H-Phsar Commerce**.
