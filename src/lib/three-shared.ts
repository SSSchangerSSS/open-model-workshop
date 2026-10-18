import * as THREE from "three";

/**
 * Shared three.js helpers used by both DatacenterScene (corridor) and
 * GalaxyScene. Kept in a dependency-free module so route chunks don't drag
 * each other in (GalaxyScene used to import from DatacenterScene, which
 * pulled the whole corridor chunk — and postprocessing — onto /hardware).
 */

export type Palette = {
  void: string;
  metal: string;
  green: string;
  cyan: string;
  light: string;
  tile: string;
};

export function getPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    ["void", "metal", "green", "cyan", "light", "tile"].map((key) => [
      key,
      css.getPropertyValue(`--scene-${key}`).trim(),
    ]),
  ) as Palette;
}

export const RACK_PANEL_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const RACK_PANEL_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSeed;
  uniform float uBoost;
  uniform vec3 uGreen;
  uniform vec3 uCyan;
  uniform vec3 uRed;
  uniform vec3 uDark;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    // Unit area: LEDs occupy the top 78%, vents the bottom 22%.
    vec2 uv = vUv;
    vec3 base = uDark * (0.55 + 0.45 * sin(uv.y * 240.0)); // faint scanlines on the metal
    vec3 col = base;

    if (uv.y > 0.22) {
      vec2 g = vec2(9.0, 17.0);
      vec2 cell = floor((uv - vec2(0.0, 0.22)) * vec2(g.x, g.y / 0.78));
      vec2 f = fract((uv - vec2(0.0, 0.22)) * vec2(g.x, g.y / 0.78));
      float id = hash(cell + uSeed * 91.7);
      float phase = id * 6.2831;
      float speed = 0.25 + hash(cell + uSeed + 3.1) * 1.4;
      float on = smoothstep(0.35, 0.55, fract(phase + uTime * speed) ) * step(0.16, id);
      float pick = hash(cell * 1.7 + uSeed);
      vec3 ledColor = pick > 0.93 ? uRed : (pick > 0.72 ? uCyan : uGreen);
      float d = length(f - 0.5);
      float led = smoothstep(0.34, 0.14, d) * on;
      col += ledColor * led * (1.7 + uBoost * 3.5);
    } else {
      // vents
      float slot = step(0.5, fract(uv.x * 26.0));
      col = uDark * (slot > 0.5 ? 0.9 : 0.4);
    }

    // rack frame border
    vec2 b = min(uv, 1.0 - uv);
    float frame = smoothstep(0.015, 0.03, min(b.x, b.y));
    col = mix(uDark * 2.2, col, frame);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const FA_RE = /[\u0600-\u06FF]/;

/**
 * Rasterize a label into a canvas texture.
 * The canvas width is sized from the MEASURED text width so long Persian
 * strings (e.g. "هسته هوش مصنوعی · آماده استقرار") are never clipped —
 * a fixed 512px canvas used to cut them on both sides.
 */
export function makeLabelTexture(
  text: string,
  color: string,
  matrix: boolean,
  px = 40,
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  const probe = c.getContext("2d");
  const fontSpec = matrix
    ? `bold ${px}px "Vazir Matrix", "JetBrains Mono", monospace`
    : `bold ${px}px 'JetBrains Mono', monospace`;
  let textW = 0;
  if (probe) {
    probe.font = fontSpec;
    textW = probe.measureText(text).width;
  }
  c.width = Math.min(2048, Math.max(192, Math.ceil(textW) + 32));
  c.height = Math.ceil(px * 2.4);
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.direction = FA_RE.test(text) ? "rtl" : "ltr";
    ctx.font = fontSpec;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, c.width / 2, c.height / 2 + px * 0.06);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
