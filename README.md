# VaultGuard Chrome Extension

Autofill passwords, save credentials, and generate strong passwords directly in your browser.

## Features
- **Autofill**: Detects login forms and fills username + password with one click
- **Save password**: Prompts to save credentials after login
- **Password generator**: Generate strong passwords and fill directly into forms
- **Site matching**: Shows matching vault items for the current website
- **Badge counter**: Shows number of matching logins for current site
- **Auto-lock**: Vault locks when browser is idle

## Install (Development)

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this `extension/` folder
5. The VaultGuard icon appears in your toolbar

## Usage

1. Click the VaultGuard icon in the toolbar
2. Enter your master password to unlock
3. Click a matching item to autofill, or search for any vault item
4. Use ⚡ Generator to create a new password and fill it directly

## Structure

```
extension/
├── manifest.json              # Extension manifest (MV3)
├── popup.html                 # Popup UI
├── icons/                     # Extension icons (16,32,48,128px)
├── src/
│   ├── popup/
│   │   ├── popup.js           # Popup logic
│   │   └── popup.css          # Popup styles
│   ├── content/
│   │   └── content.js         # Content script (autofill, save prompt)
│   └── background/
│       └── background.js      # Service worker (API, context menus, badge)
```

## Permissions
- `storage` — Store unlock state and saved credentials
- `activeTab` — Access current tab URL for site matching
- `scripting` — Inject autofill scripts
- `contextMenus` — Right-click "Generate password" option
- `notifications` — "Password saved" confirmation
- `clipboardWrite` — Copy passwords to clipboard
