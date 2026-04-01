# Design System Strategy: The Scholarly Tactician

This design system is crafted to transform a traditional intellectual pursuit—Xiangqi (Chinese Chess)—into a high-end digital learning experience. It moves away from the cluttered, high-contrast aesthetics of legacy chess software, opting instead for an "Editorial-Instructional" approach. 

The goal is to provide a sense of **Calm Authority**. By utilizing expansive white space, tonal depth, and a sophisticated typographic scale, we create an environment where the user’s cognitive load is reserved for strategy, not navigating the interface.

---

### 1. Creative North Star: "The Modern Archive"
The design system is guided by the concept of **The Modern Archive**. Imagine a premium, minimalist chess manual printed on heavy, matte paper. We utilize intentional asymmetry, overlapping surfaces, and "breathing" layouts to break the rigid grid. This system honors the tradition of the game through a primary "Seal Red" while embracing contemporary UI through glassmorphism and soft, layered depth.

---

### 2. Color & Surface Philosophy
The palette is rooted in the interplay between the vibrant `primary` (#f2554a/#b02521) and a sophisticated range of neutral surfaces.

*   **The "No-Line" Rule:** To achieve a premium editorial look, **1px solid borders are strictly prohibited** for sectioning. Boundaries must be defined through background color shifts. For example, a sidebar should be `surface-container-low` sitting flush against a `surface` main stage.
*   **Surface Hierarchy & Nesting:** We treat the UI as a series of physical layers.
    *   **Level 0 (Base):** `surface` (#f8f9fa) - The canvas.
    *   **Level 1 (Sections):** `surface-container-low` (#f3f4f5) - Large layout blocks.
    *   **Level 2 (Interaction):** `surface-container-lowest` (#ffffff) - Cards and active learning modules. This creates a "lifted" effect without heavy shadows.
*   **Signature Textures:** Use subtle linear gradients for primary actions. A transition from `primary` (#b02521) to `primary_container` (#d33f36) at a 135-degree angle adds "soul" and prevents the red from feeling flat or aggressive.
*   **Glassmorphism:** Floating panels (e.g., Engine Analysis or Move History) should utilize `surface_container_low` with a 70% opacity and a `20px` backdrop-blur. This keeps the chess board visible underneath, maintaining context.

---

### 3. Typography: Editorial Authority
The system pairs the high-character **Manrope** for displays with the hyper-legible **Inter** for functional data.

*   **Display & Headline (Manrope):** Used for chapter titles, "Checkmate" announcements, and lesson headers. The generous sizing of `display-lg` (3.5rem) creates a bold, confident entry point.
*   **Body & Labels (Inter):** Used for move notations, piece descriptions, and UI controls. Inter’s tall x-height ensures readability even at `body-sm` (0.75rem).
*   **Hierarchy Tip:** Always pair a `headline-sm` with `label-md` in `on_surface_variant` (#5a413e) for sub-captions to create that "museum gallery" caption feel.

---

### 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering** and ambient light, not structural lines.

*   **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container-low` background. The slight delta in brightness creates a soft, natural edge.
*   **Ambient Shadows:** For floating elements like Modals or Piece Selection menus, use a "Cloud Shadow": 
    *   `box-shadow: 0 12px 32px -4px rgba(25, 28, 29, 0.06);` 
    *   The shadow color is a tinted version of `on_surface` to mimic natural light.
*   **The Ghost Border:** If a border is required for accessibility (e.g., in input fields), use `outline_variant` (#e2beba) at **20% opacity**. It should be felt, not seen.

---

### 5. Components & Interaction

#### Buttons
*   **Primary:** Uses the Red Pastel gradient. Roundedness is `md` (0.75rem). 
*   **Secondary:** `surface_container_highest` background with `on_surface` text. No border.
*   **Tertiary (Ghost):** Transparent background, `primary` text. Use for less critical actions like "View Variations."

#### The Chess Board (Custom Component)
*   **Grid:** Instead of high-contrast black/white squares, use `surface_container_high` and `surface_container_lowest`. 
*   **Highlights:** Last move should be indicated with a 20% opacity `secondary_container` overlay.

#### Cards & Lists
*   **Forbid Dividers:** Use vertical white space (`spacing-6` or `spacing-8`) to separate list items. 
*   **Hover States:** When hovering over a lesson card, transition the background from `surface` to `surface_container_lowest` and apply an Ambient Shadow.

#### Input Fields
*   Minimalist style. Background is `surface_container_low`. On focus, the background shifts to `surface_container_lowest` with a "Ghost Border" in `primary`.

---

### 6. Do’s and Don’ts

**Do:**
*   **Do** use `spacing-12` and `spacing-16` for margins between major sections. Generous breathing room is a hallmark of premium design.
*   **Do** use `tertiary` (#006861) for "Correct Move" or "Success" feedback—its teal tone provides a sophisticated contrast to the primary red.
*   **Do** use `xl` (1.5rem) roundedness for large containers to soften the "academic" feel of the app.

**Don’t:**
*   **Don’t** use pure black (#000000). Always use `on_surface` (#191c1d) for text to maintain a soft, ink-on-paper quality.
*   **Don’t** stack more than three levels of surface containers. If you need more depth, use a Backdrop Blur (Glassmorphism).
*   **Don’t** use standard "Drop Shadows" from a library. Always tint the shadow and keep the opacity below 8% for a clean, modern look.

---

### 7. Spacing & Rhythm
Adhere strictly to the spacing scale to ensure mathematical harmony.
*   **Component Padding:** Use `spacing-3` (0.75rem) for tight elements and `spacing-5` (1.25rem) for standard padding.
*   **Layout Gaps:** Use `spacing-10` (2.5rem) for the gap between the Chess Board and the Move History list. This "intentional gap" signifies that they are two distinct cognitive zones.