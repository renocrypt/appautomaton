// Original procedural drawings, evaluated once at build time. A repository name
// supplies a stable seed, not a manually maintained artwork or destination map.
const around = (count, draw) => Array.from({length:count}, (_,i) => draw(i)).join('')
const rotate = (angle, content, x=240, y=160) => `<g transform="rotate(${angle} ${x} ${y})">${content}</g>`
const circle = (x,y,r,extra='') => `<circle cx="${x}" cy="${y}" r="${r}" ${extra}/>`
const ellipse = (rx,ry,extra='') => `<ellipse cx="240" cy="160" rx="${rx}" ry="${ry}" ${extra}/>`
const layer = (name, drawing) => `<div class="art-layer art-${name}"><svg viewBox="0 0 480 320" fill="none" stroke="currentColor" stroke-width="1.15" aria-hidden="true">${drawing}</svg></div>`

// Eight families, each with four structural variations and seeded orientation.
// Each pair of moving layers has a different relationship: counter-rotation,
// parallel translation, opening, or an offset orbit. No path morphing at runtime.
const drawings = {
  iris(v) {
    const n = 8 + v*2
    const petals = around(n,i => rotate(i*360/n, '<path d="M240 160C180 126 156 50 207 33 258 16 302 105 240 160Z" fill="var(--plate-light)"/><path d="M240 160C223 123 195 63 218 38" opacity=".65"/>'))
    return [circle(240,160,131)+circle(240,160,139,'stroke-dasharray="1 7"'), petals, circle(240,160,34,'fill="var(--plate)"')+around(12,i => rotate(i*30,'<path d="M240 143v-11"/>'))+circle(240,160,13,'fill="currentColor"')]
  },
  interference(v) {
    const lines = around(13,i => ellipse(21+i*8,118-i*2))
    return [circle(240,160,135,'stroke-dasharray="2 7"'), rotate(22+v*9,lines), rotate(-22-v*9,lines)]
  },
  orbit(v) {
    const axis = around(6+v,i => rotate(i*180/(6+v),ellipse(135,34+v*4)))
    return [circle(240,160,128)+circle(240,160,138,'stroke-dasharray="1 8"'), axis, circle(240,160,46,'fill="var(--plate)"')+circle(240,160,32)+circle(348,85,10,'fill="currentColor"')+circle(130,235,6,'fill="var(--plate-light)"')]
  },
  pleats(v) {
    const fan = around(12,i => rotate(i*12-66,`<path d="M240 160 223 ${32+v*5} 270 38Z" fill="${i%2?'var(--plate)':'var(--plate-light)'}"/>`))
    return [circle(240,160,139,'stroke-dasharray="2 8"')+'<path d="M80 160h320M240 16v288" opacity=".35"/>', fan, rotate(180,fan)+circle(240,160,17,'fill="currentColor"')]
  },
  current(v) {
    const waves = around(15,i => `<path d="M68 ${62+i*14}C145 ${-23+i*14+v*6} 173 ${262+i*3} 241 ${157+i*3}S354 ${38+i*14} 412 ${103+i*9}"/>`)
    return [circle(240,160,133,'stroke-dasharray="1 8"'), waves, rotate(180,waves)]
  },
  lattice(v) {
    const grid = around(5,r => around(5,c => `<rect x="${131+c*43}" y="${51+r*43}" width="${34+v*2}" height="${34+v*2}" rx="${v%2?17:0}"/>`))
    return [circle(240,160,142,'stroke-dasharray="1 8"'), rotate(8+v*8,grid), rotate(-8-v*8,grid)]
  },
  ribbon(v) {
    const bands = around(17,i => `<ellipse cx="240" cy="${65+i*12}" rx="${28+Math.sin(i/16*Math.PI)*88}" ry="${19+v*3}"/>`)
    return [circle(240,160,138,'stroke-dasharray="2 7"'), rotate(-24-v*6,bands), rotate(48+v*7,ellipse(124,35))+circle(329,252,7,'fill="currentColor"')]
  },
  seed(v) {
    const leaves = around(7,i => rotate(i*360/7, `<path d="M240 160C${125+v*8} 159 132 44 213 49 267 52 281 127 240 160Z" fill="var(--plate-light)"/><path d="M240 160C210 112 175 91 176 69"/>`))
    return [circle(240,160,137,'stroke-dasharray="1 8"'), leaves, rotate(26,around(7,i => rotate(i*360/7,ellipse(86,25))))+circle(240,160,19,'fill="var(--plate)"')]
  },
}

export function artwork(name) {
  let seed = 2166136261
  for (const char of name) seed = Math.imul(seed ^ char.codePointAt(0),16777619) >>> 0
  const family = ['pleats','interference','orbit','iris','current','lattice','seed','ribbon'][seed % 8]
  const variant = (seed >>> 6) % 4
  const layers = drawings[family](variant)
  return `<div class="plate-art art-${family}" style="--art-turn:${(seed >>> 9)%4*15}deg;--art-phase:-${seed%31}s" aria-hidden="true">${layers.map((drawing,i)=>layer(['ground','primary','secondary'][i],drawing)).join('')}</div>`
}
