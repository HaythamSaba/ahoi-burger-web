# Ahoi Burger!

A web app for the Ahoi Burger restaurant: an overview of all burgers and drinks, and a detail page for each item. The data is fetched from the provided `restaurant.json`.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript (strict)** and **Tailwind CSS v4**.

## Getting started

Requirements: Node.js 20+.

```bash
npm install
npm run dev        # development server on http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Lint and tests:

```bash
npm run lint
npm test           # unit tests for the mapper and formatting (Vitest)
```

## Platforms

The challenge asks for at least two platforms. This submission implements **web only**. I chose to spend the available time on one platform done properly (data layer, states, accessibility, responsiveness) rather than two platforms done partially.

The architecture is set up so a second platform could reuse the same ideas: the domain model (`src/lib/models.ts`) and the mapping rules (`src/lib/mapper.ts`) are plain TypeScript with no React or Next.js dependency. A React Native app could reuse them directly; a native iOS/Android app would port the same model and mapping rules to Swift/Kotlin.

## Architecture

```
src/
├── lib/
│   ├── dto.ts       # Types that mirror the raw JSON exactly (snake_case, optional fields)
│   ├── models.ts    # Clean domain models used by the UI (Burger, Drink, Restaurant)
│   ├── mapper.ts    # DTO -> domain model: validates values, IDs, availability, defaults
│   ├── api.ts       # Fetches restaurant.json (cached, revalidated every 5 minutes)
│   ├── format.ts    # Pure display helpers (price, weight, capitalization)
│   └── *.test.ts    # Unit tests for the mapper and format helpers
├── components/
│   ├── BurgerCard.tsx      # Burger card on the overview
│   ├── DrinkCard.tsx       # Drink tile in the horizontal drinks row
│   └── MenuItemDetail.tsx  # Shared detail view for burgers and drinks
└── app/
    ├── page.tsx              # Overview
    ├── burgers/[id]/page.tsx # Burger detail
    ├── drinks/[id]/page.tsx  # Drink detail
    ├── loading.tsx           # Loading state
    ├── error.tsx             # Error state with retry (e.g. network failure)
    └── not-found.tsx         # Unknown item / URL
```

Data flows in one direction: **fetch → DTO → mapper → domain model → components**. All API quirks (mixed naming, different shapes for burgers and drinks, missing fields) are handled in the mapper, so the components only deal with a consistent model. The mapper also checks every value at runtime, because the TypeScript types can't guarantee what the server actually sends.

All pages are React Server Components: the data is fetched on the server and the browser receives ready HTML. The only client component is the error boundary, which Next.js requires. Images use `next/image` for responsive sizes and lazy loading.

## Design decisions

- **Mobile-first.** Only iOS mockups were provided, so the layout follows them on small screens.
- **No desktop design was provided.** On larger screens the content is centered with a maximum width, burgers are shown in a 2-column grid, and the drinks row stays horizontally scrollable.
- **Drinks row without a scrollbar.** Like in the mockup, the row scrolls by swiping (or trackpad / keyboard) and the next drink is cut off at the edge to show that there is more.
- **Web conventions over iOS conventions.** The detail page has an iOS-style top bar like the mockup, but navigation uses real links, so the browser back button, deep links and opening in a new tab all work.

## Assumptions

The JSON has several inconsistencies and the mockups don't match the data. These are the assumptions made in the code:

**Data**
- **IDs:** items have no IDs, so the URL ID is derived from the name (`"Big Burger"` → `big-burger`). If two items have the same name, the second one gets a suffix (`big-burger-2`); a name without latin letters or digits falls back to its position (`item-3`). Burgers and drinks have separate URLs, so they can share an ID.
- **Drink prices** have no currency; they are assumed to be **USD**, like the burgers.
- **Prices** are always shown with two decimals (`9` → `9.00 USD`, `7.5` → `7.50 USD`).
- **Drink names** are lowercase in the data (`"Long island ice tea"`) and are shown in title case (`"Long Island Ice Tea"`), as in the mockup.
- **Tags** (`"bacon"`, `"tomatoes"`) are shown as **"Special ingredients"**, capitalized.
- **Allergens** are shown as the codes from the data (`rr, xx, mm`), because no mapping to real allergen names was provided.
- **Missing fields** are hidden instead of shown as empty: e.g. Fish Burger has no weight, so the weight stat is not shown; Coffee has no allergens, so the allergens section is not shown. Vegetarian is only shown when the field exists.
- **Invalid values** (`null`, wrong types, negative prices or weights, empty strings) are treated as missing. Items without a name are skipped, because they can't be shown or linked. If the restaurant has no name, "Menu" is shown.

**Availability**
- A burger is **unavailable** if `in_stock` is `false`, or the current date is before `availableSince` (Unix timestamp in ms) or after `available_until` (ISO date).
- A missing `in_stock` counts as in stock; missing dates mean no time limit; invalid dates are ignored.
- Drinks have no availability data and are always available.
- Availability is evaluated on the server and cached together with the data, so it can be up to 5 minutes out of date.

**Mockups vs. data**
- The mockups use placeholder content that differs from the JSON (address, prices, weights, which burger is unavailable). The app always shows the **real data**. For example, Big Burger is shown as unavailable because its `available_until` is 2021-12-12, and Chicken Burger because `in_stock` is `false`.

## AI usage

<!-- TODO: describe honestly how you used AI tools, e.g.: -->
<!-- - Which tools (e.g. Claude Code) and for which parts (review, debugging, README draft, ...) -->
<!-- - What you wrote yourself and what you reviewed/changed -->
