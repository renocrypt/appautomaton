(() => {
  const root = document.documentElement
  const theme = document.querySelector('.theme-toggle')
  const themeColor = document.querySelector('meta[name="theme-color"]')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const systemTheme = matchMedia('(prefers-color-scheme: dark)')
  function reflectTheme() {
    const night = root.dataset.theme === 'night'
    theme.setAttribute('aria-label', `Switch to ${night ? 'day' : 'night'} palette`)
    theme.querySelector('.theme-label').textContent = night ? 'Day' : 'Night'
    themeColor.content = night ? '#182820' : '#f2f0df'
  }
  theme.hidden = false
  reflectTheme()
  theme.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'night' ? 'day' : 'night'
    try { localStorage.setItem('field-theme', root.dataset.theme) } catch {}
    reflectTheme()
  })
  systemTheme.addEventListener('change', event => {
    let saved
    try { saved = localStorage.getItem('field-theme') } catch {}
    if (!saved) { root.dataset.theme = event.matches ? 'night' : 'day'; reflectTheme() }
  })
  const tools = document.querySelector('.catalog-tools')
  const input = tools.querySelector('input')
  const cards = [...document.querySelectorAll('.project')]
  const filters = [...document.querySelectorAll('.filter')]
  const status = document.querySelector('.filter-status')
  let selected = 'all'
  tools.hidden = false
  tools.addEventListener('submit', event => event.preventDefault())
  function applyFilter() {
    const query = input.value.trim().toLowerCase()
    let count = 0
    cards.forEach(card => {
      const shown = (selected === 'all' || card.dataset.category === selected) && card.dataset.search.includes(query)
      card.hidden = !shown
      if (shown) count++
    })
    filters.forEach(button => {
      const active = button.dataset.filter === selected
      button.classList.toggle('active', active)
      button.setAttribute('aria-pressed', String(active))
    })
    document.querySelector('.empty').hidden = count > 0
    status.textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`
  }
  filters.forEach(button => button.addEventListener('click', () => {selected = button.dataset.filter; applyFilter()}))
  input.addEventListener('input', applyFilter)
  document.querySelector('.reset-search').addEventListener('click', () => {
    selected = 'all'; input.value = ''; applyFilter(); input.focus()
  })
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
      event.preventDefault(); input.focus(); input.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'})
    }
    if (event.key === 'Escape' && document.activeElement === input) { input.value = ''; applyFilter() }
  })
  // A native scroll remains native. A small decorative offset follows it.
  const object = document.querySelector('.hero-object')
  let scheduled = false
  function frame() {
    scheduled = false
    if (reduced.matches) { object.style.removeProperty('transform'); return }
    if (scrollY < innerHeight * 1.5) object.style.transform = `translateY(${Math.min(scrollY*.09,90)}px) rotate(${Math.min(scrollY*.018,14)}deg)`
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(frame) } }, {passive:true})
  reduced.addEventListener('change', frame)
})()
