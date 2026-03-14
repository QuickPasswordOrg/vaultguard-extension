// VaultGuard Extension Popup – v2

const DEMO_ITEMS = [
  { id: '1', name: 'GitHub',      username: 'john@example.com',   password: 'Gh!tbS3cure2024#', url: 'github.com'     },
  { id: '2', name: 'Gmail',       username: 'john@example.com',   password: 'GmailP@ss!X9',     url: 'gmail.com'      },
  { id: '3', name: 'AWS Console', username: 'admin@company.com',  password: 'AWS#Secure!2024',  url: 'aws.amazon.com' },
  { id: '4', name: 'Netflix',     username: 'john@example.com',   password: 'netflix123',        url: 'netflix.com'    },
  { id: '5', name: 'Twitter/X',   username: 'john_doe',           password: 'Twitter@Secure!',   url: 'x.com'          },
]

let isUnlocked  = false
let currentSite = ''
let currentTheme = 'light'

// ── Helpers ───────────────────────────────────────────────────
function $(id) { return document.getElementById(id) }

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'))
  $(`view-${id}`).classList.remove('hidden')
}

function toast(msg) {
  document.querySelectorAll('.saved-toast').forEach(t => t.remove())
  const t = document.createElement('div')
  t.className = 'saved-toast'
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.remove(), 2200)
}

async function copyText(text, label = 'Copied', btn = null) {
  try {
    await navigator.clipboard.writeText(text)
    toast(`${label}!`)
    if (btn) {
      btn.classList.add('copied')
      setTimeout(() => btn.classList.remove('copied'), 1500)
    }
  } catch {
    toast('Copy failed — check permissions')
  }
}

// ── Password strength ─────────────────────────────────────────
function passwordStrength(pw) {
  if (!pw || pw.length < 4) return { score: 0, label: 'Weak',   cls: 'weak'   }
  let score = 0
  if (pw.length >= 12)                      score++
  if (pw.length >= 16)                      score++
  if (/[A-Z]/.test(pw))                     score++
  if (/[a-z]/.test(pw))                     score++
  if (/[0-9]/.test(pw))                     score++
  if (/[^A-Za-z0-9]/.test(pw))             score++
  if (score <= 2) return { score, label: 'Weak',   cls: 'weak',   pct: 25,  color: '#DC2626' }
  if (score <= 4) return { score, label: 'Medium', cls: 'medium', pct: 60,  color: '#D97706' }
  return             { score, label: 'Strong', cls: 'strong', pct: 100, color: '#16A34A' }
}

function updateGenStrength(pw) {
  const s = passwordStrength(pw)
  const bar = $('gen-strength-bar')
  const lbl = $('gen-strength-label')
  if (!bar || !lbl) return
  bar.style.width = (s.pct || 0) + '%'
  bar.style.background = s.color || '#DC2626'
  lbl.textContent = s.label || '—'
  lbl.style.color = s.color || 'var(--text-muted)'
}

// ── Favicon ───────────────────────────────────────────────────
function faviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

function itemIconHTML(item) {
  const letter = item.name.charAt(0).toUpperCase()
  return `
    <div class="item-favicon">
      <img src="${faviconUrl(item.url)}"
           alt="${item.name}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
      />
      <span class="favicon-fallback" style="display:none">${letter}</span>
    </div>`
}

// ── Theme ─────────────────────────────────────────────────────
function applyTheme(theme) {
  currentTheme = theme
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '')
}

function toggleTheme() {
  const next = currentTheme === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  chrome.storage.local.set({ vg_theme: next })
}

// ── Render items ──────────────────────────────────────────────
function renderItems(items, container, showMatchBadge = false) {
  container.innerHTML = ''
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>No items found</p>
      </div>`
    return
  }
  items.forEach(item => {
    const str = passwordStrength(item.password)
    const el = document.createElement('div')
    el.className = 'vault-item'
    el.setAttribute('tabindex', '0')
    el.innerHTML = `
      ${itemIconHTML(item)}
      <div class="item-info">
        <div class="item-name">
          ${item.name}
          ${showMatchBadge ? '<span class="match-badge">Match</span>' : `<span class="strength-badge ${str.cls}">${str.label}</span>`}
        </div>
        <div class="item-user">${item.username}</div>
      </div>
      <div class="item-actions">
        <button class="action-btn btn-copy-user" title="Copy username" aria-label="Copy username">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
        <button class="action-btn btn-copy-pw" title="Copy password" aria-label="Copy password">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="action-btn btn-autofill" title="Autofill" aria-label="Autofill credentials">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
        </button>
      </div>`

    const copyUserBtn = el.querySelector('.btn-copy-user')
    const copyPwBtn   = el.querySelector('.btn-copy-pw')
    const autofillBtn = el.querySelector('.btn-autofill')

    copyUserBtn.addEventListener('click', e => { e.stopPropagation(); copyText(item.username, 'Username copied', copyUserBtn) })
    copyPwBtn.addEventListener('click',   e => { e.stopPropagation(); copyText(item.password, 'Password copied', copyPwBtn)  })
    autofillBtn.addEventListener('click', e => {
      e.stopPropagation()
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'autofill', username: item.username, password: item.password })
        }
        toast('Autofilled!')
        setTimeout(() => window.close(), 900)
      })
    })

    // Keyboard: Enter = autofill
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') autofillBtn.click()
    })

    container.appendChild(el)
  })
}

// ── Site matches ──────────────────────────────────────────────
function showSiteMatches(hostname) {
  const host = hostname.replace('www.', '')
  const matches = DEMO_ITEMS.filter(i => host.includes(i.url) || i.url.includes(host))
  const section = $('site-matches')
  const list    = $('matches-list')
  if (matches.length && section && list) {
    section.classList.remove('hidden')
    renderItems(matches, list, true)
  }
}

// ── Password generator ────────────────────────────────────────
function generatePassword() {
  const length = parseInt($('gen-length').value)
  const upper  = $('opt-upper').checked
  const lower  = $('opt-lower').checked
  const nums   = $('opt-nums').checked
  const syms   = $('opt-syms').checked
  let chars = ''
  if (lower) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (nums)  chars += '0123456789'
  if (syms)  chars += '!@#$%^&*()-_=+[]{}|;:,.<>?'
  if (!chars) return 'Select at least one option'
  const arr = new Uint32Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(n => chars[n % chars.length]).join('')
}

function refreshPassword() {
  const pw = generatePassword()
  $('gen-password').textContent = pw
  updateGenStrength(pw)
}

// ── Load vault items ──────────────────────────────────────────
function loadVaultItems() {
  const list = $('items-list')
  if (!list) return
  renderItems(DEMO_ITEMS, list)
  const countEl = $('items-count')
  if (countEl) countEl.textContent = DEMO_ITEMS.length

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    try {
      const url = new URL(tabs[0].url)
      currentSite = url.hostname
      showSiteMatches(currentSite)
    } catch {}
  })
}

// ── Show auth error ───────────────────────────────────────────
function showAuthError() {
  const err = $('auth-error')
  if (!err) return
  err.classList.remove('hidden')
  // Re-trigger shake
  err.style.animation = 'none'
  requestAnimationFrame(() => { err.style.animation = '' })
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Apply saved theme
  chrome.storage.local.get('vg_theme', ({ vg_theme }) => {
    applyTheme(vg_theme || 'light')
  })

  // Theme toggles
  $('btn-theme-auth').addEventListener('click', toggleTheme)
  $('btn-theme').addEventListener('click', toggleTheme)

  // ── Auth screen ──────────────────────────────────────────────
  // Eye toggle (show/hide password)
  $('btn-eye').addEventListener('click', () => {
    const inp = $('master-password')
    const isHidden = inp.type === 'password'
    inp.type = isHidden ? 'text' : 'password'
    $('btn-eye').querySelector('.eye-open').classList.toggle('hidden', isHidden)
    $('btn-eye').querySelector('.eye-closed').classList.toggle('hidden', !isHidden)
  })

  // Unlock
  const doUnlock = () => {
    const pw = $('master-password').value.trim()
    if (!pw) {
      $('master-password').focus()
      return
    }
    // Demo: any non-empty password unlocks. Production: verify hash.
    if (pw.length < 3) {
      showAuthError()
      return
    }
    $('auth-error').classList.add('hidden')
    chrome.storage.session.set({ unlocked: true })
    isUnlocked = true
    showView('vault')
    loadVaultItems()
  }

  $('btn-unlock').addEventListener('click', doUnlock)
  $('master-password').addEventListener('keydown', e => { if (e.key === 'Enter') doUnlock() })

  // Lock
  $('btn-lock').addEventListener('click', () => {
    chrome.storage.session.remove('unlocked')
    isUnlocked = false
    showView('auth')
    $('master-password').value = ''
    $('auth-error').classList.add('hidden')
  })

  // ── Search ────────────────────────────────────────────────────
  $('search-input').addEventListener('input', e => {
    const q = e.target.value.toLowerCase()
    const clearBtn = $('btn-search-clear')
    clearBtn.classList.toggle('hidden', !q)

    const filtered = DEMO_ITEMS.filter(i =>
      i.name.toLowerCase().includes(q) || i.username.toLowerCase().includes(q)
    )
    renderItems(filtered, $('items-list'))
    const countEl = $('items-count')
    if (countEl) countEl.textContent = filtered.length
  })

  $('btn-search-clear').addEventListener('click', () => {
    $('search-input').value = ''
    $('btn-search-clear').classList.add('hidden')
    renderItems(DEMO_ITEMS, $('items-list'))
    const countEl = $('items-count')
    if (countEl) countEl.textContent = DEMO_ITEMS.length
    $('search-input').focus()
  })

  // ── Generator ─────────────────────────────────────────────────
  $('btn-generator').addEventListener('click', () => {
    showView('generator')
    refreshPassword()
  })
  $('btn-back').addEventListener('click', () => showView('vault'))
  $('btn-generate').addEventListener('click', refreshPassword)
  $('btn-refresh').addEventListener('click', refreshPassword)

  $('gen-length').addEventListener('input', e => {
    $('len-display').textContent = e.target.value
    refreshPassword()
  })

  $('btn-copy-gen').addEventListener('click', () => {
    copyText($('gen-password').textContent, 'Password copied', $('btn-copy-gen'))
  })

  $('btn-fill').addEventListener('click', () => {
    const pw = $('gen-password').textContent
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: 'fillPassword', password: pw })
      toast('Password filled!')
      setTimeout(() => window.close(), 900)
    })
  })

  // ── Open app ──────────────────────────────────────────────────
  $('btn-open-app').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' })
  })

  // ── Check unlock state ────────────────────────────────────────
  chrome.storage.session.get('unlocked', ({ unlocked }) => {
    if (unlocked) {
      isUnlocked = true
      showView('vault')
      loadVaultItems()
    } else {
      showView('auth')
    }
  })
})
