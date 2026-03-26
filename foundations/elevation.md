# Elevation

## Shadow System

Phase 2 — this will be populated from a full component audit of Patina's 60+ components.

### Current Known Shadows

| Name | Value | Usage |
|------|-------|-------|
| none | `none` | Default state |
| xl | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | www hover-lift |

## Z-Index System

Phase 2 placeholder. Named layers prevent z-index wars:

| Layer | Value | Usage |
|-------|-------|-------|
| base | 0 | Default content |
| dropdown | 10 | Dropdown menus |
| sticky | 20 | Sticky headers, nav |
| overlay | 30 | Overlays, scrims |
| modal | 40 | Modal dialogs |
| toast | 50 | Notifications, toasts |

## Dark Mode Shadows

In dark mode, traditional box-shadows become invisible. Consider:
- Using `border` with semi-transparent white instead of shadows
- Increasing background lightness to create visual separation
- Using a subtle glow (brand-tinted shadow) for elevated elements
