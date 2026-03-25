# Design System Strategy: The Academic Luminary

## 1. Overview & Creative North Star
This design system is built to transform the standard, often rigid college management experience into a high-end editorial environment. Our Creative North Star is **"The Academic Luminary"**—an aesthetic that balances the vibrant energy of student life with the authoritative, organized structure of premium digital publishing.

By leveraging **intentional asymmetry**, large-scale typography, and **tonal depth**, we move away from the "template" feel of enterprise software. The system prioritizes breathing room (whitespace) and a sophisticated hierarchy to ensure that high-density data feels light, approachable, and premium.

## 2. Colors: Tonal Architecture
The palette is centered on a high-energy primary orange, supported by a sophisticated range of neutrals that define the spatial hierarchy.

### The "No-Line" Rule
To achieve a modern, seamless aesthetic, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through background color shifts. Use `surface-container-low` for secondary sections sitting on a `surface` background. Let color transitions, rather than structural lines, guide the eye.

### Surface Hierarchy & Nesting
Treat the UI as a series of layered sheets of paper.
- **Base Layer:** `surface` (#f5f6f7) - The canvas.
- **Sub-Sections:** `surface-container-low` (#eff1f2) - For subtle grouping.
- **Main Containers:** `surface-container-lowest` (#ffffff) - For primary cards and content areas.
- **Active Elements:** Use `primary-container` (#ff7a2f) at low opacity for subtle highlights.

### The "Glass & Gradient" Rule
For floating elements such as modals, popovers, or navigation overlays, utilize **Glassmorphism**. Apply `surface-container-lowest` with a 70-80% opacity and a `backdrop-blur` of 20px. 
*Signature Polish:* Main CTAs should not be flat. Apply a subtle linear gradient from `primary` (#9c3f00) to `primary-container` (#ff7a2f) to add "soul" and dimension.

## 3. Typography: Editorial Authority
The typography uses a high-contrast pairing: **Plus Jakarta Sans** for expressive headers and **Inter** for functional clarity.

- **Display (L/M/S):** Plus Jakarta Sans. Use for hero statistics or welcome headers. These are large, bold, and authoritative.
- **Headline (L/M/S):** Plus Jakarta Sans. Used for section titles. The increased letter-spacing of the display face provides a contemporary "magazine" feel.
- **Title (L/M/S):** Inter. Medium weight. Used for card headers and navigation elements.
- **Body (L/M/S):** Inter. Regular weight. Optimized for readability. Use `body-md` (0.875rem) as the standard for data-heavy views.
- **Label (M/S):** Inter. All-caps with increased letter-spacing (0.05em) for secondary metadata to create a "caption" effect.

## 4. Elevation & Depth: Tonal Layering
In "The Academic Luminary," we replace traditional drop shadows with **Ambient Depth**.

### The Layering Principle
Depth is achieved by stacking surface tokens. A card (`surface-container-lowest`) placed on a workspace (`surface-container-low`) creates a natural lift without visual noise.

### Ambient Shadows
If an element must float (e.g., a Sidebar or Profile Dropdown), use an extra-diffused shadow:
- **X/Y:** 0, 12px | **Blur:** 32px | **Spread:** -4px
- **Color:** Use `on-surface` (#2c2f30) at 6% opacity. This creates a soft, natural glow rather than a harsh outline.

### The "Ghost Border" Fallback
Where containment is essential for accessibility, use a **Ghost Border**: `outline-variant` (#abadae) at 15% opacity. Never use a 100% opaque border.

## 5. Components: Fluid Primitives

### Buttons
- **Primary:** Rounded-full (`full`: 9999px) or `xl` (3rem). Gradient fill (Primary to Primary-Container), white text.
- **Secondary:** Surface-tinted. No border. Use `surface-container-high` background with `primary` text.
- **States:** On hover, primary buttons should scale 2% (1.02) rather than just changing color, providing a tactile, premium feel.

### Cards & Lists
- **Layout:** Cards must use `lg` (2rem) or `xl` (3rem) corner radius.
- **Spacing:** Forbid divider lines. Use `spacing-6` (1.5rem) or `spacing-8` (2rem) to separate list items. 
- **Active State:** In sidebars or lists, indicate selection with a "pill" shape using `surface-container-highest` or a low-opacity `primary-container`, rather than a border.

### Input Fields
- **Styling:** `surface-container-low` background. No border. Focus state is indicated by a 2px `primary` ghost-border (15% opacity) and a slight elevation shift.
- **Radii:** Always match the container (`md`: 1.5rem) to maintain the "friendly" aesthetic.

### Additional Signature Components
- **The Progress Orbit:** Instead of linear bars, use thick, circular progress rings for student grades/attendance, mimicking the "Leaderboard" aesthetic.
- **Quick-Action Floating Pill:** A bottom-centered floating navigation pill using Glassmorphism for rapid access to "Add Assignment" or "Record Attendance."

## 6. Do’s and Don’ts

### Do
- **DO** use asymmetry. Place a large `display-md` heading on the left with a smaller `label-md` metadata cluster on the right to create visual interest.
- **DO** lean into the 24px (`xl`) border radius for main dashboard containers.
- **DO** use `surface-dim` for dark mode backgrounds to ensure the vibrant orange highlights don't cause eye strain.

### Don't
- **DON'T** use black (#000000) for text. Use `on-surface` (#2c2f30) to maintain a soft, high-end editorial feel.
- **DON'T** use 1px dividers between list items. Use whitespace (`spacing-4`) and background tonal shifts.
- **DON'T** use standard "Material" shadows. Keep elevations low-opacity and highly diffused to mimic natural ambient light.