// Original line drawings. Shared geometry keeps every mark in the same family.
export const marks = {
  spark: '<path d="M48 6c0 28 14 42 42 42-28 0-42 14-42 42C48 62 34 48 6 48 34 48 48 34 48 6Z"/><path d="M20 20 76 76M76 20 20 76"/><circle cx="48" cy="48" r="12"/>',
  wave: '<path d="M8 48c8-44 16-44 24 0s16 44 24 0 16-44 24 0"/><path d="M8 48c8 28 16 28 24 0s16-28 24 0 16 28 24 0"/><path d="M8 48h80"/>',
  orbit: '<ellipse cx="48" cy="48" rx="40" ry="17" transform="rotate(-35 48 48)"/><ellipse cx="48" cy="48" rx="40" ry="17" transform="rotate(35 48 48)"/><circle cx="48" cy="48" r="28"/><circle cx="76" cy="27" r="5" fill="currentColor"/>',
  atom: '<ellipse cx="48" cy="48" rx="16" ry="41"/><ellipse cx="48" cy="48" rx="16" ry="41" transform="rotate(60 48 48)"/><ellipse cx="48" cy="48" rx="16" ry="41" transform="rotate(120 48 48)"/><circle cx="48" cy="48" r="5" fill="currentColor"/>',
  weave: '<path d="M12 30h72M12 48h72M12 66h72M30 12v72M48 12v72M66 12v72"/><rect x="12" y="12" width="72" height="72" rx="36"/><circle cx="48" cy="48" r="19"/>',
  flower: '<path d="M48 48C-2 12 54-14 48 48c36-50 62 6 0 0 50 36-6 62 0 0-36 50-62-6 0 0Z"/><circle cx="48" cy="48" r="8"/>',
  arrow: '<path d="M21 75 75 21M21 21h54v54"/>',
  sun: '<circle cx="48" cy="48" r="16"/><path d="M48 8v11m0 58v11M8 48h11m58 0h11M20 20l8 8m40 40 8 8M20 76l8-8m40-40 8-8"/>',
  moon: '<path d="M67 15a35 35 0 1 0 14 58A36 36 0 0 1 67 15Z"/>',
}
export function icon(name, cls = '') {
 return `<svg class="mark ${cls}" viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${marks[name] || marks.flower}</svg>`
}
// Independent orbit, petal, and heart layers. Geometry never changes per frame.
export function bloom() {
 const ticks = Array.from({length:48}, (_,i) => `<path d="M360 32v${i%4===0?14:5}" transform="rotate(${i*7.5} 360 360)"/>`).join('')
 const petals = Array.from({length:8}, (_,i) => `<div class="specimen-blade-position" style="--blade-angle:${i*45}deg;--blade-delay:-${i*1.2}s;--blade-side:${i%2?1:-1};--blade-stagger:${i*32}ms"><div class="specimen-blade"><svg viewBox="0 0 720 720" fill="none"><use href="#specimen-petal"/></svg></div></div>`).join('')
 const seeds = Array.from({length:12}, (_,i) => `<ellipse cx="360" cy="336" rx="9" ry="30" transform="rotate(${i*30} 360 360)"/>`).join('')
 return `<div class="specimen" aria-hidden="true">
 <div class="specimen-orbit"><svg viewBox="0 0 720 720" fill="none" stroke="var(--petal-line)" stroke-width="1"><circle cx="360" cy="360" r="328" opacity=".3"/><circle cx="360" cy="360" r="308" stroke-dasharray="2 10" opacity=".55"/><g opacity=".7">${ticks}</g><path d="M32 360h34m588 0h34M360 32v34m0 588v34"/><circle cx="688" cy="360" r="5" fill="var(--accent)"/><circle cx="32" cy="360" r="5" fill="var(--seed)"/></svg></div>
 <div class="specimen-petals"><svg class="specimen-definitions" viewBox="0 0 720 720" aria-hidden="true"><defs>
 <linearGradient id="specimen-fold" x1="257" y1="106" x2="413" y2="371" gradientUnits="userSpaceOnUse"><stop stop-color="var(--petal-light)"/><stop offset=".48" stop-color="var(--petal)"/><stop offset="1" stop-color="var(--petal-shade)"/></linearGradient>
 <g id="specimen-petal" stroke="var(--petal-line)" stroke-width="1.1" stroke-linejoin="round">
 <path d="M360 360C302 322 236 225 258 144 276 80 332 66 376 81 456 111 452 263 360 360Z" fill="url(#specimen-fold)"/>
 <path d="M360 360C375 269 345 190 376 81 422 169 439 270 360 360Z" fill="var(--petal-shade)" fill-opacity=".45"/>
 <path d="M360 360C307 267 278 165 340 91M360 360C325 257 317 167 354 86M360 360C350 246 346 156 368 83M360 360C400 258 407 170 383 94" opacity=".45"/>
 <path d="M272 163C277 120 307 97 330 94" stroke="var(--petal-glint)" stroke-width="2"/>
 </g></defs></svg>${petals}</div>
 <div class="specimen-heart"><svg viewBox="0 0 720 720" fill="none" stroke="var(--petal-line)"><circle cx="360" cy="360" r="68" fill="var(--paper)" stroke-width="1.2"/><circle cx="360" cy="360" r="60" stroke-dasharray="1 5" stroke-width="4"/><g stroke-width=".85" fill="var(--seed)" fill-opacity=".18">${seeds}</g><circle cx="360" cy="360" r="12" fill="var(--seed)" stroke-width="1.2"/><circle cx="360" cy="360" r="4" fill="var(--petal-line)" stroke="none"/></svg></div>
 </div>`
}
