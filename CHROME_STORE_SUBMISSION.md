# Chrome Web Store Submission Guide — VaultGuard Extension

## 1. Pre-submission Checklist

- [ ] Extension loads and works without errors in Chrome (`chrome://extensions` → Load unpacked)
- [ ] All permissions are justified (see §5)
- [ ] Privacy policy URL is live and accessible
- [ ] All icons are present (16, 32, 48, 128 px PNG)
- [ ] `manifest.json` version incremented
- [ ] Extension tested on Chrome 120+

---

## 2. Store Listing Details

### Name
```
VaultGuard – Password Manager
```

### Short Description (max 132 chars)
```
Autofill passwords, save credentials & generate strong passwords. Zero-knowledge security for every site you visit.
```

### Detailed Description (max 16,000 chars — paste this into the store)
```
VaultGuard is a zero-knowledge password manager that keeps your credentials safe with AES-256 encryption.

🔐 KEY FEATURES
• One-click autofill — detects login fields on any website and fills them instantly
• Password generator — create strong, random passwords up to 64 characters
• Site matching — automatically surfaces credentials for the site you're on
• Search your vault — find any login in seconds
• Light & dark theme — comfortable on any display
• Lock your vault — session-based unlock with master password

🛡️ SECURITY
• Zero-knowledge architecture — your passwords never leave your device unencrypted
• AES-256 encryption for all stored credentials
• Session-scoped unlock — vault locks automatically when the browser closes

📱 WORKS WITH
• VaultGuard Web App (vaultguard.io)
• VaultGuard Mobile App (iOS & Android)
• VaultGuard Desktop App

No ads. No tracking. Your data stays yours.
```

### Category
**Productivity** (primary) → Subcategory: **Tools**

### Language
English (US)

---

## 3. Required Screenshots

Prepare **5 screenshots** at exactly **1280×800px** or **640×400px**:

| # | Screenshot | Description |
|---|-----------|-------------|
| 1 | Auth screen (light mode) | Shows the unlock screen with shield icon |
| 2 | Vault list with site match | Vault open showing "Suggested for this site" |
| 3 | Search in action | Search bar with filtered results |
| 4 | Password generator | Generator view with strength bar |
| 5 | Dark mode vault | Full vault list in dark mode |

**Promotional tile** (optional but recommended): 440×280px

---

## 4. Privacy & Data Practices

### Privacy Policy URL
You must have a live privacy policy at e.g. `https://vaultguard.io/privacy`

### Data Use Declaration (fill this in the Developer Dashboard)

| Data type | Collected? | Purpose |
|-----------|-----------|---------|
| Personally identifiable information | No | — |
| Health information | No | — |
| Financial information | No | — |
| Authentication information | Yes (local only) | Vault access — never sent to servers |
| Personal communications | No | — |
| Location | No | — |
| Web history | No | — |
| User activity | No | — |

**Important:** Check "This extension does NOT sell or transfer user data to third parties"

---

## 5. Permissions Justification

When submitting you must justify each permission:

| Permission | Justification |
|-----------|--------------|
| `storage` | Save vault items, theme preference, and session state locally |
| `activeTab` | Read the current tab's URL to match vault items to the site |
| `scripting` | Inject autofill script to fill username/password fields |
| `contextMenus` | Right-click menu: "Fill with VaultGuard" on input fields |
| `notifications` | Alert user when a password has been copied or autofilled |
| `clipboardWrite` | Copy username/password to clipboard on user request |
| `host_permissions: localhost:3000` | Connect to local VaultGuard web app for credential sync |
| `host_permissions: api.vaultguard.io` | Connect to VaultGuard API for cloud sync (production) |

---

## 6. Submission Steps

1. **Go to** [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. **Pay** the one-time $5 developer registration fee (if not already paid)
3. Click **"New Item"** → Upload a `.zip` of the `extension/` folder
4. Fill in all store listing fields (§2)
5. Upload screenshots (§3)
6. Fill in privacy practices (§4)
7. Submit for review

### Packaging the extension
```bash
cd /path/to/VaultGuard/extension
zip -r vaultguard-extension-v1.0.0.zip . --exclude "*.DS_Store" --exclude "*.md" --exclude "node_modules/*"
```

---

## 7. Review Timeline

- Initial review: **1–3 business days**
- If rejected: fix the issue noted and resubmit (usually 24 hrs)
- Common rejection reasons:
  - Missing or vague permission justification
  - Privacy policy not accessible
  - Extension requests more permissions than needed

---

## 8. After Approval

- Set up **automatic updates** by incrementing `manifest.json` version on each release
- Monitor **crash reports** in the Developer Dashboard
- Reply to user reviews within 48 hours
