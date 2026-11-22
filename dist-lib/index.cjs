"use client";"use strict";var Be=Object.defineProperty;var Pe=(s,i,t)=>i in s?Be(s,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[i]=t;var I=(s,i,t)=>Pe(s,typeof i!="symbol"?i+"":i,t);Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const e=require("react/jsx-runtime"),l=require("react"),ae=12,ce={tahoe:"/wallpapers/tahoe-cobalt.jpg",sunset:"/wallpapers/sunset-silk.jpg",dark:"/wallpapers/midnight-obsidian.jpg",light:"/wallpapers/studio-light.jpg"},Re={},xe={tahoe:"linear-gradient(155deg, #21519e 0%, #527bb8 38%, #1045b8 70%, #071e68 100%)",sunset:"linear-gradient(145deg, #1d0a3c 0%, #ae1f52 44%, #d66129 76%, #e0b375 100%)",dark:"linear-gradient(150deg, #070a16 0%, #172361 52%, #247beb 100%)",light:"linear-gradient(145deg, #ebf0f7 0%, #d1e3f7 54%, #6ba8f7 100%)",prism:"linear-gradient(125deg, #0c1020 0%, #1d4ed8 25%, #06b6d4 45%, #a855f7 68%, #f43f5e 88%, #0c1020 100%)"},ne=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,Ge=`#version 300 es
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
`,_e=`#version 300 es
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
`,Fe=`#version 300 es
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
`,$e=`#version 300 es
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
`;function Se(s,i,t){const a=s.createShader(i);return a?(s.shaderSource(a,t),s.compileShader(a),s.getShaderParameter(a,s.COMPILE_STATUS)?a:(console.warn("GlassKit WebGL2 shader compile error:",s.getShaderInfoLog(a)),s.deleteShader(a),null)):null}function oe(s,i,t){const a=Se(s,s.VERTEX_SHADER,i),n=Se(s,s.FRAGMENT_SHADER,t);if(!a||!n)return null;const r=s.createProgram();return r?(s.attachShader(r,a),s.attachShader(r,n),s.linkProgram(r),s.deleteShader(a),s.deleteShader(n),s.getProgramParameter(r,s.LINK_STATUS)?r:(console.warn("GlassKit WebGL2 link error:",s.getProgramInfoLog(r)),s.deleteProgram(r),null)):null}function me(s,i,t){const a=s.createTexture();return a?(s.bindTexture(s.TEXTURE_2D,a),s.texImage2D(s.TEXTURE_2D,0,s.RGBA,i,t,0,s.RGBA,s.UNSIGNED_BYTE,null),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE),a):null}function Xe(s){switch(s){case"tahoe":return 0;case"sunset":return 1;case"light":return 2;case"dark":return 3;case"prism":return 4}}function ze(s){switch(s){case"clear":return 0;case"tinted":return 1;case"dark":return 2;case"prominent":return 3}}class We{constructor(){I(this,"canvas",null);I(this,"gl",null);I(this,"wallProg",null);I(this,"coverProg",null);I(this,"blurProg",null);I(this,"glassProg",null);I(this,"quadBuf",null);I(this,"fbo",null);I(this,"wallpaperCache",new Map);I(this,"loadedImages",new Map);I(this,"loadingImages",new Set);I(this,"failedImages",new Set);I(this,"assetListeners",new Set);I(this,"MAX_WALLPAPERS",10);I(this,"MAX_LOADED_IMAGES",10);I(this,"ready",!1);I(this,"initialized",!1);I(this,"wallUniforms",null);I(this,"coverUniforms",null);I(this,"blurUniforms",null);I(this,"glassUniforms",null);I(this,"rectArr",new Float32Array(ae*4));I(this,"paramArr",new Float32Array(ae*4));I(this,"hoverArr",new Float32Array(ae*4));I(this,"opticsArr",new Float32Array(ae*4));I(this,"posLocCache",new WeakMap);I(this,"ctx2dCache",new WeakMap)}isAvailable(){return this.initialized||this.init(),this.ready}onAssetLoaded(i){return this.assetListeners.add(i),()=>{this.assetListeners.delete(i)}}notifyAssetLoaded(){this.assetListeners.forEach(i=>i())}uploadImageTexture(i,t){const a=this.gl;if(!a||a.isContextLost())return;if(this.loadedImages.size>=this.MAX_LOADED_IMAGES){const r=this.loadedImages.keys().next().value;if(r&&!r.startsWith("scene:")){const o=this.loadedImages.get(r);o&&a.deleteTexture(o.tex),this.loadedImages.delete(r)}}const n=a.createTexture();if(n){a.bindTexture(a.TEXTURE_2D,n),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,1),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,t),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,0),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),this.loadedImages.set(i,{tex:n,width:t.naturalWidth||1920,height:t.naturalHeight||1080});for(const[r,o]of this.wallpaperCache.entries())r.startsWith(`${i}_`)&&!o.fromImage&&(a.deleteTexture(o.crispTex),a.deleteTexture(o.blurTex),this.wallpaperCache.delete(r));this.notifyAssetLoaded()}}ensureImageLoaded(i,t,a){if(!t||this.loadedImages.has(i)||this.loadingImages.has(i)||this.failedImages.has(i)||!this.gl||this.gl.isContextLost())return;this.loadingImages.add(i);const n=(r,o)=>{const u=new Image;/^https?:\/\//i.test(r)&&(u.crossOrigin="anonymous"),u.decoding="async",u.onload=()=>{this.loadingImages.delete(i),this.uploadImageTexture(i,u)},u.onerror=()=>{o?n(o):(this.loadingImages.delete(i),this.failedImages.add(i))},u.src=r};n(t,a)}evictImage(i){const t=this.gl,a=`img:${i}`,n=this.loadedImages.get(a);if(n&&t&&!t.isContextLost()&&t.deleteTexture(n.tex),this.loadedImages.delete(a),this.failedImages.delete(a),t&&!t.isContextLost())for(const[r,o]of this.wallpaperCache.entries())r.startsWith(`${a}_`)&&(t.deleteTexture(o.crispTex),t.deleteTexture(o.blurTex),this.wallpaperCache.delete(r))}init(){if(this.initialized=!0,typeof document>"u")return;const i=document.createElement("canvas");i.width=2,i.height=2;const t=i.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!0,powerPreference:"default"});if(!t)return;const a=oe(t,ne,Fe),n=oe(t,ne,Ge),r=oe(t,ne,_e),o=oe(t,ne,$e);if(!a||!n||!r||!o)return;const u=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,u),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW);const d=t.createFramebuffer();this.canvas=i,this.gl=t,this.wallProg=a,this.coverProg=n,this.blurProg=r,this.glassProg=o,this.quadBuf=u,this.fbo=d,this.wallUniforms={uRes:t.getUniformLocation(a,"uRes"),uScene:t.getUniformLocation(a,"uScene")},this.coverUniforms={uImg:t.getUniformLocation(n,"uImg"),uScale:t.getUniformLocation(n,"uScale"),uOffset:t.getUniformLocation(n,"uOffset")},this.blurUniforms={uSrc:t.getUniformLocation(r,"uSrc"),uDir:t.getUniformLocation(r,"uDir")},this.glassUniforms={uBg:t.getUniformLocation(o,"uBg"),uBgBlur:t.getUniformLocation(o,"uBgBlur"),uRes:t.getUniformLocation(o,"uRes"),uCount:t.getUniformLocation(o,"uCount"),uRects:t.getUniformLocation(o,"uRects[0]"),uParams:t.getUniformLocation(o,"uParams[0]"),uHover:t.getUniformLocation(o,"uHover[0]"),uOptics:t.getUniformLocation(o,"uOptics[0]"),uDroplet:t.getUniformLocation(o,"uDroplet"),uDropAlpha:t.getUniformLocation(o,"uDropAlpha"),uIsLightStage:t.getUniformLocation(o,"uIsLightStage"),uBgSoftness:t.getUniformLocation(o,"uBgSoftness"),uSaturation:t.getUniformLocation(o,"uSaturation")},i.addEventListener("webglcontextlost",h=>{h.preventDefault(),this.ready=!1,this.wallpaperCache.clear(),this.loadedImages.clear(),this.loadingImages.clear()}),i.addEventListener("webglcontextrestored",()=>{this.initialized=!1,this.init(),this.notifyAssetLoaded()}),this.ready=!0;const c=ce.tahoe;c&&this.ensureImageLoaded("scene:tahoe",c,Re.tahoe)}bindQuad(i){const t=this.gl;t.bindBuffer(t.ARRAY_BUFFER,this.quadBuf);let a=this.posLocCache.get(i);a===void 0&&(a=t.getAttribLocation(i,"aPos"),this.posLocCache.set(i,a)),t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0)}getOrBakeWallpaper(i,t,a,n){const r=this.gl;if(!r||!this.wallProg||!this.coverProg||!this.blurProg||!this.wallUniforms||!this.coverUniforms||!this.blurUniforms||!this.fbo)return null;const o=t?`img:${t}`:`scene:${i}`;if(t)this.ensureImageLoaded(o,t);else{const p=ce[i];p&&this.ensureImageLoaded(o,p,Re[i])}const u=this.loadedImages.get(o),d=Math.max(256,Math.round(a/16)*16),c=Math.max(200,Math.round(n/16)*16),h=`${o}_${d}x${c}`,m=this.wallpaperCache.get(h);if(m&&(!u||m.fromImage))return m;if(m&&(r.deleteTexture(m.crispTex),r.deleteTexture(m.blurTex),this.wallpaperCache.delete(h)),this.wallpaperCache.size>=this.MAX_WALLPAPERS){const p=this.wallpaperCache.keys().next().value;if(p){const g=this.wallpaperCache.get(p);g&&(r.deleteTexture(g.crispTex),r.deleteTexture(g.blurTex)),this.wallpaperCache.delete(p)}}const x=me(r,d,c),f=Math.max(128,Math.round(d*.5)),w=Math.max(100,Math.round(c*.5)),v=me(r,f,w),T=me(r,f,w);if(!x||!v||!T)return x&&r.deleteTexture(x),v&&r.deleteTexture(v),T&&r.deleteTexture(T),null;if(r.bindFramebuffer(r.FRAMEBUFFER,this.fbo),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,x,0),r.viewport(0,0,d,c),u){const p=d/c,g=u.width/Math.max(1,u.height);let M=1,b=1;p>g?b=g/p:M=p/g;const j=(1-M)*.5,U=(1-b)*.5;r.useProgram(this.coverProg),this.bindQuad(this.coverProg),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,u.tex),r.uniform1i(this.coverUniforms.uImg,0),r.uniform2f(this.coverUniforms.uScale,M,b),r.uniform2f(this.coverUniforms.uOffset,j,U),r.drawArrays(r.TRIANGLES,0,6)}else r.useProgram(this.wallProg),this.bindQuad(this.wallProg),r.uniform2f(this.wallUniforms.uRes,d,c),r.uniform1i(this.wallUniforms.uScene,Xe(i)),r.drawArrays(r.TRIANGLES,0,6);r.useProgram(this.blurProg),this.bindQuad(this.blurProg),r.activeTexture(r.TEXTURE0),r.uniform1i(this.blurUniforms.uSrc,0),r.viewport(0,0,f,w);const k=Math.max(1.4,w/250);r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,v,0),r.bindTexture(r.TEXTURE_2D,x),r.uniform2f(this.blurUniforms.uDir,k/f,0),r.drawArrays(r.TRIANGLES,0,6),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,T,0),r.bindTexture(r.TEXTURE_2D,v),r.uniform2f(this.blurUniforms.uDir,0,k/w),r.drawArrays(r.TRIANGLES,0,6),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,v,0),r.bindTexture(r.TEXTURE_2D,T),r.uniform2f(this.blurUniforms.uDir,k*1.65/f,0),r.drawArrays(r.TRIANGLES,0,6),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,T,0),r.bindTexture(r.TEXTURE_2D,v),r.uniform2f(this.blurUniforms.uDir,0,k*1.65/w),r.drawArrays(r.TRIANGLES,0,6),r.bindFramebuffer(r.FRAMEBUFFER,null),r.deleteTexture(v);const y={crispTex:x,blurTex:T,w:d,h:c,fromImage:!!u};return this.wallpaperCache.set(h,y),y}renderToCanvas(i,t){if(!this.isAvailable())return!1;const a=this.gl,n=this.canvas;if(!a||!n||!this.glassProg||!this.glassUniforms||!this.quadBuf||a.isContextLost())return!1;const r=Math.min(window.devicePixelRatio||1,2),o=Math.min(2400,Math.max(200,Math.round(t.stageWidth*r))),u=Math.min(1600,Math.max(160,Math.round(t.stageHeight*r)));(i.width!==o||i.height!==u)&&(i.width=o,i.height=u),(n.width!==o||n.height!==u)&&(n.width=o,n.height=u);const d=this.getOrBakeWallpaper(t.scene,t.backgroundImage,o,u);if(!d)return!1;const c=t.stageWidth/Math.max(1,t.stageHeight),h=Math.min(ae,t.rects.length);for(let x=0;x<h;x++){const f=t.rects[x],w=f.cx/Math.max(1,t.stageWidth),v=1-f.cy/Math.max(1,t.stageHeight),T=(w-.5)*c,k=v-.5,y=f.hw/Math.max(1,t.stageHeight),p=f.hh/Math.max(1,t.stageHeight),g=f.radius/Math.max(1,t.stageHeight),M=f.bezelPx/Math.max(1,t.stageHeight),b=x*4;this.rectArr[b]=T,this.rectArr[b+1]=k,this.rectArr[b+2]=y,this.rectArr[b+3]=p,this.paramArr[b]=g,this.paramArr[b+1]=f.opacity,this.paramArr[b+2]=ze(f.variant),this.paramArr[b+3]=M,this.hoverArr[b]=f.pointerX,this.hoverArr[b+1]=f.pointerY,this.hoverArr[b+2]=f.pointerAlpha,this.hoverArr[b+3]=0,this.opticsArr[b]=f.refraction??t.refraction,this.opticsArr[b+1]=f.blur??t.blur,this.opticsArr[b+2]=f.aberration??t.aberration,this.opticsArr[b+3]=f.specular??t.specular}if(a.bindFramebuffer(a.FRAMEBUFFER,null),a.viewport(0,0,o,u),a.useProgram(this.glassProg),this.bindQuad(this.glassProg),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,d.crispTex),a.uniform1i(this.glassUniforms.uBg,0),a.activeTexture(a.TEXTURE1),a.bindTexture(a.TEXTURE_2D,d.blurTex),a.uniform1i(this.glassUniforms.uBgBlur,1),a.uniform2f(this.glassUniforms.uRes,o,u),a.uniform1i(this.glassUniforms.uCount,h),a.uniform4fv(this.glassUniforms.uRects,this.rectArr),a.uniform4fv(this.glassUniforms.uParams,this.paramArr),a.uniform4fv(this.glassUniforms.uHover,this.hoverArr),a.uniform4fv(this.glassUniforms.uOptics,this.opticsArr),t.droplet&&t.droplet.opacity>.005){const x=(t.droplet.x-.5)*c,f=t.droplet.y-.5;a.uniform4f(this.glassUniforms.uDroplet,x,f,t.droplet.radius,t.droplet.morph),a.uniform1f(this.glassUniforms.uDropAlpha,t.droplet.opacity)}else a.uniform4f(this.glassUniforms.uDroplet,10,10,0,0),a.uniform1f(this.glassUniforms.uDropAlpha,0);a.uniform1f(this.glassUniforms.uIsLightStage,t.isLightStage?1:0),a.uniform1f(this.glassUniforms.uBgSoftness,.46),a.uniform1f(this.glassUniforms.uSaturation,t.saturation),a.drawArrays(a.TRIANGLES,0,6);let m=this.ctx2dCache.get(i);if(!m){const x=i.getContext("2d",{alpha:!1});if(!x)return!1;this.ctx2dCache.set(i,x),m=x}return m.drawImage(n,0,0,o,u,0,0,o,u),!0}}const le=new We,ie=new Map,Oe=120;let ee=null,ge=null;function He(s,i){return typeof document>"u"||(ee||(ee=document.createElement("canvas"),ge=ee.getContext("2d",{willReadFrequently:!1})),!ge)?null:(ee.width!==s&&(ee.width=s),ee.height!==i&&(ee.height=i),{canvas:ee,ctx:ge})}function qe(s,i,t,a,n){const r=Math.max(0,t-n),o=Math.max(0,a-n),u=Math.abs(s)-r,d=Math.abs(i)-o,c=Math.hypot(Math.max(u,0),Math.max(d,0)),h=Math.min(Math.max(u,d),0);return c+h-n}function Ye(s,i,t,a,n){const r=Math.max(0,t-n),o=Math.max(0,a-n),u=s>=0?1:-1,d=i>=0?1:-1,c=Math.abs(s)-r,h=Math.abs(i)-o;if(c>0||h>0){const m=Math.max(c,0),x=Math.max(h,0),f=Math.hypot(m,x)||1;return[u*m/f,d*x/f]}return c>h?[u,0]:[0,d]}function Ve(s,i,t){if(s>=1)return 0;const n=1-Math.max(.015,Math.min(.999,s)),r=n*n*n,o=r*n,u=Math.pow(Math.max(2e-4,1-o),.25),d=r/Math.pow(Math.max(8e-4,1-o),.75)*1.18,c=Math.atan(d),h=Math.min(.995,Math.sin(c)/i),m=Math.asin(h),x=Math.max(0,c-m),f=t*1.42+u*t*.9;return Math.tan(x)*f}function ye(s){const i=Math.max(24,Math.min(960,Math.round(s.width/8)*8)),t=Math.max(24,Math.min(720,Math.round(s.height/8)*8)),a=Math.min(i,t)/2,n=Math.max(4,Math.min(a,Math.round(s.radius/2)*2)),r=Math.max(8,Math.min(a*.96,Math.round(s.bezelWidth/2)*2)),o=s.ior??1.54,u=Math.round((s.refractionStrength??1.55)*20)/20,d=`${i}x${t}_r${n}_b${r}_i${o.toFixed(2)}_s${u.toFixed(2)}`,c=ie.get(d);if(c)return c;const h=Math.max(i,t),m=h>160?160/h:1,x=Math.max(20,Math.round(i*m)),f=Math.max(20,Math.round(t*m)),w=x/2,v=f/2,T=n*m,k=Math.max(3,r*m),y=He(x,f);if(!y)return{displacementUrl:"",maxScale:0,width:i,height:t};const{canvas:p,ctx:g}=y,M=g.createImageData(x,f),b=M.data,j=x*f,U=new Float32Array(j),G=new Float32Array(j);let E=1e-4;for(let C=0;C<f;C++){const z=C+.5-v;for(let L=0;L<x;L++){const P=L+.5-w,R=C*x+L,B=qe(P,z,w,v,T);if(B>.5)continue;const W=Math.max(0,-B),[X,_]=Ye(P,z,w,v,T);if(W<k){const N=W/k,F=Ve(N,o,r)*u,O=-X*F,H=-_*F;U[R]=O,G[R]=H;const J=Math.max(Math.abs(O),Math.abs(H));J>E&&(E=J)}else{const N=P/Math.max(1,w),F=z/Math.max(1,v),O=.65*u;U[R]=-N*O,G[R]=-F*O}}}const D=127/E;for(let C=0;C<j;C++){const z=C*4,L=128+U[C]*D,P=128+G[C]*D;b[z]=L<0?0:L>255?255:L+.5|0,b[z+1]=P<0?0:P>255?255:P+.5|0,b[z+2]=128,b[z+3]=255}g.putImageData(M,0,0);const Y={displacementUrl:p.toDataURL("image/png"),maxScale:Math.min(72,E*1.6),width:i,height:t};if(ie.size>=Oe){const C=ie.keys().next().value;C&&ie.delete(C)}return ie.set(d,Y),Y}function ue(){if(typeof navigator>"u")return!1;const s=navigator.userAgent;return/Chrome\/|Chromium\/|Edg\//.test(s)&&!/CriOS|FxiOS/.test(s)}const Ae="glasskit-site-theme",de={refraction:.88,blur:3.4,bezelWidth:24,specular:.95,aberration:.16,saturation:1.16,morphStrength:.075,useSvgRefraction:!0,renderMode:"auto",siteTheme:"dark"};function Ke(s,i){if(s)return s;if(typeof window>"u")return"dark";if(i)try{const t=window.localStorage.getItem(Ae);if(t==="dark"||t==="light")return t}catch{}return"dark"}const Ne=l.createContext(null),Qe=({children:s,defaultSettings:i,persistTheme:t=!0})=>{const[a]=l.useState(()=>ue()),[n,r]=l.useState(()=>({...de,useSvgRefraction:ue(),...i,siteTheme:Ke(i==null?void 0:i.siteTheme,t)}));l.useEffect(()=>{if(!(!t||typeof window>"u"))try{window.localStorage.setItem(Ae,n.siteTheme)}catch{}},[n.siteTheme,t]);const o=l.useCallback((h,m)=>{r(x=>x[h]===m?x:{...x,[h]:m})},[]),u=l.useCallback(h=>{r(m=>h==="clear"?{...m,refraction:.88,blur:3.4,bezelWidth:24,specular:.95,aberration:.16,saturation:1.16}:h==="regular"?{...m,refraction:.65,blur:5.2,bezelWidth:20,specular:.85,aberration:.08,saturation:1.12}:h==="crystal"?{...m,refraction:1.25,blur:1.2,bezelWidth:28,specular:1.15,aberration:.18,saturation:1.22}:{...m,refraction:1.15,blur:2.2,bezelWidth:26,specular:1.1,aberration:.34,saturation:1.24})},[]),d=l.useCallback(()=>{r(h=>({...de,...i,siteTheme:h.siteTheme,useSvgRefraction:a,renderMode:"auto"}))},[i,a]),c=l.useMemo(()=>({settings:n,svgSupported:a,updateSetting:o,applyPreset:u,resetSettings:d}),[n,a,o,u,d]);return e.jsx(Ne.Provider,{value:c,children:s})};function ve(){const s=l.useContext(Ne);return s||{settings:de,svgSupported:ue(),updateSetting:()=>{},applyPreset:()=>{},resetSettings:()=>{}}}const Ue=l.createContext(null);function pe(){return l.useContext(Ue)}const ke=l.forwardRef(({scene:s="tahoe",backgroundImage:i,tone:t,renderMode:a,className:n="",style:r,children:o,onStagePointerMove:u,onStagePointerDown:d,onStagePointerUp:c,onStagePointerLeave:h,onPointerMove:m,onPointerDown:x,onPointerUp:f,onPointerLeave:w,onClick:v,underlay:T,...k},y)=>{const{settings:p}=ve(),g=l.useRef(null),M=l.useRef(null),b=l.useRef(new Map),j=l.useRef(null),U=l.useRef(p);U.current=p;const G=l.useRef(s);G.current=s;const E=l.useRef(i);E.current=i;const D=t??(i?"dark":s==="light"?"light":"dark"),Y=l.useRef(D==="light");Y.current=D==="light";const C=a??p.renderMode,[z]=l.useState(()=>le.isAvailable()),L=z&&(C==="auto"||C==="webgl"),P=l.useRef(!1),R=l.useRef(0),B=l.useRef(0),W=l.useCallback(()=>{const S=g.current,V=M.current;if(!S||!V||!L||!P.current||document.hidden)return;const K=S.getBoundingClientRect();if(K.width<10||K.height<10)return;const Z=U.current,te=[];b.current.forEach($=>{if(!$.el.isConnected)return;const Q=$.el.getBoundingClientRect();if(Q.width<2||Q.height<2)return;const fe=window.getComputedStyle($.el),se=parseFloat(fe.opacity);if(Number.isNaN(se)||se<=.01)return;const re=$.el.parentElement?parseFloat(window.getComputedStyle($.el.parentElement).opacity):1,be=se*(Number.isNaN(re)?1:re);if(be<=.01)return;const Ce=Q.left-K.left+Q.width*.5,De=Q.top-K.top+Q.height*.5,we=Q.width*.5,Me=Q.height*.5,Ie=Math.min($.radius,Math.min(we,Me));te.push({cx:Ce,cy:De,hw:we,hh:Me,radius:Ie,opacity:be,variant:$.variant,bezelPx:$.bezelWidth??Z.bezelWidth,refraction:$.refraction,blur:$.blur,aberration:$.aberration,specular:$.specular,pointerX:$.pointerX,pointerY:$.pointerY,pointerAlpha:$.pointerAlpha})}),le.renderToCanvas(V,{scene:G.current,backgroundImage:E.current,isLightStage:Y.current,stageWidth:K.width,stageHeight:K.height,rects:te,droplet:j.current,refraction:Z.refraction,blur:Z.blur,aberration:Z.aberration,specular:Z.specular,saturation:Z.saturation})},[L]),X=l.useCallback(S=>{R.current=0,W(),S<B.current&&P.current&&!document.hidden&&(R.current=requestAnimationFrame(X))},[W]),_=l.useCallback(()=>{!P.current||document.hidden||!L||R.current||(R.current=requestAnimationFrame(X))},[L,X]),N=l.useCallback((S=460)=>{L&&(B.current=Math.max(B.current,performance.now()+S),P.current&&!document.hidden&&!R.current&&(R.current=requestAnimationFrame(X)))},[L,X]);l.useImperativeHandle(y,()=>({requestFrame:_,requestBurst:N,setDroplet:S=>{j.current=S}}),[_,N]),l.useEffect(()=>{const S=g.current;if(!S||!L)return;const V=typeof IntersectionObserver<"u"?new IntersectionObserver(fe=>{var re;const se=((re=fe[0])==null?void 0:re.isIntersecting)??!1;P.current=se,se?N(820):R.current&&(cancelAnimationFrame(R.current),R.current=0)},{rootMargin:"120px 0px"}):null;V?V.observe(S):(P.current=!0,_());const K=new ResizeObserver(()=>N(120));K.observe(S);const Z=()=>{!document.hidden&&P.current?_():R.current&&(cancelAnimationFrame(R.current),R.current=0)};document.addEventListener("visibilitychange",Z);const te=le.onAssetLoaded(()=>_()),$=()=>N(540),Q=()=>N(420);return S.addEventListener("transitionstart",$),window.addEventListener("orientationchange",Q),()=>{V==null||V.disconnect(),K.disconnect(),te(),S.removeEventListener("transitionstart",$),window.removeEventListener("orientationchange",Q),document.removeEventListener("visibilitychange",Z),R.current&&(cancelAnimationFrame(R.current),R.current=0)}},[L,N,_]),l.useEffect(()=>{_()},[s,i,D,L,p.refraction,p.blur,p.bezelWidth,p.specular,p.aberration,p.saturation,_]);const F=l.useCallback(S=>{b.current.set(S.id,S),N(120)},[N]),O=l.useCallback(S=>{b.current.delete(S),_()},[_]),H=l.useCallback((S,V)=>{const K=b.current.get(S);K&&(Object.assign(K,V),_())},[_]),J=l.useMemo(()=>({gpuActive:L,stageRenderMode:C,register:F,unregister:O,updateMeta:H,requestBurst:N}),[L,C,F,O,H,N]),he=l.useMemo(()=>{if(L)return;const S=i??ce[s];return{backgroundImage:S?`url("${S}"), ${xe[s]}`:xe[s],backgroundSize:"cover",backgroundPosition:"center"}},[L,i,s]),A=n.includes("stage-tone-")?"":D==="light"?"stage-tone-light":"stage-tone-dark";return e.jsx(Ue.Provider,{value:J,children:e.jsxs("div",{ref:g,className:`glass-stage-root ${A} ${n}`.trim(),style:r,onPointerMove:S=>{u==null||u(S),m==null||m(S)},onPointerDown:S=>{N(480),d==null||d(S),x==null||x(S)},onPointerUp:S=>{N(480),c==null||c(S),f==null||f(S)},onPointerLeave:S=>{N(320),h==null||h(S),w==null||w(S)},onClick:S=>{N(540),v==null||v(S)},...k,children:[L?e.jsx("canvas",{ref:M,className:"glass-stage-canvas","aria-hidden":"true"}):e.jsx("div",{className:"glass-stage-fallback-bg",style:he,"aria-hidden":"true"}),T&&e.jsx("div",{className:"glass-stage-underlay","aria-hidden":"true",children:T}),e.jsx("div",{className:"glass-stage-foreground",children:o})]})})});ke.displayName="GlassStage";const Ze=({children:s,className:i="",style:t,radius:a=24,refraction:n,blur:r,bezelWidth:o,aberration:u,specular:d,variant:c="clear",interactive:h=!0,renderMode:m,forceSvg:x=!1,onPointerMove:f,onPointerLeave:w,...v})=>{const T=l.useId(),k=l.useMemo(()=>`lg-svg-${T.replace(/[^a-zA-Z0-9_-]/g,"")}`,[T]),y=l.useRef(null),p=pe(),{settings:g,svgSupported:M}=ve(),b=x?"svg":m??(p==null?void 0:p.stageRenderMode)??g.renderMode,j=!!(p&&p.gpuActive&&(b==="auto"||b==="webgl")),U=!j&&M&&(b==="svg"||b==="auto"&&g.useSvgRefraction),[G,E]=l.useState(null),D=n??g.refraction,Y=r??g.blur,C=o??g.bezelWidth,z=u??g.aberration,L=d??g.specular;l.useEffect(()=>{const N=y.current;if(!j||!p||!N)return;p.register({id:T,el:N,radius:a,variant:c,bezelWidth:o,refraction:n,blur:r,aberration:u,specular:d,pointerX:.5,pointerY:.3,pointerAlpha:0});const F=new ResizeObserver(()=>{p.requestBurst(120)});return F.observe(N),()=>{F.disconnect(),p.unregister(T)}},[T,p,j]),l.useEffect(()=>{!j||!p||p.updateMeta(T,{radius:a,variant:c,bezelWidth:o,refraction:n,blur:r,aberration:u,specular:d})},[T,p,j,a,c,o,n,r,u,d]),l.useEffect(()=>{const N=y.current;if(!U||!N){E(null);return}const F=()=>{const H=N.getBoundingClientRect();if(H.width<12||H.height<12)return;const J=ye({width:H.width,height:H.height,radius:Math.min(a,Math.min(H.width,H.height)/2),bezelWidth:C,refractionStrength:Math.max(.25,D*1.65)});E(J)};F();const O=new ResizeObserver(F);return O.observe(N),()=>O.disconnect()},[U,a,C,D]);const P=l.useCallback(N=>{if(h&&N.pointerType==="mouse"&&y.current){const F=y.current.getBoundingClientRect(),O=Math.max(0,Math.min(1,(N.clientX-F.left)/Math.max(1,F.width))),H=Math.max(0,Math.min(1,(N.clientY-F.top)/Math.max(1,F.height)));j&&p?p.updateMeta(T,{pointerX:O,pointerY:H,pointerAlpha:1}):(y.current.style.setProperty("--lg-mx",`${(O*100).toFixed(1)}%`),y.current.style.setProperty("--lg-my",`${(H*100).toFixed(1)}%`),y.current.style.setProperty("--lg-pointer-alpha","1"))}f==null||f(N)},[T,h,f,p,j]),R=l.useCallback(N=>{h&&(j&&p?p.updateMeta(T,{pointerAlpha:0}):y.current&&y.current.style.setProperty("--lg-pointer-alpha","0")),w==null||w(N)},[T,h,w,p,j]);if(j)return e.jsx("div",{ref:y,className:`lg-surface-gpu lg-variant-${c} ${i}`.trim(),onPointerMove:P,onPointerLeave:R,style:{borderRadius:`${a}px`,...t},...v,children:e.jsx("div",{className:"lg-content",children:s})});const B=Math.max(2,Y*3.8),W=Math.round(g.saturation*145),X=!!(U&&G&&G.displacementUrl),_=X?`url(#${k}) saturate(${W}%) brightness(1.04)`:`blur(${Math.max(10,B).toFixed(1)}px) saturate(${W}%)`;return e.jsxs("div",{ref:y,className:`lg-surface lg-variant-${c} ${X?"lg-tier-svg":"lg-tier-css"} ${i}`.trim(),onPointerMove:P,onPointerLeave:R,style:{borderRadius:`${a}px`,"--lg-specular":L,"--lg-aberration":z,...t},...v,children:[X&&G&&e.jsx("svg",{width:"0",height:"0","aria-hidden":"true",style:{position:"absolute",pointerEvents:"none"},children:e.jsx("defs",{children:e.jsxs("filter",{id:k,colorInterpolationFilters:"sRGB",children:[e.jsx("feGaussianBlur",{in:"SourceGraphic",stdDeviation:Math.max(.4,Y*.65).toFixed(2),result:"blur"}),e.jsx("feImage",{href:G.displacementUrl,x:"0",y:"0",width:"100%",height:"100%",preserveAspectRatio:"none",result:"dispMap"}),e.jsx("feDisplacementMap",{in:"blur",in2:"dispMap",scale:G.maxScale.toFixed(1),xChannelSelector:"R",yChannelSelector:"G"})]})})}),e.jsx("div",{className:"lg-backdrop","aria-hidden":"true",style:{backdropFilter:_,WebkitBackdropFilter:`blur(${Math.max(10,B).toFixed(1)}px) saturate(${W}%)`}}),h&&e.jsx("div",{className:"lg-pointer-sheen","aria-hidden":"true"}),e.jsx("div",{className:"lg-rim-highlight","aria-hidden":"true"}),e.jsx("div",{className:"lg-content",children:s})]})},q=l.memo(Ze),Te=()=>e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.1",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("circle",{cx:"11",cy:"11",r:"8"}),e.jsx("path",{d:"m21 21-4.3-4.3"})]}),je=({size:s=20})=>e.jsxs("svg",{width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.1",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M18 6 6 18"}),e.jsx("path",{d:"m6 6 12 12"})]}),Je=({items:s,activeIndex:i,defaultActiveIndex:t=0,onChange:a,searchable:n=!1,searchPlaceholder:r="Search...",searchValue:o,onSearchChange:u,searchIcon:d,closeIcon:c,variant:h="clear",ariaLabel:m="Primary navigation (drag or tap)",className:x=""})=>{const[f,w]=l.useState(t),[v,T]=l.useState(!1),[k,y]=l.useState(""),p=i!==void 0?i:f,g=o!==void 0?o:k,M=A=>{i===void 0&&w(A),s[A]&&(a==null||a(A,s[A]))},b=A=>{o===void 0&&y(A),u==null||u(A)},j=l.useRef(null),[U,G]=l.useState(!1),[E,D]=l.useState(null),[Y,C]=l.useState(0),[z,L]=l.useState(!1),P=l.useRef(0),R=l.useRef(!1),B=l.useRef(null),W=Math.max(1,s.length),X=A=>{const S=j.current;if(!S)return p;const V=S.getBoundingClientRect(),K=6,te=Math.max(1,V.width-K*2)/W,$=(A-V.left-K-te*.5)/te;return Math.max(0,Math.min(W-1,$))},_=()=>{L(!0),B.current!==null&&window.clearTimeout(B.current),B.current=window.setTimeout(()=>L(!1),380)},N=A=>{A.currentTarget.setPointerCapture(A.pointerId),G(!0),R.current=!1,P.current=A.clientX,D(X(A.clientX)),C(0)},F=A=>{if(!U)return;const S=A.clientX-P.current;Math.abs(S)>2&&(R.current=!0),P.current=A.clientX,D(X(A.clientX)),C(Math.min(.24,Math.abs(S)*.012))},O=A=>{if(!U)return;const S=Math.round(X(A));S!==p&&(_(),M(S)),G(!1),D(null),C(0)},H=A=>{R.current||A!==p&&(_(),M(A))},J=E!==null?E:p,he=Math.round(J);return e.jsx("div",{className:`demo-tabbar-wrap ${x}`.trim(),children:e.jsxs("div",{className:`ios-tabbar-row ${v?"is-searching":""}`,children:[v?e.jsx(q,{radius:999,bezelWidth:20,variant:h,className:"ios-search-expanded blur-morph-in",children:e.jsxs("div",{className:"ios-search-field",children:[e.jsx("span",{className:"ios-search-icon","aria-hidden":"true",children:d??e.jsx(Te,{})}),e.jsx("input",{type:"text",value:g,onChange:A=>b(A.target.value),placeholder:r,autoFocus:!0,"aria-label":r}),g&&e.jsx("button",{type:"button",className:"ios-search-clear",onClick:()=>b(""),"aria-label":"Clear search",children:c??e.jsx(je,{size:14})})]})}):e.jsx(q,{radius:999,bezelWidth:20,variant:h,className:"ios-tabbar-capsule",children:e.jsxs("div",{ref:j,className:`ios-tabbar-inner ${U?"is-swiping":""}`,style:{gridTemplateColumns:`repeat(${W}, minmax(0, 1fr))`},role:"tablist","aria-label":m,onPointerDown:N,onPointerMove:F,onPointerUp:A=>O(A.clientX),onPointerCancel:A=>O(A.clientX),children:[e.jsx("div",{className:`ios-tabbar-indicator ${U?"is-dragging-pill":""} ${z?"is-gliding-pill":""}`,style:{width:`calc((100% - 12px) / ${W})`,transform:`translate3d(${J*100}%, 0, 0)`},"aria-hidden":"true",children:e.jsx("div",{className:"ios-tabbar-indicator-pill",style:U?{transform:`scale(${(1.09+Y).toFixed(3)}, ${(1.14-Y*.35).toFixed(3)})`}:void 0})}),s.map((A,S)=>{const V=S===he;return e.jsxs("button",{type:"button",role:"tab","aria-selected":S===p,className:`ios-tab-item ${V?"is-active":""}`,onClick:()=>H(S),children:[A.icon,e.jsx("span",{children:A.label})]},A.id)})]})}),n&&e.jsx(q,{radius:999,bezelWidth:18,variant:h,className:"ios-tabbar-search-btn-wrap",children:e.jsx("button",{type:"button",className:"ios-tabbar-search-btn",onClick:()=>{T(A=>(A&&b(""),!A))},"aria-label":v?"Close search":"Open search",children:v?c??e.jsx(je,{}):d??e.jsx(Te,{})})})]})})},et=({checked:s,defaultChecked:i=!1,onChange:t,disabled:a=!1,label:n,description:r,ariaLabel:o,className:u=""})=>{const[d,c]=l.useState(i),[h,m]=l.useState(!1),x=s!==void 0?s:d,f=()=>{if(a)return;const v=!x;s===void 0&&c(v),t==null||t(v)},w=e.jsx("button",{type:"button",role:"switch","aria-checked":x,"aria-label":o??n??"Toggle",disabled:a,className:`ios-liquid-switch ${x?"is-on":""} ${h?"is-pressed":""} ${n?"":u}`.trim(),onPointerDown:()=>!a&&m(!0),onPointerUp:()=>m(!1),onPointerLeave:()=>m(!1),onPointerCancel:()=>m(!1),onClick:f,children:e.jsx("span",{className:"ios-liquid-thumb"})});return!n&&!r?w:e.jsxs("div",{className:`ios-toggle-row ${u}`.trim(),children:[e.jsxs("div",{className:"ios-toggle-meta",children:[n&&e.jsx("span",{className:"ios-toggle-title",children:n}),r&&e.jsx("span",{className:"ios-toggle-sub",children:r})]}),w]})},tt=({value:s,defaultValue:i=50,min:t=0,max:a=100,step:n=1,onChange:r,label:o,showValue:u=!0,formatValue:d=x=>`${x}%`,accent:c="blue",ariaLabel:h="Slider",className:m=""})=>{const[x,f]=l.useState(i),[w,v]=l.useState(!1),T=l.useRef(null),k=s!==void 0?s:x,y=Math.max(0,Math.min(100,(k-t)/Math.max(1e-6,a-t)*100)),p=M=>{const b=Math.round(M/n)*n,j=Math.max(t,Math.min(a,Number(b.toFixed(4))));s===void 0&&f(j),r==null||r(j)},g=M=>{const b=T.current;if(!b)return;const j=b.getBoundingClientRect(),U=Math.max(0,Math.min(1,(M-j.left)/Math.max(1,j.width)));p(t+U*(a-t))};return e.jsxs("div",{className:`ios-slider-block ${m}`.trim(),children:[(o||u)&&e.jsxs("div",{className:"ios-slider-header",children:[e.jsx("span",{className:"ios-slider-label",children:o}),u&&e.jsx("span",{className:"ios-slider-value",children:d(k)})]}),e.jsxs("div",{ref:T,className:`ios-liquid-slider ${w?"is-dragging":""}`,role:"slider",tabIndex:0,"aria-label":h,"aria-valuemin":t,"aria-valuemax":a,"aria-valuenow":k,onPointerDown:M=>{M.currentTarget.setPointerCapture(M.pointerId),v(!0),g(M.clientX)},onPointerMove:M=>{w&&g(M.clientX)},onPointerUp:()=>v(!1),onPointerCancel:()=>v(!1),onKeyDown:M=>{const b=Math.max(n,(a-t)*.05);M.key==="ArrowRight"||M.key==="ArrowUp"?(M.preventDefault(),p(k+b)):(M.key==="ArrowLeft"||M.key==="ArrowDown")&&(M.preventDefault(),p(k-b))},children:[e.jsx("div",{className:"ios-slider-track",children:e.jsx("div",{className:`ios-slider-fill ${c==="amber"?"ios-slider-fill-amber":""}`,style:{width:`${y}%`}})}),e.jsx("div",{className:"ios-slider-knob-wrap",style:{left:`${y}%`},children:e.jsx("div",{className:"ios-slider-knob"})})]})]})},st=({options:s,value:i,defaultValue:t=0,onChange:a,compact:n=!1,iconOnly:r=!1,variant:o="clear",ariaLabel:u="Segmented control (drag or tap)",className:d=""})=>{const[c,h]=l.useState(t),m=i!==void 0?i:c,x=l.useRef(null),[f,w]=l.useState(!1),[v,T]=l.useState(null),[k,y]=l.useState(0),[p,g]=l.useState(!1),M=l.useRef(0),b=l.useRef(!1),j=l.useRef(null),U=Math.max(1,s.length),G=R=>{i===void 0&&h(R),s[R]&&(a==null||a(R,s[R]))},E=R=>{const B=x.current;if(!B)return m;const W=B.getBoundingClientRect(),X=5,_=Math.max(1,(W.width-X*2)/U);return Math.max(0,Math.min(U-1,(R-W.left-X-_*.5)/_))},D=()=>{g(!0),j.current!==null&&window.clearTimeout(j.current),j.current=window.setTimeout(()=>g(!1),360)},Y=R=>{R.currentTarget.setPointerCapture(R.pointerId),w(!0),b.current=!1,M.current=R.clientX,T(E(R.clientX)),y(0)},C=R=>{if(!f)return;const B=R.clientX-M.current;Math.abs(B)>2&&(b.current=!0),M.current=R.clientX,T(E(R.clientX)),y(Math.min(.22,Math.abs(B)*.011))},z=R=>{if(!f)return;const B=Math.round(E(R));B!==m&&(D(),G(B)),w(!1),T(null),y(0)},L=v!==null?v:m,P=Math.round(L);return e.jsx(q,{radius:999,bezelWidth:n?16:18,variant:o,className:`ios-segmented-shell ${n?"ios-segmented-compact":""} ${d}`.trim(),children:e.jsxs("div",{ref:x,className:`ios-segmented-track ${f?"is-swiping":""}`,style:{gridTemplateColumns:`repeat(${U}, minmax(0, 1fr))`},role:"tablist","aria-label":u,onPointerDown:Y,onPointerMove:C,onPointerUp:R=>z(R.clientX),onPointerCancel:R=>z(R.clientX),children:[e.jsx("div",{className:`ios-segmented-thumb-wrap ${f?"is-dragging-pill":""} ${p?"is-gliding-pill":""}`,style:{width:`calc((100% - 10px) / ${U})`,transform:`translate3d(${L*100}%, 0, 0)`},"aria-hidden":"true",children:e.jsx("div",{className:"ios-segmented-thumb",style:f?{transform:`scale(${(1.08+k).toFixed(3)}, ${(1.16-k*.35).toFixed(3)})`}:void 0})}),s.map((R,B)=>e.jsx("button",{type:"button",role:"tab","aria-selected":m===B,"aria-label":r?R.label:void 0,className:`ios-segmented-btn ${r?"ios-segmented-icon-btn":""} ${P===B?"is-active":""}`.trim(),onClick:()=>{b.current||B!==m&&(D(),G(B))},children:r?R.icon:R.label},R.id))]})})},rt=({variant:s="clear",bezelWidth:i=18,radius:t=999,icon:a,children:n,className:r="",type:o="button",...u})=>e.jsx(q,{radius:t,bezelWidth:i,variant:s,className:`ios-glass-btn-wrap ${r}`.trim(),children:e.jsxs("button",{type:o,className:`ios-glass-btn ${s==="prominent"?"ios-glass-btn-prominent":""}`.trim(),...u,children:[a,e.jsx("span",{children:n})]})}),at=({variant:s="clear",bezelWidth:i=16,children:t,className:a="",type:n="button",...r})=>e.jsx(q,{radius:999,bezelWidth:i,variant:s,className:`ios-circle-btn-wrap ${a}`.trim(),children:e.jsx("button",{type:n,className:"ios-circle-btn",...r,children:t})}),it=({actions:s,variant:i="clear",bezelWidth:t=18,className:a=""})=>e.jsx(q,{radius:999,bezelWidth:t,variant:i,className:`ios-grouped-pill ${a}`.trim(),children:e.jsx("div",{className:"ios-grouped-pill-inner",children:s.map((n,r)=>e.jsxs(l.Fragment,{children:[r>0&&e.jsx("span",{className:"ios-pill-divider"}),e.jsx("button",{type:"button",className:`ios-pill-action ${n.active&&n.activeTone==="rose"?"is-rose":n.active&&n.activeTone==="amber"?"is-amber":""}`.trim(),onClick:n.onClick,"aria-label":n.ariaLabel,"aria-pressed":n.active,children:n.icon})]},n.id))})}),Le=({value:s,defaultValue:i=65,onChange:t,icon:a,ariaLabel:n,min:r=4,max:o=100})=>{const[u,d]=l.useState(i),c=l.useRef(null),h=l.useRef(!1),m=s!==void 0?s:u,x=w=>{const v=Math.max(r,Math.min(o,Math.round(w)));s===void 0&&d(v),t==null||t(v)},f=w=>{const v=c.current;if(!v)return;const T=v.getBoundingClientRect(),k=(T.bottom-w)/Math.max(1,T.height)*100;x(k)};return e.jsx(q,{radius:26,bezelWidth:18,className:"cc-vslider-shell",children:e.jsxs("div",{ref:c,className:"cc-vslider",role:"slider",tabIndex:0,"aria-label":n,"aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":m,onPointerDown:w=>{w.currentTarget.setPointerCapture(w.pointerId),h.current=!0,f(w.clientY)},onPointerMove:w=>{h.current&&f(w.clientY)},onPointerUp:()=>{h.current=!1},onPointerCancel:()=>{h.current=!1},onKeyDown:w=>{w.key==="ArrowUp"||w.key==="ArrowRight"?(w.preventDefault(),x(m+5)):(w.key==="ArrowDown"||w.key==="ArrowLeft")&&(w.preventDefault(),x(m-5))},children:[e.jsx("div",{className:"cc-vslider-fill",style:{height:`${m}%`}}),a&&e.jsx("div",{className:"cc-vslider-icon",children:a})]})})},nt=({orbs:s,sliders:i,focus:t,className:a=""})=>e.jsxs("div",{className:`cc-grid ${a}`.trim(),children:[e.jsx(q,{radius:30,bezelWidth:22,className:"cc-connectivity-card",children:e.jsx("div",{className:"cc-connectivity-grid",children:s.map(n=>e.jsx("button",{type:"button",className:`cc-orb ${n.active?`is-${n.tone??"blue"}`:""}`.trim(),onClick:n.onToggle,"aria-label":n.label,"aria-pressed":n.active,children:n.icon},n.id))})}),e.jsx("div",{className:"cc-sliders-pair",children:i.map(n=>e.jsx(Le,{...n},n.ariaLabel))}),t&&e.jsx(q,{radius:999,bezelWidth:18,variant:t.active?"tinted":"clear",className:"cc-focus-pill-wrap",children:e.jsxs("button",{type:"button",className:`cc-focus-pill ${t.active?"is-on":""}`.trim(),onClick:t.onToggle,"aria-pressed":t.active,children:[e.jsx("span",{className:"cc-focus-icon",children:t.icon}),e.jsxs("span",{className:"cc-focus-text",children:[e.jsx("strong",{children:t.title}),e.jsx("small",{children:t.subtitle})]})]})})]});function Ee(s){const i=Math.floor(s/60),t=Math.floor(s%60);return`${i}:${t.toString().padStart(2,"0")}`}const ot=()=>e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"currentColor",style:{marginLeft:2},"aria-hidden":"true",children:e.jsx("polygon",{points:"6 3 20 12 6 21 6 3"})}),lt=()=>e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true",children:[e.jsx("rect",{x:"6",y:"4",width:"4",height:"16",rx:"1"}),e.jsx("rect",{x:"14",y:"4",width:"4",height:"16",rx:"1"})]}),ct=()=>e.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true",children:[e.jsx("polygon",{points:"19 20 9 12 19 4 19 20"}),e.jsx("line",{x1:"5",x2:"5",y1:"19",y2:"5",stroke:"currentColor",strokeWidth:"2.2"})]}),ut=()=>e.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true",children:[e.jsx("polygon",{points:"5 4 15 12 5 20 5 4"}),e.jsx("line",{x1:"19",x2:"19",y1:"5",y2:"19",stroke:"currentColor",strokeWidth:"2.2"})]}),dt=()=>e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}),e.jsx("path",{d:"M3 3v5h5"})]}),ht=()=>e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"}),e.jsx("polyline",{points:"16 6 12 2 8 6"}),e.jsx("line",{x1:"12",x2:"12",y1:"2",y2:"15"})]}),ft=({active:s})=>e.jsx("svg",{width:"17",height:"17",viewBox:"0 0 24 24",fill:s?"currentColor":"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:e.jsx("path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"})}),mt=({tracks:s,initialTrackIndex:i=0,autoTick:t=!0,defaultPlaying:a=!0,defaultElapsed:n=22,variant:r="clear",onTrackChange:o,onPlayChange:u,onFavoriteChange:d,icons:c,className:h=""})=>{const m=l.useRef(null),[x,f]=l.useState(!1),[w,v]=l.useState(i),[T,k]=l.useState(a),[y,p]=l.useState(n),[g,M]=l.useState(!1),b=s.length>0?w%s.length:0,j=s[b]??{title:"Untitled Track",artist:"Unknown Artist",duration:180,artworkGradient:"linear-gradient(135deg, #34d399 0%, #0ea5e9 55%, #1d4ed8 100%)"};l.useEffect(()=>{const E=m.current;if(!E||typeof IntersectionObserver>"u"){f(!0);return}const D=new IntersectionObserver(Y=>{var C;return f(((C=Y[0])==null?void 0:C.isIntersecting)??!1)},{threshold:.05});return D.observe(E),()=>D.disconnect()},[]),l.useEffect(()=>{if(!t||!T||!x)return;const E=window.setInterval(()=>{p(D=>D+1>=j.duration?0:D+1)},1e3);return()=>window.clearInterval(E)},[t,T,x,j.duration]);const U=E=>{if(s.length===0)return;const D=(b+E+s.length)%s.length;v(D),p(0),o==null||o(D,s[D])},G=Math.min(100,Math.max(0,y/Math.max(1,j.duration)*100));return e.jsx("div",{ref:m,className:`media-demo-shell ${h}`.trim(),children:e.jsxs(q,{radius:38,bezelWidth:26,variant:r,className:"media-glass-card",children:[e.jsxs("div",{className:"media-top",children:[e.jsx("div",{className:`media-artwork ${T?"is-playing":""}`,style:j.artwork?void 0:{background:j.artworkGradient??"linear-gradient(135deg, #34d399 0%, #0ea5e9 55%, #1d4ed8 100%)"},"aria-hidden":"true",children:j.artwork??e.jsx("div",{className:"media-artwork-ring"})}),e.jsxs("div",{className:"media-info",children:[e.jsx("div",{className:"media-title",children:j.title}),e.jsx("div",{className:"media-artist",children:j.artist})]}),e.jsx("button",{type:"button",className:`media-fav-btn ${g?"is-active":""}`,onClick:()=>{const E=!g;M(E),d==null||d(E)},"aria-label":"Favorite track","aria-pressed":g,children:c!=null&&c.heart?c.heart(g):e.jsx(ft,{active:g})})]}),e.jsxs("div",{className:"media-scrubber-wrap",children:[e.jsxs("div",{className:"media-times media-times-top",children:[e.jsx("span",{children:Ee(y)}),e.jsxs("span",{children:["-",Ee(Math.max(0,j.duration-y))]})]}),e.jsx("input",{type:"range",min:0,max:j.duration,value:y,onChange:E=>p(Number(E.target.value)),className:"media-scrubber","aria-label":"Track progress",style:{"--progress":`${G}%`}})]}),e.jsxs("div",{className:"media-controls",children:[e.jsx("button",{type:"button",className:"media-ctrl-btn media-side-btn",onClick:()=>p(E=>Math.max(0,E-10)),"aria-label":"Rewind 10 seconds",title:"Rewind 10s",children:(c==null?void 0:c.rewind)??e.jsx(dt,{})}),e.jsxs("div",{className:"media-center-transport",children:[e.jsx("button",{type:"button",className:"media-ctrl-btn",onClick:()=>U(-1),"aria-label":"Previous track",children:(c==null?void 0:c.prev)??e.jsx(ct,{})}),e.jsx("button",{type:"button",className:"media-play-btn",onClick:()=>{const E=!T;k(E),u==null||u(E)},"aria-label":T?"Pause":"Play",children:T?(c==null?void 0:c.pause)??e.jsx(lt,{}):(c==null?void 0:c.play)??e.jsx(ot,{})}),e.jsx("button",{type:"button",className:"media-ctrl-btn",onClick:()=>U(1),"aria-label":"Next track",children:(c==null?void 0:c.next)??e.jsx(ut,{})})]}),e.jsx("button",{type:"button",className:"media-ctrl-btn media-side-btn",onClick:()=>U(1),"aria-label":"Next track",title:"Next track",children:(c==null?void 0:c.share)??e.jsx(ht,{})})]})]})})},gt=({open:s,defaultOpen:i=!0,onOpenChange:t,triggerLabel:a="Open Context Menu",closeLabel:n="Hide Menu",triggerIcon:r,quickActions:o,items:u,feedback:d,variant:c="clear",className:h=""})=>{const[m,x]=l.useState(i),f=s!==void 0?s:m,w=()=>{const v=!f;s===void 0&&x(v),t==null||t(v)};return e.jsxs("div",{className:`ctx-demo-wrap ${h}`.trim(),children:[e.jsxs("div",{className:"ctx-trigger-row",children:[e.jsx(q,{radius:999,bezelWidth:16,variant:c,className:"ios-glass-btn-wrap",children:e.jsxs("button",{type:"button",className:"ios-glass-btn",onClick:w,"aria-expanded":f,children:[r,e.jsx("span",{children:f?n:a})]})}),d&&e.jsx("span",{className:"ctx-feedback-pill",children:d})]}),e.jsx("div",{className:`ctx-popover-slot ${f?"is-open":""}`,children:e.jsxs(q,{radius:24,bezelWidth:22,variant:c,className:"ctx-menu-card",children:[o&&o.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"ctx-quick-row",style:{gridTemplateColumns:`repeat(${o.length}, 1fr)`},children:o.map(v=>e.jsxs("button",{type:"button",onClick:v.onSelect,children:[v.icon,e.jsx("span",{children:v.label})]},v.id))}),e.jsx("div",{className:"ios-hairline"})]}),e.jsx("div",{className:"ctx-list",role:"menu",children:u.map(v=>e.jsxs(l.Fragment,{children:[v.dividerBefore&&e.jsx("div",{className:"ios-hairline"}),e.jsxs("button",{type:"button",role:"menuitem",className:`ctx-item ${v.destructive?"is-destructive":""}`.trim(),onClick:v.onSelect,children:[e.jsxs("span",{className:"ctx-item-left",children:[v.icon,e.jsx("span",{children:v.label})]}),v.shortcut&&e.jsx("kbd",{children:v.shortcut})]})]},v.id))})]})})]})},xt=({rotated:s})=>e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",style:{transform:s?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.25s ease"},children:e.jsx("path",{d:"m18 15-6-6-6 6"})}),vt=()=>e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.1",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}),e.jsx("path",{d:"M3 3v5h5"})]}),pt=({items:s,onDismiss:i,onRestore:t,canRestore:a=!1,defaultExpanded:n=!0,emptyLabel:r="All caught up",variant:o="clear",className:u=""})=>{const[d,c]=l.useState(n);return e.jsxs("div",{className:`notif-demo-wrap ${u}`.trim(),children:[e.jsxs("div",{className:"notif-header-bar",children:[e.jsx("span",{className:"notif-count",children:s.length>0?`${s.length} Notification${s.length===1?"":"s"}`:r}),e.jsxs("div",{className:"notif-actions",children:[s.length>1&&e.jsxs("button",{type:"button",className:"notif-chip-btn",onClick:()=>c(h=>!h),children:[e.jsx(xt,{rotated:!d}),d?"Stack":"Expand"]}),a&&t&&e.jsxs("button",{type:"button",className:"notif-chip-btn",onClick:()=>{t(),c(!0)},children:[e.jsx(vt,{})," Restore"]})]})]}),e.jsx("div",{className:`notif-stack ${d?"is-expanded":"is-collapsed"}`,children:s.map((h,m)=>{const x=d?0:m*10,f=d?1:Math.max(.88,1-m*.05);return e.jsx("div",{className:"notif-card-slot",style:{zIndex:s.length-m,transform:d?"translateY(0) scale(1)":`translateY(${x}px) scale(${f})`,marginTop:d?m===0?0:10:m===0?0:-66,opacity:d?1:Math.max(.55,1-m*.2)},onClick:()=>{d||c(!0)},children:e.jsx(q,{radius:24,bezelWidth:20,variant:o,className:"notif-glass-card",children:e.jsxs("div",{className:"notif-inner",children:[h.icon&&e.jsx("div",{className:"notif-app-icon-svg","aria-hidden":"true",children:h.icon}),e.jsxs("div",{className:"notif-copy",children:[e.jsxs("div",{className:"notif-top-line",children:[e.jsx("strong",{children:h.title}),e.jsx("span",{children:h.time})]}),e.jsx("p",{children:h.body})]}),d&&i&&e.jsx("button",{type:"button",className:"notif-dismiss",onClick:w=>{w.stopPropagation(),i(h.id)},"aria-label":`Dismiss ${h.title}`,children:"×"})]})})},h.id)})})]})},bt=({title:s,description:i,icon:t,primaryLabel:a,onPrimary:n,secondaryLabel:r,onSecondary:o,variant:u="clear",className:d=""})=>e.jsx("div",{className:`alert-demo-wrap ${d}`.trim(),children:e.jsxs(q,{radius:32,bezelWidth:24,variant:u,className:"ios-alert-card",children:[e.jsxs("div",{className:"ios-alert-body",children:[t&&e.jsx("div",{className:"ios-alert-icon",children:t}),e.jsx("h4",{children:s}),e.jsx("p",{children:i})]}),e.jsxs("div",{className:"ios-alert-actions",style:r?void 0:{gridTemplateColumns:"1fr"},children:[r&&e.jsx("button",{type:"button",className:"ios-alert-btn ios-alert-btn-secondary",onClick:o,children:r}),e.jsx("button",{type:"button",className:"ios-alert-btn ios-alert-btn-primary",onClick:n,children:a})]})]})}),wt=({items:s,utilityItems:i=[],activeId:t,defaultActiveId:a,onSelect:n,magnification:r=1.36,variant:o="clear",className:u=""})=>{var p;const d=pe(),[c,h]=l.useState(null),[m,x]=l.useState(a??((p=s[0])==null?void 0:p.id)??""),[f,w]=l.useState(null),v=t!==void 0?t:m;l.useEffect(()=>{d==null||d.requestBurst(320)},[c,f,d]);const T=g=>{if(c===null)return 1;const M=Math.abs(c-g),b=r-1;return M===0?1+b:M===1?1+b*.5:M===2?1+b*.19:1},k=g=>{var M;t===void 0&&x(g.id),w(g.id),window.setTimeout(()=>w(b=>b===g.id?null:b),520),(M=g.onClick)==null||M.call(g),n==null||n(g.id,g)},y=(g,M,b=!1)=>{const j=T(M),U=c===M,G=!b&&(g.running||v===g.id),E=Math.round((j-1)*18);return e.jsxs("button",{type:"button",className:`dock-item ${f===g.id?"is-bouncing":""} ${g.hideOnCompact?"dock-item-optional":""} ${g.hideOnMobile?"dock-item-mobile-hide":""}`.trim(),onPointerEnter:D=>{D.pointerType==="mouse"&&h(M)},onClick:()=>k(g),"aria-label":g.name,style:{marginLeft:E?`${E}px`:void 0,marginRight:E?`${E}px`:void 0,zIndex:U?4:j>1?2:1},children:[U&&e.jsx("span",{className:"dock-tooltip",children:g.name}),e.jsx("span",{className:"dock-icon-wrap",style:{transform:`translateY(${((j-1)*-14).toFixed(1)}px) scale(${j})`},children:g.icon}),e.jsx("span",{className:`dock-dot ${G?"is-visible":""}`})]},g.id)};return e.jsx("div",{className:`dock-demo-stage ${u}`.trim(),children:e.jsx(q,{radius:22,bezelWidth:12,variant:o,className:"macos-dock-shell",children:e.jsxs("div",{className:"macos-dock-row",onPointerLeave:g=>{g.pointerType==="mouse"&&h(null)},children:[s.map((g,M)=>y(g,M)),i.length>0&&e.jsx("span",{className:"dock-divider","aria-hidden":"true"}),i.map((g,M)=>y(g,s.length+M,!0))]})})})};exports.DEFAULT_GLASS_SETTINGS=de;exports.DEFAULT_SCENE_IMAGE_URLS=ce;exports.GlassAlertSheet=bt;exports.GlassButton=rt;exports.GlassButtonGroup=it;exports.GlassContextMenu=gt;exports.GlassControlCenter=nt;exports.GlassDock=wt;exports.GlassIconButton=at;exports.GlassMediaPlayer=mt;exports.GlassNotificationStack=pt;exports.GlassSegmentedControl=st;exports.GlassSettingsProvider=Qe;exports.GlassSlider=tt;exports.GlassStage=ke;exports.GlassSwitch=et;exports.GlassTabBar=Je;exports.GlassVerticalSlider=Le;exports.LiquidGlass=q;exports.SCENE_CSS_FALLBACKS=xe;exports.generateLiquidGlassMaps=ye;exports.sharedGlassEngine=le;exports.supportsSvgBackdropFilter=ue;exports.useGlassSettings=ve;exports.useGlassStage=pe;
