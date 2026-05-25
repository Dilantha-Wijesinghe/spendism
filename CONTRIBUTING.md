# Contributing to Spendism

Thank you for your interest in contributing! This document explains how to get involved.

## Reporting Bugs

Before filing a bug report, please check that the issue hasn't already been reported. When filing a new issue, use the **Bug Report** template and include:

- Steps to reproduce the problem
- What you expected to happen
- What actually happened
- Browser name and version

## Suggesting Features

Use the **Feature Request** template to propose new features. Describe the problem you're trying to solve rather than jumping straight to a solution — this helps frame the discussion.

## Development Setup

```bash
git clone https://github.com/Dilantha-Wijesinghe/spendism.git
cd spendism
npm install
npm run dev
```

The dev server starts at [http://localhost:3000](http://localhost:3000).

## Code Style

- TypeScript everywhere — avoid `any`
- Tailwind CSS for styling — avoid inline styles and custom CSS where Tailwind suffices
- Keep components co-located with their feature in `src/features/`
- Shared primitives go in `src/components/ui/`
- Pure business logic (no React) belongs in `src/lib/`
- Run `npm run lint` and `npm run typecheck` before committing — CI enforces both

## Checks

```bash
npm run typecheck  # TypeScript
npm run lint       # ESLint
```

Unit tests are not yet set up. If you add business logic to `src/lib/`, consider adding tests alongside the module.

## Pull Request Process

1. Fork the repository and create a branch from `main`.
2. Make your changes and ensure all checks pass (`typecheck`, `lint`).
3. Open a pull request using the PR template.
4. A maintainer will review your PR. Be ready to iterate based on feedback.
5. Once approved and all CI checks pass, your PR will be merged.

## Scope

Spendism is intentionally minimal and single-user. Before implementing a large feature, open an issue to discuss whether it fits the project's goals. See [docs/PRD.md](docs/PRD.md) for the non-goals list.
