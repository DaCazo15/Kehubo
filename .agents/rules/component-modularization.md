# Component Modularization & Clean Architecture Rule

## Guidelines for Vue Components

1. **Section Comments as Component Boundaries**:
   Whenever a component contains structural section comments (e.g. `<!-- Bloque 1: ... -->`, `<!-- Seccion 2: ... -->`, `<!-- CTA Actions -->`), treat each section as a candidate for a dedicated subcomponent.

2. **Single Responsibility Principle**:
   - Main views or container components should act as high-level **orchestrators**.
   - Sub-features (headers, tables, cards, dialogs, user menus, navigation bars) should be extracted into subfolders under `src/components/<feature>/<component-name>/`.

3. **DRY & Design System Usage**:
   - Reuse `BaseButton`, `BaseCard`, `BaseModal` etc., instead of writing native `<button>` or `<RouterLink>` tags with repeated ad-hoc Tailwind classes.
   - Centralize navigation links and menu configurations in typed data constants (e.g., `navData.ts`) with named routes (`:to="{ name: '...' }"`).

4. **Self-Auditing**:
   - Proactively inspect large components (> 120 lines in `<template>`) and propose/execute modularization into maintainable subcomponents.
