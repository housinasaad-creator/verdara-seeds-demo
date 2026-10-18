/*
  Brand identity in one place. VERDARA is an invented brand made for this demo (a wholesale seed company concept);
  it is not tied to any real company. To adapt the site to a real client change this file (name, WhatsApp number, e-mail).
*/
export const BRAND = {
  name: 'VERDARA',
  nameAr: 'فيردارا',
  sub: 'SEEDS',
  wa: '905537410520',              // studio number for testing; replace with the company's own WhatsApp number
  email: 'hello@verdara.example',
  year: new Date().getFullYear()
};

/* Mark: two leaves forming a V above a seed, inside a double ring */
export const MARK = {
  leafL: 'M50 61 C35 57 27 45 27 27 C43 29 53 42 50 61 Z',
  leafR: 'M50 61 C65 57 73 45 73 27 C57 29 47 42 50 61 Z',
  seed: 'M50 64 C43.5 68.5 42.5 78 50 85 C57.5 78 56.5 68.5 50 64 Z',
  vein: 'M50 66 L50 82'
};

export function markSVG(cls = '') {
  return `<svg class="mark ${cls}" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor">
    <circle cx="50" cy="50" r="46" stroke-width="2.2"/>
    <circle cx="50" cy="50" r="40.5" stroke-width="1.1" stroke-dasharray="0.1 2.6" stroke-linecap="round"/>
    <path d="${MARK.leafL}" fill="currentColor" stroke="none"/>
    <path d="${MARK.leafR}" fill="currentColor" stroke="none" opacity=".72"/>
    <path d="${MARK.seed}" fill="currentColor" stroke="none"/>
    <path d="${MARK.vein}" stroke="var(--mark-cut, #0e1712)" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

/* The same mark on a canvas (packets, 3D packet texture) */
export function drawMark(g, cx, cy, r, color = '#f4efe2', cut = '#0e1712') {
  g.save(); g.translate(cx - r, cy - r); g.scale(r / 50, r / 50);
  g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round';
  g.lineWidth = 2.4; g.beginPath(); g.arc(50, 50, 46, 0, 6.3); g.stroke();
  g.lineWidth = 1.2; g.setLineDash([0.1, 2.6]); g.beginPath(); g.arc(50, 50, 40.5, 0, 6.3); g.stroke(); g.setLineDash([]);
  g.fill(new Path2D(MARK.leafL)); g.globalAlpha = 0.72; g.fill(new Path2D(MARK.leafR)); g.globalAlpha = 1;
  g.fill(new Path2D(MARK.seed));
  g.strokeStyle = cut; g.lineWidth = 1.7; g.stroke(new Path2D(MARK.vein));
  g.restore();
}
