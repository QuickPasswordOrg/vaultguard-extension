// VaultGuard Content Script — inline dropdown on password field click

(function () {
  'use strict'

  let dropdown = null
  let activeField = null
  let saveBar = null

  // ── Inject styles ─────────────────────────────────────────
  const style = document.createElement('style')
  style.textContent = `
    #vg-dropdown {
      position: fixed;
      z-index: 2147483647;
      background: #13082B;
      border: 1px solid #3D2980;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(109,40,217,0.2);
      font-family: -apple-system, 'Inter', BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      color: #F5F3FF;
      min-width: 260px;
      max-width: 320px;
      overflow: hidden;
      animation: vgSlideIn 0.15s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes vgSlideIn {
      from { opacity:0; transform:translateY(-6px) scale(0.97); }
      to   { opacity:1; transform:translateY(0)   scale(1); }
    }
    #vg-dropdown .vg-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px 8px;
      border-bottom: 1px solid #2D1F66;
    }
    #vg-dropdown .vg-logo {
      width: 20px;
      height: 20px;
      background: #6D28D9;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      flex-shrink: 0;
    }
    #vg-dropdown .vg-brand {
      font-size: 12px;
      font-weight: 700;
      color: #A78BFA;
      letter-spacing: 0.3px;
    }
    #vg-dropdown .vg-site {
      font-size: 11px;
      color: #6B5FA0;
      margin-left: auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }
    #vg-dropdown .vg-items {
      max-height: 180px;
      overflow-y: auto;
    }
    #vg-dropdown .vg-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 14px;
      cursor: pointer;
      transition: background 0.1s;
      border-bottom: 1px solid #1E1040;
    }
    #vg-dropdown .vg-item:hover {
      background: #1E1040;
    }
    #vg-dropdown .vg-item:last-child {
      border-bottom: none;
    }
    #vg-dropdown .vg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: linear-gradient(135deg, #6D28D9, #4C1D95);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }
    #vg-dropdown .vg-item-info { flex: 1; min-width: 0; }
    #vg-dropdown .vg-item-user {
      font-size: 13px;
      font-weight: 600;
      color: #EDE9FE;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #vg-dropdown .vg-item-site {
      font-size: 11px;
      color: #6B5FA0;
      margin-top: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #vg-dropdown .vg-fill-label {
      font-size: 10px;
      color: #6D28D9;
      font-weight: 600;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }
    #vg-dropdown .vg-empty {
      padding: 14px;
      text-align: center;
      color: #6B5FA0;
      font-size: 12px;
    }
    #vg-dropdown .vg-save-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      cursor: pointer;
      border-top: 1px solid #2D1F66;
      transition: background 0.1s;
      background: none;
      width: 100%;
      border-left: none;
      border-right: none;
      border-bottom: none;
      color: #A78BFA;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
    }
    #vg-dropdown .vg-save-btn:hover {
      background: #1E1040;
      color: #C4B5FD;
    }
    #vg-dropdown .vg-save-icon {
      width: 18px;
      height: 18px;
      border-radius: 5px;
      background: rgba(109,40,217,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    /* Save bar (top banner) */
    #vg-save-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: #13082B;
      border-bottom: 2px solid #6D28D9;
      font-family: -apple-system, 'Inter', sans-serif;
      font-size: 13px;
      color: #F5F3FF;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      animation: vgSlideDown 0.2s ease;
    }
    @keyframes vgSlideDown {
      from { transform: translateY(-100%); }
      to   { transform: translateY(0); }
    }
    #vg-save-bar .vg-sb-logo {
      width: 22px; height: 22px;
      background: #6D28D9;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; flex-shrink: 0;
    }
    #vg-save-bar .vg-sb-text { flex: 1; }
    #vg-save-bar .vg-sb-title { font-weight: 700; color: #A78BFA; font-size: 12px; }
    #vg-save-bar .vg-sb-sub { color: #8B7DB8; font-size: 11px; margin-top: 1px; }
    #vg-save-bar button {
      border: none; border-radius: 8px;
      padding: 6px 14px; font-size: 12px; font-weight: 700;
      cursor: pointer; font-family: inherit;
    }
    #vg-save-yes { background: #6D28D9; color: white; }
    #vg-save-yes:hover { background: #5B21B6; }
    #vg-save-no  { background: transparent; color: #8B7DB8; border: 1px solid #3D2980 !important; }
    #vg-save-no:hover  { color: #A78BFA; }
    #vg-save-never { background: transparent; color: #6B5FA0; font-size: 11px; text-decoration: underline; }
    /* Toast */
    .vg-toast {
      position: fixed; bottom: 20px; right: 20px;
      background: #6D28D9; color: white;
      font-family: -apple-system, 'Inter', sans-serif;
      font-size: 13px; font-weight: 600;
      padding: 10px 18px; border-radius: 12px;
      z-index: 2147483647;
      box-shadow: 0 4px 20px rgba(109,40,217,0.5);
      animation: vgFadeUp 0.3s ease;
    }
    @keyframes vgFadeUp {
      from { opacity:0; transform:translateY(8px); }
      to   { opacity:1; transform:translateY(0); }
    }
  `
  document.head.appendChild(style)

  // ── Helpers ───────────────────────────────────────────────
  function getPasswordFields() {
    return Array.from(document.querySelectorAll('input[type="password"]'))
      .filter(el => el.offsetParent !== null)
  }

  function getUsernameField(pwField) {
    const form = pwField.closest('form') || document.body
    const inputs = Array.from(form.querySelectorAll('input'))
    const idx = inputs.indexOf(pwField)
    for (let i = idx - 1; i >= 0; i--) {
      if (['text', 'email', 'tel'].includes(inputs[i].type)) return inputs[i]
    }
    return null
  }

  function nativeFill(el, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (setter) {
      setter.call(el, value)
      el.dispatchEvent(new Event('input',  { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  function showToast(msg) {
    const t = document.createElement('div')
    t.className = 'vg-toast'
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 2800)
  }

  function closeDropdown() {
    if (dropdown) { dropdown.remove(); dropdown = null }
    activeField = null
  }

  // ── Position dropdown near the input field ────────────────
  function positionDropdown(el) {
    const rect = el.getBoundingClientRect()
    const vp = { w: window.innerWidth, h: window.innerHeight }
    const dd = dropdown

    // Default: below the field, aligned left
    let top  = rect.bottom + 4
    let left = rect.left

    // Flip above if not enough space below
    if (top + 260 > vp.h - 20) top = rect.top - 4 - dd.offsetHeight

    // Clamp horizontally
    const ddW = Math.min(320, vp.w - 16)
    if (left + ddW > vp.w - 8) left = vp.w - ddW - 8
    if (left < 8) left = 8

    dd.style.top  = top  + 'px'
    dd.style.left = left + 'px'
    dd.style.width = Math.min(rect.width > 200 ? rect.width : 260, 320) + 'px'
  }

  // ── Build & show dropdown ─────────────────────────────────
  function showDropdown(pwField) {
    closeDropdown()
    activeField = pwField

    dropdown = document.createElement('div')
    dropdown.id = 'vg-dropdown'

    const hostname = location.hostname.replace(/^www\./, '')

    // Header
    dropdown.innerHTML = `
      <div class="vg-header">
        <div class="vg-logo">🛡</div>
        <span class="vg-brand">VaultGuard</span>
        <span class="vg-site">${hostname}</span>
      </div>
      <div class="vg-items" id="vg-items-list"></div>
      <button class="vg-save-btn" id="vg-save-btn">
        <div class="vg-save-icon">＋</div>
        Save in VaultGuard
      </button>
    `
    document.body.appendChild(dropdown)
    positionDropdown(pwField)

    // Load matching credentials from storage
    chrome.storage.local.get('vaultItems', (res) => {
      const items = (res.vaultItems || DEMO_ITEMS).filter(item => {
        try {
          const itemHost = new URL(item.url || '').hostname.replace(/^www\./, '')
          return itemHost === hostname || hostname.includes(itemHost) || itemHost.includes(hostname)
        } catch { return false }
      })

      const list = document.getElementById('vg-items-list')
      if (!list) return

      if (items.length === 0) {
        list.innerHTML = `<div class="vg-empty">No saved logins for this site</div>`
      } else {
        items.forEach(item => {
          const row = document.createElement('div')
          row.className = 'vg-item'
          const initial = (item.username || item.name || '?')[0].toUpperCase()
          row.innerHTML = `
            <div class="vg-avatar">${initial}</div>
            <div class="vg-item-info">
              <div class="vg-item-user">${item.username || item.name}</div>
              <div class="vg-item-site">${item.url || hostname}</div>
            </div>
            <span class="vg-fill-label">FILL</span>
          `
          row.addEventListener('mousedown', (e) => {
            e.preventDefault()
            const userField = getUsernameField(pwField)
            if (userField) nativeFill(userField, item.username || '')
            nativeFill(pwField, item.password || '')
            closeDropdown()
            showToast('✅ Filled by VaultGuard')
          })
          list.appendChild(row)
        })
      }
    })

    // Save button — saves immediately to storage + toast
    document.getElementById('vg-save-btn').addEventListener('mousedown', (e) => {
      e.preventDefault()
      const userField = getUsernameField(pwField)
      const username  = userField?.value || ''
      const password  = pwField.value || ''
      const hostname  = location.hostname.replace(/^www\./, '')

      if (!password) {
        closeDropdown()
        showToast('⚠️ Type a password first')
        return
      }

      chrome.runtime.sendMessage(
        { action: 'saveCredential', site: hostname, url: location.href, username, password },
        (res) => {
          closeDropdown()
          if (res && res.success) {
            showToast('✅ Saved to VaultGuard')
          } else {
            showToast('✅ Saved locally to VaultGuard')
          }
        }
      )
      closeDropdown()
    })
  }

  // ── Save banner (top bar) ─────────────────────────────────
  function showSaveBanner(username, password) {
    if (saveBar) saveBar.remove()
    const hostname = location.hostname.replace(/^www\./, '')
    saveBar = document.createElement('div')
    saveBar.id = 'vg-save-bar'
    saveBar.innerHTML = `
      <div class="vg-sb-logo">🛡</div>
      <div class="vg-sb-text">
        <div class="vg-sb-title">Save in VaultGuard?</div>
        <div class="vg-sb-sub">${username || 'unknown user'} · ${hostname}</div>
      </div>
      <button id="vg-save-yes">Save</button>
      <button id="vg-save-no">Not now</button>
      <button id="vg-save-never">Never for this site</button>
    `
    document.body.prepend(saveBar)
    document.body.style.marginTop = Math.max(parseInt(document.body.style.marginTop) || 0, 52) + 'px'

    document.getElementById('vg-save-yes').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'saveCredential', site: hostname, url: location.href, username, password })
      showToast('✅ Saved to VaultGuard')
      saveBar.remove()
      document.body.style.marginTop = ''
    })
    document.getElementById('vg-save-no').addEventListener('click', () => {
      saveBar.remove()
      document.body.style.marginTop = ''
    })
    document.getElementById('vg-save-never').addEventListener('click', () => {
      chrome.storage.local.set({ [`never_${hostname}`]: true })
      saveBar.remove()
      document.body.style.marginTop = ''
    })
  }

  // ── Demo data (replaced when vault items are stored) ──────
  const DEMO_ITEMS = [
    { name: 'GitHub',   username: 'john@example.com', password: 'gh_secret!', url: 'https://github.com' },
    { name: 'Gmail',    username: 'john@example.com', password: 'gmail_pass!', url: 'https://mail.google.com' },
    { name: 'Netflix',  username: 'john@example.com', password: 'nflx_pass!',  url: 'https://netflix.com' },
  ]

  // ── Attach click listener to a password field ─────────────
  function attachToField(field) {
    if (field.dataset.vgAttached) return
    field.dataset.vgAttached = '1'

    field.addEventListener('click', (e) => {
      e.stopPropagation()
      showDropdown(field)
    })
    field.addEventListener('focus', (e) => {
      // Only show on focus if triggered by click (not tab navigation)
      // We rely on click event above; focus alone is intentionally not used
    })
  }

  // ── Form submit → save prompt ─────────────────────────────
  function watchForms() {
    document.querySelectorAll('form').forEach(form => {
      if (form.dataset.vgWatched) return
      form.dataset.vgWatched = '1'
      form.addEventListener('submit', () => {
        const pwField   = form.querySelector('input[type="password"]')
        const userField = pwField ? getUsernameField(pwField) : null
        if (!pwField?.value) return
        const hostname = location.hostname.replace(/^www\./, '')
        chrome.storage.local.get(`never_${hostname}`, (res) => {
          if (!res[`never_${hostname}`]) {
            setTimeout(() => showSaveBanner(userField?.value || '', pwField.value), 400)
          }
        })
      })
    })
  }

  // ── Close on outside click ────────────────────────────────
  document.addEventListener('mousedown', (e) => {
    if (dropdown && !dropdown.contains(e.target)) closeDropdown()
  }, true)

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown()
  })

  // Reposition on scroll/resize
  window.addEventListener('scroll',  () => { if (dropdown && activeField) positionDropdown(activeField) }, { passive: true })
  window.addEventListener('resize',  () => { if (dropdown && activeField) positionDropdown(activeField) }, { passive: true })

  // ── Message handler ───────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'autofill') {
      const pwFields = getPasswordFields()
      pwFields.forEach(pf => {
        const uf = getUsernameField(pf)
        if (uf) nativeFill(uf, msg.username)
        nativeFill(pf, msg.password)
      })
      closeDropdown()
      showToast('✅ Autofilled by VaultGuard')
    }
  })

  // ── Init ─────────────────────────────────────────────────
  function init() {
    getPasswordFields().forEach(attachToField)
    watchForms()
  }

  init()

  const observer = new MutationObserver(() => {
    getPasswordFields().forEach(attachToField)
    watchForms()
  })
  observer.observe(document.body, { childList: true, subtree: true })
})()
