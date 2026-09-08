# Culé — your life in blaugrana

## Objective
Build a distinctive, responsive Barcelona fan experience inspired by the birthday-driven storytelling at https://passmode.shop/numbers/. The user has authorized a new implementation and creative direction. The working directory was empty.

## Experience and acceptance criteria
- A memorable editorial landing page using warm paper, deep navy, blaugrana, expressive type, and an original football graphic.
- A birthday form changes the match statistics, results mosaic, first archived match, manager, player peer, trophy cabinet, and memorable nights.
- Results come from actual FC Barcelona men's first-team LaLiga fixtures. Coverage is explicitly displayed; unavailable history is never estimated.
- Trophy dates and historical milestones are curated separately, with source links and a dated cutoff.
- A default example is clearly identified. Invalid and future dates have useful errors. The birth date remains in memory and is never sent to a server.
- Users can inspect individual results, filter the mosaic, open methodology, and download a personal image card.
- Keyboard access, reduced motion, no horizontal overflow from 320px upward, and readable mobile layouts.

## Stack and structure
React, TypeScript, Vite, plain CSS, Lucide icons, locally bundled fonts. No backend or API keys are needed.
`src/components/`: focused UI sections. `src/data/`: checked-in records and provenance. `src/lib/`: date and statistics functions. `tests/`: behavior and browser checks. `scripts/`: reproducible import and verification utilities.

## Commands
`npm install`; `npm run dev`; `npm run build`; `npm test`; `npm run test:browser`.

## Code style
Use named TypeScript types, pure data calculations, semantic HTML, and shared CSS tokens. Example: `const wins = matches.filter((match) => match.result === 'W').length`.

## Testing strategy
Vitest verifies real date validation, filtering boundaries, home/away score normalization, and trophy counts. Browser checks cover the primary form journey, invalid dates, filters, modal keyboard behavior, export, desktop/mobile layouts, and console errors. A production build includes TypeScript checking.

## Boundaries
Always preserve truthful data labels, use sourced records, and verify the build. Public launch, paid services, and external posting require a separate instruction. Never invent missing statistics, copy the reference's implementation, transmit birthdays, or introduce analytics.

## Build order
1. Import and verify the historical archive; establish the build and calculation tests.
2. Build the landing page and end-to-end birthday journey.
3. Add interactive archive, trophy cabinet, and image export.
4. Verify behavior, accessibility, responsive screenshots, and document the result.
