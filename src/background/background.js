// VaultGuard Background Service Worker (Manifest V3)

const API_BASE = 'http://localhost:3000'

// ── Context menus ─────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'vg-generate',
    title: '⚡ Generate password with VaultGuard',
    contexts: ['editable'],
  })
  chrome.contextMenus.create({
    id: 'vg-save',
    title: '🛡️ Save credentials to VaultGuard',
    contexts: ['editable'],
  })
})

chrome.contextMenus.onClicked.addListener(({ menuItemId }, tab) => {
  if (menuItemId === 'vg-generate') {
    chrome.action.openPopup()
  }
})

// ── Message handling ──────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'saveCredential') {
    handleSaveCredential(msg).then(sendResponse)
    return true // Keep message channel open for async
  }
  if (msg.action === 'getItemsForSite') {
    handleGetItemsForSite(msg.hostname).then(sendResponse)
    return true
  }
  if (msg.action === 'openPopup') {
    chrome.action.openPopup()
  }
})

// ── Save credential to vault ──────────────────────────────────
async function handleSaveCredential({ site, url, username, password }) {
  // Always persist locally so dropdown shows it next time
  await saveLocalCredential({ site, url, username, password })

  // Also try to sync with API if authenticated
  try {
    const { vg_token } = await chrome.storage.local.get('vg_token')
    if (vg_token) {
      const res = await fetch(`${API_BASE}/api/vault/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vg_token}` },
        body: JSON.stringify({
          type: 'LOGIN',
          name: site,
          encryptedData: JSON.stringify({ username, password, url }),
          favorite: false,
          tags: [],
        }),
      })
      if (res.ok) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'VaultGuard',
          message: `Password for ${site} saved!`,
          priority: 1,
        })
        return { success: true }
      }
    }
  } catch {}

  // Saved locally even if API failed
  return { success: true, local: true }
}

// ── Persist credential to chrome.storage.local ───────────────
async function saveLocalCredential({ site, url, username, password }) {
  const { vaultItems = [] } = await chrome.storage.local.get('vaultItems')

  // Update if same site+username already exists, else append
  const idx = vaultItems.findIndex(
    i => i.url === url && i.username === username
  )
  const entry = { name: site, url, username, password, savedAt: Date.now() }
  if (idx >= 0) {
    vaultItems[idx] = entry
  } else {
    vaultItems.push(entry)
  }

  await chrome.storage.local.set({ vaultItems })
}

// ── Get matching items for current site ───────────────────────
async function handleGetItemsForSite(hostname) {
  try {
    const { vg_token } = await chrome.storage.local.get('vg_token')
    if (!vg_token) return { items: [] }

    const res = await fetch(`${API_BASE}/api/vault/items`, {
      headers: { Authorization: `Bearer ${vg_token}` },
    })
    if (!res.ok) return { items: [] }
    const { items } = await res.json()

    // Filter items matching current hostname
    const matches = items.filter(item => {
      try {
        const data = JSON.parse(item.encryptedData) // In prod: decrypt first
        return data.url && (new URL(data.url).hostname.includes(hostname) || hostname.includes(new URL(data.url).hostname))
      } catch { return false }
    })
    return { items: matches }
  } catch {
    return { items: [] }
  }
}

// ── Tab change: update extension badge ───────────────────────
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId)
    if (!tab.url || tab.url.startsWith('chrome://')) {
      chrome.action.setBadgeText({ text: '', tabId })
      return
    }
    const hostname = new URL(tab.url).hostname
    const { items } = await handleGetItemsForSite(hostname)
    if (items.length > 0) {
      chrome.action.setBadgeText({ text: String(items.length), tabId })
      chrome.action.setBadgeBackgroundColor({ color: '#6D28D9', tabId })
    } else {
      chrome.action.setBadgeText({ text: '', tabId })
    }
  } catch {}
})
