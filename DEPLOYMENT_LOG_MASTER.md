# DEPLOYMENT LOG MASTER

**PURPOSE:**
This file tracks all deployments to production.
**RULE:** Every AI completing a feature MUST append a new entry here (at the top).

---

## [2025-12-05] Repair: Z-Index & Persistence
**Status:** ✅ Pushed to Main (V2)
**Commit:** Fix(UI/Logic): Standardize Z-Index, Safe Areas & Implement HPP Persistence
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Addressed critical UI/UX issues and data loss bugs.

### Key Changes
*   **HPP Persistence:** Implemented `useHppStore` with `persist` middleware. HPP Calculator data now survives page refreshes.
*   **Z-Index Fix:** Standardized all Sticky Footers to `z-[40]` (below modals/navbars) to prevent overlay collisions.
*   **Safe Area Fix:** Updated bottom padding to `pb-[calc(env(safe-area-inset-bottom)+150px)]` to ensure content is not hidden behind footers on iPhone X+ devices.
*   **Cleanup:** Added type safety TODOs in Stock Opname.

## [2025-12-05] Hotfix: Payslip Generator Syntax
**Status:** ✅ Pushed to Main (V2)
**Commit:** Fix(Payslip): Remove stray JSX and restore jsPDF import
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Fixed a syntax error caused by stray code in `PayslipGeneratorScreen.tsx`.

### Key Changes
*   **Fix:** Removed accidental JSX paste at the top of the file.
*   **Restore:** Restored missing `import jsPDF from 'jspdf'`.

## [2025-12-05] Refactor: Smart Scroll-on-Demand
**Status:** ✅ Pushed to Main (V2)
**Commit:** Refactor(UI): Implement Smart Scroll-on-Demand (Overflow Auto & Horizontal Support)
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Optimized scroll behavior to be cleaner and more responsive.

### Key Changes
*   **Smart Scrolling:** Main content area now uses `overflow-auto` instead of forced `overflow-y-scroll`. Scrollbars only appear when needed.
*   **Horizontal Scroll Support:** Added logic to handle wide content (like Payslip Preview) by enabling horizontal scrolling when content exceeds screen width.
*   **Scrollbar Styling:** Updated custom scrollbar CSS to support horizontal scrollbars (added height dimension).
*   **Payslip Preview:** Wrapped the A4 preview in a responsive container to prevent layout breakage on mobile.

## [2025-12-05] Refactor: Smart Navigation & Global Back Button
**Status:** ✅ Pushed to Main (V2)
**Commit:** Refactor(Nav): Implement Smart Tab Bar & Global Back Button with History Stack
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Refactored the navigation system to be smarter and more native-like.

### Key Changes
*   **Smart Tab Bar:** Bottom Tab now ONLY appears on main dashboard screens (`dashboard`, `adminDashboard`, `financeDashboard`).
*   **Global Back Button:** Added a sticky `NavigationHeader` that automatically shows a "Back" button when navigating deep into the app.
*   **History Stack:** Implemented a custom history stack in `App.tsx` to support true "Back" functionality (`pop` from stack).
*   **Layout:** Content area automatically expands when the Bottom Tab is hidden.

## [2025-12-05] Feature: Native Pull-to-Refresh
**Status:** ✅ Pushed to Main (V2)
**Commit:** Feat(UX): Implement Native Custom Pull-to-Refresh with Orange Spinner
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Implemented a custom "Pull-to-Refresh" mechanism for the mobile app shell.

### Key Changes
*   **Component:** Created `PullToRefresh` wrapper with touch event handling.
*   **Visual:** Added an orange spinner with spring animation that appears when pulling down.
*   **Action:** Triggers `window.location.reload()` when pulled beyond 80px threshold.
*   **Integration:** Wrapped the main content area in `App.tsx` to enable this globally.

## [2025-12-05] Config: PDF Orientation Landscape
**Status:** ✅ Pushed to Main (V2)
**Commit:** Config(PDF): Set Orientation to Landscape (A4) with Margins
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Updated PDF generation to use Landscape orientation (A4) for better layout fit.

### Key Changes
*   **Orientation:** Changed `jsPDF` config to `landscape`.
*   **Dimensions:** Updated width to 297mm (A4 Landscape).
*   **Margins:** Implemented 10mm horizontal margins.
*   **Scaling:** Adjusted image scaling to fit the new landscape width.

## [2025-12-05] Feature: Direct PDF Download
**Status:** ✅ Pushed to Main (V2)
**Commit:** Feat(Payslip): Implement Direct PDF Download using html2canvas and jsPDF
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Replaced browser print dialog with direct PDF download functionality for Payslips.

### Key Changes
*   **Library:** Used `html2canvas` and `jspdf` to generate high-quality PDFs from the DOM.
*   **Functionality:** "Download PDF" button now instantly generates and downloads the file.
*   **Filename:** Auto-generated filename: `Slip_Gaji_[Nama]_[Bulan]_[Tahun].pdf`.
*   **Layout:** Enforced A4 size and layout consistency, independent of user printer settings.

## [2025-12-05] UI Polish: Payslip Generator Fintech Aesthetic
**Status:** ✅ Pushed to Main (V2)
**Commit:** Feat(UI): Polish Payslip Generator with Modern Fintech Aesthetic (Glassmorphism, Clean Inputs, Tactile Buttons)
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Applied a "Modern Fintech" visual overhaul to the Payslip Generator.

### Key Changes
*   **Glassmorphism:** Form container now uses a premium glass effect (`bg-white/90`, `backdrop-blur-md`).
*   **Clean Inputs:** Inputs styled with `bg-gray-50`, transparent borders, and smooth focus transitions.
*   **Typography:** Numbers in preview now use `font-mono` with color coding (Green for Income, Red for Deductions, Orange for Net).
*   **Tactile Buttons:** "Generate" button features a gradient and scale animation for better feedback.

## [2025-12-05] Architecture: True Native PWA Layout
**Status:** ✅ Pushed to Main (V2)
**Commit:** Refactor(Arch): Implement True Native PWA Layout (Global Lock, Sandwich Structure, Custom Scrollbar)
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Refactored the core application layout to enforce a strict "Native App" experience.

### Key Changes
*   **Global Layout Lock:** Root container locked to `100dvh` with `overflow-hidden` to prevent body scrolling.
*   **Sandwich Structure:**
    *   **Header:** Sticky Top.
    *   **Content:** Scrollable Middle (`flex-1`, `overscroll-y-contain`).
    *   **Footer:** Sticky Bottom.
*   **Bottom Tab:** Refactored to remove fixed positioning and integrate seamlessly into the layout flow.
*   **Scrollbar:** Updated to strict thin style with rounded edges.

## [2025-12-05] Feature: Payslip Generator UI Enhancements (Native App Feel)
**Status:** ✅ Pushed to Main (V2)
**Commit:** Feat(UI): Enhance Payslip Generator with Native App Feel (Custom Scrollbar & Fixed Layout)
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Enhanced the Payslip Generator UI to mimic a native application experience.

### Key Changes
*   **Custom Scrollbar:** Implemented `.scrollbar-thin` for a sleek, non-intrusive scrollbar.
*   **Fixed Layout:** Header and Footer are now fixed, with only the content area scrolling.
*   **UX:** Improved usability on mobile devices by preventing full-page scrolling.

## [2025-12-05] Feature: Payslip Generator Update
**Status:** ✅ Pushed to Main (V2)
**Commit:** Feat(Payslip): Implement Management vs Staff Hierarchy and Auto-fill
**Hash:** 697841c
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Updated Payslip Generator to support Management/Staff hierarchy, auto-fill logic, and improved print layout.

### Key Changes
*   **Hierarchy:** Added "MANAGEMENT" and "STAFF" optgroups in employee selection.
*   **Auto-fill:** Automatically populates Position, Department, Status, and NIK based on selected employee.
*   **Terminology:** Changed "Nama Karyawan" to "**Nama**".
*   **Print:** Optimized A4 layout with 2-column income/deduction sections.

## [2025-12-05] UI Fix: Login Screen Layout
**Status:** ✅ Pushed to Main (V2)
**Commit:** Fix(UI): Make Login Screen Static Full-Height (No Overscroll Gap)
**Hash:** 96763a9
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Fixed the Login Screen layout to be static full-height with a sticky footer, eliminating the "white gap" issue on mobile devices.

### Key Changes
*   **Layout:** Implemented "Flexbox Sandwich" (Main Container 100dvh, Scrollable Middle, Fixed Footer).
*   **UX:** Prevented body scroll on login screen.
*   **Visual:** Maintained Premium Glass theme within the new structure.

## [2025-12-05] UI Fix: HR Dashboard Restoration
**Status:** ✅ Pushed to Main (V2)
**Commit:** Feat(UI): Restore Full HR Dashboard on V2 Environment
**Hash:** eca7aad
**URL:** https://pawon-salam-finance-v2.pages.dev

### Summary
Restored missing menu items in HR Manager Dashboard and applied "Wawan" style (Premium Glass Cards) for visual consistency.

### Key Changes
*   **Restored:** Payroll, Shift, SP/Coach, Cuti, Monitoring.
*   **Style:** Replaced basic grid with `PremiumGlassCard` 2-column grid.
*   **Fix:** Mapped "Kasbon" and "Reimbursement" to `financeInput` (temporary) and `payslipGenerator`.

## [2025-12-05] Fix: Purge Submodules
**Status:** ✅ Pushed to Main
**Commit:** Fix: Purge .gitmodules and convert submodule to regular folder
**Hash:** f9972e6
**URL:** https://pawonsalam-finance.pages.dev

### Summary
Removed `.gitmodules` and converted `pawon-salam-enterprise-app` from a submodule to a regular folder to fix Cloudflare build errors.

### Key Changes
*   **Deleted:** `.gitmodules`
*   **Converted:** `pawon-salam-enterprise-app` (Removed from git cache, deleted nested .git)

## [2025-12-05] FRESH START V2
**Status:** ✅ Pushed to Main
**Commit:** Initial commit: Clean start v2
**Hash:** 835e456
**URL:** https://pawonsalam-finance.pages.dev

### Summary
Complete repository reset to resolve persistent submodule issues.
*   Deleted old `.git` history.
*   Re-initialized as new repository.
*   Renamed branch to `main`.
*   Pushed to new remote: `pawon-salam-finance-v2`.

### Included Features (From Previous History)
*   **Refactor:** Stock Opname, HPP, Smart OpEx (Screens).
*   **Payslip System:** Full V2 Rewrite (Client-side PDF, Send Logic).
*   **UI:** Premium Glassmorphism, Bold Brand Graphics.
*   **Fixes:** Submodule removal, Deployment scripts.

---
