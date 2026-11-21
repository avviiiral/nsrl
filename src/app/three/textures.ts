import { CanvasTexture, LinearMipmapLinearFilter, RepeatWrapping, SRGBColorSpace, Texture } from 'three';

/**
 * Procedural textures for the highway scene. Everything is drawn on a canvas
 * at runtime, so the scene ships no image files except the original NSRL logo,
 * which is drawn as-is onto the container livery (never redrawn).
 */

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function texture(c: HTMLCanvasElement, srgb = true): CanvasTexture {
  const t = new CanvasTexture(c);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  return t;
}

/** Seeded PRNG so the asphalt looks the same on every visit. */
function rng(seed: number): () => number {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export const ROAD = {
  /** Texture tile covers the carriageway width (m) by this length (m). */
  width: 11,
  tile: 20,
  laneEdge: 3.6,
};

/**
 * One tile of a two-lane Indian highway seen from above: worn asphalt, solid
 * white edge lines, a broken yellow centre line and gravel shoulders.
 */
export function roadTexture(maxAnisotropy: number): CanvasTexture {
  const ppm = 48; // pixels per metre
  const [c, g] = canvas(ROAD.width * ppm, ROAD.tile * ppm);
  const W = c.width;
  const H = c.height;
  const x = (m: number) => W / 2 + m * ppm;
  const rand = rng(7);

  g.fillStyle = '#2b2e30';
  g.fillRect(0, 0, W, H);

  // Shoulders: lighter, coarser gravel beyond the edge lines.
  g.fillStyle = '#3a3a37';
  g.fillRect(0, 0, x(-ROAD.laneEdge), H);
  g.fillRect(x(ROAD.laneEdge), 0, W - x(ROAD.laneEdge), H);

  // Aggregate speckle.
  for (let i = 0; i < 14000; i++) {
    const v = 30 + Math.floor(rand() * 40);
    g.fillStyle = `rgb(${v},${v},${v + 2})`;
    const s = rand() < 0.85 ? 1 : 2;
    g.fillRect(rand() * W, rand() * H, s, s);
  }

  // Tyre polish in each lane's wheel tracks.
  for (const lane of [-1.8, 1.8]) {
    for (const track of [-0.95, 0.95]) {
      const grad = g.createLinearGradient(x(lane + track - 0.45), 0, x(lane + track + 0.45), 0);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.22)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.fillRect(x(lane + track - 0.45), 0, 0.9 * ppm, H);
    }
  }

  // Edge lines.
  g.fillStyle = '#e9e7e1';
  g.fillRect(x(-ROAD.laneEdge) - 0.15 * ppm, 0, 0.15 * ppm, H);
  g.fillRect(x(ROAD.laneEdge), 0, 0.15 * ppm, H);

  // Broken centre line: 4 m dash, 6 m gap.
  g.fillStyle = '#f6b900';
  for (const start of [2, 12]) {
    g.fillRect(x(0) - 0.08 * ppm, start * ppm, 0.16 * ppm, 4 * ppm);
  }

  const t = texture(c);
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.anisotropy = maxAnisotropy;
  return t;
}

/** Soft radial falloff used for glows, light pools and the truck's contact shadow. */
export function radialTexture(inner: string, outer: string): CanvasTexture {
  const [c, g] = canvas(128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return texture(c);
}

/** Headlight beam on the road: a long, soft trapezoid that fades with distance. */
export function beamTexture(): CanvasTexture {
  const [c, g] = canvas(128, 256);
  const along = g.createLinearGradient(0, 256, 0, 0);
  along.addColorStop(0, 'rgba(255,236,200,0.55)');
  along.addColorStop(0.5, 'rgba(255,230,190,0.18)');
  along.addColorStop(1, 'rgba(255,230,190,0)');
  g.fillStyle = along;
  g.beginPath();
  g.moveTo(44, 256);
  g.lineTo(84, 256);
  g.lineTo(128, 0);
  g.lineTo(0, 0);
  g.closePath();
  g.fill();
  return texture(c);
}

/**
 * Container side livery. White ribbed panels, a red base band that repeats
 * the stripes of the NSRL logo, the original logo file, and the company name.
 * `logoAtEnd` places the logo toward the cab on either side of the truck.
 */
export function liveryTexture(logo: HTMLImageElement | null, logoAtEnd: 'left' | 'right', maxAnisotropy: number): CanvasTexture {
  const [c, g] = canvas(1536, 672); // 6.4 m × 2.8 m
  const W = c.width;
  const H = c.height;

  g.fillStyle = '#f2f1ec';
  g.fillRect(0, 0, W, H);

  // Vertical panel ribs.
  for (let i = 0; i < 24; i++) {
    const px = (i + 0.5) * (W / 24);
    const rib = g.createLinearGradient(px - 10, 0, px + 10, 0);
    rib.addColorStop(0, 'rgba(0,0,0,0)');
    rib.addColorStop(0.45, 'rgba(0,0,0,0.07)');
    rib.addColorStop(0.55, 'rgba(255,255,255,0.6)');
    rib.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rib;
    g.fillRect(px - 10, 0, 20, H);
  }

  // Top and bottom rails.
  g.fillStyle = '#c9c8c2';
  g.fillRect(0, 0, W, 16);
  g.fillStyle = '#9b9a95';
  g.fillRect(0, H - 22, W, 22);

  // Red band with the logo's horizontal stripes.
  const bandTop = H - 150;
  g.fillStyle = '#de2a1b';
  g.fillRect(0, bandTop, W, 128);
  g.fillStyle = '#f2f1ec';
  for (let i = 0; i < 4; i++) g.fillRect(0, bandTop + 22 + i * 26, W, 9);

  const toCab = logoAtEnd === 'right';
  const logoW = 470;
  const logoH = logo ? (logo.naturalHeight / logo.naturalWidth) * logoW : 0;
  const logoX = toCab ? W - logoW - 110 : 110;
  if (logo) g.drawImage(logo, logoX, 110, logoW, logoH);

  g.fillStyle = '#15191b';
  g.textBaseline = 'alphabetic';
  g.textAlign = toCab ? 'right' : 'left';
  const textX = toCab ? logoX - 80 : logoX + logoW + 80;
  g.font = "780 104px 'Archivo Variable', 'Archivo', system-ui, sans-serif";
  g.fillText('NORTH SOUTH', textX, 250);
  g.fillText('ROADLINES', textX, 360);
  g.font = "600 46px 'Archivo Variable', 'Archivo', system-ui, sans-serif";
  g.fillStyle = '#b81f14';
  g.fillText('nsrl.in', textX, 440);

  const t = texture(c);
  t.anisotropy = maxAnisotropy;
  return t;
}

/** Rear doors: two leaves, lock bars, and red–white reflective chevrons. */
export function rearDoorTexture(): CanvasTexture {
  const [c, g] = canvas(512, 576); // 2.45 m × 2.8 m
  const W = c.width;
  const H = c.height;
  g.fillStyle = '#e8e7e2';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = '#9d9c97';
  g.lineWidth = 10;
  g.strokeRect(5, 5, W - 10, H - 10);
  g.fillStyle = '#8f8e89';
  g.fillRect(W / 2 - 3, 0, 6, H);

  // Lock bars.
  g.fillStyle = '#6f706d';
  for (const bx of [W * 0.2, W * 0.4, W * 0.6, W * 0.8]) {
    g.fillRect(bx - 5, 20, 10, H - 40);
    g.fillRect(bx - 16, H * 0.55, 32, 26);
  }

  // Chevrons along the bottom edge.
  const y = H - 70;
  for (let i = 0; i < 12; i++) {
    g.fillStyle = i % 2 ? '#f2f1ec' : '#de2a1b';
    g.beginPath();
    g.moveTo(i * 44, y);
    g.lineTo(i * 44 + 44, y);
    g.lineTo(i * 44 + 22, y + 46);
    g.lineTo(i * 44 - 22, y + 46);
    g.closePath();
    g.fill();
  }
  return texture(c);
}

/** Night-time city glow on the horizon: a few hundred warm points on a dark band. */
export function horizonLightsTexture(): CanvasTexture {
  const [c, g] = canvas(2048, 64);
  const rand = rng(31);
  for (let i = 0; i < 420; i++) {
    const a = 0.25 + rand() * 0.75;
    g.fillStyle = rand() < 0.8 ? `rgba(255,196,128,${a})` : `rgba(220,235,255,${a})`;
    const s = rand() < 0.9 ? 2 : 3;
    g.fillRect(rand() * 2048, 30 + rand() * 30, s, s);
  }
  const t = texture(c);
  t.wrapS = RepeatWrapping;
  return t;
}

export function disposeTexture(t: Texture | null | undefined): void {
  t?.dispose();
}
