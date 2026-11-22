/**
 * GlassKit Production Full-HD WebGL2 Optical Glass Engine (iOS 26 / macOS Tahoe Calibrated)
 *
 * Features:
 * - ONE shared offscreen WebGL2 context for the entire app (zero context limits, 0% idle GPU).
 * - Supports both built-in procedural/photo scenes AND arbitrary custom background image URLs
 *   (remote URLs, local public paths, data URLs, or uploaded File blob URLs).
 * - Pre-baked 2-pass separable 17-tap Gaussian frost texture for creamy, artifact-free diffusion.
 * - Per-element optical overrides (`uOptics[12]`) for refraction, frost blur, chromatic dispersion,
 *   and specular intensity alongside global stage defaults.
 */

export type WallpaperScene = 'tahoe' | 'sunset' | 'light' | 'dark' | 'prism';
export type GlassVariantId = 'clear' | 'tinted' | 'dark' | 'prominent';

export interface GlassRectDescriptor {
  cx: number;
  cy: number;
  hw: number;
  hh: number;
  radius: number;
  opacity: number;
  variant: GlassVariantId;
  bezelPx: number;
  pointerX: number;
  pointerY: number;
  pointerAlpha: number;
  /** Optional per-element optical overrides (falls back to stage settings when omitted) */
  refraction?: number;
  blur?: number;
  aberration?: number;
  specular?: number;
}

export interface DropletDescriptor {
  x: number;
  y: number;
  radius: number;
  morph: number;
  opacity: number;
}

export interface StageRenderOptions {
  scene: WallpaperScene;
  /** Arbitrary custom image URL (https://, /path, data:, blob:) rendered instead of scene */
  backgroundImage?: string;
  isLightStage: boolean;
  stageWidth: number;
  stageHeight: number;
  rects: GlassRectDescriptor[];
  droplet?: DropletDescriptor | null;
  refraction: number;
  blur: number;
  aberration: number;
  specular: number;
  saturation: number;
}

const MAX_RECTS = 12;

export const DEFAULT_SCENE_IMAGE_URLS: Partial<Record<WallpaperScene, string>> = {
  tahoe: '/wallpapers/tahoe-cobalt.jpg',
  sunset: '/wallpapers/sunset-silk.jpg',
  dark: '/wallpapers/midnight-obsidian.jpg',
  light: '/wallpapers/studio-light.jpg',
};

const SCENE_JPG_FALLBACKS: Partial<Record<WallpaperScene, string>> = {};

export const SCENE_CSS_FALLBACKS: Record<WallpaperScene, string> = {
  tahoe: 'linear-gradient(155deg, #21519e 0%, #527bb8 38%, #1045b8 70%, #071e68 100%)',
  sunset: 'linear-gradient(145deg, #1d0a3c 0%, #ae1f52 44%, #d66129 76%, #e0b375 100%)',
  dark: 'linear-gradient(150deg, #070a16 0%, #172361 52%, #247beb 100%)',
  light: 'linear-gradient(145deg, #ebf0f7 0%, #d1e3f7 54%, #6ba8f7 100%)',
  prism:
    'linear-gradient(125deg, #0c1020 0%, #1d4ed8 25%, #06b6d4 45%, #a855f7 68%, #f43f5e 88%, #0c1020 100%)',
};

const QUAD_VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const COVER_BLIT_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uImg;
uniform vec2 uScale;
uniform vec2 uOffset;

void main() {
  vec2 uv = vUv * uScale + uOffset;
  fragColor = texture(uImg, clamp(uv, vec2(0.001), vec2(0.999)));
}
`;

const BLUR_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSrc;
uniform vec2 uDir;

void main() {
  const float w[9] = float[9](
    0.0956, 0.0928, 0.0850, 0.0736, 0.0601, 0.0464, 0.0338, 0.0233, 0.0151
  );
  vec3 acc = texture(uSrc, vUv).rgb * w[0];
  for (int i = 1; i < 9; i++) {
    vec2 off = uDir * float(i);
    acc += texture(uSrc, clamp(vUv + off, vec2(0.001), vec2(0.999))).rgb * w[i];
    acc += texture(uSrc, clamp(vUv - off, vec2(0.001), vec2(0.999))).rgb * w[i];
  }
  fragColor = vec4(acc, 1.0);
}
`;

const WALLPAPER_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uRes;
uniform int uScene;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float silkField(vec2 uv) {
  vec2 p = uv * 2.0 - 1.0;
  float diag = p.x * 0.58 - p.y * 0.82;
  float w1 = sin(diag * 2.2 + sin(p.x * 1.35 - p.y * 0.9) * 0.85);
  float w2 = cos((p.x * 0.38 + p.y * 0.94) * 1.9 + w1 * 0.65);
  return w1 * 0.55 + w2 * 0.32;
}

vec3 renderTahoeSilk(vec2 uv) {
  vec3 skyTop = vec3(0.14, 0.32, 0.62);
  vec3 skyMid = vec3(0.32, 0.48, 0.72);
  vec3 warmPearl = vec3(0.62, 0.58, 0.56);
  vec3 bg = mix(skyMid, skyTop, smoothstep(0.32, 1.0, uv.y));
  float warmMask = exp(-length((uv - vec2(0.12, 0.44)) * vec2(1.35, 1.85)) * 1.75);
  bg = mix(bg, warmPearl, clamp(warmMask * 0.65, 0.0, 1.0));

  float yRibbon = 0.04 + 0.84 * smoothstep(-0.06, 1.06, uv.x) + 0.11 * sin(uv.x * 3.6 - 0.55);
  float distMain = uv.y - yRibbon;
  float lowerWave = smoothstep(0.26, -0.14, distMain);
  float h = silkField(uv);
  vec3 waveCol = mix(vec3(0.03, 0.14, 0.58), vec3(0.12, 0.42, 0.92), clamp(0.5 + 0.5 * h, 0.0, 1.0));
  vec3 col = mix(bg, waveCol, lowerWave);
  float crest = exp(-pow(distMain - 0.025, 2.0) * 1400.0);
  col += vec3(0.75, 0.88, 1.0) * crest * 0.52;
  return col;
}

vec3 renderSunsetSilk(vec2 uv) {
  float h = silkField(uv * 1.08 + vec2(0.12, -0.04));
  float band = clamp(uv.x * 0.55 + uv.y * 0.45 + h * 0.3, 0.0, 1.0);
  vec3 col = mix(vec3(0.10, 0.04, 0.22), vec3(0.68, 0.12, 0.32), smoothstep(0.08, 0.48, band));
  col = mix(col, vec3(0.84, 0.38, 0.16), smoothstep(0.42, 0.8, band));
  col = mix(col, vec3(0.88, 0.70, 0.46), smoothstep(0.75, 1.0, band) * 0.72);
  return col;
}

vec3 renderMidnightVelvet(vec2 uv) {
  float h = silkField(uv * 1.12 - vec2(0.06, 0.08));
  vec3 col = mix(vec3(0.03, 0.04, 0.085), vec3(0.09, 0.14, 0.38), smoothstep(-0.3, 0.8, h));
  float r1 = exp(-pow(uv.y - (0.36 + 0.26 * sin(uv.x * 3.4 - 0.4)), 2.0) * 14.0);
  col = mix(col, vec3(0.14, 0.48, 0.92), r1 * 0.72);
  return col;
}

vec3 renderLightStudio(vec2 uv) {
  vec3 base = mix(vec3(0.92, 0.94, 0.97), vec3(0.82, 0.89, 0.97), uv.x * 0.55 + (1.0 - uv.y) * 0.45);
  float ribbon = exp(-pow(uv.y - (0.22 + 0.54 * uv.x + 0.11 * sin(uv.x * 4.2)), 2.0) * 26.0);
  return mix(base, vec3(0.32, 0.62, 0.96), ribbon * 0.52);
}

vec3 renderPrismSpectrum(vec2 uv) {
  float x = uv.x * 6.28318 * 0.85 + 0.35 * sin(uv.y * 3.14159);
  vec3 spectrum = 0.5 + 0.5 * cos(x + vec3(0.0, 2.094, 4.188));
  spectrum = pow(spectrum, vec3(1.22)) * 0.82;
  float rib = 0.52 + 0.48 * sin(uv.x * 22.0 + uv.y * 3.5);
  vec3 col = mix(vec3(0.045, 0.06, 0.12), spectrum, 0.28 + 0.58 * rib);
  float diag = exp(-pow(uv.y - (0.22 + 0.56 * uv.x), 2.0) * 28.0);
  col += vec3(0.85, 0.90, 1.0) * diag * 0.28;
  return col;
}

void main() {
  vec3 col;
  if (uScene == 0) col = renderTahoeSilk(vUv);
  else if (uScene == 1) col = renderSunsetSilk(vUv);
  else if (uScene == 2) col = renderLightStudio(vUv);
  else if (uScene == 3) col = renderMidnightVelvet(vUv);
  else col = renderPrismSpectrum(vUv);

  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  fragColor = vec4(clamp(col + dither, 0.0, 1.0), 1.0);
}
`;

/**
 * Authentic iOS 26 / macOS Tahoe Liquid Glass Multi-Rect Composite Shader
 * with per-element optical overrides (uOptics[12]).
 */
const GLASS_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uBg;
uniform sampler2D uBgBlur;
uniform vec2 uRes;
uniform int uCount;
uniform vec4 uRects[12];
uniform vec4 uParams[12];
uniform vec4 uHover[12];
uniform vec4 uOptics[12];
uniform vec4 uDroplet;
uniform float uDropAlpha;
uniform float uIsLightStage;
uniform float uBgSoftness;
uniform float uSaturation;

float sdRoundedBox(vec2 p, vec2 b, float r) {
  float rr = min(r, min(b.x, b.y));
  vec2 q = abs(p) - b + rr;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rr;
}

float smin(float a, float b, float k) {
  if (k <= 0.0001) return min(a, b);
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float snellBezelOffset(float t, float ior, float bezel) {
  if (t >= 1.0) return 0.0;
  float tc = clamp(t, 0.022, 0.999);
  float u = 1.0 - tc;
  float u3 = u * u * u;
  float u4 = u3 * u;
  float height = pow(max(0.0005, 1.0 - u4), 0.25);
  float slope = (u3 / pow(max(0.0012, 1.0 - u4), 0.75)) * 0.92;
  float a1 = atan(slope);
  float a2 = asin(clamp(sin(a1) / ior, 0.0, 0.992));
  float deflect = max(0.0, a1 - a2);
  return tan(deflect) * (bezel * 0.92 + height * bezel * 0.58);
}

vec3 sampleOpticalBg(vec2 uv, float frostMix) {
  vec2 c = clamp(uv, vec2(0.0015), vec2(0.9985));
  if (frostMix <= 0.005) return texture(uBg, c).rgb;
  if (frostMix >= 0.995) return texture(uBgBlur, c).rgb;
  return mix(texture(uBg, c).rgb, texture(uBgBlur, c).rgb, frostMix);
}

float evalElementDist(vec2 p, int idx) {
  float d = sdRoundedBox(p - uRects[idx].xy, uRects[idx].zw, uParams[idx].x);
  if (idx == 0 && uDropAlpha > 0.01) {
    float dDrop = length(p - uDroplet.xy) - uDroplet.z;
    d = smin(d, dDrop, uDroplet.w);
  }
  return d;
}

vec2 evalElementNormal(vec2 p, int idx) {
  float e = 1.35 / uRes.y;
  float dx = evalElementDist(p + vec2(e, 0.0), idx) - evalElementDist(p - vec2(e, 0.0), idx);
  float dy = evalElementDist(p + vec2(0.0, e), idx) - evalElementDist(p - vec2(0.0, e), idx);
  vec2 g = vec2(dx, dy);
  float len = length(g);
  return len > 0.00001 ? g / len : vec2(0.0, 1.0);
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float px = 1.2 / uRes.y;

  vec2 bgUv = clamp(vUv, vec2(0.0015), vec2(0.9985));
  float radialDist = length((vUv - 0.5) * vec2(1.0, 1.12));
  float dofMix = clamp(uBgSoftness + smoothstep(0.16, 0.88, radialDist) * 0.24, 0.0, 0.84);
  vec3 col = mix(texture(uBg, bgUv).rgb, texture(uBgBlur, bgUv).rgb, dofMix);

  float bgVignette = mix(1.0, uIsLightStage > 0.5 ? 0.91 : 0.80, smoothstep(0.18, 0.96, radialDist));
  if (uIsLightStage < 0.5) {
    float bgLuma = dot(col, vec3(0.2126, 0.7152, 0.0722));
    float highlightSoften = 1.0 - smoothstep(0.36, 0.90, bgLuma) * 0.34;
    col *= highlightSoften * 0.84 * bgVignette;
  } else {
    col *= bgVignette;
  }

  for (int i = 0; i < 12; i++) {
    if (i >= uCount) break;

    float opacity = uParams[i].y;
    if (opacity <= 0.005) continue;

    float d = evalElementDist(p, i);
    if (d > 0.18) continue;

    float dShadow = evalElementDist(p - vec2(0.0, -0.02), i);
    float softShadow = exp(-max(dShadow, 0.0) * 14.5) * (uIsLightStage > 0.5 ? 0.10 : 0.16) * opacity;
    float tightShadow = exp(-max(d, 0.0) * 84.0) * (uIsLightStage > 0.5 ? 0.035 : 0.045) * opacity;
    col *= (1.0 - softShadow - tightShadow);

    float mask = smoothstep(px, -px, d) * opacity;
    if (mask <= 0.001) continue;

    float elRefraction = uOptics[i].x;
    float elBlur = uOptics[i].y;
    float elAberration = uOptics[i].z;
    float elSpecular = uOptics[i].w;

    vec2 outNormal = evalElementNormal(p, i);
    float distIn = max(0.0, -d);
    float minDim = min(uRects[i].z, uRects[i].w);
    float bezel = clamp(uParams[i].w, 0.014, min(0.12, minDim * 0.82));
    float t = clamp(distIn / bezel, 0.0, 1.0);

    float baseMag = snellBezelOffset(t, 1.48, bezel) * elRefraction;
    float dispSpread = elAberration * 0.75;
    float magR = baseMag * (1.0 - dispSpread);
    float magG = baseMag;
    float magB = baseMag * (1.0 + dispSpread);

    vec2 dirUv = -outNormal / vec2(aspect, 1.0);
    vec2 uvR = vUv + dirUv * magR;
    vec2 uvG = vUv + dirUv * magG;
    vec2 uvB = vUv + dirUv * magB;

    float frostStrength = clamp(elBlur / 6.0, 0.0, 1.0);
    float edgeClarity = mix(0.26, 1.0, smoothstep(0.0, 0.78, t));
    float frostMix = clamp(frostStrength * edgeClarity, 0.0, 1.0);

    float rCh = sampleOpticalBg(uvR, frostMix).r;
    float gCh = sampleOpticalBg(uvG, frostMix).g;
    float bCh = sampleOpticalBg(uvB, frostMix).b;
    vec3 refracted = vec3(rCh, gCh, bCh);

    float luma = dot(refracted, vec3(0.2126, 0.7152, 0.0722));
    refracted = mix(vec3(luma), refracted, uSaturation);

    float bevelFactor = pow(1.0 - t, 1.9);
    vec3 N = normalize(vec3(outNormal * bevelFactor * 0.86, sqrt(max(0.08, 1.0 - bevelFactor * bevelFactor * 0.75))));
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 L1 = normalize(vec3(-0.62, 0.76, 0.65));
    vec3 L2 = normalize(vec3(0.60, -0.68, 0.60));
    vec3 H1 = normalize(L1 + V);
    vec3 H2 = normalize(L2 + V);

    float spec1 = pow(max(dot(N, H1), 0.0), 54.0);
    float spec2 = pow(max(dot(N, H2), 0.0), 34.0) * 0.42;
    float fresnel = 0.03 + 0.97 * pow(1.0 - max(dot(N, V), 0.0), 3.6);

    float rimWidth = max(px * 2.0, bezel * 0.085);
    float rimBand = pow(1.0 - clamp(distIn / rimWidth, 0.0, 1.0), 2.35);
    float rimDir = 0.46 + 0.56 * max(0.0, dot(outNormal, normalize(vec2(-0.65, 0.76))))
                        + 0.36 * max(0.0, dot(outNormal, normalize(vec2(0.65, -0.76))));
    float rimGlow = rimBand * rimDir;

    vec2 localRel = (p - uRects[i].xy) / max(uRects[i].zw, vec2(0.001));
    float topLeftSoftGlow = smoothstep(1.1, -0.9, localRel.x * 0.48 - localRel.y * 0.72);

    float variant = uParams[i].z;
    vec3 glass = refracted;

    if (variant < 0.5) {
      if (uIsLightStage > 0.5) {
        glass = mix(glass, vec3(1.0), 0.20 + topLeftSoftGlow * 0.05 + fresnel * 0.10 * elSpecular);
        float lightBorder = smoothstep(px * 3.0, 0.0, distIn) * 0.08;
        glass *= (1.0 - lightBorder);
      } else {
        float highLuma = smoothstep(0.34, 0.88, luma);
        vec3 balancedGlass = glass * 0.68 + vec3(0.06, 0.12, 0.22) * 0.14;
        glass = mix(glass, balancedGlass, highLuma * 0.68);
        float crystalLift = (1.0 - highLuma) * 0.085 + topLeftSoftGlow * 0.025 + fresnel * 0.095 * elSpecular;
        glass = mix(glass, vec3(0.92, 0.96, 1.0), clamp(crystalLift, 0.0, 0.17));
      }
    } else if (variant < 1.5) {
      if (uIsLightStage > 0.5) {
        glass = mix(glass, vec3(1.0), 0.36 + fresnel * 0.10 * elSpecular);
      } else {
        float highLuma = smoothstep(0.34, 0.88, luma);
        glass = mix(glass, glass * 0.72 + vec3(0.07, 0.13, 0.24) * 0.14, highLuma * 0.58);
        glass = mix(glass, vec3(0.93, 0.965, 1.0), 0.12 + fresnel * 0.10 * elSpecular);
      }
    } else if (variant < 2.5) {
      glass = mix(glass * 0.68, vec3(0.08, 0.11, 0.18), 0.42);
      glass += vec3(0.94, 0.96, 1.0) * fresnel * 0.12 * elSpecular;
    } else {
      vec3 azure = mix(vec3(0.0, 0.48, 1.0), vec3(0.20, 0.70, 1.0), clamp(0.5 - localRel.y * 0.5, 0.0, 1.0));
      glass = mix(glass, azure, 0.64);
      glass += vec3(0.96, 0.98, 1.0) * fresnel * 0.13 * elSpecular;
    }

    if (uHover[i].z > 0.01) {
      vec2 pointerLocal = (uHover[i].xy - 0.5) * 2.0;
      float pDist = length((localRel - vec2(pointerLocal.x, -pointerLocal.y)) * vec2(1.0, uRects[i].w / max(uRects[i].z, 0.001)));
      float sheen = exp(-pDist * pDist * 3.8) * uHover[i].z * 0.09 * elSpecular;
      glass += vec3(1.0) * sheen;
    }

    glass += vec3(1.0) * (spec1 * 0.22 + spec2 * 0.12) * elSpecular * bevelFactor;
    glass += vec3(0.98, 0.99, 1.0) * rimGlow * (uIsLightStage > 0.5 ? 0.42 : 0.34) * elSpecular;

    col = mix(col, glass, mask);
  }

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('GlassKit WebGL2 shader compile error:', gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('GlassKit WebGL2 link error:', gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

function createRgbaTexture(gl: WebGL2RenderingContext, w: number, h: number): WebGLTexture | null {
  const tex = gl.createTexture();
  if (!tex) return null;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

function sceneToInt(scene: WallpaperScene): number {
  switch (scene) {
    case 'tahoe': return 0;
    case 'sunset': return 1;
    case 'light': return 2;
    case 'dark': return 3;
    case 'prism': return 4;
  }
}

function variantToFloat(v: GlassVariantId): number {
  switch (v) {
    case 'clear': return 0;
    case 'tinted': return 1;
    case 'dark': return 2;
    case 'prominent': return 3;
  }
}

interface CachedWallpaperPair {
  crispTex: WebGLTexture;
  blurTex: WebGLTexture;
  w: number;
  h: number;
  fromImage: boolean;
}

interface LoadedWallpaperSource {
  tex: WebGLTexture;
  width: number;
  height: number;
}

class SharedWebGLGlassEngine {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private wallProg: WebGLProgram | null = null;
  private coverProg: WebGLProgram | null = null;
  private blurProg: WebGLProgram | null = null;
  private glassProg: WebGLProgram | null = null;
  private quadBuf: WebGLBuffer | null = null;
  private fbo: WebGLFramebuffer | null = null;
  private wallpaperCache = new Map<string, CachedWallpaperPair>();
  private loadedImages = new Map<string, LoadedWallpaperSource>();
  private loadingImages = new Set<string>();
  private failedImages = new Set<string>();
  private assetListeners = new Set<() => void>();
  private readonly MAX_WALLPAPERS = 10;
  private readonly MAX_LOADED_IMAGES = 10;
  private ready = false;
  private initialized = false;

  private wallUniforms: {
    uRes: WebGLUniformLocation | null;
    uScene: WebGLUniformLocation | null;
  } | null = null;

  private coverUniforms: {
    uImg: WebGLUniformLocation | null;
    uScale: WebGLUniformLocation | null;
    uOffset: WebGLUniformLocation | null;
  } | null = null;

  private blurUniforms: {
    uSrc: WebGLUniformLocation | null;
    uDir: WebGLUniformLocation | null;
  } | null = null;

  private glassUniforms: {
    uBg: WebGLUniformLocation | null;
    uBgBlur: WebGLUniformLocation | null;
    uRes: WebGLUniformLocation | null;
    uCount: WebGLUniformLocation | null;
    uRects: WebGLUniformLocation | null;
    uParams: WebGLUniformLocation | null;
    uHover: WebGLUniformLocation | null;
    uOptics: WebGLUniformLocation | null;
    uDroplet: WebGLUniformLocation | null;
    uDropAlpha: WebGLUniformLocation | null;
    uIsLightStage: WebGLUniformLocation | null;
    uBgSoftness: WebGLUniformLocation | null;
    uSaturation: WebGLUniformLocation | null;
  } | null = null;

  private rectArr = new Float32Array(MAX_RECTS * 4);
  private paramArr = new Float32Array(MAX_RECTS * 4);
  private hoverArr = new Float32Array(MAX_RECTS * 4);
  private opticsArr = new Float32Array(MAX_RECTS * 4);
  private posLocCache = new WeakMap<WebGLProgram, number>();
  private ctx2dCache = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>();

  public isAvailable(): boolean {
    if (!this.initialized) this.init();
    return this.ready;
  }

  public onAssetLoaded(cb: () => void): () => void {
    this.assetListeners.add(cb);
    return () => {
      this.assetListeners.delete(cb);
    };
  }

  private notifyAssetLoaded() {
    this.assetListeners.forEach((cb) => cb());
  }

  private uploadImageTexture(cacheKey: string, img: HTMLImageElement) {
    const gl = this.gl;
    if (!gl || gl.isContextLost()) return;

    if (this.loadedImages.size >= this.MAX_LOADED_IMAGES) {
      const oldest = this.loadedImages.keys().next().value;
      if (oldest && !oldest.startsWith('scene:')) {
        const old = this.loadedImages.get(oldest);
        if (old) gl.deleteTexture(old.tex);
        this.loadedImages.delete(oldest);
      }
    }

    const tex = gl.createTexture();
    if (!tex) return;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.loadedImages.set(cacheKey, {
      tex,
      width: img.naturalWidth || 1920,
      height: img.naturalHeight || 1080,
    });

    for (const [k, v] of this.wallpaperCache.entries()) {
      if (k.startsWith(`${cacheKey}_`) && !v.fromImage) {
        gl.deleteTexture(v.crispTex);
        gl.deleteTexture(v.blurTex);
        this.wallpaperCache.delete(k);
      }
    }

    this.notifyAssetLoaded();
  }

  private ensureImageLoaded(cacheKey: string, primaryUrl: string, fallbackUrl?: string) {
    if (
      !primaryUrl ||
      this.loadedImages.has(cacheKey) ||
      this.loadingImages.has(cacheKey) ||
      this.failedImages.has(cacheKey)
    ) {
      return;
    }
    if (!this.gl || this.gl.isContextLost()) return;

    this.loadingImages.add(cacheKey);
    const loadUrl = (url: string, retryFallback?: string) => {
      const img = new Image();
      if (/^https?:\/\//i.test(url)) {
        img.crossOrigin = 'anonymous';
      }
      img.decoding = 'async';
      img.onload = () => {
        this.loadingImages.delete(cacheKey);
        this.uploadImageTexture(cacheKey, img);
      };
      img.onerror = () => {
        if (retryFallback) {
          loadUrl(retryFallback);
        } else {
          this.loadingImages.delete(cacheKey);
          this.failedImages.add(cacheKey);
        }
      };
      img.src = url;
    };

    loadUrl(primaryUrl, fallbackUrl);
  }

  public evictImage(backgroundImageUrl: string) {
    const gl = this.gl;
    const cacheKey = `img:${backgroundImageUrl}`;
    const loaded = this.loadedImages.get(cacheKey);
    if (loaded && gl && !gl.isContextLost()) {
      gl.deleteTexture(loaded.tex);
    }
    this.loadedImages.delete(cacheKey);
    this.failedImages.delete(cacheKey);
    if (gl && !gl.isContextLost()) {
      for (const [k, v] of this.wallpaperCache.entries()) {
        if (k.startsWith(`${cacheKey}_`)) {
          gl.deleteTexture(v.crispTex);
          gl.deleteTexture(v.blurTex);
          this.wallpaperCache.delete(k);
        }
      }
    }
  }

  private init() {
    this.initialized = true;
    if (typeof document === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      powerPreference: 'default',
    });
    if (!gl) return;

    const wallProg = createProgram(gl, QUAD_VERT, WALLPAPER_FRAG);
    const coverProg = createProgram(gl, QUAD_VERT, COVER_BLIT_FRAG);
    const blurProg = createProgram(gl, QUAD_VERT, BLUR_FRAG);
    const glassProg = createProgram(gl, QUAD_VERT, GLASS_FRAG);
    if (!wallProg || !coverProg || !blurProg || !glassProg) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const fbo = gl.createFramebuffer();

    this.canvas = canvas;
    this.gl = gl;
    this.wallProg = wallProg;
    this.coverProg = coverProg;
    this.blurProg = blurProg;
    this.glassProg = glassProg;
    this.quadBuf = buf;
    this.fbo = fbo;

    this.wallUniforms = {
      uRes: gl.getUniformLocation(wallProg, 'uRes'),
      uScene: gl.getUniformLocation(wallProg, 'uScene'),
    };

    this.coverUniforms = {
      uImg: gl.getUniformLocation(coverProg, 'uImg'),
      uScale: gl.getUniformLocation(coverProg, 'uScale'),
      uOffset: gl.getUniformLocation(coverProg, 'uOffset'),
    };

    this.blurUniforms = {
      uSrc: gl.getUniformLocation(blurProg, 'uSrc'),
      uDir: gl.getUniformLocation(blurProg, 'uDir'),
    };

    this.glassUniforms = {
      uBg: gl.getUniformLocation(glassProg, 'uBg'),
      uBgBlur: gl.getUniformLocation(glassProg, 'uBgBlur'),
      uRes: gl.getUniformLocation(glassProg, 'uRes'),
      uCount: gl.getUniformLocation(glassProg, 'uCount'),
      uRects: gl.getUniformLocation(glassProg, 'uRects[0]'),
      uParams: gl.getUniformLocation(glassProg, 'uParams[0]'),
      uHover: gl.getUniformLocation(glassProg, 'uHover[0]'),
      uOptics: gl.getUniformLocation(glassProg, 'uOptics[0]'),
      uDroplet: gl.getUniformLocation(glassProg, 'uDroplet'),
      uDropAlpha: gl.getUniformLocation(glassProg, 'uDropAlpha'),
      uIsLightStage: gl.getUniformLocation(glassProg, 'uIsLightStage'),
      uBgSoftness: gl.getUniformLocation(glassProg, 'uBgSoftness'),
      uSaturation: gl.getUniformLocation(glassProg, 'uSaturation'),
    };

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.ready = false;
      this.wallpaperCache.clear();
      this.loadedImages.clear();
      this.loadingImages.clear();
    });

    canvas.addEventListener('webglcontextrestored', () => {
      this.initialized = false;
      this.init();
      this.notifyAssetLoaded();
    });

    this.ready = true;
    const tahoeUrl = DEFAULT_SCENE_IMAGE_URLS.tahoe;
    if (tahoeUrl) {
      this.ensureImageLoaded('scene:tahoe', tahoeUrl, SCENE_JPG_FALLBACKS.tahoe);
    }
  }

  private bindQuad(prog: WebGLProgram) {
    const gl = this.gl!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
    let aPos = this.posLocCache.get(prog);
    if (aPos === undefined) {
      aPos = gl.getAttribLocation(prog, 'aPos');
      this.posLocCache.set(prog, aPos);
    }
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  }

  private getOrBakeWallpaper(
    scene: WallpaperScene,
    backgroundImage: string | undefined,
    w: number,
    h: number
  ): CachedWallpaperPair | null {
    const gl = this.gl;
    if (
      !gl ||
      !this.wallProg ||
      !this.coverProg ||
      !this.blurProg ||
      !this.wallUniforms ||
      !this.coverUniforms ||
      !this.blurUniforms ||
      !this.fbo
    ) {
      return null;
    }

    const sourceKey = backgroundImage ? `img:${backgroundImage}` : `scene:${scene}`;
    if (backgroundImage) {
      this.ensureImageLoaded(sourceKey, backgroundImage);
    } else {
      const url = DEFAULT_SCENE_IMAGE_URLS[scene];
      if (url) {
        this.ensureImageLoaded(sourceKey, url, SCENE_JPG_FALLBACKS[scene]);
      }
    }

    const imgSrc = this.loadedImages.get(sourceKey);

    const bw = Math.max(256, Math.round(w / 16) * 16);
    const bh = Math.max(200, Math.round(h / 16) * 16);
    const key = `${sourceKey}_${bw}x${bh}`;

    const hit = this.wallpaperCache.get(key);
    if (hit && (!imgSrc || hit.fromImage)) return hit;

    if (hit) {
      gl.deleteTexture(hit.crispTex);
      gl.deleteTexture(hit.blurTex);
      this.wallpaperCache.delete(key);
    }

    if (this.wallpaperCache.size >= this.MAX_WALLPAPERS) {
      const oldestKey = this.wallpaperCache.keys().next().value;
      if (oldestKey) {
        const old = this.wallpaperCache.get(oldestKey);
        if (old) {
          gl.deleteTexture(old.crispTex);
          gl.deleteTexture(old.blurTex);
        }
        this.wallpaperCache.delete(oldestKey);
      }
    }

    const crispTex = createRgbaTexture(gl, bw, bh);
    const blurW = Math.max(128, Math.round(bw * 0.5));
    const blurH = Math.max(100, Math.round(bh * 0.5));
    const tempTex = createRgbaTexture(gl, blurW, blurH);
    const blurTex = createRgbaTexture(gl, blurW, blurH);

    if (!crispTex || !tempTex || !blurTex) {
      if (crispTex) gl.deleteTexture(crispTex);
      if (tempTex) gl.deleteTexture(tempTex);
      if (blurTex) gl.deleteTexture(blurTex);
      return null;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, crispTex, 0);
    gl.viewport(0, 0, bw, bh);

    if (imgSrc) {
      const stageAspect = bw / bh;
      const imgAspect = imgSrc.width / Math.max(1, imgSrc.height);
      let sx = 1;
      let sy = 1;
      if (stageAspect > imgAspect) {
        sy = imgAspect / stageAspect;
      } else {
        sx = stageAspect / imgAspect;
      }
      const ox = (1 - sx) * 0.5;
      const oy = (1 - sy) * 0.5;

      gl.useProgram(this.coverProg);
      this.bindQuad(this.coverProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imgSrc.tex);
      gl.uniform1i(this.coverUniforms.uImg, 0);
      gl.uniform2f(this.coverUniforms.uScale, sx, sy);
      gl.uniform2f(this.coverUniforms.uOffset, ox, oy);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else {
      gl.useProgram(this.wallProg);
      this.bindQuad(this.wallProg);
      gl.uniform2f(this.wallUniforms.uRes, bw, bh);
      gl.uniform1i(this.wallUniforms.uScene, sceneToInt(scene));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // 2-stage separable 17-tap Gaussian frost bake
    gl.useProgram(this.blurProg);
    this.bindQuad(this.blurProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.blurUniforms.uSrc, 0);
    gl.viewport(0, 0, blurW, blurH);

    const spread = Math.max(1.4, blurH / 250);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tempTex, 0);
    gl.bindTexture(gl.TEXTURE_2D, crispTex);
    gl.uniform2f(this.blurUniforms.uDir, spread / blurW, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, blurTex, 0);
    gl.bindTexture(gl.TEXTURE_2D, tempTex);
    gl.uniform2f(this.blurUniforms.uDir, 0, spread / blurH);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tempTex, 0);
    gl.bindTexture(gl.TEXTURE_2D, blurTex);
    gl.uniform2f(this.blurUniforms.uDir, (spread * 1.65) / blurW, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, blurTex, 0);
    gl.bindTexture(gl.TEXTURE_2D, tempTex);
    gl.uniform2f(this.blurUniforms.uDir, 0, (spread * 1.65) / blurH);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteTexture(tempTex);

    const pair: CachedWallpaperPair = {
      crispTex,
      blurTex,
      w: bw,
      h: bh,
      fromImage: Boolean(imgSrc),
    };
    this.wallpaperCache.set(key, pair);
    return pair;
  }

  public renderToCanvas(target: HTMLCanvasElement, opts: StageRenderOptions): boolean {
    if (!this.isAvailable()) return false;
    const gl = this.gl;
    const srcCanvas = this.canvas;
    if (!gl || !srcCanvas || !this.glassProg || !this.glassUniforms || !this.quadBuf) return false;
    if (gl.isContextLost()) return false;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw = Math.min(2400, Math.max(200, Math.round(opts.stageWidth * dpr)));
    const ph = Math.min(1600, Math.max(160, Math.round(opts.stageHeight * dpr)));

    if (target.width !== pw || target.height !== ph) {
      target.width = pw;
      target.height = ph;
    }
    if (srcCanvas.width !== pw || srcCanvas.height !== ph) {
      srcCanvas.width = pw;
      srcCanvas.height = ph;
    }

    const bgPair = this.getOrBakeWallpaper(opts.scene, opts.backgroundImage, pw, ph);
    if (!bgPair) return false;

    const aspect = opts.stageWidth / Math.max(1, opts.stageHeight);
    const count = Math.min(MAX_RECTS, opts.rects.length);

    for (let i = 0; i < count; i++) {
      const r = opts.rects[i];
      const nx = r.cx / Math.max(1, opts.stageWidth);
      const ny = 1 - r.cy / Math.max(1, opts.stageHeight);
      const cx = (nx - 0.5) * aspect;
      const cy = ny - 0.5;
      const hw = r.hw / Math.max(1, opts.stageHeight);
      const hh = r.hh / Math.max(1, opts.stageHeight);
      const rad = r.radius / Math.max(1, opts.stageHeight);
      const bezelNorm = r.bezelPx / Math.max(1, opts.stageHeight);

      const o = i * 4;
      this.rectArr[o] = cx;
      this.rectArr[o + 1] = cy;
      this.rectArr[o + 2] = hw;
      this.rectArr[o + 3] = hh;

      this.paramArr[o] = rad;
      this.paramArr[o + 1] = r.opacity;
      this.paramArr[o + 2] = variantToFloat(r.variant);
      this.paramArr[o + 3] = bezelNorm;

      this.hoverArr[o] = r.pointerX;
      this.hoverArr[o + 1] = r.pointerY;
      this.hoverArr[o + 2] = r.pointerAlpha;
      this.hoverArr[o + 3] = 0;

      this.opticsArr[o] = r.refraction ?? opts.refraction;
      this.opticsArr[o + 1] = r.blur ?? opts.blur;
      this.opticsArr[o + 2] = r.aberration ?? opts.aberration;
      this.opticsArr[o + 3] = r.specular ?? opts.specular;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, pw, ph);
    gl.useProgram(this.glassProg);
    this.bindQuad(this.glassProg);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, bgPair.crispTex);
    gl.uniform1i(this.glassUniforms.uBg, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, bgPair.blurTex);
    gl.uniform1i(this.glassUniforms.uBgBlur, 1);

    gl.uniform2f(this.glassUniforms.uRes, pw, ph);
    gl.uniform1i(this.glassUniforms.uCount, count);
    gl.uniform4fv(this.glassUniforms.uRects, this.rectArr);
    gl.uniform4fv(this.glassUniforms.uParams, this.paramArr);
    gl.uniform4fv(this.glassUniforms.uHover, this.hoverArr);
    gl.uniform4fv(this.glassUniforms.uOptics, this.opticsArr);

    if (opts.droplet && opts.droplet.opacity > 0.005) {
      const dx = (opts.droplet.x - 0.5) * aspect;
      const dy = opts.droplet.y - 0.5;
      gl.uniform4f(this.glassUniforms.uDroplet, dx, dy, opts.droplet.radius, opts.droplet.morph);
      gl.uniform1f(this.glassUniforms.uDropAlpha, opts.droplet.opacity);
    } else {
      gl.uniform4f(this.glassUniforms.uDroplet, 10, 10, 0, 0);
      gl.uniform1f(this.glassUniforms.uDropAlpha, 0);
    }

    gl.uniform1f(this.glassUniforms.uIsLightStage, opts.isLightStage ? 1.0 : 0.0);
    gl.uniform1f(this.glassUniforms.uBgSoftness, 0.46);
    gl.uniform1f(this.glassUniforms.uSaturation, opts.saturation);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    let ctx2d = this.ctx2dCache.get(target);
    if (!ctx2d) {
      const nextCtx = target.getContext('2d', { alpha: false });
      if (!nextCtx) return false;
      this.ctx2dCache.set(target, nextCtx);
      ctx2d = nextCtx;
    }
    ctx2d.drawImage(srcCanvas, 0, 0, pw, ph, 0, 0, pw, ph);
    return true;
  }
}

export const sharedGlassEngine = new SharedWebGLGlassEngine();
