import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Html, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import { CATEGORIES, CATEGORY_MAP, MODELS, type ModelCategory, type ModelSpec } from "@/lib/sizing";
import { getPalette, makeLabelTexture, type Palette } from "@/lib/three-shared";
import { isCompactDevice } from "@/lib/device";

/** One-time device tier — phones/low-power get a lighter galaxy. */
const COMPACT = isCompactDevice();

/* ------------------------------------------------------------------ */
/* Multi-galaxy layout — ONE full galaxy per category,                 */
/* each model = a star orbiting inside its own galaxy                  */
/* ------------------------------------------------------------------ */

const GAL_COUNT = CATEGORIES.length; // 9
export const GAL_R = 27; // distance of galaxy centers from origin

const sizeOf = (w: number) =>
  (w < 1
    ? 0.24
    : w < 6
      ? 0.3
      : w < 20
        ? 0.38
        : w < 60
          ? 0.46
          : w < 150
            ? 0.54
            : w < 400
              ? 0.66
              : w < 1200
                ? 0.78
                : 0.9) * 0.92;

/** Deterministic per-galaxy y-offset so galaxies don't share one plane. */
const GAL_Y = [2.2, -1.6, 1.2, -2.2, 0.9, -1.0, 2.4, -1.7, 1.1];
export function galaxyCenterOf(cat: ModelCategory): THREE.Vector3 {
  const idx = CATEGORIES.findIndex((c) => c.key === cat);
  const a = (idx / GAL_COUNT) * Math.PI * 2 + 0.45;
  return new THREE.Vector3(Math.sin(a) * GAL_R, GAL_Y[idx % GAL_Y.length], Math.cos(a) * GAL_R);
}

const galaxyTiltOf = (idx: number) =>
  new THREE.Euler(-0.52 + ((idx % 3) - 1) * 0.14, 0, (idx % 2 ? 1 : -1) * 0.11);

const GAL_PHASE = 1.1;

/** Stars of one galaxy, laid on a gentle two-arm spiral. */
function starOrbitOf(localIdx: number, count: number) {
  const maxR = 2.9 + count * 0.36; // 5 models → 4.7 · 9 models → 6.1
  const t = count === 1 ? 0.55 : localIdx / (count - 1);
  const r = 1.5 + (maxR - 1.5) * Math.pow(t, 0.92);
  const arm = localIdx % 2 === 0 ? 0 : Math.PI; // two arms
  const a = GAL_PHASE + arm + localIdx * ((Math.PI * 2) / count) + r * 0.42;
  return { r, a };
}

const starSpeed = (r: number) => 0.16 / Math.sqrt(r);

const overviewRad = () => (typeof window !== "undefined" && window.innerWidth < 640 ? 78 : 62);
const overviewH = () => (typeof window !== "undefined" && window.innerWidth < 640 ? 36 : 30);
const galaxyViewD = () => (typeof window !== "undefined" && window.innerWidth < 640 ? 13 : 11);

/* Camera walk state shared between DOM hints and the in-canvas rig */
export type NavState = {
  az: number;
  azT: number;
  rad: number;
  radT: number;
  h: number;
  hT: number;
  idle: number;
  dragging: boolean;
};

/** Registry of camera targets: galaxies (`c:<cat>`) + stars (`m:<i>`). */
type Registry = Map<string, THREE.Object3D>;

function useMatrixFont() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    const done = () => alive && setOk(true);
    try {
      Promise.all([
        document.fonts.load('700 40px "Vazir Matrix"'),
        document.fonts.load('400 40px "Vazir Matrix"'),
      ]).then(done, done);
    } catch {
      done();
    }
    const t = setTimeout(done, 3000);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);
  return ok;
}

/* ------------------------------------------------------------------ */
/* Soft glow sprite texture (cached per color)                         */
/* ------------------------------------------------------------------ */

const glowCache = new Map<string, THREE.CanvasTexture>();

function glowTexture(color: string): THREE.CanvasTexture {
  const hit = glowCache.get(color);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, color);
    g.addColorStop(0.25, `${color}55`);
    g.addColorStop(1, "#00000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  glowCache.set(color, t);
  return t;
}

const discCache = new Map<string, THREE.CanvasTexture>();

/** Flat radial disc — the glowing body of a galaxy. */
function discTexture(color: string): THREE.CanvasTexture {
  const hit = discCache.get(color);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 6, 128, 128, 128);
    g.addColorStop(0, `${color}bb`);
    g.addColorStop(0.35, `${color}33`);
    g.addColorStop(0.7, `${color}12`);
    g.addColorStop(1, "#00000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  discCache.set(color, t);
  return t;
}

/* ------------------------------------------------------------------ */
/* ModelStar — one open-weight model orbiting inside its galaxy        */
/* ------------------------------------------------------------------ */

function ModelStar({
  m,
  i,
  p,
  selected,
  dimmed,
  labelsOn,
  matrixFont,
  reduced,
  onPick,
  register,
}: {
  m: ModelSpec;
  i: number;
  p: Palette;
  selected: boolean;
  dimmed: boolean;
  labelsOn: boolean;
  matrixFont: boolean;
  reduced: boolean;
  onPick: (i: number) => void;
  register: (key: string, obj: THREE.Object3D | null) => void;
}) {
  const cat = CATEGORY_MAP[m.cat];
  const galIdx = CATEGORIES.findIndex((c) => c.key === m.cat);
  const size = sizeOf(m.weightsGb);
  const { r, a } = useMemo(() => {
    const siblings = MODELS.filter((x) => x.cat === m.cat);
    return starOrbitOf(siblings.indexOf(m), siblings.length);
  }, [m]);
  const speed = starSpeed(r) * (galIdx % 2 ? -1 : 1) * (1 + (i % 5) * 0.07);

  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const selRing = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const ang = useRef(a);
  const [hover, setHover] = useState(false);

  const glow = useMemo(() => glowTexture(m.accent), [m.accent]);
  const enLabel = m.en.includes(m.params) ? m.en : `${m.en} · ${m.params}`;
  const texs = useMemo(
    () => ({
      fa: makeLabelTexture(m.fa, p.green, matrixFont, 30),
      en: makeLabelTexture(enLabel, m.accent, false, 24),
    }),
    [m, p.green, matrixFont, enLabel],
  );
  useEffect(
    () => () => {
      texs.fa.dispose();
      texs.en.dispose();
    },
    [texs],
  );

  useEffect(() => {
    register(`m:${i}`, group.current);
    return () => register(`m:${i}`, null);
  }, [i, register]);

  useFrame(({ clock }, rawDelta) => {
    const dt = reduced ? 0 : Math.min(rawDelta, 0.05);
    const t = clock.elapsedTime;
    if (!selected && !reduced) ang.current += dt * speed;
    if (group.current) {
      const bob = reduced ? 0.06 : 0.06 + Math.sin(t * 0.9 + i * 1.7) * 0.05;
      group.current.position.set(Math.sin(ang.current) * r, bob, Math.cos(ang.current) * r);
    }
    if (mesh.current && !reduced) mesh.current.rotation.y += dt * 0.5;
    if (mat.current) {
      const target = dimmed ? 0.05 : selected ? 1.8 : hover ? 1.25 : 0.75;
      mat.current.emissiveIntensity +=
        (target - mat.current.emissiveIntensity) * (1 - Math.exp(-6 * dt));
    }
    if (selRing.current) {
      selRing.current.visible = selected || hover;
      if (selected && !reduced) selRing.current.rotation.z += dt * 1.2;
    }
  });

  const pick = (e: { stopPropagation: () => void }) => {
    if (dimmed) return;
    e.stopPropagation();
    onPick(i);
  };
  const over = (e: { stopPropagation: () => void }) => {
    if (dimmed) return;
    e.stopPropagation();
    setHover(true);
    document.body.style.cursor = "pointer";
  };
  const out = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHover(false);
    document.body.style.cursor = "auto";
  };

  const labelW = (tex: THREE.CanvasTexture, h: number) =>
    Math.min(3.2, h * (tex.image.width / tex.image.height));
  const active = labelsOn || hover || selected;
  // English names stay visible on the star chart even in overview;
  // Persian names join in when the galaxy is focused or the star is hot.
  const showFa = active && !dimmed;
  const showEn = !dimmed;

  return (
    <group ref={group}>
      {/* star body */}
      <mesh ref={mesh} onPointerOver={over} onPointerOut={out} onClick={pick}>
        <sphereGeometry args={[size, 36, 36]} />
        <meshStandardMaterial
          ref={mat}
          color="#07100b"
          emissive={m.accent}
          emissiveIntensity={0.75}
          roughness={0.4}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* glow halo */}
      <sprite scale={[size * 5.2, size * 5.2, 1]}>
        <spriteMaterial
          map={glow}
          transparent
          opacity={dimmed ? 0.05 : selected ? 0.5 : hover ? 0.42 : 0.24}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* selection ring */}
      <mesh ref={selRing} rotation-x={-Math.PI / 2} visible={false}>
        <torusGeometry args={[size * 1.7, 0.012, 8, 48]} />
        <meshBasicMaterial color={m.accent} transparent opacity={0.85} toneMapped={false} />
      </mesh>

      {/* floating labels — EN always on, FA appears when focused/hovered */}
      <Billboard position={[0, size * 2 + 0.9, 0]} visible={showEn}>
        {showFa && (
          <mesh>
            <planeGeometry args={[labelW(texs.fa, 0.3), 0.3]} />
            <meshBasicMaterial map={texs.fa} transparent opacity={1} toneMapped={false} />
          </mesh>
        )}
        <mesh position={[0, showFa ? -0.34 : 0, 0]}>
          <planeGeometry args={[labelW(texs.en, showFa ? 0.19 : 0.24), showFa ? 0.19 : 0.24]} />
          <meshBasicMaterial
            map={texs.en}
            transparent
            opacity={active ? 1 : 0.62}
            toneMapped={false}
          />
        </mesh>
      </Billboard>

      {hover && !selected && !dimmed && (
        <Html
          position={[0, size * 2 + 1.6, 0]}
          center
          zIndexRange={[15, 10]}
          style={{ pointerEvents: "none" }}
        >
          <div className="rack-tip" dir="rtl">
            <p className="text-xs font-bold text-primary whitespace-nowrap">{m.fa}</p>
            <p
              className="mt-1 text-[11px] font-bold whitespace-nowrap"
              style={{ color: cat.color }}
            >
              {cat.fa} · {cat.descFa}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground whitespace-nowrap">{m.tagFa}</p>
            <p className="mt-1 font-mono text-[10px] text-accent" dir="ltr">
              {m.en} · {m.params}
            </p>
            <p className="mt-1 text-[10px] text-primary">کلیک: سخت‌افزار و قیمت</p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Galaxy — one category: core, sign, orbit paths, stardust, stars     */
/* ------------------------------------------------------------------ */

function Galaxy({
  cat,
  dimmed,
  filterActive,
  reduced,
  matrixFont,
  register,
  onCorePick,
  children,
}: {
  cat: ModelCategory;
  dimmed: boolean;
  filterActive: boolean;
  reduced: boolean;
  matrixFont: boolean;
  register: (key: string, obj: THREE.Object3D | null) => void;
  onCorePick: (cat: ModelCategory) => void;
  children: React.ReactNode;
}) {
  const spec = CATEGORY_MAP[cat];
  const idx = CATEGORIES.findIndex((c) => c.key === cat);
  const center = useMemo(() => galaxyCenterOf(cat), [cat]);
  const tilt = useMemo(() => galaxyTiltOf(idx), [idx]);
  const count = MODELS.filter((m) => m.cat === cat).length;
  const maxR = 2.9 + count * 0.36;

  const anchor = useRef<THREE.Group>(null);
  const coreWire = useRef<THREE.Mesh>(null);
  const coreRing = useRef<THREE.Mesh>(null);
  const [coreHover, setCoreHover] = useState(false);

  const coreOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setCoreHover(true);
    document.body.style.cursor = "pointer";
  };
  const coreOut = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setCoreHover(false);
    document.body.style.cursor = "auto";
  };
  const coreClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onCorePick(cat);
  };

  const texs = useMemo(
    () => ({
      fa: makeLabelTexture(spec.fa, spec.color, matrixFont, 52),
      en: makeLabelTexture(`${spec.en} × ${count}`, spec.color, false, 26),
    }),
    [spec, count, matrixFont],
  );
  useEffect(
    () => () => {
      texs.fa.dispose();
      texs.en.dispose();
    },
    [texs],
  );

  useEffect(() => {
    register(`c:${cat}`, anchor.current);
    return () => register(`c:${cat}`, null);
  }, [cat, register]);

  useFrame((_, rawDelta) => {
    const dt = reduced ? 0 : Math.min(rawDelta, 0.05);
    if (coreWire.current) {
      coreWire.current.rotation.y += dt * 0.3;
      coreWire.current.rotation.x -= dt * 0.12;
    }
    if (coreRing.current) coreRing.current.rotation.z += dt * 0.5;
  });

  return (
    <group position={center} rotation={tilt}>
      {/* glowing galactic body */}
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[maxR * 1.5, 48]} />
        <meshBasicMaterial
          map={discTexture(spec.color)}
          transparent
          opacity={dimmed ? 0.1 : 0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <Sparkles
        count={COMPACT ? 16 : 44}
        scale={[maxR * 2.1, 1.3, maxR * 2.1]}
        size={1.7}
        speed={0.2}
        color={spec.color}
        opacity={dimmed ? 0.07 : 0.38}
      />

      {/* core sun — hover shows the category name, click flies to this galaxy */}
      <group onPointerOver={coreOver} onPointerOut={coreOut} onClick={coreClick}>
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshBasicMaterial color={spec.color} toneMapped={false} />
        </mesh>
        <sprite scale={[3.4, 3.4, 1]}>
          <spriteMaterial
            map={glowTexture(spec.color)}
            transparent
            opacity={dimmed ? 0.1 : coreHover ? 0.85 : 0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
        <mesh ref={coreWire}>
          <icosahedronGeometry args={[0.95, 1]} />
          <meshBasicMaterial
            color={spec.color}
            wireframe
            transparent
            opacity={dimmed ? 0.06 : coreHover ? 0.75 : 0.3}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={coreRing} rotation-x={Math.PI / 2.4}>
          <torusGeometry args={[1.25, 0.012, 8, 64]} />
          <meshBasicMaterial
            color={spec.color}
            transparent
            opacity={dimmed ? 0.08 : coreHover ? 0.9 : 0.5}
            toneMapped={false}
          />
        </mesh>
      </group>
      {coreHover && !dimmed && (
        <Html
          position={[0, 2.1, 0]}
          center
          zIndexRange={[15, 10]}
          style={{ pointerEvents: "none" }}
        >
          <div className="rack-tip" dir="rtl">
            <p className="text-sm font-black whitespace-nowrap" style={{ color: spec.color }}>
              {spec.fa}
            </p>
            <p
              className="mt-0.5 font-mono text-[11px] font-bold text-accent whitespace-nowrap"
              dir="ltr"
            >
              {spec.en} · {count} MODELS
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground whitespace-nowrap">
              {spec.descFa}
            </p>
            <p className="mt-1.5 text-[10px] text-primary">کلیک روی هسته: سفر به این کهکشان</p>
          </div>
        </Html>
      )}
      <pointLight
        intensity={dimmed ? 0.3 : 1.1}
        distance={maxR * 3.2}
        decay={2}
        color={spec.color}
      />

      {/* category sign — always readable, floats above the core */}
      <Billboard position={[0, maxR * 0.62 + 1.35, 0]}>
        <mesh>
          <planeGeometry
            args={[Math.min(5.6, 0.66 * (texs.fa.image.width / texs.fa.image.height)), 0.66]}
          />
          <meshBasicMaterial
            map={texs.fa}
            transparent
            opacity={dimmed ? 0.22 : 1}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, -0.47, 0]}>
          <planeGeometry
            args={[Math.min(3.2, 0.3 * (texs.en.image.width / texs.en.image.height)), 0.3]}
          />
          <meshBasicMaterial
            map={texs.en}
            transparent
            opacity={dimmed ? 0.14 : 0.92}
            toneMapped={false}
          />
        </mesh>
      </Billboard>

      <group ref={anchor} />

      {/* one faint orbit path per star, centered on the galaxy core */}
      {MODELS.map((m) =>
        m.cat === cat ? (
          <mesh key={`o-${m.id}`} rotation-x={-Math.PI / 2}>
            <ringGeometry
              args={[
                starOrbitOf(MODELS.filter((x) => x.cat === cat).indexOf(m), count).r - 0.02,
                starOrbitOf(MODELS.filter((x) => x.cat === cat).indexOf(m), count).r + 0.02,
                128,
              ]}
            />
            <meshBasicMaterial
              color={spec.color}
              transparent
              opacity={dimmed ? 0.02 : filterActive ? 0.22 : 0.1}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        ) : null,
      )}

      {/* model stars live inside the tilted galaxy plane */}
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Camera — overview orbit, galaxy glide + orbit, star follow          */
/* ------------------------------------------------------------------ */

const lookTmp = new THREE.Vector3();
const posTmp = new THREE.Vector3();
const lookHome = new THREE.Vector3(0, 0.6, 0);

function HoloRig({
  nav,
  regs,
  focus,
  filter,
  reduced,
}: {
  nav: React.RefObject<NavState>;
  regs: React.RefObject<Registry>;
  focus: number;
  filter: ModelCategory | null;
  reduced: boolean;
}) {
  const look = useRef(new THREE.Vector3(0, 0.6, 0));
  useFrame(({ camera, pointer, size }, rawDelta) => {
    const n = nav.current;
    if (!n) return;
    const dt = Math.min(rawDelta, 0.05);
    const mobile = size.width < 640;
    n.idle += dt;
    const k = 1 - Math.exp(-2.8 * dt);

    if (focus >= 0 && regs.current?.get(`m:${focus}`)) {
      // follow the (paused) selected star — drag orbits around it
      regs.current!.get(`m:${focus}`)!.getWorldPosition(lookTmp);
      const azP = Math.atan2(lookTmp.x, lookTmp.z) + n.az;
      const d = mobile ? 3.6 : 4.4;
      posTmp.set(lookTmp.x + Math.sin(azP) * d, lookTmp.y + 1.4, lookTmp.z + Math.cos(azP) * d);
      camera.position.lerp(posTmp, k);
      look.current.lerp(lookTmp, k);
    } else if (filter && regs.current?.get(`c:${filter}`)) {
      // orbit the selected galaxy — drag swings around its core
      regs.current!.get(`c:${filter}`)!.getWorldPosition(lookTmp);
      const d = galaxyViewD();
      posTmp.set(
        lookTmp.x + Math.sin(n.az) * d,
        lookTmp.y + (mobile ? 5.2 : 4.4),
        lookTmp.z + Math.cos(n.az) * d,
      );
      camera.position.lerp(posTmp, k);
      lookTmp.y += 0.6;
      look.current.lerp(lookTmp, k);
    } else {
      // slow cinematic orbit around the whole galaxy cluster
      if (!n.dragging && !reduced && n.idle > 3) n.azT += dt * 0.04;
      let d = n.azT - n.az;
      d = ((((d + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
      n.az += d * k;
      n.rad += (n.radT - n.rad) * k;
      n.h += (n.hT - n.h) * k;
      const px = reduced ? 0 : pointer.x;
      const py = reduced ? 0 : pointer.y;
      posTmp.set(Math.sin(n.az) * n.rad + px * 0.8, n.h + py * 0.5, Math.cos(n.az) * n.rad);
      camera.position.lerp(posTmp, k);
      look.current.lerp(lookHome, k);
    }
    camera.lookAt(look.current);
  });
  return null;
}

/** Drag horizontally to orbit (touch-friendly: vertical swipes still scroll the page). */
function NavControls({ nav }: { nav: React.RefObject<NavState> }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    let active = false;
    let lastX = 0;
    let moved = 0;
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      active = true;
      moved = 0;
      lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      const n = nav.current;
      if (n && moved > 5) {
        n.dragging = true;
        n.az -= dx * 0.006;
        n.azT = n.az;
        n.idle = 0;
        document.body.style.cursor = "grabbing";
      }
    };
    const up = () => {
      active = false;
      const n = nav.current;
      if (n) n.dragging = false;
      document.body.style.cursor = "auto";
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl, nav]);
  return null;
}

/* ------------------------------------------------------------------ */
/* World — deep space: backdrop, 9 galaxies, 61 stars                  */
/* ------------------------------------------------------------------ */

function Nebulae() {
  const blobs = useMemo(
    () => [
      { color: "#b18cff", pos: [-38, 6, -30] as const, s: 52, o: 0.08 },
      { color: "#4dff88", pos: [40, -4, -22] as const, s: 46, o: 0.07 },
      { color: "#ff9e64", pos: [14, 9, 42] as const, s: 50, o: 0.06 },
      { color: "#6fd8dd", pos: [-26, -7, 36] as const, s: 44, o: 0.06 },
      { color: "#93c5fd", pos: [46, 5, 20] as const, s: 40, o: 0.05 },
      { color: "#ffd166", pos: [-46, 2, 8] as const, s: 40, o: 0.05 },
    ],
    [],
  );
  return (
    <>
      {blobs.map((b, i) => (
        <sprite key={i} position={[b.pos[0], b.pos[1], b.pos[2]]} scale={[b.s, b.s, 1]}>
          <spriteMaterial
            map={glowTexture(b.color)}
            transparent
            opacity={b.o}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </>
  );
}

function World({
  p,
  nav,
  regs,
  focus,
  filter,
  reduced,
  matrixFont,
  onPick,
  onCorePick,
}: {
  p: Palette;
  nav: React.RefObject<NavState>;
  regs: React.RefObject<Registry>;
  focus: number;
  filter: ModelCategory | null;
  reduced: boolean;
  matrixFont: boolean;
  onPick: (i: number) => void;
  onCorePick: (cat: ModelCategory) => void;
}) {
  const register = (key: string, obj: THREE.Object3D | null) => {
    const map = regs.current;
    if (!map) return;
    if (obj) map.set(key, obj);
    else map.delete(key);
  };

  return (
    <>
      <color attach="background" args={[p.void]} />
      <fogExp2 attach="fog" args={[p.void, 0.0032]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 18, 10]} intensity={0.5} color={p.light} />

      <Stars
        radius={220}
        depth={110}
        count={COMPACT ? 2400 : 5600}
        factor={4.6}
        saturation={0.4}
        fade
        speed={reduced ? 0 : 0.6}
      />
      <Nebulae />

      {CATEGORIES.map((c) => (
        <Galaxy
          key={c.key}
          cat={c.key}
          dimmed={filter !== null && filter !== c.key}
          filterActive={filter === c.key}
          reduced={reduced}
          matrixFont={matrixFont}
          register={register}
          onCorePick={onCorePick}
        >
          {MODELS.map((m, i) =>
            m.cat === c.key ? (
              <ModelStar
                key={m.id}
                m={m}
                i={i}
                p={p}
                selected={focus === i}
                dimmed={filter !== null && m.cat !== filter}
                labelsOn={filter === c.key}
                matrixFont={matrixFont}
                reduced={reduced}
                onPick={onPick}
                register={register}
              />
            ) : null,
          )}
        </Galaxy>
      ))}

      <HoloRig nav={nav} regs={regs} focus={focus} filter={filter} reduced={reduced} />
      <NavControls nav={nav} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Entry                                                               */
/* ------------------------------------------------------------------ */

export default function GalaxyScene({
  focus,
  catFilter,
  onPick,
  onCorePick,
}: {
  focus: number;
  catFilter: ModelCategory | null;
  onPick: (i: number) => void;
  onCorePick: (cat: ModelCategory) => void;
}) {
  const [p] = useState(getPalette);
  const [reduced] = useState(
    () =>
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const matrixFont = useMatrixFont();
  const regs = useRef<Registry>(new Map());
  const nav = useRef<NavState>({
    az: 2.4,
    azT: 2.4,
    rad: overviewRad(),
    radT: overviewRad(),
    h: overviewH(),
    hT: overviewH(),
    idle: 0,
    dragging: false,
  });

  // recentre when selection clears / filter changes
  useEffect(() => {
    const n = nav.current;
    if (focus >= 0) {
      n.az = 0;
      n.azT = 0;
      n.idle = 0;
    } else if (catFilter) {
      const c = galaxyCenterOf(catFilter);
      n.az = Math.atan2(c.x, c.z);
      n.azT = n.az;
      n.idle = 0;
    } else {
      n.radT = overviewRad();
      n.hT = overviewH();
      n.idle = 0;
    }
  }, [focus, catFilter]);

  return (
    <Canvas
      dpr={COMPACT ? [0.65, 1] : [1, 1.75]}
      camera={{
        position: [Math.sin(2.4) * overviewRad(), overviewH(), Math.cos(2.4) * overviewRad()],
        fov: 55,
        near: 0.1,
        far: 900,
      }}
      gl={{
        antialias: !COMPACT,
        powerPreference: COMPACT ? "low-power" : "high-performance",
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense
        fallback={
          <Html center>
            <span className="font-mono text-primary text-xs">booting galaxy…</span>
          </Html>
        }
      >
        <World
          p={p}
          nav={nav}
          regs={regs}
          focus={focus}
          filter={catFilter}
          reduced={reduced}
          matrixFont={matrixFont}
          onPick={onPick}
          onCorePick={onCorePick}
        />
      </Suspense>
      {/* NOTE: no EffectComposer here — @react-three/postprocessing takes over
          the render loop and (in this scene) silently stops all output.
          The glow aesthetic comes from additive glow sprites + disc textures. */}
    </Canvas>
  );
}
