# AGENTS.md

## About

NotToday is a desktop-first productivity application that helps users record and manage dated events from a lightweight floating window.

The long-term vision is a cross-platform time management system, but the current goal is to build an excellent Windows desktop application.

The core workflow is: add an event, choose its date, review events in chronological order, and mark, edit, or delete them. Always optimize for simplicity and usability over feature count.

---

## Current Phase

Desktop MVP

Current platform:

- Windows

Future platforms:

- macOS
- Mobile
- Web

Cloud sync is NOT part of the current milestone.

Desktop MVP capabilities:

- Add a local event with a title and date
- Display recorded events in chronological order
- Mark an event as completed
- Edit or delete an event
- Use the application from a floating window

---

## Tech Stack

Desktop

- Tauri 2
- React
- TypeScript
- Tailwind CSS

Desktop Storage

- SQLite

Package Manager

- pnpm

---

## Architecture

Use a layered architecture.

UI

↓

Application Logic

↓

Persistence

Keep responsibilities separated.

Avoid putting business logic inside React components.

---

## Development Principles

- Keep the project simple.
- Prefer editing existing files over creating new ones.
- Minimize dependencies.
- Avoid premature abstraction.
- Build for maintainability.

When unsure, choose the simpler solution.

---

## AI Expectations

You are encouraged to improve the implementation when appropriate.

Do not blindly follow previous code if a cleaner solution exists.

However:

- Preserve project consistency.
- Explain significant architectural changes before making them.
- Do not rewrite unrelated code.

Favor incremental improvements.
