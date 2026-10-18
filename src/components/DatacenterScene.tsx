import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-progress";
import { MatrixRain } from "./MatrixRain";

export type SceneMode = "scroll" | "fixed";

type Palette = {
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

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const WALK_START = 12;
const WALK_END = -50;

function CameraRig({ mode, reduced }: { mode: SceneMode; reduced: boolean }) {
  const drift = useRef(0);
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
      const p = easeInOut(Math.min(1, Math.max(0, scrollStore.target)));
      tz = THREE.MathUtils.lerp(WALK_START + (mobile ? 3 : 0), WALK_END, p);
      ty = (mobile ? 2.05 : 1.7) + py * 0.3;
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
/* Server racks — procedural LED panel shader                          */
/* ------------------------------------------------------------------ */

const RACK_PANEL_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RACK_PANEL_FRAG = /* glsl */ `
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

export const MODEL_LABELS = [
  { short: "QWEN", label: "QWEN · PERSIAN CHAT" },
  { short: "LLAMA", label: "LLAMA · AGENTS" },
  { short: "DEEPSEEK", label: "DEEPSEEK · REASONING" },
  { short: "MISTRAL", label: "MISTRAL · FAST INFER" },
] as const;

const INFRA_LABELS = [
  "N8N · WORKFLOWS",
  "FLOWISE · RAG",
  "GPU RIG · RTX 4090",
  "STORAGE · NVME",
  "COOLING · INROW",
  "QDRANT · VECTOR DB",
  "VLLM · SERVE",
  "MONITORING",
  "BACKUP · SNAPSHOT",
  "SECURITY · FW",
];

function makeLabelTexture(text: string, green: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 512, 96);
    ctx.font = "bold 40px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = green;
    ctx.fillText(`[ ${text} ]`, 256, 50);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

type RackData = {
  pos: [number, number, number];
  seed: number;
  label: string | null;
  model: number;
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
      racks.push({ pos: [x, 1.16, z], seed: (side * 31 + i * 7.13) % 100, label, model });
    }
  }
  return racks;
}

function Racks({ p, model, reduced }: { p: Palette; model: number; reduced: boolean }) {
  const racks = useMemo(buildRacks, []);
  const panelMats = useRef<THREE.ShaderMaterial[]>([]);
  const labelMats = useRef<Map<string, THREE.CanvasTexture>>(new Map());

  const textures = useMemo(() => {
    const map = new Map<string, THREE.CanvasTexture>();
    const all = [...MODEL_LABELS.map((m) => m.label), ...INFRA_LABELS];
    for (const l of all) map.set(l, makeLabelTexture(l, p.green));
    return map;
  }, [p]);

  useEffect(() => {
    const mats = panelMats.current;
    const texs = textures;
    return () => {
      mats.forEach((m) => m.dispose());
      texs.forEach((t) => t.dispose());
      labelMats.current.clear();
    };
  }, [textures]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    for (let i = 0; i < panelMats.current.length; i++) {
      const m = panelMats.current[i];
      if (!m) continue;
      m.uniforms.uTime.value += reduced ? 0 : dt;
      const rack = racks[i];
      const target = rack && rack.model >= 0 && rack.model === model ? 1 : 0;
      m.uniforms.uBoost.value += (target - m.uniforms.uBoost.value) * (1 - Math.exp(-6 * dt));
    }
  });

  return (
    <group>
      {racks.map((r, i) => (
        <group key={i} position={r.pos}>
          <mesh castShadow>
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
          {r.label && (
            <mesh
              position={[r.pos[0] > 0 ? -0.59 : 0.59, 2.02, 0]}
              rotation-y={r.pos[0] > 0 ? -Math.PI / 2 : Math.PI / 2}
            >
              <planeGeometry args={[1.05, 0.2]} />
              <meshBasicMaterial map={textures.get(r.label)!} transparent toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Showcase — the "AI store" at the end of the corridor                */
/* ------------------------------------------------------------------ */

function ShowcaseCore({ p, reduced }: { p: Palette; reduced: boolean }) {
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
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
      {/* energy core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.52, 1]} />
        <meshStandardMaterial
          color={p.light}
          emissive={p.green}
          emissiveIntensity={2.6}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.86, 1]} />
        <meshBasicMaterial color={p.cyan} wireframe transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.2, 0]} intensity={9} distance={9} color={p.green} />
      {/* spec plate */}
      <mesh position={[0, -0.82, 1.2]} rotation-x={-0.35}>
        <planeGeometry args={[2.1, 0.5]} />
        <meshBasicMaterial
          map={makeLabelTexture("AI CORE · READY TO DEPLOY", p.green)}
          transparent
          toneMapped={false}
        />
      </mesh>
    </group>
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
}: {
  p: Palette;
  mode: SceneMode;
  model: number;
  reduced: boolean;
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
      <Racks p={p} model={model} reduced={reduced} />
      <ShowcaseCore p={p} reduced={reduced} />
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
}: {
  mode?: SceneMode;
  model?: number;
}) {
  const [p] = useState(getPalette);
  const [reduced] = useState(
    () =>
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 1.75, WALK_START + 4], fov: 52 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense
        fallback={
          <Html center>
            <span className="font-mono text-primary text-xs">loading corridor…</span>
          </Html>
        }
      >
        <World p={p} mode={mode} model={model} reduced={reduced} />
      </Suspense>
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.18} luminanceSmoothing={0.25} />
      </EffectComposer>
    </Canvas>
  );
}
