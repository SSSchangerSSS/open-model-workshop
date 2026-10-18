import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-progress";
import { tourZ } from "@/lib/tour";
import { MatrixRain } from "./MatrixRain";
import {
  getPalette,
  makeLabelTexture,
  RACK_PANEL_VERT,
  RACK_PANEL_FRAG,
  type Palette,
} from "@/lib/three-shared";
import { isCompactDevice } from "@/lib/device";

export { getPalette, makeLabelTexture, RACK_PANEL_VERT, RACK_PANEL_FRAG };
export type { Palette };

/** Bloom is desktop-only and lives in its own lazy chunk (BloomLayer). */
const BloomLayer = lazy(() => import("./BloomLayer"));
const COMPACT = isCompactDevice();

export type SceneMode = "scroll" | "fixed";

// Palette lives in @/lib/three-shared (shared with GalaxyScene)

/* ------------------------------------------------------------------ */
/* Camera — guided scroll tour + pointer parallax + speed FOV kick     */
/* ------------------------------------------------------------------ */

const WALK_START = 12;

function CameraRig({ mode, reduced }: { mode: SceneMode; reduced: boolean }) {
  const drift = useRef(0);
  const prevP = useRef(0);
  const fov = useRef(52);
  useFrame(({ camera, pointer, size }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    drift.current += dt;
    const k = reduced ? 1 : 1 - Math.exp(-2.6 * dt);
    const mobile = size.width < 640;
    const px = reduced ? 0 : pointer.x;
    const py = reduced ? 0 : pointer.y;

    let tz: number;
    let ty: number;
    if (mode === "scroll") {
      const p = Math.min(1, Math.max(0, scrollStore.target));
      tz = tourZ(p) + (mobile ? 3 : 0);
      ty = (mobile ? 2.05 : 1.7) + py * 0.3;
      // scroll velocity widens the FOV a touch — a "speed" feeling
      const vel = Math.abs(p - prevP.current);
      prevP.current = p;
      const targetFov = 52 + Math.min(8, vel * 380);
      fov.current += (targetFov - fov.current) * (1 - Math.exp(-3.5 * dt));
      const cam = camera as THREE.PerspectiveCamera;
      if (Math.abs(cam.fov - fov.current) > 0.01) {
        cam.fov = fov.current;
        cam.updateProjectionMatrix();
      }
    } else {
      tz = -8 + Math.sin(drift.current * 0.12) * 1.6;
      ty = 1.75 + py * 0.25;
    }
    const tx = px * 0.55 + Math.sin(drift.current * 0.07) * 0.15;

    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.position.z += (tz - camera.position.z) * k;
    camera.lookAt(camera.position.x * 0.35, 1.45, camera.position.z - 8);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Floor & ceiling                                                     */
/* ------------------------------------------------------------------ */

function Floor({ p }: { p: Palette }) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = p.tile;
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = p.metal;
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, 252, 252);
      ctx.fillStyle = p.metal;
      for (let i = 0; i < 28; i++) ctx.fillRect(20 + i * 8, 120, 3, 16);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(24, 56);
    return t;
  }, [p]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -45]} receiveShadow>
      <planeGeometry args={[26, 190]} />
      <meshStandardMaterial map={texture} metalness={0.7} roughness={0.3} />
    </mesh>
  );
}

function Ceiling({ p }: { p: Palette }) {
  const strips = useMemo(() => {
    const arr: number[] = [];
    for (let z = 8; z > -68; z -= 4.5) arr.push(z);
    return arr;
  }, []);
  return (
    <group>
      <mesh rotation-x={Math.PI / 2} position={[0, 3.55, -45]}>
        <planeGeometry args={[26, 190]} />
        <meshStandardMaterial color={p.void} metalness={0.4} roughness={0.9} />
      </mesh>
      {strips.map((z, i) => (
        <mesh key={i} position={[0, 3.42, z]}>
          <boxGeometry args={[1.7, 0.05, 0.32]} />
          <meshStandardMaterial
            color={p.light}
            emissive={i % 3 === 0 ? p.cyan : p.green}
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Server racks — procedural LED panel shader + hover/pick/proximity   */
/* ------------------------------------------------------------------ */

// RACK_PANEL_VERT / RACK_PANEL_FRAG live in @/lib/three-shared

export const MODEL_LABELS = [
  { short: "QWEN", label: "QWEN · چت فارسی" },
  { short: "LLAMA", label: "LLAMA · ایجنت سازمانی" },
  { short: "DEEPSEEK", label: "DEEPSEEK · استدلال" },
  { short: "MISTRAL", label: "MISTRAL · استنتاج سریع" },
] as const;

const INFRA_LABELS = [
  "N8N · WORKFLOWS",
  "FLOWISE · RAG",
  "GPU RIG · RTX 4090",
  "ذخیره‌سازی · NVME",
  "COOLING · INROW",
  "QDRANT · VECTOR DB",
  "VLLM · SERVE",
  "مانیتورینگ ۲۴/۷",
  "BACKUP · SNAPSHOT",
  "امنیت · فایروال",
];

// makeLabelTexture lives in @/lib/three-shared (shared with GalaxyScene)

type RackData = {
  pos: [number, number, number];
  seed: number;
  label: string | null;
  model: number;
  no: number;
};
function buildRacks(): RackData[] {
  const racks: RackData[] = [];
  const modelZ = [-9, -15.5, -22, -28.5]; // one rack per model, alternating sides
  let infra = 0;
  for (let side = 0; side < 2; side++) {
    const x = side === 0 ? -2.6 : 2.6;
    for (let i = 0; i < 22; i++) {
      const z = 8.5 - i * 3.0;
      const mi = modelZ.indexOf(z);
      let label: string | null = null;
      let model = -1;
      if (mi >= 0 && side === i % 2) {
        label = MODEL_LABELS[mi].label;
        model = mi;
      } else if (i % 2 === 0) {
        label = INFRA_LABELS[infra++ % INFRA_LABELS.length];
      }
      racks.push({
        pos: [x, 1.16, z],
        seed: (side * 31 + i * 7.13) % 100,
        label,
        model,
        no: racks.length + 1,
      });
    }
  }
  return racks;
}

const RACK_FA = new Map<number, string>([
  [-1, "رک زیرساخت — خاموش و بی‌خطر؛ فقط چراغ‌هایش می‌رقصند."],
  [0, "رک Qwen — گفتگو و پردازش زبان فارسی. کلیک: انتخاب مدل"],
  [1, "رک Llama — ایجنت‌های سازمانی. کلیک: انتخاب مدل"],
  [2, "رک DeepSeek — استدلال و کدنویسی. کلیک: انتخاب مدل"],
  [3, "رک Mistral — استنتاج سریع و محلی. کلیک: انتخاب مدل"],
]);

function Racks({
  p,
  model,
  reduced,
  matrixFont,
  onPickModel,
}: {
  p: Palette;
  model: number;
  reduced: boolean;
  matrixFont: boolean;
  onPickModel?: (i: number) => void;
}) {
  const racks = useMemo(buildRacks, []);
  const panelMats = useRef<THREE.ShaderMaterial[]>([]);
  const [hover, setHover] = useState(-1);

  const textures = useMemo(() => {
    const map = new Map<string, THREE.CanvasTexture>();
    const all = [...MODEL_LABELS.map((m) => m.label), ...INFRA_LABELS];
    for (const l of all) map.set(l, makeLabelTexture(l, p.green, matrixFont));
    return map;
  }, [p, matrixFont]);

  useEffect(() => {
    const mats = panelMats.current;
    const texs = textures;
    return () => {
      mats.forEach((m) => m.dispose());
      texs.forEach((t) => t.dispose());
    };
  }, [textures]);

  useFrame(({ camera }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const camZ = camera.position.z;
    for (let i = 0; i < panelMats.current.length; i++) {
      const m = panelMats.current[i];
      if (!m) continue;
      if (!reduced) m.uniforms.uTime.value += dt;
      const rack = racks[i];
      if (!rack) continue;
      // combined highlight: selected model > hovered > proximity to walker
      const dist = Math.abs(rack.pos[2] - camZ);
      const prox = Math.max(0, 1 - dist / 10) * 0.45;
      const target = Math.max(
        rack.model >= 0 && rack.model === model ? 1 : 0,
        hover === i ? 0.85 : 0,
        reduced ? 0 : prox,
      );
      m.uniforms.uBoost.value += (target - m.uniforms.uBoost.value) * (1 - Math.exp(-6 * dt));
    }
  });

  return (
    <group>
      {racks.map((r, i) => (
        <group key={i} position={r.pos}>
          <mesh
            castShadow
            onPointerOver={(e) => {
              e.stopPropagation();
              setHover(i);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHover((h) => (h === i ? -1 : h));
              document.body.style.cursor = "auto";
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (r.model >= 0) onPickModel?.(r.model === model ? -1 : r.model);
            }}
          >
            <boxGeometry args={[1.15, 2.3, 0.95]} />
            <meshStandardMaterial
              attach="material-0"
              color={p.metal}
              metalness={0.85}
              roughness={0.35}
            />
            <meshStandardMaterial
              attach="material-1"
              color={p.metal}
              metalness={0.85}
              roughness={0.35}
            />
            <meshStandardMaterial
              attach="material-2"
              color={p.void}
              metalness={0.6}
              roughness={0.6}
            />
            <meshStandardMaterial
              attach="material-3"
              color={p.void}
              metalness={0.6}
              roughness={0.6}
            />
            <shaderMaterial
              attach="material-4"
              vertexShader={RACK_PANEL_VERT}
              fragmentShader={RACK_PANEL_FRAG}
              uniforms={{
                uTime: { value: r.seed * 3 },
                uSeed: { value: r.seed },
                uBoost: { value: 0 },
                uGreen: { value: new THREE.Color(p.green) },
                uCyan: { value: new THREE.Color(p.cyan) },
                uRed: { value: new THREE.Color("#ff3355") },
                uDark: { value: new THREE.Color("#050a07") },
              }}
              ref={(m: THREE.ShaderMaterial) => {
                if (m && !panelMats.current[i]) panelMats.current[i] = m;
              }}
            />
            <meshStandardMaterial
              attach="material-5"
              color={p.metal}
              metalness={0.85}
              roughness={0.35}
            />
          </mesh>
          {r.label &&
            (() => {
              const tex = textures.get(r.label)!;
              const w = Math.min(1.35, 0.2 * (tex.image.width / tex.image.height));
              return (
                <mesh
                  position={[r.pos[0] > 0 ? -0.59 : 0.59, 2.02, 0]}
                  rotation-y={r.pos[0] > 0 ? -Math.PI / 2 : Math.PI / 2}
                >
                  <planeGeometry args={[w, 0.2]} />
                  <meshBasicMaterial map={tex} transparent toneMapped={false} />
                </mesh>
              );
            })()}
          {hover === i && (
            <Html
              position={[0, 1.72, 0]}
              center
              zIndexRange={[15, 10]}
              style={{ pointerEvents: "none" }}
            >
              <div className="rack-tip" dir="rtl">
                <span className="font-mono text-[10px] text-primary" dir="ltr">
                  RACK-{String(r.no).padStart(2, "0")}
                </span>
                <p className="mt-1 text-xs leading-relaxed text-foreground/90 whitespace-nowrap">
                  {RACK_FA.get(r.model) ?? "رک زیرساخت — خاموش و بی‌خطر؛ فقط چراغ‌هایش می‌رقصند."}
                </p>
                {r.label && (
                  <p className="mt-1 font-mono text-[10px] text-accent" dir="auto">
                    {r.label}
                  </p>
                )}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Showcase — the clickable "AI store" at the end of the corridor       */
/* ------------------------------------------------------------------ */

function ShowcaseCore({
  p,
  reduced,
  matrixFont,
  onContact,
}: {
  p: Palette;
  reduced: boolean;
  matrixFont: boolean;
  onContact?: () => void;
}) {
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  useFrame((_, rawDelta) => {
    const dt = reduced ? 0 : Math.min(rawDelta, 0.05);
    if (core.current) {
      core.current.rotation.y += dt * 0.6;
      core.current.rotation.x += dt * 0.18;
    }
    if (shell.current) {
      shell.current.rotation.y -= dt * 0.22;
      shell.current.scale.setScalar(1 + Math.sin(performance.now() * 0.0012) * 0.035);
    }
  });
  return (
    <group position={[0, 1.5, -56]}>
      {/* podium */}
      <mesh position={[0, -1.32, 0]}>
        <cylinderGeometry args={[1.15, 1.35, 0.22, 32]} />
        <meshStandardMaterial color={p.metal} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, -1.19, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.7, 1.0, 48]} />
        <meshBasicMaterial color={p.green} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {/* energy core — clickable: opens the specialist channel */}
      <mesh
        ref={core}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onContact?.();
        }}
      >
        <icosahedronGeometry args={[0.52, 1]} />
        <meshStandardMaterial
          color={p.light}
          emissive={p.green}
          emissiveIntensity={hover ? 4.2 : 2.6}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.86, 1]} />
        <meshBasicMaterial color={p.cyan} wireframe transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.2, 0]} intensity={9} distance={9} color={p.green} />
      {hover && (
        <Html
          position={[0, 1.05, 0]}
          center
          zIndexRange={[15, 10]}
          style={{ pointerEvents: "none" }}
        >
          <div className="rack-tip" dir="rtl">
            <p className="text-xs font-bold text-primary whitespace-nowrap">هسته هوش مصنوعی</p>
            <p className="mt-1 text-[11px] text-muted-foreground whitespace-nowrap">
              کلیک کنید تا کانال ارتباطی باز شود
            </p>
          </div>
        </Html>
      )}
      {/* spec plate — texture sized from measured text so the full sentence shows */}
      <SpecPlate p={p} matrixFont={matrixFont} />
    </group>
  );
}

/** Floating spec plate under the AI core — sized to the measured text. */
function SpecPlate({ p, matrixFont }: { p: Palette; matrixFont: boolean }) {
  const tex = useMemo(
    () => makeLabelTexture("هسته هوش مصنوعی · آماده استقرار", p.green, matrixFont, 30),
    [p, matrixFont],
  );
  useEffect(() => () => tex.dispose(), [tex]);
  const aspect = tex.image.width / tex.image.height;
  const w = Math.min(3.2, 0.5 * aspect);
  return (
    <mesh position={[0, -0.82, 1.2]} rotation-x={-0.35}>
      <planeGeometry args={[w, 0.5]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */

function World({
  p,
  mode,
  model,
  reduced,
  matrixFont,
  onPickModel,
  onContact,
}: {
  p: Palette;
  mode: SceneMode;
  model: number;
  reduced: boolean;
  matrixFont: boolean;
  onPickModel?: (i: number) => void;
  onContact?: () => void;
}) {
  return (
    <>
      <color attach="background" args={[p.void]} />
      <fogExp2 attach="fog" args={[p.void, 0.052]} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[2, 8, 5]} intensity={0.5} color={p.light} />
      <pointLight position={[-2.2, 2.6, 4]} intensity={10} distance={14} color={p.green} />
      <pointLight position={[2.2, 2.6, -4]} intensity={10} distance={14} color={p.cyan} />
      <pointLight position={[-2.2, 2.6, -16]} intensity={9} distance={14} color={p.cyan} />
      <pointLight position={[2.2, 2.6, -26]} intensity={9} distance={14} color={p.green} />
      <pointLight position={[0, 2.4, -42]} intensity={14} distance={20} color={p.green} />

      <Floor p={p} />
      <Ceiling p={p} />
      <Racks
        p={p}
        model={model}
        reduced={reduced}
        matrixFont={matrixFont}
        onPickModel={onPickModel}
      />
      <ShowcaseCore p={p} reduced={reduced} matrixFont={matrixFont} onContact={onContact} />
      <MatrixRain green={p.green} light={p.light} reduced={reduced} />
      <Sparkles
        count={90}
        scale={[10, 3.2, 70]}
        position={[0, 1.8, -25]}
        size={2.2}
        speed={0.25}
        color={p.green}
        opacity={0.4}
      />
      <CameraRig mode={mode} reduced={reduced} />
    </>
  );
}

export default function DatacenterScene({
  mode = "scroll",
  model = -1,
  onPickModel,
  onContact,
}: {
  mode?: SceneMode;
  model?: number;
  onPickModel?: (i: number) => void;
  onContact?: () => void;
}) {
  const [p] = useState(getPalette);
  const [reduced] = useState(
    () =>
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  // Persian rack labels need the matrix font before canvas rasterization
  const [matrixFont, setMatrixFont] = useState(false);
  useEffect(() => {
    let alive = true;
    const done = () => alive && setMatrixFont(true);
    try {
      Promise.all([
        document.fonts.load('700 40px "Vazir Matrix"'),
        document.fonts.load('400 40px "Vazir Matrix"'),
      ]).then(done, done);
    } catch {
      done();
    }
    const t = setTimeout(done, 3000); // fallback if fonts.ready stalls
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  return (
    <Canvas
      dpr={COMPACT ? [0.8, 1] : [1, 1.6]}
      camera={{ position: [0, 1.75, WALK_START + 4], fov: 52 }}
      gl={{
        antialias: !COMPACT,
        powerPreference: COMPACT ? "low-power" : "high-performance",
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense
        fallback={
          <Html center>
            <span className="font-mono text-primary text-xs">loading corridor…</span>
          </Html>
        }
      >
        <World
          p={p}
          mode={mode}
          model={model}
          reduced={reduced}
          matrixFont={matrixFont}
          onPickModel={onPickModel}
          onContact={onContact}
        />
      </Suspense>
      {/* Desktop-only bloom in a lazy chunk; mobile renders additive glow only */}
      {!COMPACT && !reduced && (
        <Suspense fallback={null}>
          <BloomLayer />
        </Suspense>
      )}
    </Canvas>
  );
}
