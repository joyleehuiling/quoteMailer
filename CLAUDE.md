## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint

---

# QuoteMailer — QS Email Tool

## Stack
- SvelteKit + TypeScript
- Convex (backend + database)
- Tailwind CSS
- shadcn-svelte (UI components)
- Resend (email sending)
- Claude API (AI email drafting)

## Dev commands
- `npm run dev` — start SvelteKit dev server (port 5173)
- `npx convex dev` — start Convex watcher (run in separate terminal)
- `npm run build` — production build

## Conventions
- All Convex functions live in convex/ folder
- Svelte components use TypeScript (lang="ts")
- Tailwind for all styling — no custom CSS files
- Commit messages: feat:, fix:, chore: prefixes
- One branch per sprint

## What this app does
A QS (Quantity Surveyor) tool for sending quotation emails to client consultants.
Features: quotation entry, project email directory, email templates, Claude AI drafting, PDF attachment, send via Resend.

## Sprint we are on
Sprint 1 — Scaffold + schema + Git setup

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
