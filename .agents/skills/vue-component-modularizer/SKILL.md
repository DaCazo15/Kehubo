---
name: vue-component-modularizer
description: >-
  Audits and modularizes Vue components by detecting section comments (e.g. <!-- Bloque 1: ... -->, <!-- Section: ... -->),
  bloated templates, or duplicate logic, systematically decomposing them into decoupled, maintainable subcomponents.
---

# Vue Component Modularizer & Audit Skill

This skill guides the agent in auditing, identifying monolithic Vue components, and systematically refactoring them into clean, focused, single-responsibility subcomponents.

---

## 1. Audit Trigger & Detection Criteria

Whenever reviewing a Vue component or when requested to audit/clean up code, check for:

1. **Comment-Delimited Blocks**:
   - Comments like `<!-- Bloque 1 (Izquierda): Logo -->`, `<!-- Section 2: Header -->`, `<!-- CTA Actions -->`.
   - Each distinct commented section usually represents a natural candidate for an independent subcomponent.

2. **Template Bloat (> 100-150 lines in `<template>`)**:
   - Monolithic files handling layout, navigation, modals, lists, dropdowns, and buttons all in one file.

3. **Duplicated Markup / Logic (DRY Violations)**:
   - Repeated avatar fallbacks, repeated `<RouterLink>` elements with similar classes, repeated button styling instead of design-system components (e.g., `BaseButton`).

4. **Mixed State Responsibilities**:
   - One component managing scroll events, dropdown states, modals, auth actions, and complex UI renders.

---

## 2. Refactoring & Modularization Workflow

### Step 1: Scan and Map Sections
Identify all functional boundaries in the component. For example:
- Section 1: Brand / Logo
- Section 2: Navigation Links (Desktop)
- Section 3: Action Buttons / User Menu & Dropdown
- Section 4: Mobile Bar Toggle / Triggers
- Section 5: Mobile Drawer / Dropdown Menu

### Step 2: Extract Shared Data & Types
If multiple subcomponents share data structures (e.g., navigation links, menu items):
- Create a dedicated data file (e.g. `navbar/navData.ts` or `types.ts`).
- Avoid hardcoding paths or duplicate arrays in both desktop and mobile views.
- Use dynamic named routes (`:to="{ name: 'routeName' }"`) rather than hardcoded string paths.

### Step 3: Create Focused Subcomponents
For each identified block:
- Place subcomponents in a dedicated subdirectory (e.g. `src/components/<feature>/<componentName>/`).
- Keep subcomponents focused on their specific responsibility.
- Use explicit `defineProps`, `defineEmits`, and shared composables (`useAuth`, `useGame`, etc.) where appropriate.
- Leverage base components (`BaseButton`, `BaseModal`, `BaseCard`) instead of raw native tags with long Tailwind classes.

### Step 4: Convert Parent into an Orchestrator
The main parent component should only:
- Coordinate layout and high-level layout state (e.g., `isScrolled`, `isDrawerOpen`).
- Import and render the subcomponents cleanly.
- Forward necessary events or state.

### Step 5: Verify & Build Check
- Run `npm run build` or `vue-tsc --noEmit` to ensure zero type or template errors.
- Verify that props, emits, and reactivity work without regressions.

---

## 3. Example Reference Structure

### Monolith Before:
```vue
<!-- Navbar.vue (350+ lines with all logic inline) -->
<template>
  <header>
    <!-- Bloque 1: Logo -->
    <RouterLink to="/">...</RouterLink>

    <!-- Bloque 2: Nav -->
    <nav>...</nav>

    <!-- Bloque 3: User actions -->
    <div class="user-menu">...</div>

    <!-- Bloque 4: Mobile buttons -->
    <button @click="...">...</button>

    <!-- Bloque 5: Mobile menu -->
    <div v-if="isOpen">...</div>
  </header>
</template>
```

### Modularized After:
```vue
<!-- Navbar.vue (Clean Orchestrator ~50 lines) -->
<script setup lang="ts">
import NavbarLogo from './navbar/NavbarLogo.vue'
import NavbarDesktopNav from './navbar/NavbarDesktopNav.vue'
import NavbarUserActions from './navbar/NavbarUserActions.vue'
import NavbarMobileToggle from './navbar/NavbarMobileToggle.vue'
import NavbarMobileMenu from './navbar/NavbarMobileMenu.vue'
// ...
</script>

<template>
  <header :class="...">
    <div class="...">
      <NavbarLogo />
      <NavbarDesktopNav />
      <NavbarUserActions />
      <NavbarMobileToggle :is-open="isOpen" @toggle="toggleMenu" />
    </div>
    <NavbarMobileMenu :is-open="isOpen" @close="closeMenu" />
  </header>
</template>
```
