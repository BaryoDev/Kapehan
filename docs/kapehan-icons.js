/**
 * Kapehan v0.2 icon source.
 *
 * DESIGN SYSTEM
 * -------------
 * Grid       48 x 48, 3px optical padding, everything optically centred on x=24.
 * Baseline   objects rest on y=42. Saucer lips at cy 39.4 / 40.6.
 * Cup rim    y=20 to 24 depending on vessel height. Handles draw BEFORE the body so they tuck behind.
 * Palette    only the tokens below. Liquid always runs ink to crema; foam is always milk;
 *            a vessel picks exactly ONE of: ceramic, clay, barako, slate/glass.
 *            Ceramic is deliberately warm-tinted, not white, because pure white ceramic
 *            disappears on the light backgrounds these icons actually sit on.
 * Strokes    steam and drizzle 2px round cap, handles 3 to 3.8px. Flat fills, no outlines, so
 *            the artwork survives 16px and screen printing alike.
 * Mono       elements marked data-mono="drop" are redundant highlights that merge into the
 *            silhouette once everything is one colour. The mono build removes them so the
 *            solid version stays a clean pictogram.
 */

export const palette = {
  ink: '#241A13',       // darkest coffee, liquid, knobs
  roast: '#5A3520',     // coffee body
  brown: '#8C5A32',     // crema, mid brown, wood
  crema: '#D6A164',     // light crema, burlap
  milk: '#F5E9D6',      // foam, milk
  ceramic: '#F4E8D6',   // warm white ceramic
  ceramicDeep: '#DBC5A4', // shadow side of ceramic
  barako: '#E5901A',    // brand accent
  barakoDeep: '#BE7008',
  clay: '#C2593A',      // terracotta vessel
  clayDeep: '#9E4025',
  slate: '#A7B3BA',     // metal
  slateDeep: '#77878F',
  glass: '#CBDCE3',     // glassware

  // Tea & more. A non-coffee drink may introduce ONE hue token, held at the same
  // muted chroma as the roasted ramp so it still sits in a row with the coffee icons.
  matcha: '#7A9B5A',
  matchaLight: '#94B571',
  ube: '#8E6BA8',
  ubeLight: '#B392C9',
  amber: '#C08A3E',     // brewed tea, salabat
  mango: '#F0B34A',
  citrus: '#D9C63E',    // calamansi juice
  leaf: '#8FAF4E',      // calamansi rind
  melon: '#DE7286',     // watermelon, halo-halo
  pandan: '#A8C486',    // buko pandan
};

const steam = (c, x1 = 21, x2 = 27, y = 13, w = 2) =>
  `<g stroke="${c}" stroke-width="${w}" stroke-linecap="round">
    <path d="M${x1} ${y}c-1.4 1.8 1.4 2.8 0 4.6"/>
    <path d="M${x2} ${y}c-1.4 1.8 1.4 2.8 0 4.6"/>
  </g>`;

const saucer = (dark, light, rx = 13.5) =>
  `<ellipse cx="24" cy="40.6" rx="${rx}" ry="3" fill="${dark}" data-mono="drop"/>
  <ellipse cx="24" cy="39.4" rx="${rx}" ry="3" fill="${light}"/>`;

export const icons = [
  {
    name: 'espresso',
    aliases: ['shot', 'cup-sm'],
    tags: ['demitasse', 'ristretto', 'doppio', 'hot', 'small'],
    category: 'Drinks',
    body: `${saucer('#DBC5A4', '#F4E8D6', 12.5)}
  <path d="M31 26.6c4.6 0 4.6 6 0 6" stroke="#DBC5A4" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  <path d="M17 24h14v5.6a7 6 0 0 1-14 0z" fill="#F4E8D6"/>
  <ellipse cx="24" cy="24" rx="7" ry="2.1" fill="#241A13"/>
  <ellipse cx="24" cy="23.8" rx="4.6" ry="1.3" fill="#5A3520" data-mono="drop"/>
  ${steam('#C9A87E', 21, 27, 15)}`,
  },
  {
    name: 'americano',
    aliases: ['long-black', 'cup-black'],
    tags: ['black', 'hot', 'lungo', 'brewed'],
    category: 'Drinks',
    body: `${saucer('#DBC5A4', '#F4E8D6', 14)}
  <path d="M33 24c5.4 0 5.4 7.6 0 7.6" stroke="#DBC5A4" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  <path d="M14 21h20v7.4a10 8 0 0 1-20 0z" fill="#F4E8D6"/>
  <ellipse cx="24" cy="21" rx="10" ry="2.8" fill="#241A13"/>
  ${steam('#C9A87E', 20, 28, 12)}`,
  },
  {
    name: 'latte',
    aliases: ['glass-latte', 'cup-tall'],
    tags: ['milk', 'latte-art', 'glass', 'layered', 'hot'],
    category: 'Drinks',
    body: `<ellipse cx="24" cy="42" rx="11" ry="2.4" fill="#DBC5A4" data-mono="drop"/>
  <path d="M15.5 13h17l-1.9 25.6a3 3 0 0 1-3 2.8h-7.2a3 3 0 0 1-3-2.8z" fill="#CBDCE3"/>
  <path d="M16.9 22h14.2l-1.3 16a2.6 2.6 0 0 1-2.6 2.4h-6.4a2.6 2.6 0 0 1-2.6-2.4z" fill="#5A3520" data-mono="drop"/>
  <path d="M16.2 16.4h15.6l-.42 5.6H16.62z" fill="#D6A164" data-mono="drop"/>
  <path d="M15.5 13h17l-.3 3.4H15.8z" fill="#F5E9D6" data-mono="drop"/>
  <path d="M24 25.6c1.1-1.5 3.8-.6 3.8 1.3 0 1.6-2.3 3.1-3.8 4.4-1.5-1.3-3.8-2.8-3.8-4.4 0-1.9 2.7-2.8 3.8-1.3z" fill="#F5E9D6" data-mono="drop"/>`,
    // Solid glass with the heart knocked out (evenodd), so the latte keeps its signature in one colour.
    monoBody: `<path fill-rule="evenodd" d="M15.5 13h17l-1.9 25.6a3 3 0 0 1-3 2.8h-7.2a3 3 0 0 1-3-2.8zM24 25.6c1.1-1.5 3.8-.6 3.8 1.3 0 1.6-2.3 3.1-3.8 4.4-1.5-1.3-3.8-2.8-3.8-4.4 0-1.9 2.7-2.8 3.8-1.3z" fill="currentColor"/>`,
  },
  {
    name: 'macchiato',
    aliases: ['cup-marked', 'piccolo'],
    tags: ['stained', 'milk', 'dot', 'hot'],
    category: 'Drinks',
    body: `${saucer('#DBC5A4', '#F4E8D6')}
  <path d="M32.5 24c5.2 0 5.2 7 0 7" stroke="#DBC5A4" stroke-width="3.3" stroke-linecap="round" fill="none"/>
  <path d="M15 21.5h18v7a9 7.5 0 0 1-18 0z" fill="#F4E8D6"/>
  <ellipse cx="24" cy="21.5" rx="9" ry="2.6" fill="#241A13"/>
  <circle cx="24" cy="21.2" r="2.9" fill="#F5E9D6" data-mono="drop"/>
  ${steam('#C9A87E', 20, 28, 12.5)}`,
  },
  {
    name: 'cappuccino',
    aliases: ['cup-foam', 'capp'],
    tags: ['foam', 'cocoa', 'terracotta', 'hot'],
    category: 'Drinks',
    body: `${saucer('#9E4025', '#C2593A')}
  <path d="M32.5 24c5.2 0 5.2 7 0 7" stroke="#C2593A" stroke-width="3.3" stroke-linecap="round" fill="none"/>
  <path d="M15 21.5h18v7a9 7.5 0 0 1-18 0z" fill="#C2593A"/>
  <ellipse cx="24" cy="21.3" rx="9" ry="3" fill="#F5E9D6" data-mono="drop"/>
  <g fill="#8C5A32" data-mono="drop">
    <circle cx="20.2" cy="21" r="1"/>
    <circle cx="24" cy="22.1" r="1"/>
    <circle cx="27.8" cy="21" r="1"/>
  </g>
  ${steam('#F5E9D6', 20, 28, 12.5)}`,
  },
  {
    name: 'mocha',
    aliases: ['cup-choco', 'mochaccino'],
    tags: ['chocolate', 'drizzle', 'sweet', 'hot'],
    category: 'Drinks',
    body: `${saucer('#DBC5A4', '#F4E8D6')}
  <path d="M32.5 24c5.2 0 5.2 7 0 7" stroke="#DBC5A4" stroke-width="3.3" stroke-linecap="round" fill="none"/>
  <path d="M15 21.5h18v7a9 7.5 0 0 1-18 0z" fill="#F4E8D6"/>
  <ellipse cx="24" cy="21.3" rx="9" ry="2.9" fill="#F5E9D6" data-mono="drop"/>
  <path d="M16.8 21c1.8-1.6 3.6-1.6 5.4 0s3.6 1.6 5.4 0" stroke="#5A3520" stroke-width="2.2" stroke-linecap="round" fill="none"/>`,
  },
  {
    name: 'barako',
    aliases: ['kapeng-barako', 'cup-barako'],
    tags: ['liberica', 'batangas', 'strong', 'filipino', 'hot'],
    category: 'Drinks',
    body: `<ellipse cx="24" cy="40.8" rx="15" ry="3.2" fill="#BE7008" data-mono="drop"/>
  <ellipse cx="24" cy="39.5" rx="15" ry="3.2" fill="#E5901A"/>
  <path d="M33.5 23c5.8 0 5.8 8.6 0 8.6" stroke="#5A3520" stroke-width="3.8" stroke-linecap="round" fill="none"/>
  <path d="M13 20h22v7.5a11 8.5 0 0 1-22 0z" fill="#8C5A32"/>
  <path d="M13 20h22v3.2H13z" fill="#5A3520" data-mono="drop"/>
  <ellipse cx="24" cy="20" rx="11" ry="3" fill="#241A13"/>
  <ellipse cx="24" cy="20" rx="11" ry="3" stroke="#E5901A" stroke-width="1.6" fill="none" data-mono="drop"/>
  ${steam('#E5901A', 20, 28, 8.6, 2.2)}`,
  },
  {
    name: 'cold-brew',
    aliases: ['iced', 'cup-cold'],
    tags: ['ice', 'straw', 'cold', 'glass', 'summer'],
    category: 'Drinks',
    body: `<ellipse cx="24" cy="42" rx="10.5" ry="2.3" fill="#DBC5A4" data-mono="drop"/>
  <path d="M16 15h16l-1.6 23.6a3 3 0 0 1-3 2.8h-6.8a3 3 0 0 1-3-2.8z" fill="#CBDCE3"/>
  <path d="M16.6 20h14.8l-1.3 18.6a2.7 2.7 0 0 1-2.7 2.5h-6.8a2.7 2.7 0 0 1-2.7-2.5z" fill="#5A3520" data-mono="drop"/>
  <g fill="#F4E8D6" data-mono="drop">
    <rect x="18.4" y="21.6" width="6.6" height="6.6" rx="1.5" transform="rotate(-14 21.7 24.9)"/>
    <rect x="23.8" y="28.4" width="6.2" height="6.2" rx="1.4" transform="rotate(16 26.9 31.5)"/>
  </g>
  <path d="M31.4 7.6 26.6 21.4" stroke="#E5901A" stroke-width="3.2" stroke-linecap="round"/>`,
  },
  {
    name: 'tablea',
    aliases: ['tsokolate', 'cacao-tablet'],
    tags: ['chocolate', 'batirol', 'filipino', 'cacao', 'disc'],
    category: 'Drinks',
    body: `<ellipse cx="24" cy="41.6" rx="12" ry="2.2" fill="#DBC5A4" data-mono="drop"/>
  <path d="M12.6 34.8h22.8v2.8a11.4 3.6 0 0 1-22.8 0z" fill="#46281A"/>
  <ellipse cx="24" cy="34.8" rx="11.4" ry="3.6" fill="#7A4B2A"/>
  <path d="M12.6 29.4h22.8v2.8a11.4 3.6 0 0 1-22.8 0z" fill="#46281A"/>
  <ellipse cx="24" cy="29.4" rx="11.4" ry="3.6" fill="#8C5A32"/>
  <path d="M12.6 24h22.8v2.8a11.4 3.6 0 0 1-22.8 0z" fill="#46281A"/>
  <ellipse cx="24" cy="24" rx="11.4" ry="3.6" fill="#9C6538"/>
  <g stroke="#5A3520" stroke-width="2" stroke-linecap="round" data-mono="drop">
    <path d="M15.8 24h16.4"/>
    <path d="M24 21.8v4.4"/>
  </g>`,
  },

  {
    name: 'coffee-cup',
    aliases: ['takeaway', 'cup-togo'],
    tags: ['paper', 'to-go', 'lid', 'sleeve', 'takeout'],
    category: 'Vessels',
    body: `<path d="M15 15h18l-2.4 22.6a3 3 0 0 1-3 2.7h-7.2a3 3 0 0 1-3-2.7z" fill="#F4E8D6"/>
  <path d="M17.1 26.6h13.8l-1 11a3 3 0 0 1-3 2.7h-5.8a3 3 0 0 1-3-2.7z" fill="#DBC5A4" data-mono="drop"/>
  <rect x="15.8" y="24.6" width="16.4" height="5.4" rx="1.6" fill="#C2593A" data-mono="drop"/>
  <path d="M13.4 12.6h21.2l-.6 4.2a1.7 1.7 0 0 1-1.7 1.5H15.7a1.7 1.7 0 0 1-1.7-1.5z" fill="#8C5A32"/>
  <path d="M14 11.4h20a1.6 1.6 0 0 1 1.6 1.6H12.4A1.6 1.6 0 0 1 14 11.4z" fill="#5A3520" data-mono="drop"/>
  ${steam('#C9A87E', 21, 27, 4.2)}`,
  },
  {
    name: 'coffee-bean',
    aliases: ['bean'],
    tags: ['roast', 'seed', 'single-origin', 'arabica'],
    category: 'Beans',
    body: `<g transform="rotate(-32 24 24)">
    <ellipse cx="24" cy="24" rx="10" ry="14" fill="#5A3520"/>
    <path d="M24 11.6c-3.2 3.4-3.2 21.4 0 24.8" stroke="#241A13" stroke-width="2.6" stroke-linecap="round" fill="none" data-mono="drop"/>
    <path d="M17.8 16.6c2.6 2.2 2.6 12.6 0 14.8" stroke="#8C5A32" stroke-width="2" stroke-linecap="round" fill="none" data-mono="drop"/>
  </g>`,
    // A bean without its crease is just an ellipse, and a dark crease on a solid one-colour
    // bean is invisible. So the mono bean is two lobes with the crease as negative space.
    monoBody: `<g transform="rotate(-32 24 24)">
    <path d="M22.4 10.6C19.2 16 19.2 32 22.4 37.4 17.4 36.6 14 31 14 24 14 17 17.4 11.4 22.4 10.6z" fill="currentColor"/>
    <path d="M25 10.6C21.8 16 21.8 32 25 37.4 30 36.6 34 31 34 24 34 17 30 11.4 25 10.6z" fill="currentColor"/>
  </g>`,
  },
  {
    name: 'coffee-sack',
    aliases: ['sack', 'beans-bag'],
    tags: ['jute', 'burlap', 'green-beans', 'wholesale', 'kilo'],
    category: 'Beans',
    body: `<path d="M14.6 19h18.8l1.6 15a5 5 0 0 1-5 5.6H18a5 5 0 0 1-5-5.6z" fill="#D6A164"/>
  <path d="M13.6 14.4c2.6-1.8 6.4-2.4 10.4-2.4s7.8.6 10.4 2.4L33.4 19.4H14.6z" fill="#C08D50"/>
  <g stroke="#AE7C42" stroke-width="1.5" stroke-linecap="round" data-mono="drop">
    <path d="M18.6 15v4"/>
    <path d="M24 14.4v5"/>
    <path d="M29.4 15v4"/>
  </g>
  <circle cx="24" cy="29.4" r="5.8" fill="#5A3520" data-mono="drop"/>
  <path d="M24 24.6c-2 2-2 7.6 0 9.6" stroke="#D6A164" stroke-width="1.7" stroke-linecap="round" fill="none" data-mono="drop"/>`,
  },
  {
    name: 'drip-bag',
    aliases: ['sachet', 'drip-sachet'],
    tags: ['single-serve', 'instant', 'travel', 'pouch', '3-in-1'],
    category: 'Beans',
    body: `<path d="M9.4 14.4h29.2v3.4H9.4z" fill="#C08D50"/>
  <rect x="14" y="9" width="20" height="30" rx="2.2" fill="#F4E8D6"/>
  <path d="M16.2 9h15.6a2.2 2.2 0 0 1 2.2 2.2V14.2H14v-3A2.2 2.2 0 0 1 16.2 9z" fill="#8C5A32"/>
  <path d="M14 19.6h20" stroke="#DBC5A4" stroke-width="1.6" stroke-dasharray="2.4 2.4" data-mono="drop"/>
  <path d="M34 17.8 31.4 19.6 34 21.4z" fill="#F4E8D6" data-mono="drop"/>
  <g transform="rotate(-28 24 28.4)" data-mono="drop">
    <ellipse cx="24" cy="28.4" rx="5.2" ry="7" fill="#5A3520"/>
    <path d="M24 22c-1.7 1.8-1.7 11 0 12.8" stroke="#F4E8D6" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  </g>`,
  },
  {
    name: 'stamp-card',
    aliases: ['loyalty', 'punch-card'],
    tags: ['rewards', 'free-cup', 'suki', 'membership'],
    category: 'Beans',
    body: `<rect x="7" y="13" width="34" height="22" rx="3" fill="#F4E8D6"/>
  <path d="M10 13h28a3 3 0 0 1 3 3v2.6H7V16a3 3 0 0 1 3-3z" fill="#E5901A" data-mono="drop"/>
  <g data-mono="drop">
    <circle cx="13.4" cy="27" r="3.2" fill="#5A3520"/>
    <circle cx="20.4" cy="27" r="3.2" fill="#5A3520"/>
    <circle cx="27.4" cy="27" r="3.2" fill="#5A3520"/>
    <circle cx="34.4" cy="27" r="3.2" fill="none" stroke="#C9A87E" stroke-width="1.8" stroke-dasharray="3.2 2.4"/>
  </g>`,
    // Solid card with the header rule and stamps knocked out; the unearned stamp is a smaller hole.
    monoBody: `<path fill-rule="evenodd" d="M10 13h28a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V16a3 3 0 0 1 3-3zM7 18.6h34v1.8H7zM10.4 27a3 3 0 1 0 6 0 3 3 0 1 0-6 0zM17.4 27a3 3 0 1 0 6 0 3 3 0 1 0-6 0zM24.4 27a3 3 0 1 0 6 0 3 3 0 1 0-6 0zM32.9 27a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0z" fill="currentColor"/>`,
  },

  {
    name: 'french-press',
    aliases: ['press', 'plunger'],
    tags: ['immersion', 'carafe', 'brewer', 'plunge'],
    category: 'Brewers',
    body: `<path d="M30 19.4h2.8a3.8 3.8 0 0 1 0 8.6H30" stroke="#77878F" stroke-width="3.2" fill="none"/>
  <rect x="15" y="14" width="15" height="26" rx="3" fill="#CBDCE3"/>
  <path d="M15 26.6h15V37a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3z" fill="#5A3520" data-mono="drop"/>
  <rect x="15" y="26.6" width="15" height="2.6" fill="#8C5A32" data-mono="drop"/>
  <rect x="15" y="20.4" width="15" height="2.6" fill="#77878F" data-mono="drop"/>
  <rect x="13.4" y="10.4" width="18.2" height="4.2" rx="2.1" fill="#A7B3BA"/>
  <rect x="22.6" y="6" width="2.8" height="4.8" fill="#A7B3BA"/>
  <rect x="19.6" y="3" width="8.8" height="3.4" rx="1.7" fill="#77878F"/>`,
  },
  {
    name: 'pour-over',
    aliases: ['v60', 'dripper'],
    tags: ['filter', 'cone', 'hand-brew', 'bloom', 'chemex'],
    category: 'Brewers',
    body: `<path d="M17 30h14l-.9 8.4a3 3 0 0 1-3 2.6h-6.2a3 3 0 0 1-3-2.6z" fill="#CBDCE3"/>
  <path d="M17.6 34h12.8l-.5 4.4a3 3 0 0 1-3 2.6h-5.8a3 3 0 0 1-3-2.6z" fill="#5A3520" data-mono="drop"/>
  <path d="M13 18h22l-7.6 11.4h-6.8z" fill="#F4E8D6"/>
  <ellipse cx="24" cy="18" rx="11" ry="2.8" fill="#DBC5A4"/>
  <ellipse cx="24" cy="18" rx="8.4" ry="1.9" fill="#5A3520" data-mono="drop"/>
  <path d="M24 30.2v2.2" stroke="#5A3520" stroke-width="1.8" stroke-linecap="round" data-mono="drop"/>`,
  },
  {
    name: 'moka-pot',
    aliases: ['moka', 'stovetop'],
    tags: ['bialetti', 'italian', 'stove', 'octagon', 'brewer'],
    category: 'Brewers',
    body: `<path d="M30 28.6c4.6 0 4.6 6.6 0 6.6" stroke="#241A13" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  <path d="M30.2 17.4 34.4 15.6 35.2 18.2 31 20z" fill="#A7B3BA"/>
  <path d="M18 27h12l1.6 10.4a2.4 2.4 0 0 1-2.4 2.6H18.8a2.4 2.4 0 0 1-2.4-2.6z" fill="#A7B3BA"/>
  <rect x="17.6" y="24.4" width="12.8" height="2.8" fill="#77878F" data-mono="drop"/>
  <path d="M18.6 15.2h10.8l-1.4 9.4h-8z" fill="#CBDCE3"/>
  <rect x="18" y="12" width="12" height="3.4" rx="1.2" fill="#77878F"/>
  <circle cx="24" cy="9.8" r="2" fill="#241A13"/>`,
  },
  {
    name: 'aeropress',
    aliases: ['press-air'],
    tags: ['plunger', 'brewer', 'travel', 'syringe'],
    category: 'Brewers',
    body: `<path d="M30.5 31.4c4.4 0 4.4 5.6 0 5.6" stroke="#DBC5A4" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  <path d="M17.5 28h13l-1 10.4a3 3 0 0 1-3 2.6h-5a3 3 0 0 1-3-2.6z" fill="#F4E8D6"/>
  <rect x="18" y="13.6" width="12" height="14.8" rx="1.8" fill="#CBDCE3"/>
  <rect x="18" y="23" width="12" height="5.4" fill="#5A3520" data-mono="drop"/>
  <rect x="18" y="20.6" width="12" height="2.8" fill="#241A13" data-mono="drop"/>
  <rect x="22.2" y="6.4" width="3.6" height="7.4" fill="#A7B3BA"/>
  <rect x="17.4" y="3.4" width="13.2" height="3.6" rx="1.8" fill="#77878F"/>`,
  },
  {
    name: 'barako-pot',
    aliases: ['palayok', 'clay-pot'],
    tags: ['filipino', 'kettle', 'earthenware', 'boiled', 'kapeng-barako'],
    category: 'Brewers',
    body: `<ellipse cx="24" cy="41" rx="12.5" ry="2.6" fill="#DBC5A4" data-mono="drop"/>
  <path d="M33 25c5 0 5 7 0 7" stroke="#9E4025" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  <path d="M12.6 24.6c-3.2 1-3.2 6.4 0 7.4l2.4-.8v-5.8z" fill="#C2593A"/>
  <path d="M15 22h18v9a9 9 0 0 1-18 0z" fill="#C2593A"/>
  <ellipse cx="24" cy="22" rx="9" ry="3" fill="#9E4025" data-mono="drop"/>
  <ellipse cx="24" cy="19.6" rx="7.6" ry="2.6" fill="#D9714D"/>
  <circle cx="24" cy="16.4" r="1.9" fill="#9E4025"/>
  ${steam('#D6A164', 20.4, 27.6, 8.4)}`,
  },
  {
    name: 'kettle',
    aliases: ['gooseneck', 'tea-kettle'],
    tags: ['pour', 'spout', 'water', 'boil', 'hand-brew'],
    category: 'Brewers',
    body: `<ellipse cx="24" cy="41" rx="11" ry="2.4" fill="#DBC5A4" data-mono="drop"/>
  <path d="M33 26c5.4 0 5.4 9 0 9" stroke="#241A13" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M16 26.4c-5.2 0-7.4-4.4-7.4-9.4" stroke="#A7B3BA" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M15 24h18v10a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z" fill="#CBDCE3"/>
  <path d="M17 20h14l2 4H15z" fill="#A7B3BA"/>
  <rect x="20.4" y="16.6" width="7.2" height="3.6" rx="1.4" fill="#77878F"/>
  <circle cx="24" cy="14.4" r="1.8" fill="#241A13"/>`,
  },
  {
    name: 'grinder',
    aliases: ['mill', 'gilingan'],
    tags: ['burr', 'crank', 'grind', 'manual', 'hopper'],
    category: 'Equipment',
    body: `<rect x="14" y="21.6" width="20" height="17.4" rx="2.6" fill="#8C5A32"/>
  <rect x="15.8" y="30.6" width="16.4" height="7" rx="1.6" fill="#5A3520" data-mono="drop"/>
  <circle cx="24" cy="34.1" r="1.5" fill="#E5901A" data-mono="drop"/>
  <rect x="13" y="18.6" width="22" height="3" rx="1.4" fill="#77878F"/>
  <path d="M19 18.6a5 5 0 0 1 10 0z" fill="#CBDCE3"/>
  <path d="M24 18v-4.6h5.4" stroke="#77878F" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <circle cx="30.2" cy="13.4" r="2.4" fill="#241A13"/>`,
  },
  {
    name: 'espresso-machine',
    aliases: ['machine', 'barista-bar'],
    tags: ['group-head', 'portafilter', 'cafe', 'steam-wand', 'pull'],
    category: 'Equipment',
    body: `<rect x="8.6" y="5.6" width="30.8" height="3.8" rx="1.9" fill="#9E4025"/>
  <path d="M39 18.6v8.4" stroke="#77878F" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M13 9.4h22a3 3 0 0 1 3 3v29.6h-8V28.4H18V42h-8V12.4a3 3 0 0 1 3-3z" fill="#C2593A"/>
  <circle cx="15.6" cy="15.8" r="3.8" fill="#F4E8D6" data-mono="drop"/>
  <circle cx="15.6" cy="15.8" r="1.2" fill="#241A13" data-mono="drop"/>
  <rect x="22" y="14.2" width="13" height="3.2" rx="1.6" fill="#9E4025" data-mono="drop"/>
  <circle cx="32.6" cy="21.8" r="2.4" fill="#E5901A" data-mono="drop"/>
  <rect x="28.2" y="27.4" width="6.6" height="2.8" rx="1.4" fill="#241A13"/>
  <rect x="18.8" y="26.4" width="10.4" height="4" rx="1.3" fill="#77878F"/>
  <path d="M23 30.4h2.2v2h-2.2z" fill="#77878F"/>
  <path d="M24.1 32.8v1.8" stroke="#5A3520" stroke-width="1.5" stroke-linecap="round" data-mono="drop"/>
  <path d="M19.6 34.8h9l-.8 5a2.2 2.2 0 0 1-2.2 1.8h-3a2.2 2.2 0 0 1-2.2-1.8z" fill="#F4E8D6"/>`,
  },
  {
    name: 'tea',
    aliases: ['hot-tea', 'tsaa'],
    tags: ['teabag', 'brew', 'steep', 'black-tea', 'hot'],
    category: 'Tea & more',
    body: `${saucer('#DBC5A4', '#F4E8D6')}
  <path d="M32.5 24c5.2 0 5.2 7 0 7" stroke="#DBC5A4" stroke-width="3.3" stroke-linecap="round" fill="none"/>
  <path d="M15 21.5h18v7a9 7.5 0 0 1-18 0z" fill="#F4E8D6"/>
  <ellipse cx="24" cy="21.5" rx="9" ry="2.6" fill="#C08A3E"/>
  <path d="M26.6 21c2.4-2.8 3.4-5.4 3.4-8" stroke="#C9A87E" stroke-width="1.4" fill="none" data-mono="drop"/>
  <rect x="27.4" y="8.4" width="5.6" height="4.4" rx="1.2" fill="#F4E8D6"/>
  ${steam('#C9A87E', 18.6, 23, 12.5)}`,
  },
  {
    name: 'matcha',
    aliases: ['green-tea-latte', 'usucha'],
    tags: ['green', 'whisked', 'ceremonial', 'hot'],
    category: 'Tea & more',
    body: `${saucer('#DBC5A4', '#F4E8D6')}
  <path d="M32.5 24c5.2 0 5.2 7 0 7" stroke="#DBC5A4" stroke-width="3.3" stroke-linecap="round" fill="none"/>
  <path d="M15 21.5h18v7a9 7.5 0 0 1-18 0z" fill="#F4E8D6"/>
  <ellipse cx="24" cy="21.5" rx="9" ry="2.6" fill="#7A9B5A"/>
  <ellipse cx="24" cy="21.2" rx="5.4" ry="1.5" fill="#94B571" data-mono="drop"/>
  ${steam('#94B571', 20, 28, 12.5)}`,
  },
  {
    name: 'salabat',
    aliases: ['ginger-tea', 'ginger'],
    tags: ['filipino', 'ginger', 'remedy', 'honey', 'hot'],
    category: 'Tea & more',
    body: `${saucer('#DBC5A4', '#F4E8D6')}
  <path d="M32.5 24c5.2 0 5.2 7 0 7" stroke="#DBC5A4" stroke-width="3.3" stroke-linecap="round" fill="none"/>
  <path d="M15 21.5h18v7a9 7.5 0 0 1-18 0z" fill="#F4E8D6"/>
  <ellipse cx="24" cy="21.5" rx="9" ry="2.6" fill="#C08A3E"/>
  <circle cx="31.4" cy="20" r="3.6" fill="#E8C06A"/>
  <circle cx="31.4" cy="20" r="1.7" fill="#C99236" data-mono="drop"/>
  ${steam('#C9A87E', 18.6, 24, 12.5)}`,
  },
  {
    name: 'hot-chocolate',
    aliases: ['cocoa', 'tsokolate-drink'],
    tags: ['marshmallow', 'chocolate', 'winter', 'sweet', 'hot'],
    category: 'Tea & more',
    body: `${saucer('#DBC5A4', '#F4E8D6')}
  <path d="M32.5 24c5.2 0 5.2 7 0 7" stroke="#DBC5A4" stroke-width="3.3" stroke-linecap="round" fill="none"/>
  <path d="M15 21.5h18v7a9 7.5 0 0 1-18 0z" fill="#F4E8D6"/>
  <ellipse cx="24" cy="21.5" rx="9" ry="2.6" fill="#5A3520"/>
  <g fill="#F5E9D6" data-mono="drop">
    <rect x="18.6" y="19.8" width="4.2" height="3.4" rx="1.4"/>
    <rect x="24.4" y="20.2" width="4.2" height="3.4" rx="1.4"/>
    <rect x="22" y="18.2" width="3.8" height="3.2" rx="1.3"/>
  </g>
  ${steam('#C9A87E', 20, 28, 11.6)}`,
  },
  {
    name: 'milk-tea',
    aliases: ['boba', 'pearl-tea'],
    tags: ['bubble-tea', 'sago', 'pearls', 'straw', 'cold'],
    category: 'Tea & more',
    body: `<ellipse cx="24" cy="42" rx="10.5" ry="2.2" fill="#DBC5A4" data-mono="drop"/>
  <path d="M15.4 14h17.2l-1.8 24.4a3 3 0 0 1-3 2.8h-7.6a3 3 0 0 1-3-2.8z" fill="#CBDCE3"/>
  <path d="M16.2 19h15.6l-1.4 19.4a2.7 2.7 0 0 1-2.7 2.5h-7.4a2.7 2.7 0 0 1-2.7-2.5z" fill="#C9A87E" data-mono="drop"/>
  <g fill="#241A13" data-mono="drop">
    <circle cx="20.6" cy="35.6" r="1.9"/>
    <circle cx="24.8" cy="36.8" r="1.9"/>
    <circle cx="28.2" cy="35.2" r="1.9"/>
    <circle cx="22.6" cy="32.2" r="1.8"/>
    <circle cx="26.6" cy="31.8" r="1.8"/>
  </g>
  <rect x="14.2" y="12.8" width="19.6" height="3.2" rx="1.2" fill="#8C5A32"/>
  <path d="M30.8 7.2 26.6 20.4" stroke="#C2593A" stroke-width="3.4" stroke-linecap="round"/>`,
  },
  {
    name: 'ube-latte',
    aliases: ['ube', 'purple-yam'],
    tags: ['filipino', 'purple', 'layered', 'glass', 'sweet'],
    category: 'Tea & more',
    body: `<ellipse cx="24" cy="42" rx="11" ry="2.4" fill="#DBC5A4" data-mono="drop"/>
  <path d="M15.5 13h17l-1.9 25.6a3 3 0 0 1-3 2.8h-7.2a3 3 0 0 1-3-2.8z" fill="#CBDCE3"/>
  <path d="M16.9 22h14.2l-1.3 16a2.6 2.6 0 0 1-2.6 2.4h-6.4a2.6 2.6 0 0 1-2.6-2.4z" fill="#8E6BA8" data-mono="drop"/>
  <path d="M16.2 16.4h15.6l-.42 5.6H16.62z" fill="#B392C9" data-mono="drop"/>
  <path d="M15.5 13h17l-.3 3.4H15.8z" fill="#F5E9D6" data-mono="drop"/>`,
  },
  {
    name: 'mango-shake',
    aliases: ['shake', 'smoothie'],
    tags: ['fruit', 'blended', 'cold', 'straw', 'tropical'],
    category: 'Tropical',
    body: `<ellipse cx="24" cy="42" rx="10.5" ry="2.2" fill="#DBC5A4" data-mono="drop"/>
  <path d="M15.6 16h16.8l-1.7 22.4a3 3 0 0 1-3 2.8h-7.4a3 3 0 0 1-3-2.8z" fill="#CBDCE3"/>
  <path d="M16.3 20h15.4l-1.3 18.4a2.7 2.7 0 0 1-2.7 2.5h-7.4a2.7 2.7 0 0 1-2.7-2.5z" fill="#F0B34A" data-mono="drop"/>
  <path d="M24 12.4 30.6 15.4H17.4z" fill="#E5901A" data-mono="drop"/>
  <path d="M30.4 8.4 26.8 20" stroke="#8FAF4E" stroke-width="3.2" stroke-linecap="round"/>`,
  },
  {
    name: 'buko-juice',
    aliases: ['coconut', 'buko'],
    tags: ['filipino', 'coconut', 'straw', 'cold', 'tropical'],
    category: 'Tropical',
    body: `<circle cx="24" cy="26" r="12.4" fill="#8C5A32"/>
  <g stroke="#6E4426" stroke-width="1.6" stroke-linecap="round" fill="none" data-mono="drop">
    <path d="M18.4 20.6c-2.6 3.6-2.6 9.6 0 13.2"/>
    <path d="M29.6 20.6c2.6 3.6 2.6 9.6 0 13.2"/>
  </g>
  <ellipse cx="24" cy="17.4" rx="7.4" ry="2.6" fill="#F4E8D6"/>
  <path d="M31.4 7.6 27 17" stroke="#C2593A" stroke-width="3.2" stroke-linecap="round"/>`,
  },
  {
    name: 'calamansi',
    aliases: ['citrus', 'juice'],
    tags: ['filipino', 'lime', 'sour', 'refresher', 'cold'],
    category: 'Tropical',
    body: `<ellipse cx="24" cy="42" rx="10" ry="2.2" fill="#DBC5A4" data-mono="drop"/>
  <path d="M16.6 19h14.8l-1.4 19.4a3 3 0 0 1-3 2.6h-6a3 3 0 0 1-3-2.6z" fill="#CBDCE3"/>
  <path d="M17.3 24h13.4l-1.1 14.4a2.7 2.7 0 0 1-2.7 2.4h-5.8a2.7 2.7 0 0 1-2.7-2.4z" fill="#D9C63E" data-mono="drop"/>
  <circle cx="31.6" cy="17.8" r="4.2" fill="#8FAF4E"/>
  <circle cx="31.6" cy="17.8" r="2.2" fill="#DCE68C" data-mono="drop"/>`,
  },
  {
    name: 'halo-halo',
    aliases: ['halohalo', 'shaved-ice'],
    tags: ['filipino', 'dessert', 'ube', 'layered', 'summer', 'tropical'],
    category: 'Tropical',
    body: `<ellipse cx="24" cy="42" rx="10.5" ry="2.2" fill="#DBC5A4" data-mono="drop"/>
  <path d="M32.4 6.6 29.4 20.4" stroke="#A7B3BA" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M15.4 17h17.2l-1.8 21.4a3 3 0 0 1-3 2.8h-7.6a3 3 0 0 1-3-2.8z" fill="#CBDCE3"/>
  <path d="M16.4 30h15.2l-.7 8.4a2.7 2.7 0 0 1-2.7 2.5h-8.4a2.7 2.7 0 0 1-2.7-2.5z" fill="#8E6BA8" data-mono="drop"/>
  <path d="M16 24.6h16l-.5 5.6H16.5z" fill="#DE7286" data-mono="drop"/>
  <path d="M15.6 19.4h16.8l-.4 5.2H16z" fill="#F5E9D6" data-mono="drop"/>
  <path d="M16.2 17.6a7.8 7.8 0 0 1 15.6 0z" fill="#B392C9"/>
  <path d="M17.4 8.4 20.6 19.4" stroke="#C2593A" stroke-width="3.2" stroke-linecap="round"/>`,
  },
  {
    name: 'sago-gulaman',
    aliases: ['samalamig', 'gulaman'],
    tags: ['filipino', 'sago', 'jelly', 'street', 'cold', 'tropical'],
    category: 'Tropical',
    body: `<ellipse cx="24" cy="42" rx="10.5" ry="2.2" fill="#DBC5A4" data-mono="drop"/>
  <path d="M15.6 15h16.8l-1.7 23.4a3 3 0 0 1-3 2.8h-7.4a3 3 0 0 1-3-2.8z" fill="#CBDCE3"/>
  <path d="M16.3 19.6h15.4l-1.3 18.8a2.7 2.7 0 0 1-2.7 2.5h-7.4a2.7 2.7 0 0 1-2.7-2.5z" fill="#C08A3E" data-mono="drop"/>
  <g fill="#C2593A" data-mono="drop">
    <rect x="18" y="22.6" width="5.2" height="5.2" rx="1.2" transform="rotate(-12 20.6 25.2)"/>
    <rect x="24.4" y="26.4" width="4.8" height="4.8" rx="1.1" transform="rotate(15 26.8 28.8)"/>
  </g>
  <g fill="#F4E8D6" data-mono="drop">
    <circle cx="20.4" cy="36.2" r="1.7"/>
    <circle cx="24.4" cy="37.4" r="1.7"/>
    <circle cx="28" cy="35.8" r="1.7"/>
  </g>
  <path d="M30.6 8.4 26.8 20" stroke="#8FAF4E" stroke-width="3.2" stroke-linecap="round"/>`,
  },
  {
    name: 'buko-pandan',
    aliases: ['pandan', 'coconut-pandan'],
    tags: ['filipino', 'pandan', 'coconut', 'dessert', 'tropical'],
    category: 'Tropical',
    body: `<ellipse cx="24" cy="42" rx="10" ry="2.2" fill="#DBC5A4" data-mono="drop"/>
  <path d="M16.4 19h15.2l-1.4 19.4a3 3 0 0 1-3 2.6h-6.4a3 3 0 0 1-3-2.6z" fill="#CBDCE3"/>
  <path d="M17.1 23.6h13.8l-1.1 14.8a2.7 2.7 0 0 1-2.7 2.4h-6.2a2.7 2.7 0 0 1-2.7-2.4z" fill="#A8C486" data-mono="drop"/>
  <g fill="#F4E8D6" data-mono="drop">
    <rect x="18.8" y="27" width="7.2" height="2.4" rx="1.2" transform="rotate(-10 22.4 28.2)"/>
    <rect x="22.2" y="32" width="6.6" height="2.4" rx="1.2" transform="rotate(12 25.5 33.2)"/>
  </g>
  <path d="M29.4 19.4c3.8-1.6 5.8-4.6 6-8-3.8 1.6-5.8 4.6-6 8z" fill="#6E8B5E"/>`,
  },
  {
    name: 'watermelon-shake',
    aliases: ['pakwan', 'melon-shake'],
    tags: ['fruit', 'blended', 'pink', 'summer', 'cold', 'tropical'],
    category: 'Tropical',
    body: `<ellipse cx="24" cy="42" rx="10.5" ry="2.2" fill="#DBC5A4" data-mono="drop"/>
  <path d="M15.6 17h16.8l-1.7 21.4a3 3 0 0 1-3 2.8h-7.4a3 3 0 0 1-3-2.8z" fill="#CBDCE3"/>
  <path d="M16.3 21h15.4l-1.3 17.4a2.7 2.7 0 0 1-2.7 2.5h-7.4a2.7 2.7 0 0 1-2.7-2.5z" fill="#DE7286" data-mono="drop"/>
  <path d="M27.4 17.4a8 8 0 0 1 8-8v8z" fill="#DE7286"/>
  <path d="M27.4 17.4a8 8 0 0 1 8-8" stroke="#6E8B5E" stroke-width="2.2" fill="none" data-mono="drop"/>
  <path d="M17.6 8.4 20.8 19" stroke="#8FAF4E" stroke-width="3.2" stroke-linecap="round"/>`,
  },
  {
    name: 'avocado-shake',
    aliases: ['avocado', 'green-shake'],
    tags: ['fruit', 'blended', 'creamy', 'cold', 'tropical'],
    category: 'Tropical',
    body: `<ellipse cx="24" cy="42" rx="10.5" ry="2.2" fill="#DBC5A4" data-mono="drop"/>
  <path d="M15.6 16h16.8l-1.7 22.4a3 3 0 0 1-3 2.8h-7.4a3 3 0 0 1-3-2.8z" fill="#CBDCE3"/>
  <path d="M16.3 20.6h15.4l-1.3 17.8a2.7 2.7 0 0 1-2.7 2.5h-7.4a2.7 2.7 0 0 1-2.7-2.5z" fill="#7A9B5A" data-mono="drop"/>
  <ellipse cx="24" cy="20.4" rx="7.7" ry="1.9" fill="#F5E9D6" data-mono="drop"/>
  <ellipse cx="32" cy="14.2" rx="4.2" ry="5.4" fill="#6E8B5E"/>
  <ellipse cx="32" cy="14.2" rx="2.9" ry="4.1" fill="#C4D49A" data-mono="drop"/>
  <ellipse cx="32" cy="14.6" rx="1.9" ry="2.1" fill="#8C5A32" data-mono="drop"/>
  <path d="M17.6 8 20.8 18.6" stroke="#C2593A" stroke-width="3.2" stroke-linecap="round"/>`,
  },
  {
    name: 'pineapple-juice',
    aliases: ['pinya', 'pineapple'],
    tags: ['fruit', 'juice', 'cold', 'sweet', 'tropical'],
    category: 'Tropical',
    body: `<ellipse cx="24" cy="42" rx="10" ry="2.2" fill="#DBC5A4" data-mono="drop"/>
  <path d="M16.4 18h15.2l-1.5 20.4a3 3 0 0 1-3 2.6h-6.2a3 3 0 0 1-3-2.6z" fill="#CBDCE3"/>
  <path d="M17.1 22.6h13.8l-1.2 15.8a2.7 2.7 0 0 1-2.7 2.4h-6a2.7 2.7 0 0 1-2.7-2.4z" fill="#E8B93A" data-mono="drop"/>
  <g fill="#6E8B5E">
    <path d="M28.8 17.8c2.8-1.4 4.4-4 4.6-7.2-2.8 1.4-4.4 4-4.6 7.2z"/>
    <path d="M24.4 17.8c1.2-2.8.9-5.6-.8-8.2-1.2 2.8-.9 5.6.8 8.2z"/>
    <path d="M27 17.8c.2-3.2-1.4-5.8-4.2-7.2.2 3.2 1.8 5.8 4.2 7.2z"/>
  </g>`,
  },
];

export const categories = ['Drinks', 'Tea & more', 'Tropical', 'Vessels', 'Beans', 'Brewers', 'Equipment'];

/**
 * The mono / one-colour build: drop the redundant highlight layers, then flatten every
 * remaining fill and stroke to currentColor so the icon inherits text colour and size.
 */
export const toMono = (body) =>
  body
    .replace(/<g[^>]*data-mono="drop"[^>]*>[\s\S]*?<\/g>/g, '')
    .replace(/<(?:path|rect|circle|ellipse|line|polygon)[^>]*data-mono="drop"[^>]*\/>/g, '')
    .replace(/(fill|stroke)="#[0-9A-Fa-f]{3,8}"/g, '$1="currentColor"')
    .replace(/\s*opacity="[\d.]+"/g, '')
    .replace(/\n\s*\n/g, '\n');

export const stripHints = (body) => body.replace(/\s*data-mono="drop"/g, '');

/**
 * The one-colour body for an icon. A few icons lose their defining feature when fills
 * flatten, so they carry a hand-drawn `monoBody`; everything else is generated.
 */
export const monoOf = (icon) => icon.monoBody || toMono(icon.body);

export const wrap = (name, body, size = 48) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" role="img" aria-label="${name.replace(/-/g, ' ')}">\n  ${stripHints(body).trim()}\n</svg>\n`;
