(() => {
  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const systemTheme = matchMedia('(prefers-color-scheme: dark)')
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)')
  const theme = document.querySelector('.theme-toggle')
  const motion = document.querySelector('.motion-toggle')
  const themeColor = document.querySelector('meta[name="theme-color"]')
  const read = key => { try { return localStorage.getItem(key) } catch { return null } }
  const save = (key,value) => { try { localStorage.setItem(key,value) } catch {} }
  let paused = read('field-motion') === 'off'
  let requestedTheme = root.dataset.theme
  let transition
  const transients = new Set()
  const canMove = () => !paused && !reduced.matches && !document.hidden

  function reflectTheme() {
    const night = root.dataset.theme === 'night'
    theme.setAttribute('aria-label', `Switch to ${night ? 'day' : 'night'} palette`)
    theme.querySelector('.theme-label').textContent = night ? 'Day' : 'Night'
    themeColor.content = night ? '#182820' : '#f2f0df'
  }
  theme.hidden = false
  reflectTheme()
  theme.addEventListener('click', () => {
    requestedTheme = requestedTheme === 'night' ? 'day' : 'night'
    const next = requestedTheme
    const change = () => {
      root.dataset.theme = next
      save('field-theme', next)
      reflectTheme()
    }
    transition?.skipTransition()
    if (!canMove() || !document.startViewTransition) { change(); return }
    const current = document.startViewTransition(change)
    transition = current
    current.ready.catch(() => {})
    current.finished.catch(() => {}).finally(() => {
      if (transition === current) transition = undefined
    })
  })
  systemTheme.addEventListener('change', event => {
    const saved = read('field-theme')
    if (saved !== 'day' && saved !== 'night') {
      requestedTheme = root.dataset.theme = event.matches ? 'night' : 'day'
      reflectTheme()
    }
  })

  // Filtering changes the HTML state immediately. Position interpolation only
  // paints visible results, and rapid input cancels obsolete animation work.
  const tools = document.querySelector('.catalog-tools')
  const input = tools.querySelector('input')
  const cards = [...document.querySelectorAll('.project')]
  const filters = [...document.querySelectorAll('.filter')]
  const status = document.querySelector('.filter-status')
  const empty = document.querySelector('.empty')
  let selected = 'all'
  tools.hidden = false
  tools.addEventListener('submit', event => event.preventDefault())
  function settleResults() {
    transients.forEach(animation => animation.cancel())
    transients.clear()
  }
  function applyFilter() {
    const animate = canMove() && typeof Element.prototype.animate === 'function'
    const previous = new Map()
    if (animate) cards.filter(card => !card.hidden).forEach(card => previous.set(card,card.getBoundingClientRect()))
    settleResults()
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
    empty.hidden = count > 0
    status.textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`
    if (!animate) return
    // Batch all layout reads before starting any animations.
    const positions = cards.filter(card => !card.hidden).map(card => [card,card.getBoundingClientRect()])
    positions.forEach(([card,rect]) => {
      if (rect.top >= innerHeight || rect.bottom <= 0) return
      const before = previous.get(card)
      const nearby = before && before.bottom > 0 && before.top < innerHeight
      const dx = nearby ? before.left - rect.left : 0
      const dy = nearby ? before.top - rect.top : 18
      if (!dx && !dy) return
      const animation = card.animate([
        {transform:`translate(${dx}px,${dy}px)`,opacity:nearby?1:.8},
        {transform:'translate(0,0)',opacity:1},
      ],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'})
      transients.add(animation)
      animation.finished.catch(() => {}).finally(() => transients.delete(animation))
    })
  }
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.filter
    applyFilter()
  }))
  input.addEventListener('input', applyFilter)
  document.querySelector('.reset-search').addEventListener('click', () => {
    selected = 'all'
    input.value = ''
    applyFilter()
    input.focus()
  })
  document.addEventListener('keydown', event => {
    const editing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !editing) {
      event.preventDefault()
      input.focus({preventScroll:true})
      input.scrollIntoView({block:'center',behavior:canMove()?'smooth':'instant'})
    }
    if (event.key === 'Escape' && document.activeElement === input) {
      input.value = ''
      applyFilter()
    }
  })

  // One event-driven frame chain for the hero. It sleeps once its small spring
  // settles. SVG paths, page layout, and typography are never changed here.
  const hero = document.querySelector('.hero')
  const object = document.querySelector('.hero-object')
  const arrange = document.querySelector('.arrange-toggle')
  const arrangementStatus = document.querySelector('.arrangement-status')
  let arrangement = 0
  arrange.hidden = false
  arrange.addEventListener('click', () => {
    arrangement = (arrangement+1)%3
    object.dataset.arrangement = String(arrangement)
    arrangementStatus.textContent = ['An open bloom.','A star of narrow leaves.','A close, folded flower.'][arrangement]
  })
  let frameId = 0
  let heroVisible = false
  let heroTop = 0
  let heroHeight = hero.offsetHeight
  let pointerX = 0, pointerY = 0
  let x = 0, y = 0, travel = 0
  function measureHero() {
    const rect = hero.getBoundingClientRect()
    heroTop = rect.top + scrollY
    heroHeight = rect.height
    schedule()
  }
  function stopHero() {
    cancelAnimationFrame(frameId)
    frameId = 0
    pointerX = pointerY = x = y = travel = 0
    object.style.removeProperty('transform')
  }
  function schedule() {
    if (!frameId && heroVisible && canMove()) frameId = requestAnimationFrame(frame)
  }
  function frame() {
    frameId = 0
    if (!canMove() || !heroVisible) return
    const targetTravel = Math.max(0,Math.min(1,(scrollY-heroTop)/(heroHeight*.9)))
    x += (pointerX-x)*.12
    y += (pointerY-y)*.12
    travel += (targetTravel-travel)*.14
    object.style.transform = `perspective(900px) translate3d(${(x*12).toFixed(2)}px,${(y*8+travel*55).toFixed(2)}px,0) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg) rotateZ(${(-travel*19).toFixed(2)}deg) scale(${(1-travel*.09).toFixed(4)})`
    if (Math.abs(pointerX-x)+Math.abs(pointerY-y)+Math.abs(targetTravel-travel) > .002) schedule()
  }
  hero.addEventListener('pointermove', event => {
    if (!canMove() || !finePointer.matches) return
    pointerX = Math.max(-1,Math.min(1,event.clientX/innerWidth*2-1))
    pointerY = Math.max(-1,Math.min(1,(event.clientY+scrollY-heroTop)/heroHeight*2-1))
    schedule()
  },{passive:true})
  hero.addEventListener('pointerleave', () => { pointerX = pointerY = 0; schedule() })
  addEventListener('scroll', schedule, {passive:true})
  addEventListener('resize', measureHero, {passive:true})
  if ('ResizeObserver' in window) new ResizeObserver(measureHero).observe(hero)
  measureHero()

  // No continuous animation is enabled until its scene enters the viewport.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({target,isIntersecting}) => {
        target.dataset.visible = String(isIntersecting)
        if (isIntersecting) target.dataset.entered = 'true'
        if (target === hero) {
          heroVisible = isIntersecting
          if (isIntersecting) schedule()
          else stopHero()
        }
      })
    },{threshold:0,rootMargin:'0px'})
    document.querySelectorAll('[data-scene]').forEach(scene => observer.observe(scene))
  }
  function reflectMotion() {
    const enabled = !paused && !reduced.matches
    root.dataset.motion = enabled ? 'on' : 'off'
    root.dataset.awake = String(!document.hidden)
    motion.setAttribute('aria-pressed',String(enabled))
    motion.setAttribute('aria-label',reduced.matches ? 'Motion off, following your device preference' : 'Motion')
    motion.title = reduced.matches ? 'Motion follows your device preference' : enabled ? 'Pause motion' : 'Resume motion'
    motion.querySelector('.motion-label').textContent = 'Motion'
    motion.disabled = reduced.matches
    if (!canMove()) { stopHero(); settleResults(); transition?.skipTransition() }
    else schedule()
  }
  motion.hidden = false
  reflectMotion()
  motion.addEventListener('click', () => {
    paused = !paused
    save('field-motion',paused?'off':'on')
    reflectMotion()
  })
  reduced.addEventListener('change',reflectMotion)
  document.addEventListener('visibilitychange',reflectMotion)
  addEventListener('pagehide', () => { stopHero(); settleResults() })
  addEventListener('pageshow',reflectMotion)
})()
