"use client";
var Xe = Object.defineProperty;
var ze = (t, s, e) => s in t ? Xe(t, s, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[s] = e;
var P = (t, s, e) => ze(t, typeof s != "symbol" ? s + "" : s, e);
import { jsx as i, jsxs as w, Fragment as We } from "react/jsx-runtime";
import me, { useState as C, useEffect as ae, useCallback as J, useMemo as he, useContext as ke, createContext as De, useRef as F, useImperativeHandle as Oe, useId as He } from "react";
const le = 12, be = {
  tahoe: "/wallpapers/tahoe-cobalt.jpg",
  sunset: "/wallpapers/sunset-silk.jpg",
  dark: "/wallpapers/midnight-obsidian.jpg",
  light: "/wallpapers/studio-light.jpg"
}, Ee = {}, Ae = {
  tahoe: "linear-gradient(155deg, #21519e 0%, #527bb8 38%, #1045b8 70%, #071e68 100%)",
  sunset: "linear-gradient(145deg, #1d0a3c 0%, #ae1f52 44%, #d66129 76%, #e0b375 100%)",
  dark: "linear-gradient(150deg, #070a16 0%, #172361 52%, #247beb 100%)",
  light: "linear-gradient(145deg, #ebf0f7 0%, #d1e3f7 54%, #6ba8f7 100%)",
  prism: "linear-gradient(125deg, #0c1020 0%, #1d4ed8 25%, #06b6d4 45%, #a855f7 68%, #f43f5e 88%, #0c1020 100%)"
}, de = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`, qe = `#version 300 es
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
`, Ye = `#version 300 es
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
`, Ve = `#version 300 es
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
`, je = `#version 300 es
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
function Ne(t, s, e) {
  const a = t.createShader(s);
  return a ? (t.shaderSource(a, e), t.compileShader(a), t.getShaderParameter(a, t.COMPILE_STATUS) ? a : (console.warn("GlassKit WebGL2 shader compile error:", t.getShaderInfoLog(a)), t.deleteShader(a), null)) : null;
}
function ue(t, s, e) {
  const a = Ne(t, t.VERTEX_SHADER, s), n = Ne(t, t.FRAGMENT_SHADER, e);
  if (!a || !n) return null;
  const r = t.createProgram();
  return r ? (t.attachShader(r, a), t.attachShader(r, n), t.linkProgram(r), t.deleteShader(a), t.deleteShader(n), t.getProgramParameter(r, t.LINK_STATUS) ? r : (console.warn("GlassKit WebGL2 link error:", t.getProgramInfoLog(r)), t.deleteProgram(r), null)) : null;
}
function ve(t, s, e) {
  const a = t.createTexture();
  return a ? (t.bindTexture(t.TEXTURE_2D, a), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, s, e, 0, t.RGBA, t.UNSIGNED_BYTE, null), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), a) : null;
}
function Qe(t) {
  switch (t) {
    case "tahoe":
      return 0;
    case "sunset":
      return 1;
    case "light":
      return 2;
    case "dark":
      return 3;
    case "prism":
      return 4;
  }
}
function Ke(t) {
  switch (t) {
    case "clear":
      return 0;
    case "tinted":
      return 1;
    case "dark":
      return 2;
    case "prominent":
      return 3;
  }
}
class Ze {
  constructor() {
    P(this, "canvas", null);
    P(this, "gl", null);
    P(this, "wallProg", null);
    P(this, "coverProg", null);
    P(this, "blurProg", null);
    P(this, "glassProg", null);
    P(this, "quadBuf", null);
    P(this, "fbo", null);
    P(this, "wallpaperCache", /* @__PURE__ */ new Map());
    P(this, "loadedImages", /* @__PURE__ */ new Map());
    P(this, "loadingImages", /* @__PURE__ */ new Set());
    P(this, "failedImages", /* @__PURE__ */ new Set());
    P(this, "assetListeners", /* @__PURE__ */ new Set());
    P(this, "MAX_WALLPAPERS", 10);
    P(this, "MAX_LOADED_IMAGES", 10);
    P(this, "ready", !1);
    P(this, "initialized", !1);
    P(this, "wallUniforms", null);
    P(this, "coverUniforms", null);
    P(this, "blurUniforms", null);
    P(this, "glassUniforms", null);
    P(this, "rectArr", new Float32Array(le * 4));
    P(this, "paramArr", new Float32Array(le * 4));
    P(this, "hoverArr", new Float32Array(le * 4));
    P(this, "opticsArr", new Float32Array(le * 4));
    P(this, "posLocCache", /* @__PURE__ */ new WeakMap());
    P(this, "ctx2dCache", /* @__PURE__ */ new WeakMap());
  }
  isAvailable() {
    return this.initialized || this.init(), this.ready;
  }
  onAssetLoaded(s) {
    return this.assetListeners.add(s), () => {
      this.assetListeners.delete(s);
    };
  }
  notifyAssetLoaded() {
    this.assetListeners.forEach((s) => s());
  }
  uploadImageTexture(s, e) {
    const a = this.gl;
    if (!a || a.isContextLost()) return;
    if (this.loadedImages.size >= this.MAX_LOADED_IMAGES) {
      const r = this.loadedImages.keys().next().value;
      if (r && !r.startsWith("scene:")) {
        const o = this.loadedImages.get(r);
        o && a.deleteTexture(o.tex), this.loadedImages.delete(r);
      }
    }
    const n = a.createTexture();
    if (n) {
      a.bindTexture(a.TEXTURE_2D, n), a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL, 1), a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, e), a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL, 0), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE), this.loadedImages.set(s, {
        tex: n,
        width: e.naturalWidth || 1920,
        height: e.naturalHeight || 1080
      });
      for (const [r, o] of this.wallpaperCache.entries())
        r.startsWith(`${s}_`) && !o.fromImage && (a.deleteTexture(o.crispTex), a.deleteTexture(o.blurTex), this.wallpaperCache.delete(r));
      this.notifyAssetLoaded();
    }
  }
  ensureImageLoaded(s, e, a) {
    if (!e || this.loadedImages.has(s) || this.loadingImages.has(s) || this.failedImages.has(s) || !this.gl || this.gl.isContextLost()) return;
    this.loadingImages.add(s);
    const n = (r, o) => {
      const c = new Image();
      /^https?:\/\//i.test(r) && (c.crossOrigin = "anonymous"), c.decoding = "async", c.onload = () => {
        this.loadingImages.delete(s), this.uploadImageTexture(s, c);
      }, c.onerror = () => {
        o ? n(o) : (this.loadingImages.delete(s), this.failedImages.add(s));
      }, c.src = r;
    };
    n(e, a);
  }
  evictImage(s) {
    const e = this.gl, a = `img:${s}`, n = this.loadedImages.get(a);
    if (n && e && !e.isContextLost() && e.deleteTexture(n.tex), this.loadedImages.delete(a), this.failedImages.delete(a), e && !e.isContextLost())
      for (const [r, o] of this.wallpaperCache.entries())
        r.startsWith(`${a}_`) && (e.deleteTexture(o.crispTex), e.deleteTexture(o.blurTex), this.wallpaperCache.delete(r));
  }
  init() {
    if (this.initialized = !0, typeof document > "u") return;
    const s = document.createElement("canvas");
    s.width = 2, s.height = 2;
    const e = s.getContext("webgl2", {
      alpha: !1,
      antialias: !1,
      depth: !1,
      stencil: !1,
      preserveDrawingBuffer: !0,
      powerPreference: "default"
    });
    if (!e) return;
    const a = ue(e, de, Ve), n = ue(e, de, qe), r = ue(e, de, Ye), o = ue(e, de, je);
    if (!a || !n || !r || !o) return;
    const c = e.createBuffer();
    e.bindBuffer(e.ARRAY_BUFFER, c), e.bufferData(
      e.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      e.STATIC_DRAW
    );
    const d = e.createFramebuffer();
    this.canvas = s, this.gl = e, this.wallProg = a, this.coverProg = n, this.blurProg = r, this.glassProg = o, this.quadBuf = c, this.fbo = d, this.wallUniforms = {
      uRes: e.getUniformLocation(a, "uRes"),
      uScene: e.getUniformLocation(a, "uScene")
    }, this.coverUniforms = {
      uImg: e.getUniformLocation(n, "uImg"),
      uScale: e.getUniformLocation(n, "uScale"),
      uOffset: e.getUniformLocation(n, "uOffset")
    }, this.blurUniforms = {
      uSrc: e.getUniformLocation(r, "uSrc"),
      uDir: e.getUniformLocation(r, "uDir")
    }, this.glassUniforms = {
      uBg: e.getUniformLocation(o, "uBg"),
      uBgBlur: e.getUniformLocation(o, "uBgBlur"),
      uRes: e.getUniformLocation(o, "uRes"),
      uCount: e.getUniformLocation(o, "uCount"),
      uRects: e.getUniformLocation(o, "uRects[0]"),
      uParams: e.getUniformLocation(o, "uParams[0]"),
      uHover: e.getUniformLocation(o, "uHover[0]"),
      uOptics: e.getUniformLocation(o, "uOptics[0]"),
      uDroplet: e.getUniformLocation(o, "uDroplet"),
      uDropAlpha: e.getUniformLocation(o, "uDropAlpha"),
      uIsLightStage: e.getUniformLocation(o, "uIsLightStage"),
      uBgSoftness: e.getUniformLocation(o, "uBgSoftness"),
      uSaturation: e.getUniformLocation(o, "uSaturation")
    }, s.addEventListener("webglcontextlost", (u) => {
      u.preventDefault(), this.ready = !1, this.wallpaperCache.clear(), this.loadedImages.clear(), this.loadingImages.clear();
    }), s.addEventListener("webglcontextrestored", () => {
      this.initialized = !1, this.init(), this.notifyAssetLoaded();
    }), this.ready = !0;
    const l = be.tahoe;
    l && this.ensureImageLoaded("scene:tahoe", l, Ee.tahoe);
  }
  bindQuad(s) {
    const e = this.gl;
    e.bindBuffer(e.ARRAY_BUFFER, this.quadBuf);
    let a = this.posLocCache.get(s);
    a === void 0 && (a = e.getAttribLocation(s, "aPos"), this.posLocCache.set(s, a)), e.enableVertexAttribArray(a), e.vertexAttribPointer(a, 2, e.FLOAT, !1, 0, 0);
  }
  getOrBakeWallpaper(s, e, a, n) {
    const r = this.gl;
    if (!r || !this.wallProg || !this.coverProg || !this.blurProg || !this.wallUniforms || !this.coverUniforms || !this.blurUniforms || !this.fbo)
      return null;
    const o = e ? `img:${e}` : `scene:${s}`;
    if (e)
      this.ensureImageLoaded(o, e);
    else {
      const p = be[s];
      p && this.ensureImageLoaded(o, p, Ee[s]);
    }
    const c = this.loadedImages.get(o), d = Math.max(256, Math.round(a / 16) * 16), l = Math.max(200, Math.round(n / 16) * 16), u = `${o}_${d}x${l}`, m = this.wallpaperCache.get(u);
    if (m && (!c || m.fromImage)) return m;
    if (m && (r.deleteTexture(m.crispTex), r.deleteTexture(m.blurTex), this.wallpaperCache.delete(u)), this.wallpaperCache.size >= this.MAX_WALLPAPERS) {
      const p = this.wallpaperCache.keys().next().value;
      if (p) {
        const f = this.wallpaperCache.get(p);
        f && (r.deleteTexture(f.crispTex), r.deleteTexture(f.blurTex)), this.wallpaperCache.delete(p);
      }
    }
    const g = ve(r, d, l), h = Math.max(128, Math.round(d * 0.5)), b = Math.max(100, Math.round(l * 0.5)), v = ve(r, h, b), y = ve(r, h, b);
    if (!g || !v || !y)
      return g && r.deleteTexture(g), v && r.deleteTexture(v), y && r.deleteTexture(y), null;
    if (r.bindFramebuffer(r.FRAMEBUFFER, this.fbo), r.framebufferTexture2D(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, g, 0), r.viewport(0, 0, d, l), c) {
      const p = d / l, f = c.width / Math.max(1, c.height);
      let M = 1, x = 1;
      p > f ? x = f / p : M = p / f;
      const E = (1 - M) * 0.5, L = (1 - x) * 0.5;
      r.useProgram(this.coverProg), this.bindQuad(this.coverProg), r.activeTexture(r.TEXTURE0), r.bindTexture(r.TEXTURE_2D, c.tex), r.uniform1i(this.coverUniforms.uImg, 0), r.uniform2f(this.coverUniforms.uScale, M, x), r.uniform2f(this.coverUniforms.uOffset, E, L), r.drawArrays(r.TRIANGLES, 0, 6);
    } else
      r.useProgram(this.wallProg), this.bindQuad(this.wallProg), r.uniform2f(this.wallUniforms.uRes, d, l), r.uniform1i(this.wallUniforms.uScene, Qe(s)), r.drawArrays(r.TRIANGLES, 0, 6);
    r.useProgram(this.blurProg), this.bindQuad(this.blurProg), r.activeTexture(r.TEXTURE0), r.uniform1i(this.blurUniforms.uSrc, 0), r.viewport(0, 0, h, b);
    const k = Math.max(1.4, b / 250);
    r.framebufferTexture2D(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, v, 0), r.bindTexture(r.TEXTURE_2D, g), r.uniform2f(this.blurUniforms.uDir, k / h, 0), r.drawArrays(r.TRIANGLES, 0, 6), r.framebufferTexture2D(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, y, 0), r.bindTexture(r.TEXTURE_2D, v), r.uniform2f(this.blurUniforms.uDir, 0, k / b), r.drawArrays(r.TRIANGLES, 0, 6), r.framebufferTexture2D(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, v, 0), r.bindTexture(r.TEXTURE_2D, y), r.uniform2f(this.blurUniforms.uDir, k * 1.65 / h, 0), r.drawArrays(r.TRIANGLES, 0, 6), r.framebufferTexture2D(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, y, 0), r.bindTexture(r.TEXTURE_2D, v), r.uniform2f(this.blurUniforms.uDir, 0, k * 1.65 / b), r.drawArrays(r.TRIANGLES, 0, 6), r.bindFramebuffer(r.FRAMEBUFFER, null), r.deleteTexture(v);
    const N = {
      crispTex: g,
      blurTex: y,
      w: d,
      h: l,
      fromImage: !!c
    };
    return this.wallpaperCache.set(u, N), N;
  }
  renderToCanvas(s, e) {
    if (!this.isAvailable()) return !1;
    const a = this.gl, n = this.canvas;
    if (!a || !n || !this.glassProg || !this.glassUniforms || !this.quadBuf || a.isContextLost()) return !1;
    const r = Math.min(window.devicePixelRatio || 1, 2), o = Math.min(2400, Math.max(200, Math.round(e.stageWidth * r))), c = Math.min(1600, Math.max(160, Math.round(e.stageHeight * r)));
    (s.width !== o || s.height !== c) && (s.width = o, s.height = c), (n.width !== o || n.height !== c) && (n.width = o, n.height = c);
    const d = this.getOrBakeWallpaper(e.scene, e.backgroundImage, o, c);
    if (!d) return !1;
    const l = e.stageWidth / Math.max(1, e.stageHeight), u = Math.min(le, e.rects.length);
    for (let g = 0; g < u; g++) {
      const h = e.rects[g], b = h.cx / Math.max(1, e.stageWidth), v = 1 - h.cy / Math.max(1, e.stageHeight), y = (b - 0.5) * l, k = v - 0.5, N = h.hw / Math.max(1, e.stageHeight), p = h.hh / Math.max(1, e.stageHeight), f = h.radius / Math.max(1, e.stageHeight), M = h.bezelPx / Math.max(1, e.stageHeight), x = g * 4;
      this.rectArr[x] = y, this.rectArr[x + 1] = k, this.rectArr[x + 2] = N, this.rectArr[x + 3] = p, this.paramArr[x] = f, this.paramArr[x + 1] = h.opacity, this.paramArr[x + 2] = Ke(h.variant), this.paramArr[x + 3] = M, this.hoverArr[x] = h.pointerX, this.hoverArr[x + 1] = h.pointerY, this.hoverArr[x + 2] = h.pointerAlpha, this.hoverArr[x + 3] = 0, this.opticsArr[x] = h.refraction ?? e.refraction, this.opticsArr[x + 1] = h.blur ?? e.blur, this.opticsArr[x + 2] = h.aberration ?? e.aberration, this.opticsArr[x + 3] = h.specular ?? e.specular;
    }
    if (a.bindFramebuffer(a.FRAMEBUFFER, null), a.viewport(0, 0, o, c), a.useProgram(this.glassProg), this.bindQuad(this.glassProg), a.activeTexture(a.TEXTURE0), a.bindTexture(a.TEXTURE_2D, d.crispTex), a.uniform1i(this.glassUniforms.uBg, 0), a.activeTexture(a.TEXTURE1), a.bindTexture(a.TEXTURE_2D, d.blurTex), a.uniform1i(this.glassUniforms.uBgBlur, 1), a.uniform2f(this.glassUniforms.uRes, o, c), a.uniform1i(this.glassUniforms.uCount, u), a.uniform4fv(this.glassUniforms.uRects, this.rectArr), a.uniform4fv(this.glassUniforms.uParams, this.paramArr), a.uniform4fv(this.glassUniforms.uHover, this.hoverArr), a.uniform4fv(this.glassUniforms.uOptics, this.opticsArr), e.droplet && e.droplet.opacity > 5e-3) {
      const g = (e.droplet.x - 0.5) * l, h = e.droplet.y - 0.5;
      a.uniform4f(this.glassUniforms.uDroplet, g, h, e.droplet.radius, e.droplet.morph), a.uniform1f(this.glassUniforms.uDropAlpha, e.droplet.opacity);
    } else
      a.uniform4f(this.glassUniforms.uDroplet, 10, 10, 0, 0), a.uniform1f(this.glassUniforms.uDropAlpha, 0);
    a.uniform1f(this.glassUniforms.uIsLightStage, e.isLightStage ? 1 : 0), a.uniform1f(this.glassUniforms.uBgSoftness, 0.46), a.uniform1f(this.glassUniforms.uSaturation, e.saturation), a.drawArrays(a.TRIANGLES, 0, 6);
    let m = this.ctx2dCache.get(s);
    if (!m) {
      const g = s.getContext("2d", { alpha: !1 });
      if (!g) return !1;
      this.ctx2dCache.set(s, g), m = g;
    }
    return m.drawImage(n, 0, 0, o, c, 0, 0, o, c), !0;
  }
}
const pe = new Ze(), ce = /* @__PURE__ */ new Map(), Je = 120;
let ie = null, xe = null;
function et(t, s) {
  return typeof document > "u" || (ie || (ie = document.createElement("canvas"), xe = ie.getContext("2d", { willReadFrequently: !1 })), !xe) ? null : (ie.width !== t && (ie.width = t), ie.height !== s && (ie.height = s), { canvas: ie, ctx: xe });
}
function tt(t, s, e, a, n) {
  const r = Math.max(0, e - n), o = Math.max(0, a - n), c = Math.abs(t) - r, d = Math.abs(s) - o, l = Math.hypot(Math.max(c, 0), Math.max(d, 0)), u = Math.min(Math.max(c, d), 0);
  return l + u - n;
}
function rt(t, s, e, a, n) {
  const r = Math.max(0, e - n), o = Math.max(0, a - n), c = t >= 0 ? 1 : -1, d = s >= 0 ? 1 : -1, l = Math.abs(t) - r, u = Math.abs(s) - o;
  if (l > 0 || u > 0) {
    const m = Math.max(l, 0), g = Math.max(u, 0), h = Math.hypot(m, g) || 1;
    return [c * m / h, d * g / h];
  }
  return l > u ? [c, 0] : [0, d];
}
function at(t, s, e) {
  if (t >= 1) return 0;
  const n = 1 - Math.max(0.015, Math.min(0.999, t)), r = n * n * n, o = r * n, c = Math.pow(Math.max(2e-4, 1 - o), 0.25), d = r / Math.pow(Math.max(8e-4, 1 - o), 0.75) * 1.18, l = Math.atan(d), u = Math.min(0.995, Math.sin(l) / s), m = Math.asin(u), g = Math.max(0, l - m), h = e * 1.42 + c * e * 0.9;
  return Math.tan(g) * h;
}
function it(t) {
  const s = Math.max(24, Math.min(960, Math.round(t.width / 8) * 8)), e = Math.max(24, Math.min(720, Math.round(t.height / 8) * 8)), a = Math.min(s, e) / 2, n = Math.max(4, Math.min(a, Math.round(t.radius / 2) * 2)), r = Math.max(8, Math.min(a * 0.96, Math.round(t.bezelWidth / 2) * 2)), o = t.ior ?? 1.54, c = Math.round((t.refractionStrength ?? 1.55) * 20) / 20, d = `${s}x${e}_r${n}_b${r}_i${o.toFixed(2)}_s${c.toFixed(2)}`, l = ce.get(d);
  if (l) return l;
  const u = Math.max(s, e), m = u > 160 ? 160 / u : 1, g = Math.max(20, Math.round(s * m)), h = Math.max(20, Math.round(e * m)), b = g / 2, v = h / 2, y = n * m, k = Math.max(3, r * m), N = et(g, h);
  if (!N)
    return {
      displacementUrl: "",
      maxScale: 0,
      width: s,
      height: e
    };
  const { canvas: p, ctx: f } = N, M = f.createImageData(g, h), x = M.data, E = g * h, L = new Float32Array(E), G = new Float32Array(E);
  let A = 1e-4;
  for (let I = 0; I < h; I++) {
    const H = I + 0.5 - v;
    for (let D = 0; D < g; D++) {
      const $ = D + 0.5 - b, T = I * g + D, _ = tt($, H, b, v, y);
      if (_ > 0.5)
        continue;
      const q = Math.max(0, -_), [O, X] = rt($, H, b, v, y);
      if (q < k) {
        const U = q / k, z = at(U, o, r) * c, Y = -O * z, V = -X * z;
        L[T] = Y, G[T] = V;
        const re = Math.max(Math.abs(Y), Math.abs(V));
        re > A && (A = re);
      } else {
        const U = $ / Math.max(1, b), z = H / Math.max(1, v), Y = 0.65 * c;
        L[T] = -U * Y, G[T] = -z * Y;
      }
    }
  }
  const B = 127 / A;
  for (let I = 0; I < E; I++) {
    const H = I * 4, D = 128 + L[I] * B, $ = 128 + G[I] * B;
    x[H] = D < 0 ? 0 : D > 255 ? 255 : D + 0.5 | 0, x[H + 1] = $ < 0 ? 0 : $ > 255 ? 255 : $ + 0.5 | 0, x[H + 2] = 128, x[H + 3] = 255;
  }
  f.putImageData(M, 0, 0);
  const Q = {
    displacementUrl: p.toDataURL("image/png"),
    maxScale: Math.min(72, A * 1.6),
    width: s,
    height: e
  };
  if (ce.size >= Je) {
    const I = ce.keys().next().value;
    I && ce.delete(I);
  }
  return ce.set(d, Q), Q;
}
function we() {
  if (typeof navigator > "u") return !1;
  const t = navigator.userAgent;
  return /Chrome\/|Chromium\/|Edg\//.test(t) && !/CriOS|FxiOS/.test(t);
}
const Ce = "glasskit-site-theme", Me = {
  refraction: 0.88,
  blur: 3.4,
  bezelWidth: 24,
  specular: 0.95,
  aberration: 0.16,
  saturation: 1.16,
  morphStrength: 0.075,
  useSvgRefraction: !0,
  renderMode: "auto",
  siteTheme: "dark"
};
function st(t, s) {
  if (t) return t;
  if (typeof window > "u") return "dark";
  if (s)
    try {
      const e = window.localStorage.getItem(Ce);
      if (e === "dark" || e === "light") return e;
    } catch {
    }
  return "dark";
}
const Ie = De(null), Mt = ({
  children: t,
  defaultSettings: s,
  persistTheme: e = !0
}) => {
  const [a] = C(() => we()), [n, r] = C(() => ({
    ...Me,
    useSvgRefraction: we(),
    ...s,
    siteTheme: st(s == null ? void 0 : s.siteTheme, e)
  }));
  ae(() => {
    if (!(!e || typeof window > "u"))
      try {
        window.localStorage.setItem(Ce, n.siteTheme);
      } catch {
      }
  }, [n.siteTheme, e]);
  const o = J(
    (u, m) => {
      r((g) => g[u] === m ? g : { ...g, [u]: m });
    },
    []
  ), c = J((u) => {
    r((m) => u === "clear" ? {
      ...m,
      refraction: 0.88,
      blur: 3.4,
      bezelWidth: 24,
      specular: 0.95,
      aberration: 0.16,
      saturation: 1.16
    } : u === "regular" ? {
      ...m,
      refraction: 0.65,
      blur: 5.2,
      bezelWidth: 20,
      specular: 0.85,
      aberration: 0.08,
      saturation: 1.12
    } : u === "crystal" ? {
      ...m,
      refraction: 1.25,
      blur: 1.2,
      bezelWidth: 28,
      specular: 1.15,
      aberration: 0.18,
      saturation: 1.22
    } : {
      ...m,
      refraction: 1.15,
      blur: 2.2,
      bezelWidth: 26,
      specular: 1.1,
      aberration: 0.34,
      saturation: 1.24
    });
  }, []), d = J(() => {
    r((u) => ({
      ...Me,
      ...s,
      siteTheme: u.siteTheme,
      useSvgRefraction: a,
      renderMode: "auto"
    }));
  }, [s, a]), l = he(
    () => ({
      settings: n,
      svgSupported: a,
      updateSetting: o,
      applyPreset: c,
      resetSettings: d
    }),
    [n, a, o, c, d]
  );
  return /* @__PURE__ */ i(Ie.Provider, { value: l, children: t });
};
function Be() {
  const t = ke(Ie);
  return t || {
    settings: Me,
    svgSupported: we(),
    updateSetting: () => {
    },
    applyPreset: () => {
    },
    resetSettings: () => {
    }
  };
}
const Pe = De(null);
function _e() {
  return ke(Pe);
}
const nt = me.forwardRef(
  ({
    scene: t = "tahoe",
    backgroundImage: s,
    tone: e,
    renderMode: a,
    className: n = "",
    style: r,
    children: o,
    onStagePointerMove: c,
    onStagePointerDown: d,
    onStagePointerUp: l,
    onStagePointerLeave: u,
    onPointerMove: m,
    onPointerDown: g,
    onPointerUp: h,
    onPointerLeave: b,
    onClick: v,
    underlay: y,
    ...k
  }, N) => {
    const { settings: p } = Be(), f = F(null), M = F(null), x = F(/* @__PURE__ */ new Map()), E = F(null), L = F(p);
    L.current = p;
    const G = F(t);
    G.current = t;
    const A = F(s);
    A.current = s;
    const B = e ?? (s ? "dark" : t === "light" ? "light" : "dark"), Q = F(B === "light");
    Q.current = B === "light";
    const I = a ?? p.renderMode, [H] = C(() => pe.isAvailable()), D = H && (I === "auto" || I === "webgl"), $ = F(!1), T = F(0), _ = F(0), q = J(() => {
      const R = f.current, Z = M.current;
      if (!R || !Z || !D || !$.current || document.hidden)
        return;
      const K = R.getBoundingClientRect();
      if (K.width < 10 || K.height < 10) return;
      const te = L.current, se = [];
      x.current.forEach((W) => {
        if (!W.el.isConnected) return;
        const ee = W.el.getBoundingClientRect();
        if (ee.width < 2 || ee.height < 2) return;
        const ge = window.getComputedStyle(W.el), ne = parseFloat(ge.opacity);
        if (Number.isNaN(ne) || ne <= 0.01) return;
        const oe = W.el.parentElement ? parseFloat(window.getComputedStyle(W.el.parentElement).opacity) : 1, Te = ne * (Number.isNaN(oe) ? 1 : oe);
        if (Te <= 0.01) return;
        const $e = ee.left - K.left + ee.width * 0.5, Fe = ee.top - K.top + ee.height * 0.5, Re = ee.width * 0.5, ye = ee.height * 0.5, Ge = Math.min(W.radius, Math.min(Re, ye));
        se.push({
          cx: $e,
          cy: Fe,
          hw: Re,
          hh: ye,
          radius: Ge,
          opacity: Te,
          variant: W.variant,
          bezelPx: W.bezelWidth ?? te.bezelWidth,
          refraction: W.refraction,
          blur: W.blur,
          aberration: W.aberration,
          specular: W.specular,
          pointerX: W.pointerX,
          pointerY: W.pointerY,
          pointerAlpha: W.pointerAlpha
        });
      }), pe.renderToCanvas(Z, {
        scene: G.current,
        backgroundImage: A.current,
        isLightStage: Q.current,
        stageWidth: K.width,
        stageHeight: K.height,
        rects: se,
        droplet: E.current,
        refraction: te.refraction,
        blur: te.blur,
        aberration: te.aberration,
        specular: te.specular,
        saturation: te.saturation
      });
    }, [D]), O = J(
      (R) => {
        T.current = 0, q(), R < _.current && $.current && !document.hidden && (T.current = requestAnimationFrame(O));
      },
      [q]
    ), X = J(() => {
      !$.current || document.hidden || !D || T.current || (T.current = requestAnimationFrame(O));
    }, [D, O]), U = J(
      (R = 460) => {
        D && (_.current = Math.max(_.current, performance.now() + R), $.current && !document.hidden && !T.current && (T.current = requestAnimationFrame(O)));
      },
      [D, O]
    );
    Oe(
      N,
      () => ({
        requestFrame: X,
        requestBurst: U,
        setDroplet: (R) => {
          E.current = R;
        }
      }),
      [X, U]
    ), ae(() => {
      const R = f.current;
      if (!R || !D) return;
      const Z = typeof IntersectionObserver < "u" ? new IntersectionObserver(
        (ge) => {
          var oe;
          const ne = ((oe = ge[0]) == null ? void 0 : oe.isIntersecting) ?? !1;
          $.current = ne, ne ? U(820) : T.current && (cancelAnimationFrame(T.current), T.current = 0);
        },
        { rootMargin: "120px 0px" }
      ) : null;
      Z ? Z.observe(R) : ($.current = !0, X());
      const K = new ResizeObserver(() => U(120));
      K.observe(R);
      const te = () => {
        !document.hidden && $.current ? X() : T.current && (cancelAnimationFrame(T.current), T.current = 0);
      };
      document.addEventListener("visibilitychange", te);
      const se = pe.onAssetLoaded(() => X()), W = () => U(540), ee = () => U(420);
      return R.addEventListener("transitionstart", W), window.addEventListener("orientationchange", ee), () => {
        Z == null || Z.disconnect(), K.disconnect(), se(), R.removeEventListener("transitionstart", W), window.removeEventListener("orientationchange", ee), document.removeEventListener("visibilitychange", te), T.current && (cancelAnimationFrame(T.current), T.current = 0);
      };
    }, [D, U, X]), ae(() => {
      X();
    }, [
      t,
      s,
      B,
      D,
      p.refraction,
      p.blur,
      p.bezelWidth,
      p.specular,
      p.aberration,
      p.saturation,
      X
    ]);
    const z = J(
      (R) => {
        x.current.set(R.id, R), U(120);
      },
      [U]
    ), Y = J(
      (R) => {
        x.current.delete(R), X();
      },
      [X]
    ), V = J(
      (R, Z) => {
        const K = x.current.get(R);
        K && (Object.assign(K, Z), X());
      },
      [X]
    ), re = he(
      () => ({
        gpuActive: D,
        stageRenderMode: I,
        register: z,
        unregister: Y,
        updateMeta: V,
        requestBurst: U
      }),
      [D, I, z, Y, V, U]
    ), fe = he(() => {
      if (D) return;
      const R = s ?? be[t];
      return {
        backgroundImage: R ? `url("${R}"), ${Ae[t]}` : Ae[t],
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
    }, [D, s, t]), S = n.includes("stage-tone-") ? "" : B === "light" ? "stage-tone-light" : "stage-tone-dark";
    return /* @__PURE__ */ i(Pe.Provider, { value: re, children: /* @__PURE__ */ w(
      "div",
      {
        ref: f,
        className: `glass-stage-root ${S} ${n}`.trim(),
        style: r,
        onPointerMove: (R) => {
          c == null || c(R), m == null || m(R);
        },
        onPointerDown: (R) => {
          U(480), d == null || d(R), g == null || g(R);
        },
        onPointerUp: (R) => {
          U(480), l == null || l(R), h == null || h(R);
        },
        onPointerLeave: (R) => {
          U(320), u == null || u(R), b == null || b(R);
        },
        onClick: (R) => {
          U(540), v == null || v(R);
        },
        ...k,
        children: [
          D ? /* @__PURE__ */ i(
            "canvas",
            {
              ref: M,
              className: "glass-stage-canvas",
              "aria-hidden": "true"
            }
          ) : /* @__PURE__ */ i(
            "div",
            {
              className: "glass-stage-fallback-bg",
              style: fe,
              "aria-hidden": "true"
            }
          ),
          y && /* @__PURE__ */ i("div", { className: "glass-stage-underlay", "aria-hidden": "true", children: y }),
          /* @__PURE__ */ i("div", { className: "glass-stage-foreground", children: o })
        ]
      }
    ) });
  }
);
nt.displayName = "GlassStage";
const ot = ({
  children: t,
  className: s = "",
  style: e,
  radius: a = 24,
  refraction: n,
  blur: r,
  bezelWidth: o,
  aberration: c,
  specular: d,
  variant: l = "clear",
  interactive: u = !0,
  renderMode: m,
  forceSvg: g = !1,
  onPointerMove: h,
  onPointerLeave: b,
  ...v
}) => {
  const y = He(), k = he(
    () => `lg-svg-${y.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [y]
  ), N = F(null), p = _e(), { settings: f, svgSupported: M } = Be(), x = g ? "svg" : m ?? (p == null ? void 0 : p.stageRenderMode) ?? f.renderMode, E = !!(p && p.gpuActive && (x === "auto" || x === "webgl")), L = !E && M && (x === "svg" || x === "auto" && f.useSvgRefraction), [G, A] = C(null), B = n ?? f.refraction, Q = r ?? f.blur, I = o ?? f.bezelWidth, H = c ?? f.aberration, D = d ?? f.specular;
  ae(() => {
    const U = N.current;
    if (!E || !p || !U) return;
    p.register({
      id: y,
      el: U,
      radius: a,
      variant: l,
      bezelWidth: o,
      refraction: n,
      blur: r,
      aberration: c,
      specular: d,
      pointerX: 0.5,
      pointerY: 0.3,
      pointerAlpha: 0
    });
    const z = new ResizeObserver(() => {
      p.requestBurst(120);
    });
    return z.observe(U), () => {
      z.disconnect(), p.unregister(y);
    };
  }, [y, p, E]), ae(() => {
    !E || !p || p.updateMeta(y, {
      radius: a,
      variant: l,
      bezelWidth: o,
      refraction: n,
      blur: r,
      aberration: c,
      specular: d
    });
  }, [y, p, E, a, l, o, n, r, c, d]), ae(() => {
    const U = N.current;
    if (!L || !U) {
      A(null);
      return;
    }
    const z = () => {
      const V = U.getBoundingClientRect();
      if (V.width < 12 || V.height < 12) return;
      const re = it({
        width: V.width,
        height: V.height,
        radius: Math.min(a, Math.min(V.width, V.height) / 2),
        bezelWidth: I,
        refractionStrength: Math.max(0.25, B * 1.65)
      });
      A(re);
    };
    z();
    const Y = new ResizeObserver(z);
    return Y.observe(U), () => Y.disconnect();
  }, [L, a, I, B]);
  const $ = J(
    (U) => {
      if (u && U.pointerType === "mouse" && N.current) {
        const z = N.current.getBoundingClientRect(), Y = Math.max(0, Math.min(1, (U.clientX - z.left) / Math.max(1, z.width))), V = Math.max(0, Math.min(1, (U.clientY - z.top) / Math.max(1, z.height)));
        E && p ? p.updateMeta(y, { pointerX: Y, pointerY: V, pointerAlpha: 1 }) : (N.current.style.setProperty("--lg-mx", `${(Y * 100).toFixed(1)}%`), N.current.style.setProperty("--lg-my", `${(V * 100).toFixed(1)}%`), N.current.style.setProperty("--lg-pointer-alpha", "1"));
      }
      h == null || h(U);
    },
    [y, u, h, p, E]
  ), T = J(
    (U) => {
      u && (E && p ? p.updateMeta(y, { pointerAlpha: 0 }) : N.current && N.current.style.setProperty("--lg-pointer-alpha", "0")), b == null || b(U);
    },
    [y, u, b, p, E]
  );
  if (E)
    return /* @__PURE__ */ i(
      "div",
      {
        ref: N,
        className: `lg-surface-gpu lg-variant-${l} ${s}`.trim(),
        onPointerMove: $,
        onPointerLeave: T,
        style: {
          borderRadius: `${a}px`,
          ...e
        },
        ...v,
        children: /* @__PURE__ */ i("div", { className: "lg-content", children: t })
      }
    );
  const _ = Math.max(2, Q * 3.8), q = Math.round(f.saturation * 145), O = !!(L && G && G.displacementUrl), X = O ? `url(#${k}) saturate(${q}%) brightness(1.04)` : `blur(${Math.max(10, _).toFixed(1)}px) saturate(${q}%)`;
  return /* @__PURE__ */ w(
    "div",
    {
      ref: N,
      className: `lg-surface lg-variant-${l} ${O ? "lg-tier-svg" : "lg-tier-css"} ${s}`.trim(),
      onPointerMove: $,
      onPointerLeave: T,
      style: {
        borderRadius: `${a}px`,
        "--lg-specular": D,
        "--lg-aberration": H,
        ...e
      },
      ...v,
      children: [
        O && G && /* @__PURE__ */ i(
          "svg",
          {
            width: "0",
            height: "0",
            "aria-hidden": "true",
            style: { position: "absolute", pointerEvents: "none" },
            children: /* @__PURE__ */ i("defs", { children: /* @__PURE__ */ w("filter", { id: k, colorInterpolationFilters: "sRGB", children: [
              /* @__PURE__ */ i(
                "feGaussianBlur",
                {
                  in: "SourceGraphic",
                  stdDeviation: Math.max(0.4, Q * 0.65).toFixed(2),
                  result: "blur"
                }
              ),
              /* @__PURE__ */ i(
                "feImage",
                {
                  href: G.displacementUrl,
                  x: "0",
                  y: "0",
                  width: "100%",
                  height: "100%",
                  preserveAspectRatio: "none",
                  result: "dispMap"
                }
              ),
              /* @__PURE__ */ i(
                "feDisplacementMap",
                {
                  in: "blur",
                  in2: "dispMap",
                  scale: G.maxScale.toFixed(1),
                  xChannelSelector: "R",
                  yChannelSelector: "G"
                }
              )
            ] }) })
          }
        ),
        /* @__PURE__ */ i(
          "div",
          {
            className: "lg-backdrop",
            "aria-hidden": "true",
            style: {
              backdropFilter: X,
              WebkitBackdropFilter: `blur(${Math.max(10, _).toFixed(1)}px) saturate(${q}%)`
            }
          }
        ),
        u && /* @__PURE__ */ i("div", { className: "lg-pointer-sheen", "aria-hidden": "true" }),
        /* @__PURE__ */ i("div", { className: "lg-rim-highlight", "aria-hidden": "true" }),
        /* @__PURE__ */ i("div", { className: "lg-content", children: t })
      ]
    }
  );
}, j = me.memo(ot), Se = () => /* @__PURE__ */ w("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.1", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ i("circle", { cx: "11", cy: "11", r: "8" }),
  /* @__PURE__ */ i("path", { d: "m21 21-4.3-4.3" })
] }), Ue = ({ size: t = 20 }) => /* @__PURE__ */ w("svg", { width: t, height: t, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.1", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ i("path", { d: "M18 6 6 18" }),
  /* @__PURE__ */ i("path", { d: "m6 6 12 12" })
] }), Tt = ({
  items: t,
  activeIndex: s,
  defaultActiveIndex: e = 0,
  onChange: a,
  searchable: n = !1,
  searchPlaceholder: r = "Search...",
  searchValue: o,
  onSearchChange: c,
  searchIcon: d,
  closeIcon: l,
  variant: u = "clear",
  ariaLabel: m = "Primary navigation (drag or tap)",
  className: g = ""
}) => {
  const [h, b] = C(e), [v, y] = C(!1), [k, N] = C(""), p = s !== void 0 ? s : h, f = o !== void 0 ? o : k, M = (S) => {
    s === void 0 && b(S), t[S] && (a == null || a(S, t[S]));
  }, x = (S) => {
    o === void 0 && N(S), c == null || c(S);
  }, E = F(null), [L, G] = C(!1), [A, B] = C(null), [Q, I] = C(0), [H, D] = C(!1), $ = F(0), T = F(!1), _ = F(null), q = Math.max(1, t.length), O = (S) => {
    const R = E.current;
    if (!R) return p;
    const Z = R.getBoundingClientRect(), K = 6, se = Math.max(1, Z.width - K * 2) / q, W = (S - Z.left - K - se * 0.5) / se;
    return Math.max(0, Math.min(q - 1, W));
  }, X = () => {
    D(!0), _.current !== null && window.clearTimeout(_.current), _.current = window.setTimeout(() => D(!1), 380);
  }, U = (S) => {
    S.currentTarget.setPointerCapture(S.pointerId), G(!0), T.current = !1, $.current = S.clientX, B(O(S.clientX)), I(0);
  }, z = (S) => {
    if (!L) return;
    const R = S.clientX - $.current;
    Math.abs(R) > 2 && (T.current = !0), $.current = S.clientX, B(O(S.clientX)), I(Math.min(0.24, Math.abs(R) * 0.012));
  }, Y = (S) => {
    if (!L) return;
    const R = Math.round(O(S));
    R !== p && (X(), M(R)), G(!1), B(null), I(0);
  }, V = (S) => {
    T.current || S !== p && (X(), M(S));
  }, re = A !== null ? A : p, fe = Math.round(re);
  return /* @__PURE__ */ i("div", { className: `demo-tabbar-wrap ${g}`.trim(), children: /* @__PURE__ */ w("div", { className: `ios-tabbar-row ${v ? "is-searching" : ""}`, children: [
    v ? /* @__PURE__ */ i(
      j,
      {
        radius: 999,
        bezelWidth: 20,
        variant: u,
        className: "ios-search-expanded blur-morph-in",
        children: /* @__PURE__ */ w("div", { className: "ios-search-field", children: [
          /* @__PURE__ */ i("span", { className: "ios-search-icon", "aria-hidden": "true", children: d ?? /* @__PURE__ */ i(Se, {}) }),
          /* @__PURE__ */ i(
            "input",
            {
              type: "text",
              value: f,
              onChange: (S) => x(S.target.value),
              placeholder: r,
              autoFocus: !0,
              "aria-label": r
            }
          ),
          f && /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: "ios-search-clear",
              onClick: () => x(""),
              "aria-label": "Clear search",
              children: l ?? /* @__PURE__ */ i(Ue, { size: 14 })
            }
          )
        ] })
      }
    ) : /* @__PURE__ */ i(j, { radius: 999, bezelWidth: 20, variant: u, className: "ios-tabbar-capsule", children: /* @__PURE__ */ w(
      "div",
      {
        ref: E,
        className: `ios-tabbar-inner ${L ? "is-swiping" : ""}`,
        style: { gridTemplateColumns: `repeat(${q}, minmax(0, 1fr))` },
        role: "tablist",
        "aria-label": m,
        onPointerDown: U,
        onPointerMove: z,
        onPointerUp: (S) => Y(S.clientX),
        onPointerCancel: (S) => Y(S.clientX),
        children: [
          /* @__PURE__ */ i(
            "div",
            {
              className: `ios-tabbar-indicator ${L ? "is-dragging-pill" : ""} ${H ? "is-gliding-pill" : ""}`,
              style: {
                width: `calc((100% - 12px) / ${q})`,
                transform: `translate3d(${re * 100}%, 0, 0)`
              },
              "aria-hidden": "true",
              children: /* @__PURE__ */ i(
                "div",
                {
                  className: "ios-tabbar-indicator-pill",
                  style: L ? {
                    transform: `scale(${(1.09 + Q).toFixed(3)}, ${(1.14 - Q * 0.35).toFixed(3)})`
                  } : void 0
                }
              )
            }
          ),
          t.map((S, R) => /* @__PURE__ */ w(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": R === p,
              className: `ios-tab-item ${R === fe ? "is-active" : ""}`,
              onClick: () => V(R),
              children: [
                S.icon,
                /* @__PURE__ */ i("span", { children: S.label })
              ]
            },
            S.id
          ))
        ]
      }
    ) }),
    n && /* @__PURE__ */ i(
      j,
      {
        radius: 999,
        bezelWidth: 18,
        variant: u,
        className: "ios-tabbar-search-btn-wrap",
        children: /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "ios-tabbar-search-btn",
            onClick: () => {
              y((S) => (S && x(""), !S));
            },
            "aria-label": v ? "Close search" : "Open search",
            children: v ? l ?? /* @__PURE__ */ i(Ue, {}) : d ?? /* @__PURE__ */ i(Se, {})
          }
        )
      }
    )
  ] }) });
}, Rt = ({
  checked: t,
  defaultChecked: s = !1,
  onChange: e,
  disabled: a = !1,
  label: n,
  description: r,
  ariaLabel: o,
  className: c = ""
}) => {
  const [d, l] = C(s), [u, m] = C(!1), g = t !== void 0 ? t : d, h = () => {
    if (a) return;
    const v = !g;
    t === void 0 && l(v), e == null || e(v);
  }, b = /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": g,
      "aria-label": o ?? n ?? "Toggle",
      disabled: a,
      className: `ios-liquid-switch ${g ? "is-on" : ""} ${u ? "is-pressed" : ""} ${n ? "" : c}`.trim(),
      onPointerDown: () => !a && m(!0),
      onPointerUp: () => m(!1),
      onPointerLeave: () => m(!1),
      onPointerCancel: () => m(!1),
      onClick: h,
      children: /* @__PURE__ */ i("span", { className: "ios-liquid-thumb" })
    }
  );
  return !n && !r ? b : /* @__PURE__ */ w("div", { className: `ios-toggle-row ${c}`.trim(), children: [
    /* @__PURE__ */ w("div", { className: "ios-toggle-meta", children: [
      n && /* @__PURE__ */ i("span", { className: "ios-toggle-title", children: n }),
      r && /* @__PURE__ */ i("span", { className: "ios-toggle-sub", children: r })
    ] }),
    b
  ] });
}, yt = ({
  value: t,
  defaultValue: s = 50,
  min: e = 0,
  max: a = 100,
  step: n = 1,
  onChange: r,
  label: o,
  showValue: c = !0,
  formatValue: d = (g) => `${g}%`,
  accent: l = "blue",
  ariaLabel: u = "Slider",
  className: m = ""
}) => {
  const [g, h] = C(s), [b, v] = C(!1), y = F(null), k = t !== void 0 ? t : g, N = Math.max(0, Math.min(100, (k - e) / Math.max(1e-6, a - e) * 100)), p = (M) => {
    const x = Math.round(M / n) * n, E = Math.max(e, Math.min(a, Number(x.toFixed(4))));
    t === void 0 && h(E), r == null || r(E);
  }, f = (M) => {
    const x = y.current;
    if (!x) return;
    const E = x.getBoundingClientRect(), L = Math.max(0, Math.min(1, (M - E.left) / Math.max(1, E.width)));
    p(e + L * (a - e));
  };
  return /* @__PURE__ */ w("div", { className: `ios-slider-block ${m}`.trim(), children: [
    (o || c) && /* @__PURE__ */ w("div", { className: "ios-slider-header", children: [
      /* @__PURE__ */ i("span", { className: "ios-slider-label", children: o }),
      c && /* @__PURE__ */ i("span", { className: "ios-slider-value", children: d(k) })
    ] }),
    /* @__PURE__ */ w(
      "div",
      {
        ref: y,
        className: `ios-liquid-slider ${b ? "is-dragging" : ""}`,
        role: "slider",
        tabIndex: 0,
        "aria-label": u,
        "aria-valuemin": e,
        "aria-valuemax": a,
        "aria-valuenow": k,
        onPointerDown: (M) => {
          M.currentTarget.setPointerCapture(M.pointerId), v(!0), f(M.clientX);
        },
        onPointerMove: (M) => {
          b && f(M.clientX);
        },
        onPointerUp: () => v(!1),
        onPointerCancel: () => v(!1),
        onKeyDown: (M) => {
          const x = Math.max(n, (a - e) * 0.05);
          M.key === "ArrowRight" || M.key === "ArrowUp" ? (M.preventDefault(), p(k + x)) : (M.key === "ArrowLeft" || M.key === "ArrowDown") && (M.preventDefault(), p(k - x));
        },
        children: [
          /* @__PURE__ */ i("div", { className: "ios-slider-track", children: /* @__PURE__ */ i(
            "div",
            {
              className: `ios-slider-fill ${l === "amber" ? "ios-slider-fill-amber" : ""}`,
              style: { width: `${N}%` }
            }
          ) }),
          /* @__PURE__ */ i("div", { className: "ios-slider-knob-wrap", style: { left: `${N}%` }, children: /* @__PURE__ */ i("div", { className: "ios-slider-knob" }) })
        ]
      }
    )
  ] });
}, Et = ({
  options: t,
  value: s,
  defaultValue: e = 0,
  onChange: a,
  compact: n = !1,
  iconOnly: r = !1,
  variant: o = "clear",
  ariaLabel: c = "Segmented control (drag or tap)",
  className: d = ""
}) => {
  const [l, u] = C(e), m = s !== void 0 ? s : l, g = F(null), [h, b] = C(!1), [v, y] = C(null), [k, N] = C(0), [p, f] = C(!1), M = F(0), x = F(!1), E = F(null), L = Math.max(1, t.length), G = (T) => {
    s === void 0 && u(T), t[T] && (a == null || a(T, t[T]));
  }, A = (T) => {
    const _ = g.current;
    if (!_) return m;
    const q = _.getBoundingClientRect(), O = 5, X = Math.max(1, (q.width - O * 2) / L);
    return Math.max(0, Math.min(L - 1, (T - q.left - O - X * 0.5) / X));
  }, B = () => {
    f(!0), E.current !== null && window.clearTimeout(E.current), E.current = window.setTimeout(() => f(!1), 360);
  }, Q = (T) => {
    T.currentTarget.setPointerCapture(T.pointerId), b(!0), x.current = !1, M.current = T.clientX, y(A(T.clientX)), N(0);
  }, I = (T) => {
    if (!h) return;
    const _ = T.clientX - M.current;
    Math.abs(_) > 2 && (x.current = !0), M.current = T.clientX, y(A(T.clientX)), N(Math.min(0.22, Math.abs(_) * 0.011));
  }, H = (T) => {
    if (!h) return;
    const _ = Math.round(A(T));
    _ !== m && (B(), G(_)), b(!1), y(null), N(0);
  }, D = v !== null ? v : m, $ = Math.round(D);
  return /* @__PURE__ */ i(
    j,
    {
      radius: 999,
      bezelWidth: n ? 16 : 18,
      variant: o,
      className: `ios-segmented-shell ${n ? "ios-segmented-compact" : ""} ${d}`.trim(),
      children: /* @__PURE__ */ w(
        "div",
        {
          ref: g,
          className: `ios-segmented-track ${h ? "is-swiping" : ""}`,
          style: { gridTemplateColumns: `repeat(${L}, minmax(0, 1fr))` },
          role: "tablist",
          "aria-label": c,
          onPointerDown: Q,
          onPointerMove: I,
          onPointerUp: (T) => H(T.clientX),
          onPointerCancel: (T) => H(T.clientX),
          children: [
            /* @__PURE__ */ i(
              "div",
              {
                className: `ios-segmented-thumb-wrap ${h ? "is-dragging-pill" : ""} ${p ? "is-gliding-pill" : ""}`,
                style: {
                  width: `calc((100% - 10px) / ${L})`,
                  transform: `translate3d(${D * 100}%, 0, 0)`
                },
                "aria-hidden": "true",
                children: /* @__PURE__ */ i(
                  "div",
                  {
                    className: "ios-segmented-thumb",
                    style: h ? {
                      transform: `scale(${(1.08 + k).toFixed(3)}, ${(1.16 - k * 0.35).toFixed(3)})`
                    } : void 0
                  }
                )
              }
            ),
            t.map((T, _) => /* @__PURE__ */ i(
              "button",
              {
                type: "button",
                role: "tab",
                "aria-selected": m === _,
                "aria-label": r ? T.label : void 0,
                className: `ios-segmented-btn ${r ? "ios-segmented-icon-btn" : ""} ${$ === _ ? "is-active" : ""}`.trim(),
                onClick: () => {
                  x.current || _ !== m && (B(), G(_));
                },
                children: r ? T.icon : T.label
              },
              T.id
            ))
          ]
        }
      )
    }
  );
}, At = ({
  variant: t = "clear",
  bezelWidth: s = 18,
  radius: e = 999,
  icon: a,
  children: n,
  className: r = "",
  type: o = "button",
  ...c
}) => /* @__PURE__ */ i(
  j,
  {
    radius: e,
    bezelWidth: s,
    variant: t,
    className: `ios-glass-btn-wrap ${r}`.trim(),
    children: /* @__PURE__ */ w(
      "button",
      {
        type: o,
        className: `ios-glass-btn ${t === "prominent" ? "ios-glass-btn-prominent" : ""}`.trim(),
        ...c,
        children: [
          a,
          /* @__PURE__ */ i("span", { children: n })
        ]
      }
    )
  }
), Nt = ({
  variant: t = "clear",
  bezelWidth: s = 16,
  children: e,
  className: a = "",
  type: n = "button",
  ...r
}) => /* @__PURE__ */ i(
  j,
  {
    radius: 999,
    bezelWidth: s,
    variant: t,
    className: `ios-circle-btn-wrap ${a}`.trim(),
    children: /* @__PURE__ */ i("button", { type: n, className: "ios-circle-btn", ...r, children: e })
  }
), St = ({
  actions: t,
  variant: s = "clear",
  bezelWidth: e = 18,
  className: a = ""
}) => /* @__PURE__ */ i(
  j,
  {
    radius: 999,
    bezelWidth: e,
    variant: s,
    className: `ios-grouped-pill ${a}`.trim(),
    children: /* @__PURE__ */ i("div", { className: "ios-grouped-pill-inner", children: t.map((n, r) => /* @__PURE__ */ w(me.Fragment, { children: [
      r > 0 && /* @__PURE__ */ i("span", { className: "ios-pill-divider" }),
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `ios-pill-action ${n.active && n.activeTone === "rose" ? "is-rose" : n.active && n.activeTone === "amber" ? "is-amber" : ""}`.trim(),
          onClick: n.onClick,
          "aria-label": n.ariaLabel,
          "aria-pressed": n.active,
          children: n.icon
        }
      )
    ] }, n.id)) })
  }
), lt = ({
  value: t,
  defaultValue: s = 65,
  onChange: e,
  icon: a,
  ariaLabel: n,
  min: r = 4,
  max: o = 100
}) => {
  const [c, d] = C(s), l = F(null), u = F(!1), m = t !== void 0 ? t : c, g = (b) => {
    const v = Math.max(r, Math.min(o, Math.round(b)));
    t === void 0 && d(v), e == null || e(v);
  }, h = (b) => {
    const v = l.current;
    if (!v) return;
    const y = v.getBoundingClientRect(), k = (y.bottom - b) / Math.max(1, y.height) * 100;
    g(k);
  };
  return /* @__PURE__ */ i(j, { radius: 26, bezelWidth: 18, className: "cc-vslider-shell", children: /* @__PURE__ */ w(
    "div",
    {
      ref: l,
      className: "cc-vslider",
      role: "slider",
      tabIndex: 0,
      "aria-label": n,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": m,
      onPointerDown: (b) => {
        b.currentTarget.setPointerCapture(b.pointerId), u.current = !0, h(b.clientY);
      },
      onPointerMove: (b) => {
        u.current && h(b.clientY);
      },
      onPointerUp: () => {
        u.current = !1;
      },
      onPointerCancel: () => {
        u.current = !1;
      },
      onKeyDown: (b) => {
        b.key === "ArrowUp" || b.key === "ArrowRight" ? (b.preventDefault(), g(m + 5)) : (b.key === "ArrowDown" || b.key === "ArrowLeft") && (b.preventDefault(), g(m - 5));
      },
      children: [
        /* @__PURE__ */ i("div", { className: "cc-vslider-fill", style: { height: `${m}%` } }),
        a && /* @__PURE__ */ i("div", { className: "cc-vslider-icon", children: a })
      ]
    }
  ) });
}, Ut = ({
  orbs: t,
  sliders: s,
  focus: e,
  className: a = ""
}) => /* @__PURE__ */ w("div", { className: `cc-grid ${a}`.trim(), children: [
  /* @__PURE__ */ i(j, { radius: 30, bezelWidth: 22, className: "cc-connectivity-card", children: /* @__PURE__ */ i("div", { className: "cc-connectivity-grid", children: t.map((n) => /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      className: `cc-orb ${n.active ? `is-${n.tone ?? "blue"}` : ""}`.trim(),
      onClick: n.onToggle,
      "aria-label": n.label,
      "aria-pressed": n.active,
      children: n.icon
    },
    n.id
  )) }) }),
  /* @__PURE__ */ i("div", { className: "cc-sliders-pair", children: s.map((n) => /* @__PURE__ */ i(lt, { ...n }, n.ariaLabel)) }),
  e && /* @__PURE__ */ i(
    j,
    {
      radius: 999,
      bezelWidth: 18,
      variant: e.active ? "tinted" : "clear",
      className: "cc-focus-pill-wrap",
      children: /* @__PURE__ */ w(
        "button",
        {
          type: "button",
          className: `cc-focus-pill ${e.active ? "is-on" : ""}`.trim(),
          onClick: e.onToggle,
          "aria-pressed": e.active,
          children: [
            /* @__PURE__ */ i("span", { className: "cc-focus-icon", children: e.icon }),
            /* @__PURE__ */ w("span", { className: "cc-focus-text", children: [
              /* @__PURE__ */ i("strong", { children: e.title }),
              /* @__PURE__ */ i("small", { children: e.subtitle })
            ] })
          ]
        }
      )
    }
  )
] });
function Le(t) {
  const s = Math.floor(t / 60), e = Math.floor(t % 60);
  return `${s}:${e.toString().padStart(2, "0")}`;
}
const ct = () => /* @__PURE__ */ i("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", style: { marginLeft: 2 }, "aria-hidden": "true", children: /* @__PURE__ */ i("polygon", { points: "6 3 20 12 6 21 6 3" }) }), dt = () => /* @__PURE__ */ w("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: [
  /* @__PURE__ */ i("rect", { x: "6", y: "4", width: "4", height: "16", rx: "1" }),
  /* @__PURE__ */ i("rect", { x: "14", y: "4", width: "4", height: "16", rx: "1" })
] }), ut = () => /* @__PURE__ */ w("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: [
  /* @__PURE__ */ i("polygon", { points: "19 20 9 12 19 4 19 20" }),
  /* @__PURE__ */ i("line", { x1: "5", x2: "5", y1: "19", y2: "5", stroke: "currentColor", strokeWidth: "2.2" })
] }), ht = () => /* @__PURE__ */ w("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: [
  /* @__PURE__ */ i("polygon", { points: "5 4 15 12 5 20 5 4" }),
  /* @__PURE__ */ i("line", { x1: "19", x2: "19", y1: "5", y2: "19", stroke: "currentColor", strokeWidth: "2.2" })
] }), mt = () => /* @__PURE__ */ w("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ i("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }),
  /* @__PURE__ */ i("path", { d: "M3 3v5h5" })
] }), ft = () => /* @__PURE__ */ w("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ i("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }),
  /* @__PURE__ */ i("polyline", { points: "16 6 12 2 8 6" }),
  /* @__PURE__ */ i("line", { x1: "12", x2: "12", y1: "2", y2: "15" })
] }), gt = ({ active: t }) => /* @__PURE__ */ i("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: t ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ i("path", { d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" }) }), Lt = ({
  tracks: t,
  initialTrackIndex: s = 0,
  autoTick: e = !0,
  defaultPlaying: a = !0,
  defaultElapsed: n = 22,
  variant: r = "clear",
  onTrackChange: o,
  onPlayChange: c,
  onFavoriteChange: d,
  icons: l,
  className: u = ""
}) => {
  const m = F(null), [g, h] = C(!1), [b, v] = C(s), [y, k] = C(a), [N, p] = C(n), [f, M] = C(!1), x = t.length > 0 ? b % t.length : 0, E = t[x] ?? {
    title: "Untitled Track",
    artist: "Unknown Artist",
    duration: 180,
    artworkGradient: "linear-gradient(135deg, #34d399 0%, #0ea5e9 55%, #1d4ed8 100%)"
  };
  ae(() => {
    const A = m.current;
    if (!A || typeof IntersectionObserver > "u") {
      h(!0);
      return;
    }
    const B = new IntersectionObserver(
      (Q) => {
        var I;
        return h(((I = Q[0]) == null ? void 0 : I.isIntersecting) ?? !1);
      },
      { threshold: 0.05 }
    );
    return B.observe(A), () => B.disconnect();
  }, []), ae(() => {
    if (!e || !y || !g) return;
    const A = window.setInterval(() => {
      p((B) => B + 1 >= E.duration ? 0 : B + 1);
    }, 1e3);
    return () => window.clearInterval(A);
  }, [e, y, g, E.duration]);
  const L = (A) => {
    if (t.length === 0) return;
    const B = (x + A + t.length) % t.length;
    v(B), p(0), o == null || o(B, t[B]);
  }, G = Math.min(100, Math.max(0, N / Math.max(1, E.duration) * 100));
  return /* @__PURE__ */ i("div", { ref: m, className: `media-demo-shell ${u}`.trim(), children: /* @__PURE__ */ w(j, { radius: 38, bezelWidth: 26, variant: r, className: "media-glass-card", children: [
    /* @__PURE__ */ w("div", { className: "media-top", children: [
      /* @__PURE__ */ i(
        "div",
        {
          className: `media-artwork ${y ? "is-playing" : ""}`,
          style: E.artwork ? void 0 : {
            background: E.artworkGradient ?? "linear-gradient(135deg, #34d399 0%, #0ea5e9 55%, #1d4ed8 100%)"
          },
          "aria-hidden": "true",
          children: E.artwork ?? /* @__PURE__ */ i("div", { className: "media-artwork-ring" })
        }
      ),
      /* @__PURE__ */ w("div", { className: "media-info", children: [
        /* @__PURE__ */ i("div", { className: "media-title", children: E.title }),
        /* @__PURE__ */ i("div", { className: "media-artist", children: E.artist })
      ] }),
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `media-fav-btn ${f ? "is-active" : ""}`,
          onClick: () => {
            const A = !f;
            M(A), d == null || d(A);
          },
          "aria-label": "Favorite track",
          "aria-pressed": f,
          children: l != null && l.heart ? l.heart(f) : /* @__PURE__ */ i(gt, { active: f })
        }
      )
    ] }),
    /* @__PURE__ */ w("div", { className: "media-scrubber-wrap", children: [
      /* @__PURE__ */ w("div", { className: "media-times media-times-top", children: [
        /* @__PURE__ */ i("span", { children: Le(N) }),
        /* @__PURE__ */ w("span", { children: [
          "-",
          Le(Math.max(0, E.duration - N))
        ] })
      ] }),
      /* @__PURE__ */ i(
        "input",
        {
          type: "range",
          min: 0,
          max: E.duration,
          value: N,
          onChange: (A) => p(Number(A.target.value)),
          className: "media-scrubber",
          "aria-label": "Track progress",
          style: { "--progress": `${G}%` }
        }
      )
    ] }),
    /* @__PURE__ */ w("div", { className: "media-controls", children: [
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "media-ctrl-btn media-side-btn",
          onClick: () => p((A) => Math.max(0, A - 10)),
          "aria-label": "Rewind 10 seconds",
          title: "Rewind 10s",
          children: (l == null ? void 0 : l.rewind) ?? /* @__PURE__ */ i(mt, {})
        }
      ),
      /* @__PURE__ */ w("div", { className: "media-center-transport", children: [
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "media-ctrl-btn",
            onClick: () => L(-1),
            "aria-label": "Previous track",
            children: (l == null ? void 0 : l.prev) ?? /* @__PURE__ */ i(ut, {})
          }
        ),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "media-play-btn",
            onClick: () => {
              const A = !y;
              k(A), c == null || c(A);
            },
            "aria-label": y ? "Pause" : "Play",
            children: y ? (l == null ? void 0 : l.pause) ?? /* @__PURE__ */ i(dt, {}) : (l == null ? void 0 : l.play) ?? /* @__PURE__ */ i(ct, {})
          }
        ),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "media-ctrl-btn",
            onClick: () => L(1),
            "aria-label": "Next track",
            children: (l == null ? void 0 : l.next) ?? /* @__PURE__ */ i(ht, {})
          }
        )
      ] }),
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "media-ctrl-btn media-side-btn",
          onClick: () => L(1),
          "aria-label": "Next track",
          title: "Next track",
          children: (l == null ? void 0 : l.share) ?? /* @__PURE__ */ i(ft, {})
        }
      )
    ] })
  ] }) });
}, kt = ({
  open: t,
  defaultOpen: s = !0,
  onOpenChange: e,
  triggerLabel: a = "Open Context Menu",
  closeLabel: n = "Hide Menu",
  triggerIcon: r,
  quickActions: o,
  items: c,
  feedback: d,
  variant: l = "clear",
  className: u = ""
}) => {
  const [m, g] = C(s), h = t !== void 0 ? t : m, b = () => {
    const v = !h;
    t === void 0 && g(v), e == null || e(v);
  };
  return /* @__PURE__ */ w("div", { className: `ctx-demo-wrap ${u}`.trim(), children: [
    /* @__PURE__ */ w("div", { className: "ctx-trigger-row", children: [
      /* @__PURE__ */ i(j, { radius: 999, bezelWidth: 16, variant: l, className: "ios-glass-btn-wrap", children: /* @__PURE__ */ w(
        "button",
        {
          type: "button",
          className: "ios-glass-btn",
          onClick: b,
          "aria-expanded": h,
          children: [
            r,
            /* @__PURE__ */ i("span", { children: h ? n : a })
          ]
        }
      ) }),
      d && /* @__PURE__ */ i("span", { className: "ctx-feedback-pill", children: d })
    ] }),
    /* @__PURE__ */ i("div", { className: `ctx-popover-slot ${h ? "is-open" : ""}`, children: /* @__PURE__ */ w(j, { radius: 24, bezelWidth: 22, variant: l, className: "ctx-menu-card", children: [
      o && o.length > 0 && /* @__PURE__ */ w(We, { children: [
        /* @__PURE__ */ i(
          "div",
          {
            className: "ctx-quick-row",
            style: { gridTemplateColumns: `repeat(${o.length}, 1fr)` },
            children: o.map((v) => /* @__PURE__ */ w("button", { type: "button", onClick: v.onSelect, children: [
              v.icon,
              /* @__PURE__ */ i("span", { children: v.label })
            ] }, v.id))
          }
        ),
        /* @__PURE__ */ i("div", { className: "ios-hairline" })
      ] }),
      /* @__PURE__ */ i("div", { className: "ctx-list", role: "menu", children: c.map((v) => /* @__PURE__ */ w(me.Fragment, { children: [
        v.dividerBefore && /* @__PURE__ */ i("div", { className: "ios-hairline" }),
        /* @__PURE__ */ w(
          "button",
          {
            type: "button",
            role: "menuitem",
            className: `ctx-item ${v.destructive ? "is-destructive" : ""}`.trim(),
            onClick: v.onSelect,
            children: [
              /* @__PURE__ */ w("span", { className: "ctx-item-left", children: [
                v.icon,
                /* @__PURE__ */ i("span", { children: v.label })
              ] }),
              v.shortcut && /* @__PURE__ */ i("kbd", { children: v.shortcut })
            ]
          }
        )
      ] }, v.id)) })
    ] }) })
  ] });
}, vt = ({ rotated: t }) => /* @__PURE__ */ i(
  "svg",
  {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      transform: t ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.25s ease"
    },
    children: /* @__PURE__ */ i("path", { d: "m18 15-6-6-6 6" })
  }
), pt = () => /* @__PURE__ */ w(
  "svg",
  {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.1",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    children: [
      /* @__PURE__ */ i("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }),
      /* @__PURE__ */ i("path", { d: "M3 3v5h5" })
    ]
  }
), Dt = ({
  items: t,
  onDismiss: s,
  onRestore: e,
  canRestore: a = !1,
  defaultExpanded: n = !0,
  emptyLabel: r = "All caught up",
  variant: o = "clear",
  className: c = ""
}) => {
  const [d, l] = C(n);
  return /* @__PURE__ */ w("div", { className: `notif-demo-wrap ${c}`.trim(), children: [
    /* @__PURE__ */ w("div", { className: "notif-header-bar", children: [
      /* @__PURE__ */ i("span", { className: "notif-count", children: t.length > 0 ? `${t.length} Notification${t.length === 1 ? "" : "s"}` : r }),
      /* @__PURE__ */ w("div", { className: "notif-actions", children: [
        t.length > 1 && /* @__PURE__ */ w(
          "button",
          {
            type: "button",
            className: "notif-chip-btn",
            onClick: () => l((u) => !u),
            children: [
              /* @__PURE__ */ i(vt, { rotated: !d }),
              d ? "Stack" : "Expand"
            ]
          }
        ),
        a && e && /* @__PURE__ */ w(
          "button",
          {
            type: "button",
            className: "notif-chip-btn",
            onClick: () => {
              e(), l(!0);
            },
            children: [
              /* @__PURE__ */ i(pt, {}),
              " Restore"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: `notif-stack ${d ? "is-expanded" : "is-collapsed"}`, children: t.map((u, m) => {
      const g = d ? 0 : m * 10, h = d ? 1 : Math.max(0.88, 1 - m * 0.05);
      return /* @__PURE__ */ i(
        "div",
        {
          className: "notif-card-slot",
          style: {
            zIndex: t.length - m,
            transform: d ? "translateY(0) scale(1)" : `translateY(${g}px) scale(${h})`,
            marginTop: d ? m === 0 ? 0 : 10 : m === 0 ? 0 : -66,
            opacity: d ? 1 : Math.max(0.55, 1 - m * 0.2)
          },
          onClick: () => {
            d || l(!0);
          },
          children: /* @__PURE__ */ i(j, { radius: 24, bezelWidth: 20, variant: o, className: "notif-glass-card", children: /* @__PURE__ */ w("div", { className: "notif-inner", children: [
            u.icon && /* @__PURE__ */ i("div", { className: "notif-app-icon-svg", "aria-hidden": "true", children: u.icon }),
            /* @__PURE__ */ w("div", { className: "notif-copy", children: [
              /* @__PURE__ */ w("div", { className: "notif-top-line", children: [
                /* @__PURE__ */ i("strong", { children: u.title }),
                /* @__PURE__ */ i("span", { children: u.time })
              ] }),
              /* @__PURE__ */ i("p", { children: u.body })
            ] }),
            d && s && /* @__PURE__ */ i(
              "button",
              {
                type: "button",
                className: "notif-dismiss",
                onClick: (b) => {
                  b.stopPropagation(), s(u.id);
                },
                "aria-label": `Dismiss ${u.title}`,
                children: "×"
              }
            )
          ] }) })
        },
        u.id
      );
    }) })
  ] });
}, Ct = ({
  title: t,
  description: s,
  icon: e,
  primaryLabel: a,
  onPrimary: n,
  secondaryLabel: r,
  onSecondary: o,
  variant: c = "clear",
  className: d = ""
}) => /* @__PURE__ */ i("div", { className: `alert-demo-wrap ${d}`.trim(), children: /* @__PURE__ */ w(j, { radius: 32, bezelWidth: 24, variant: c, className: "ios-alert-card", children: [
  /* @__PURE__ */ w("div", { className: "ios-alert-body", children: [
    e && /* @__PURE__ */ i("div", { className: "ios-alert-icon", children: e }),
    /* @__PURE__ */ i("h4", { children: t }),
    /* @__PURE__ */ i("p", { children: s })
  ] }),
  /* @__PURE__ */ w(
    "div",
    {
      className: "ios-alert-actions",
      style: r ? void 0 : { gridTemplateColumns: "1fr" },
      children: [
        r && /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "ios-alert-btn ios-alert-btn-secondary",
            onClick: o,
            children: r
          }
        ),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "ios-alert-btn ios-alert-btn-primary",
            onClick: n,
            children: a
          }
        )
      ]
    }
  )
] }) }), It = ({
  items: t,
  utilityItems: s = [],
  activeId: e,
  defaultActiveId: a,
  onSelect: n,
  magnification: r = 1.36,
  variant: o = "clear",
  className: c = ""
}) => {
  var p;
  const d = _e(), [l, u] = C(null), [m, g] = C(
    a ?? ((p = t[0]) == null ? void 0 : p.id) ?? ""
  ), [h, b] = C(null), v = e !== void 0 ? e : m;
  ae(() => {
    d == null || d.requestBurst(320);
  }, [l, h, d]);
  const y = (f) => {
    if (l === null) return 1;
    const M = Math.abs(l - f), x = r - 1;
    return M === 0 ? 1 + x : M === 1 ? 1 + x * 0.5 : M === 2 ? 1 + x * 0.19 : 1;
  }, k = (f) => {
    var M;
    e === void 0 && g(f.id), b(f.id), window.setTimeout(() => b((x) => x === f.id ? null : x), 520), (M = f.onClick) == null || M.call(f), n == null || n(f.id, f);
  }, N = (f, M, x = !1) => {
    const E = y(M), L = l === M, G = !x && (f.running || v === f.id), A = Math.round((E - 1) * 18);
    return /* @__PURE__ */ w(
      "button",
      {
        type: "button",
        className: `dock-item ${h === f.id ? "is-bouncing" : ""} ${f.hideOnCompact ? "dock-item-optional" : ""} ${f.hideOnMobile ? "dock-item-mobile-hide" : ""}`.trim(),
        onPointerEnter: (B) => {
          B.pointerType === "mouse" && u(M);
        },
        onClick: () => k(f),
        "aria-label": f.name,
        style: {
          marginLeft: A ? `${A}px` : void 0,
          marginRight: A ? `${A}px` : void 0,
          zIndex: L ? 4 : E > 1 ? 2 : 1
        },
        children: [
          L && /* @__PURE__ */ i("span", { className: "dock-tooltip", children: f.name }),
          /* @__PURE__ */ i(
            "span",
            {
              className: "dock-icon-wrap",
              style: {
                transform: `translateY(${((E - 1) * -14).toFixed(1)}px) scale(${E})`
              },
              children: f.icon
            }
          ),
          /* @__PURE__ */ i("span", { className: `dock-dot ${G ? "is-visible" : ""}` })
        ]
      },
      f.id
    );
  };
  return /* @__PURE__ */ i("div", { className: `dock-demo-stage ${c}`.trim(), children: /* @__PURE__ */ i(j, { radius: 22, bezelWidth: 12, variant: o, className: "macos-dock-shell", children: /* @__PURE__ */ w(
    "div",
    {
      className: "macos-dock-row",
      onPointerLeave: (f) => {
        f.pointerType === "mouse" && u(null);
      },
      children: [
        t.map((f, M) => N(f, M)),
        s.length > 0 && /* @__PURE__ */ i("span", { className: "dock-divider", "aria-hidden": "true" }),
        s.map(
          (f, M) => N(f, t.length + M, !0)
        )
      ]
    }
  ) }) });
};
export {
  Me as DEFAULT_GLASS_SETTINGS,
  be as DEFAULT_SCENE_IMAGE_URLS,
  Ct as GlassAlertSheet,
  At as GlassButton,
  St as GlassButtonGroup,
  kt as GlassContextMenu,
  Ut as GlassControlCenter,
  It as GlassDock,
  Nt as GlassIconButton,
  Lt as GlassMediaPlayer,
  Dt as GlassNotificationStack,
  Et as GlassSegmentedControl,
  Mt as GlassSettingsProvider,
  yt as GlassSlider,
  nt as GlassStage,
  Rt as GlassSwitch,
  Tt as GlassTabBar,
  lt as GlassVerticalSlider,
  j as LiquidGlass,
  Ae as SCENE_CSS_FALLBACKS,
  it as generateLiquidGlassMaps,
  pe as sharedGlassEngine,
  we as supportsSvgBackdropFilter,
  Be as useGlassSettings,
  _e as useGlassStage
};
