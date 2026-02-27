
# Admin Tools Behind a Settings Gear Icon with PIN

## Overview
Move the "Import CSV," "Download Template," and "Edit Targets" buttons out of the main dashboard view and tuck them behind a **gear icon** in the top navigation bar. Clicking the gear opens a **PIN entry dialog** -- once the correct PIN is entered, a side panel or dropdown reveals the admin tools. The PIN is stored in localStorage so the session stays unlocked until the user locks it again or closes the browser.

## How It Works for Users

1. Regular users see a clean dashboard with no data management buttons visible
2. The systems manager clicks the **gear icon** (top-right of the TopBar)
3. A small dialog asks for a **4-digit PIN** (default: `1234`, changeable from within the admin panel)
4. Once unlocked, a **slide-out panel (Sheet)** opens from the right showing:
   - Import CSV button (with file picker)
   - Download Template button
   - Edit Targets button
   - A "Change PIN" option
   - A "Lock" button to re-lock the session
5. The gear icon shows a subtle indicator (e.g. dot) when unlocked

## Technical Plan

### 1. Create Admin Context (`src/lib/admin-store.tsx`)
- React context to manage `isUnlocked` state (boolean)
- Store the PIN in `localStorage` (key: `dash_admin_pin`, default `"1234"`)
- Store unlock state in `sessionStorage` so it clears on browser close
- Provide `unlock(pin)`, `lock()`, and `changePin(oldPin, newPin)` functions

### 2. Create PIN Dialog Component (`src/components/dashboard/PinDialog.tsx`)
- A modal dialog with 4 input boxes for the PIN digits
- Validates against the stored PIN
- Shows error shake animation on wrong PIN
- On success, calls `unlock()` from admin context

### 3. Create Admin Panel Component (`src/components/dashboard/AdminPanel.tsx`)
- Uses the existing `Sheet` component (slides in from the right)
- Contains the three action buttons (Import CSV, Download Template, Edit Targets)
- Contains a "Change PIN" section
- Contains a "Lock Session" button
- Reuses all the existing logic currently in `DataToolbar.tsx` (file input, handlers)
- Receives the current `tab` prop to know which template/import to use

### 4. Update TopBar (`src/components/dashboard/TopBar.tsx`)
- Add a `Settings` (gear) icon button to the right side of the nav bar
- Clicking it either opens the PIN dialog (if locked) or opens the Admin Panel (if unlocked)
- Show a small colored dot on the gear when the session is unlocked
- Pass down `activeTab` so the admin panel knows which tab context to use

### 5. Update Index Page (`src/pages/Index.tsx`)
- Wrap with `AdminProvider`
- Pass `activeTab` to `TopBar`

### 6. Remove DataToolbar from Tab Views
- Remove `<DataToolbar>` from `CollectionsTab.tsx` and `ScorecardTab.tsx`
- The toolbar import/logic moves entirely into the `AdminPanel`

### Files Changed
| File | Action |
|------|--------|
| `src/lib/admin-store.tsx` | **New** -- admin context with PIN logic |
| `src/components/dashboard/PinDialog.tsx` | **New** -- PIN entry modal |
| `src/components/dashboard/AdminPanel.tsx` | **New** -- slide-out panel with admin tools |
| `src/components/dashboard/TopBar.tsx` | **Edit** -- add gear icon + admin panel trigger |
| `src/pages/Index.tsx` | **Edit** -- wrap with AdminProvider, pass activeTab to TopBar |
| `src/components/dashboard/CollectionsTab.tsx` | **Edit** -- remove DataToolbar |
| `src/components/dashboard/ScorecardTab.tsx` | **Edit** -- remove DataToolbar |
| `src/components/dashboard/DataToolbar.tsx` | **Delete** -- logic absorbed into AdminPanel |
