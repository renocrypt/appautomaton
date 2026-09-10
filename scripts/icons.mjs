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
export function bloom() {
 const petals = Array.from({length:8},(_,i)=>`<g transform="rotate(${i*45} 240 240)"><path d="M240 242C208 217 158 161 172 104 184 56 220 37 240 20c20 17 56 36 68 84 14 57-36 113-68 138Z" fill="var(--petal)" stroke="var(--petal-line)" stroke-width="1.4"/><path d="M240 228V49M240 160l-24-48m24 15 25-41" fill="none" stroke="var(--petal-line)" stroke-width="1" opacity=".55"/></g>`).join('')
 return `<svg class="bloom" viewBox="0 0 480 480" aria-hidden="true"><g class="bloom-petals">${petals}</g><circle cx="240" cy="240" r="48" fill="var(--seed)" stroke="var(--petal-line)" stroke-width="1.5"/><circle cx="240" cy="240" r="32" fill="none" stroke="var(--petal-line)" stroke-dasharray="1 5" stroke-width="10"/><path d="M228 252l24-24m-24 0h24v24" fill="none" stroke="var(--petal-line)" stroke-width="3"/></svg>`
}
