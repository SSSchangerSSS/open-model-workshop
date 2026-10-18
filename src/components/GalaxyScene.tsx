import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Sparkles, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  CATEGORIES,
  CATEGORY_MAP,
  MODELS,
  type ModelCategory,
  type ModelSpec,
} from "@/lib/sizing";
import { getPalette, makeLabelTexture, type Palette } from "./DatacenterScene";

/* ------------------------------------------------------------------ */
/* Galaxy layout — one orbit ring per category, one planet per model   */
/* ------------------------------------------------------------------ */

export const CAT_INDEX = Object.fromEntries(
  CATEGORIES.map((c, i) => [c.key, i]),
) as Record<ModelCategory, number>;

export const ringR = (cat: ModelCategory) => 7.5 + CAT_INDEX[cat] * 3; // 7.5 → 28.5

/** Base angle of model i on its category ring. */
export function baseAngleOf(i: number): number {
  const m = MODELS[i];
  if (!m) return 0;
  const r = ringR(m.cat);
  const idx = CAT_INDEX[m.cat];
  let count = 0;
  let j = 0;
  MODELS.forEach((x, k) => {
    if (x.cat !== m.cat) return;
    if (k < i) j++;
    count++;
  });
  return (j + 0.5) * ((Math.PI * 2) / count) + idx * 0.9;
}

/** Kepler-ish angular speed — inner rings orbit faster (rad/s). */
const speedOf = (cat: ModelCategory) => 0.05 / Math.sqrt(ringR(cat) / 7.5);

/** Planet radius from model size (log bucket). */
const sizeOf = (w: number) =>
  w < 1 ? 0.26 : w < 6 ? 0.33 : w < 20 ? 0.42 : w < 60 ? 0.5 : w < 150 ? 0.6 : w < 400 ? 0.72 : w < 1200 ? 0.84 : 0.95;

const freeRad = () => (typeof window !== "undefined" && window.innerWidth < 640 ? 40 : 30);
const freeH = () => (typeof window !== "undefined" && window.innerWidth < 640 ? 22 : 16);

/* Camera walk state shared between DOM hints and the in-canvas rig */
export type NavState = {
  az: number; // user drag offset (also used around a focused planet)
  azT: number;
  rad: number;
  radT: number;
  h: number;
  hT: number;
  idle: number;
  dragging: boolean;
};

/** Registry of clickable objects for the camera rig (planets + category anchors). */
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
    g.addColorStop(0.25, `${color}66`);
    g.addColorStop(1, "#00000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  glowCache.set(color, t);
  return t;
}

/* ------------------------------------------------------------------ */
/* Planet — one open-weight model orbiting its category ring           */
/* ------------------------------------------------------------------ */

function Planet({
  m,
  i,
  p,
  selected,
  dimmed,
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
  matrixFont: boolean;
  reduced: boolean;
  onPick: (i: number) => void;
  register: (key: string, obj: THREE.Object3D | null) => void;
}) {
  const cat = CATEGORY_MAP[m.cat];
  const radius = ringR(m.cat);
  const size = sizeOf(m.weightsGb);
  const speed = speedOf(m.cat);

  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const selRing = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const ang = useRef(baseAngleOf(i));
  const [hover, setHover] = useState(false);

  const glow = useMemo(() => glowTexture(m.accent), [m.accent]);
  const texs = useMemo(
    () => ({
      fa: makeLabelTexture(m.fa, p.green, matrixFont, 30),
      en: makeLabelTexture(`${m.en} · ${m.params}`, m.accent, false, 24),
    }),
    [m, p.green, matrixFont],
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
      const a = ang.current;
      const bob = reduced ? 0.15 : 0.15 + Math.sin(t * 0.8 + i) * 0.07;
      group.current.position.set(Math.sin(a) * radius, bob, Math.cos(a) * radius);
    }
    if (mesh.current && !reduced) mesh.current.rotation.y += dt * 0.4;
    if (mat.current) {
      const target = dimmed ? 0.04 : selected ? 1.7 : hover ? 1.15 : 0.6;
      mat.current.emissiveIntensity += (target - mat.current.emissiveIntensity) * (1 - Math.exp(-6 * dt));
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

  const labelW = (tex: THREE.CanvasTexture, h: number) => Math.min(3.4, h * (tex.image.width / tex.image.height));

  return (
    <group ref={group}>
      {/* planet body */}
      <mesh
        ref={mesh}
        onPointerOver={over}
        onPointerOut={out}
        onClick={pick}
      >
        <sphereGeometry args={[size, 40, 40]} />
        <meshStandardMaterial
          ref={mat}
          color="#07100b"
          emissive={m.accent}
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* glow halo — camera-facing sprite */}
      <sprite scale={[size * 5.4, size * 5.4, 1]}>
        <spriteMaterial
          map={glow}
          transparent
          opacity={dimmed ? 0.05 : selected ? 0.5 : hover ? 0.4 : 0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* selection / hover ring */}
      <mesh ref={selRing} rotation-x={-Math.PI / 2} visible={false}>
        <torusGeometry args={[size * 1.75, 0.014, 8, 48]} />
        <meshBasicMaterial color={m.accent} transparent opacity={0.85} toneMapped={false} />
      </mesh>

      {/* floating labels */}
      <mesh position={[0, size * 2 + 0.98, 0]}>
        <planeGeometry args={[labelW(texs.fa, 0.3), 0.3]} />
        <meshBasicMaterial
          map={texs.fa}
          transparent
          opacity={dimmed ? 0.08 : 1}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, size * 2 + 0.58, 0]}>
        <planeGeometry args={[labelW(texs.en, 0.19), 0.19]} />
        <meshBasicMaterial
          map={texs.en}
          transparent
          opacity={dimmed ? 0.06 : 0.95}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {hover && !selected && (
        <Html
          position={[0, size * 2 + 1.7, 0]}
          center
          zIndexRange={[15, 10]}
          style={{ pointerEvents: "none" }}
        >
          <div className="rack-tip" dir="rtl">
            <p className="text-xs font-bold text-primary whitespace-nowrap">{m.fa}</p>
            <p className="mt-1 text-[11px] font-bold whitespace-nowrap" style={{ color: cat.color }}>
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
/* Category ring — orbit path + stardust + sector sign + camera anchor */
/* ------------------------------------------------------------------ */

function RingSystem({
  cat,
  dimmed,
  reduced,
  matrixFont,
  register,
}: {
  cat: ModelCategory;
  dimmed: boolean;
  reduced: boolean;
  matrixFont: boolean;
  register: (key: string, obj: THREE.Object3D | null) => void;
}) {
  const spec = CATEGORY_MAP[cat];
  const r = ringR(cat);
  const idx = CAT_INDEX[cat];
  const signAng = idx * 0.9 + Math.PI; // deterministic position per ring
  const anchor = useRef<THREE.Group>(null);
  const sign = useRef<THREE.Group>(null);

  const count = MODELS.filter((m) => m.cat === cat).length;
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

  useFrame(({ clock }, rawDelta) => {
    const dt = reduced ? 0 : Math.min(rawDelta, 0.05);
    if (sign.current && !reduced)
      sign.current.position.y = 2.7 + Math.sin(clock.elapsedTime * 0.7 + idx) * 0.12;
  });

  return (
    <>
      {/* orbit path */}
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[r - 0.035, r + 0.035, 160]} />
        <meshBasicMaterial
          color={spec.color}
          transparent
          opacity={dimmed ? 0.05 : 0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* stardust along the ring */}
      <Sparkles
        count={60}
        scale={[r * 2, 1.1, r * 2]}
        size={1.8}
        speed={0.22}
        color={spec.color}
        opacity={dimmed ? 0.08 : 0.4}
      />
      {/* category sign + camera anchor */}
      <group ref={sign} position={[Math.sin(signAng) * r, 2.7, Math.cos(signAng) * r]}>
        <mesh>
          <planeGeometry
            args={[Math.min(6.5, 0.72 * (texs.fa.image.width / texs.fa.image.height)), 0.72]}
          />
          <meshBasicMaterial
            map={texs.fa}
            transparent
            opacity={dimmed ? 0.12 : 1}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.52, 0]}>
          <planeGeometry
            args={[Math.min(3.6, 0.34 * (texs.en.image.width / texs.en.image.height)), 0.34]}
          />
          <meshBasicMaterial
            map={texs.en}
            transparent
            opacity={dimmed ? 0.1 : 0.9}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <sprite scale={[5.2, 5.2, 1]} position={[0, -0.1, -0.4]}>
          <spriteMaterial
            map={glowTexture(spec.color)}
            transparent
            opacity={dimmed ? 0.06 : 0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      </group>
      <group ref={anchor} position={[Math.sin(signAng) * r, 0, Math.cos(signAng) * r]} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Galactic core — the "هوش برتر" sun                                  */
/* ------------------------------------------------------------------ */

function GalacticCore({ p, reduced }: { p: Palette; reduced: boolean }) {
  const wire = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const [small] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  const coreTex = useMemo(() => makeLabelTexture("هوش برتر · GALACTIC CORE", p.green, true, 44), [p.green]);
  useEffect(() => () => coreTex.dispose(), [coreTex]);
  useFrame((_, rawDelta) => {
    const dt = reduced ? 0 : Math.min(rawDelta, 0.05);
    if (wire.current) {
      wire.current.rotation.y += dt * 0.18;
      wire.current.rotation.x -= dt * 0.07;
    }
    if (ringA.current) ringA.current.rotation.z += dt * 0.4;
    if (ringB.current) ringB.current.rotation.z -= dt * 0.28;
  });
  return (
    <group scale={small ? 0.8 : 1}>
      {/* sun body */}
      <mesh>
        <sphereGeometry args={[1.65, 48, 48]} />
        <meshBasicMaterial color={p.green} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.85, 32, 32]} />
        <meshBasicMaterial color={p.green} transparent opacity={0.18} toneMapped={false} />
      </mesh>
      {/* corona wireframe + orbit rings */}
      <mesh ref={wire}>
        <icosahedronGeometry args={[2.7, 1]} />
        <meshBasicMaterial color={p.cyan} wireframe transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <mesh ref={ringA} rotation-x={Math.PI / 2.5}>
        <torusGeometry args={[3.4, 0.02, 8, 80]} />
        <meshBasicMaterial color={p.green} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} rotation-x={Math.PI / 1.75} rotation-y={0.6}>
        <torusGeometry args={[4.1, 0.012, 8, 80]} />
        <meshBasicMaterial color={p.cyan} transparent opacity={0.35} toneMapped={false} />
      </mesh>
      {/* brand sign */}
      <mesh position={[0, 5.1, 0]}>
        <planeGeometry
          args={[Math.min(7.2, 0.85 * (coreTex.image.width / coreTex.image.height)), 0.85]}
        />
        <meshBasicMaterial
          map={coreTex}
          transparent
          opacity={0.95}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight intensity={2.4} distance={0} decay={0} color={p.green} />
      <Sparkles count={130} scale={[10, 5, 10]} size={2.2} speed={0.25} color={p.green} opacity={0.55} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Nebulae + galactic disc — the deep-space backdrop                   */
/* ------------------------------------------------------------------ */

function Nebulae() {
  const blobs = useMemo(
    () => [
      { color: "#b18cff", pos: [-20, 5, -16] as const, s: 42, o: 0.09 },
      { color: "#4dff88", pos: [22, -3, -12] as const, s: 36, o: 0.07 },
      { color: "#ff9e64", pos: [8, 7, 24] as const, s: 40, o: 0.06 },
      { color: "#6fd8dd", pos: [-14, -6, 20] as const, s: 34, o: 0.06 },
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

function GalacticDisc({ p }: { p: Palette }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
      g.addColorStop(0, "rgba(12,34,20,0.85)");
      g.addColorStop(0.55, "rgba(8,22,14,0.4)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 512);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.55, 0]}>
      <circleGeometry args={[34, 64]} />
      <meshBasicMaterial map={tex} transparent opacity={0.75} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Camera — overview orbit, category glide, planet-follow              */
/* ------------------------------------------------------------------ */

const lookTmp = new THREE.Vector3();
const posTmp = new THREE.Vector3();
const dirTmp = new THREE.Vector3();

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
  const look = useRef(new THREE.Vector3(0, 0, 0));
  useFrame(({ camera, pointer, size }, rawDelta) => {
    const n = nav.current;
    if (!n) return;
    const dt = Math.min(rawDelta, 0.05);
    const mobile = size.width < 640;
    n.idle += dt;
    const k = 1 - Math.exp(-2.8 * dt);

    if (focus >= 0 && regs.current?.get(`m:${focus}`)) {
      // follow the (paused) planet — user drag orbits around it
      regs.current!.get(`m:${focus}`)!.getWorldPosition(lookTmp);
      const azP = Math.atan2(lookTmp.x, lookTmp.z) + n.az;
      const d = mobile ? 3.6 : 4.6;
      posTmp.set(lookTmp.x + Math.sin(azP) * d, lookTmp.y + 1.5, lookTmp.z + Math.cos(azP) * d);
      camera.position.lerp(posTmp, k);
      look.current.lerp(lookTmp, k);
    } else if (filter && regs.current?.get(`c:${filter}`)) {
      // glide between core and the selected ring, facing its sign
      regs.current!.get(`c:${filter}`)!.getWorldPosition(lookTmp);
      posTmp.set(lookTmp.x * 0.52, 6.4, lookTmp.z * 0.52);
      camera.position.lerp(posTmp, k);
      look.current.lerp(lookTmp, k);
    } else {
      // overview orbit around the core
      if (!n.dragging && !reduced && n.idle > 3) n.azT += dt * 0.045;
      let d = n.azT - n.az;
      d = ((((d + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
      n.az += d * k;
      n.rad += (n.radT - n.rad) * k;
      n.h += (n.hT - n.h) * k;
      const px = reduced ? 0 : pointer.x;
      const py = reduced ? 0 : pointer.y;
      posTmp.set(Math.sin(n.az) * n.rad + px * 0.6, n.h + py * 0.4, Math.cos(n.az) * n.rad);
      camera.position.lerp(posTmp, k);
      look.current.lerp(dirTmp.set(0, 0, 0), k);
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
        n.az -= dx * 0.006; // direct control in both modes
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
/* World — tilted galaxy: core, 8 rings, 39 planets                    */
/* ------------------------------------------------------------------ */

function Galaxy({
  p,
  nav,
  regs,
  focus,
  filter,
  reduced,
  matrixFont,
  onPick,
}: {
  p: Palette;
  nav: React.RefObject<NavState>;
  regs: React.RefObject<Registry>;
  focus: number;
  filter: ModelCategory | null;
  reduced: boolean;
  matrixFont: boolean;
  onPick: (i: number) => void;
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
      <fogExp2 attach="fog" args={[p.void, 0.0065]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 14, 8]} intensity={0.5} color={p.light} />

      <Stars
        radius={160}
        depth={80}
        count={6500}
        factor={4.2}
        saturation={0.35}
        fade
        speed={reduced ? 0 : 0.7}
      />
      <Nebulae />

      {/* tilted galactic plane */}
      <group rotation-x={-0.42}>
        <GalacticDisc p={p} />
        <GalacticCore p={p} reduced={reduced} />

        {CATEGORIES.map((c) => (
          <RingSystem
            key={c.key}
            cat={c.key}
            dimmed={filter !== null && filter !== c.key}
            reduced={reduced}
            matrixFont={matrixFont}
            register={register}
          />
        ))}

        {MODELS.map((m, i) => (
          <Planet
            key={m.id}
            m={m}
            i={i}
            p={p}
            selected={focus === i}
            dimmed={filter !== null && m.cat !== filter}
            matrixFont={matrixFont}
            reduced={reduced}
            onPick={onPick}
            register={register}
          />
        ))}
      </group>

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
}: {
  focus: number;
  catFilter: ModelCategory | null;
  onPick: (i: number) => void;
}) {
  const [p] = useState(getPalette);
  const [reduced] = useState(
    () =>
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const matrixFont = useMatrixFont();
  const regs = useRef<Registry>(new Map());
  const nav = useRef<NavState>({
    az: 2.2,
    azT: 2.2,
    rad: freeRad(),
    radT: freeRad(),
    h: freeH(),
    hT: freeH(),
    idle: 0,
    dragging: false,
  });

  // reset orbit offset on planet pick; recentre the overview on filter clear
  useEffect(() => {
    const n = nav.current;
    if (focus >= 0) {
      n.az = 0;
      n.azT = 0;
      n.idle = 0;
    } else if (!catFilter) {
      n.radT = freeRad();
      n.hT = freeH();
      n.idle = 0;
    }
  }, [focus, catFilter]);

  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{
        position: [Math.sin(2.2) * freeRad(), freeH(), Math.cos(2.2) * freeRad()],
        fov: 55,
      }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense
        fallback={
          <Html center>
            <span className="font-mono text-primary text-xs">booting galaxy…</span>
          </Html>
        }
      >
        <Galaxy
          p={p}
          nav={nav}
          regs={regs}
          focus={focus}
          filter={catFilter}
          reduced={reduced}
          matrixFont={matrixFont}
          onPick={onPick}
        />
      </Suspense>
      <EffectComposer>
        <Bloom mipmapBlur intensity={1.0} luminanceThreshold={0.16} luminanceSmoothing={0.25} />
      </EffectComposer>
    </Canvas>
  );
}
