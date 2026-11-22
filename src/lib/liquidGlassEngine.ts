export interface GlassMapParams {
  width: number;
  height: number;
  radius: number;
  bezelWidth: number;
  ior?: number;
  refractionStrength?: number;
}

export interface GeneratedGlassMaps {
  displacementUrl: string;
  maxScale: number;
  width: number;
  height: number;
}

const mapCache = new Map<string, GeneratedGlassMaps>();
const MAX_CACHE_ENTRIES = 120;

// Shared single offscreen canvas to avoid allocating dozens of temporary canvases
let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;

function getScratchCanvas(w: number, h: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} | null {
  if (typeof document === 'undefined') return null;
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedCtx = sharedCanvas.getContext('2d', { willReadFrequently: false });
  }
  if (!sharedCtx) return null;
  if (sharedCanvas.width !== w) sharedCanvas.width = w;
  if (sharedCanvas.height !== h) sharedCanvas.height = h;
  return { canvas: sharedCanvas, ctx: sharedCtx };
}

/**
 * Signed distance field for a rounded rectangle centered at (0, 0).
 * Negative values are inside the shape; 0 is on the boundary.
 */
function sdRoundedBox(
  px: number,
  py: number,
  halfW: number,
  halfH: number,
  r: number
): number {
  const bx = Math.max(0, halfW - r);
  const by = Math.max(0, halfH - r);
  const qx = Math.abs(px) - bx;
  const qy = Math.abs(py) - by;
  const outDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inDist = Math.min(Math.max(qx, qy), 0);
  return outDist + inDist - r;
}

/**
 * Outward unit normal of the rounded rectangle SDF at (px, py).
 */
function sdRoundedBoxNormal(
  px: number,
  py: number,
  halfW: number,
  halfH: number,
  r: number
): [number, number] {
  const bx = Math.max(0, halfW - r);
  const by = Math.max(0, halfH - r);
  const sx = px >= 0 ? 1 : -1;
  const sy = py >= 0 ? 1 : -1;
  const qx = Math.abs(px) - bx;
  const qy = Math.abs(py) - by;

  if (qx > 0 || qy > 0) {
    const cx = Math.max(qx, 0);
    const cy = Math.max(qy, 0);
    const len = Math.hypot(cx, cy) || 1;
    return [(sx * cx) / len, (sy * cy) / len];
  }
  if (qx > qy) {
    return [sx, 0];
  }
  return [0, sy];
}

/**
 * Snell's law optical refraction displacement along Apple's convex squircle bezel.
 * Steep curved meniscus at outer edge that flattens smoothly into a crystal interior.
 */
function computeSquircleBezelDisplacement(
  t: number,
  ior: number,
  bezelWidth: number
): number {
  if (t >= 1) return 0;
  const tc = Math.max(0.015, Math.min(0.999, t));
  const u = 1 - tc;
  const u3 = u * u * u;
  const u4 = u3 * u;
  const height = Math.pow(Math.max(0.0002, 1 - u4), 0.25);
  const slope = (u3 / Math.pow(Math.max(0.0008, 1 - u4), 0.75)) * 1.18;

  const incidentAngle = Math.atan(slope);
  const sinRefracted = Math.min(0.995, Math.sin(incidentAngle) / ior);
  const refractedAngle = Math.asin(sinRefracted);
  const deflection = Math.max(0, incidentAngle - refractedAngle);

  const elevation = bezelWidth * 1.42 + height * bezelWidth * 0.9;
  return Math.tan(deflection) * elevation;
}

/**
 * Generates a lightweight 2D RG displacement map (sRGB, 128 = neutral) for an arbitrary
 * rounded-rectangle Liquid Glass element.
 *
 * Kept at a compact resolution (max 160px on longest side) because SVG feDisplacementMap
 * smoothly bilinearly interpolates the vector field — visually indistinguishable from full
 * resolution while using ~16x less CPU time and GPU texture memory.
 */
export function generateLiquidGlassMaps(params: GlassMapParams): GeneratedGlassMaps {
  // Quantize dimensions to 8px buckets for high cache reuse across cards
  const w = Math.max(24, Math.min(960, Math.round(params.width / 8) * 8));
  const h = Math.max(24, Math.min(720, Math.round(params.height / 8) * 8));
  const maxR = Math.min(w, h) / 2;
  const r = Math.max(4, Math.min(maxR, Math.round(params.radius / 2) * 2));
  const bezel = Math.max(8, Math.min(maxR * 0.96, Math.round(params.bezelWidth / 2) * 2));
  const ior = params.ior ?? 1.54;
  const strength = Math.round((params.refractionStrength ?? 1.55) * 20) / 20;

  const key = `${w}x${h}_r${r}_b${bezel}_i${ior.toFixed(2)}_s${strength.toFixed(2)}`;
  const cached = mapCache.get(key);
  if (cached) return cached;

  // Compact texture resolution (max 160px) for instant generation & tiny GPU footprint
  const maxDim = Math.max(w, h);
  const scaleFactor = maxDim > 160 ? 160 / maxDim : 1;
  const cw = Math.max(20, Math.round(w * scaleFactor));
  const ch = Math.max(20, Math.round(h * scaleFactor));
  const halfW = cw / 2;
  const halfH = ch / 2;
  const cr = r * scaleFactor;
  const cBezel = Math.max(3, bezel * scaleFactor);

  const scratch = getScratchCanvas(cw, ch);
  if (!scratch) {
    return {
      displacementUrl: '',
      maxScale: 0,
      width: w,
      height: h,
    };
  }

  const { canvas, ctx } = scratch;
  const dispImg = ctx.createImageData(cw, ch);
  const dispData = dispImg.data;

  const totalPixels = cw * ch;
  const rawDx = new Float32Array(totalPixels);
  const rawDy = new Float32Array(totalPixels);
  let maxMag = 0.0001;

  for (let y = 0; y < ch; y++) {
    const py = y + 0.5 - halfH;
    for (let x = 0; x < cw; x++) {
      const px = x + 0.5 - halfW;
      const idx = y * cw + x;

      const sdf = sdRoundedBox(px, py, halfW, halfH, cr);
      if (sdf > 0.5) {
        continue;
      }

      const distIn = Math.max(0, -sdf);
      const [ox, oy] = sdRoundedBoxNormal(px, py, halfW, halfH, cr);

      if (distIn < cBezel) {
        const t = distIn / cBezel;
        const mag = computeSquircleBezelDisplacement(t, ior, bezel) * strength;
        const dx = -ox * mag;
        const dy = -oy * mag;
        rawDx[idx] = dx;
        rawDy[idx] = dy;
        const absMax = Math.max(Math.abs(dx), Math.abs(dy));
        if (absMax > maxMag) maxMag = absMax;
      } else {
        // Gentle optical dome lensing across the flat interior
        const normX = px / Math.max(1, halfW);
        const normY = py / Math.max(1, halfH);
        const subtle = 0.65 * strength;
        rawDx[idx] = -normX * subtle;
        rawDy[idx] = -normY * subtle;
      }
    }
  }

  const invMax = 127 / maxMag;
  for (let i = 0; i < totalPixels; i++) {
    const p4 = i * 4;
    const rx = 128 + rawDx[i] * invMax;
    const ry = 128 + rawDy[i] * invMax;
    dispData[p4] = rx < 0 ? 0 : rx > 255 ? 255 : (rx + 0.5) | 0;
    dispData[p4 + 1] = ry < 0 ? 0 : ry > 255 ? 255 : (ry + 0.5) | 0;
    dispData[p4 + 2] = 128;
    dispData[p4 + 3] = 255;
  }

  ctx.putImageData(dispImg, 0, 0);

  const result: GeneratedGlassMaps = {
    displacementUrl: canvas.toDataURL('image/png'),
    maxScale: Math.min(72, maxMag * 1.6),
    width: w,
    height: h,
  };

  if (mapCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = mapCache.keys().next().value;
    if (firstKey) mapCache.delete(firstKey);
  }
  mapCache.set(key, result);
  return result;
}

export function supportsSvgBackdropFilter(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Chrome\/|Chromium\/|Edg\//.test(ua) && !/CriOS|FxiOS/.test(ua);
}
