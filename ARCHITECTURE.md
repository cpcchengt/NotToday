# Architecture

Current architecture is intentionally simple.

```
React UI
    │
Application Logic
    │
SQLite
```

The application is desktop-first.

Business logic should remain independent from the UI whenever practical.

For the desktop MVP, the application logic is responsible for creating, listing in chronological order, completing, editing, and deleting local events. Each event has at least a title, a selected date, and a completion state. The React UI calls this logic; persistence is handled locally through SQLite.

Cloud services are intentionally excluded from the current architecture.

The architecture should evolve only when new requirements justify additional complexity.
