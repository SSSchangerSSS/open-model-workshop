import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { MODELS, type ModelSpec } from "@/lib/sizing";
import { MatrixRain } from "./MatrixRain";
import {
  getPalette,
  makeLabelTexture,
  RACK_PANEL_VERT,
  RACK_PANEL_FRAG,
  type Palette,
} from "./DatacenterScene";

export const RING_R = 8; // pod ring radius (m)
export const angleOf = (i: number) => (i / MODELS.length) * Math.PI * 2;

/** Overview orbit radius — farther back on small screens so the ring fits the frame. */
const freeRad = () => (typeof window !== "undefined" && window.innerWidth < 640 ? 6.3 : 4.6);

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
/* Camera — orbit inside the pod ring; glide to the clicked pod        */
/* ------------------------------------------------------------------ */

const lookTmp = new THREE.Vector3();

function HoloRig({
  nav,
  focus,
  reduced,
}: {
  nav: React.RefObject<NavState>;
  focus: number;
  reduced: boolean;
}) {
  const look = useRef(new THREE.Vector3(0, 1.5, 0));
  useFrame(({ camera, pointer, size }, rawDelta) => {
    const n = nav.current;
    if (!n) return;
    const dt = Math.min(rawDelta, 0.05);
    n.idle += dt;
    if (focus < 0 && !n.dragging && !reduced && n.idle > 3) n.azT += dt * 0.05;

    const mobile = size.width < 640;
    const k = 1 - Math.exp(-3.2 * dt);

    // look target: the focused pod, otherwise the hall center
    lookTmp.set(0, 1.5, 0);
    if (focus >= 0)
      lookTmp.set(Math.sin(angleOf(focus)) * RING_R, 1.8, Math.cos(angleOf(focus)) * RING_R);
    look.current.lerp(lookTmp, k);

    // shortest-path azimuth easing
    let d = n.azT - n.az;
    d = ((((d + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
    n.az += d * k;
    n.rad += (n.radT - n.rad) * k;
    n.h += (n.hT - n.h) * k;

    const px = reduced ? 0 : pointer.x;
    const py = reduced ? 0 : pointer.y;
    camera.position.set(
      Math.sin(n.az) * n.rad + px * 0.25,
      n.h + py * 0.14,
      Math.cos(n.az) * n.rad,
    );
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
        n.azT -= dx * 0.006;
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
/* Pod — one glass enclosure per open-weight model                     */
/* ------------------------------------------------------------------ */

function Pod({
  m,
  i,
  p,
  selected,
  matrixFont,
  reduced,
  onPick,
}: {
  m: ModelSpec;
  i: number;
  p: Palette;
  selected: boolean;
  matrixFont: boolean;
  reduced: boolean;
  onPick: (i: number) => void;
}) {
  const a = angleOf(i);
  const pos: [number, number, number] = [Math.sin(a) * RING_R, 0, Math.cos(a) * RING_R];
  const mat = useRef<THREE.ShaderMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);
  const labels = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);

  const texs = useMemo(() => {
    const fa = makeLabelTexture(m.fa, p.green, matrixFont, 34);
    const en = makeLabelTexture(`${m.en} · ${m.params}`, m.accent, false, 30);
    return { fa, en };
  }, [m, p, matrixFont]);
  useEffect(
    () => () => {
      texs.fa.dispose();
      texs.en.dispose();
    },
    [texs],
  );

  useFrame(({ clock }, rawDelta) => {
    const dt = reduced ? 0 : Math.min(rawDelta, 0.05);
    const t = clock.elapsedTime;
    if (mat.current) {
      if (!reduced) mat.current.uniforms.uTime.value += dt;
      const target = selected ? 1 : hover ? 0.85 : 0.22;
      mat.current.uniforms.uBoost.value +=
        (target - mat.current.uniforms.uBoost.value) * (1 - Math.exp(-6 * dt));
    }
    if (ring.current) {
      const s = selected ? 1 + Math.sin(t * 3) * 0.06 : 1;
      ring.current.scale.setScalar(s);
    }
    if (labels.current && !reduced) {
      labels.current.position.y = Math.sin(t * 1.2 + i) * 0.045;
    }
  });

  const accent = new THREE.Color(m.accent);
  return (
    <group position={pos} rotation-y={a + Math.PI}>
      {/* floor accent ring */}
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.32, 1.62, 48]} />
        <meshBasicMaterial
          color={m.accent}
          transparent
          opacity={selected ? 0.75 : 0.3}
          toneMapped={false}
        />
      </mesh>
      {/* podium */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[1.08, 1.22, 0.18, 32]} />
        <meshStandardMaterial color={p.metal} metalness={0.9} roughness={0.28} />
      </mesh>
      {/* glass case */}
      <mesh
        position={[0, 1.45, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHover(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPick(i);
        }}
      >
        <cylinderGeometry args={[1.02, 1.02, 2.7, 32, 1, true]} />
        <meshStandardMaterial
          color="#0d241a"
          metalness={0.35}
          roughness={0.12}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* server inside — LED face toward center */}
      <mesh
        position={[0, 1.22, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHover(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPick(i);
        }}
      >
        <boxGeometry args={[0.95, 1.85, 0.72]} />
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
        <meshStandardMaterial attach="material-2" color={p.void} metalness={0.6} roughness={0.6} />
        <meshStandardMaterial attach="material-3" color={p.void} metalness={0.6} roughness={0.6} />
        <shaderMaterial
          attach="material-4"
          vertexShader={RACK_PANEL_VERT}
          fragmentShader={RACK_PANEL_FRAG}
          uniforms={{
            uTime: { value: i * 3.7 },
            uSeed: { value: i * 11.3 + 5 },
            uBoost: { value: 0.2 },
            uGreen: { value: accent },
            uCyan: { value: new THREE.Color(p.cyan) },
            uRed: { value: new THREE.Color("#ff3355") },
            uDark: { value: new THREE.Color("#050a07") },
          }}
          ref={mat}
        />
        <meshStandardMaterial
          attach="material-5"
          color={p.metal}
          metalness={0.85}
          roughness={0.35}
        />
      </mesh>
      {/* vertical light beam */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 3.1, 24, 1, true]} />
        <meshBasicMaterial
          color={m.accent}
          transparent
          opacity={selected ? 0.1 : 0.045}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* floating labels */}
      <group ref={labels}>
        <mesh position={[0, 3.22, 0]}>
          <planeGeometry
            args={[Math.min(2.5, 0.34 * (texs.fa.image.width / texs.fa.image.height)), 0.34]}
          />
          <meshBasicMaterial map={texs.fa} transparent toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 2.86, 0]}>
          <planeGeometry
            args={[Math.min(2.5, 0.24 * (texs.en.image.width / texs.en.image.height)), 0.24]}
          />
          <meshBasicMaterial map={texs.en} transparent toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <pointLight position={[0, 1.6, 0.6]} intensity={2.2} distance={3.4} color={m.accent} />
      {hover && !selected && (
        <Html
          position={[0, 2.35, 0.7]}
          center
          zIndexRange={[15, 10]}
          style={{ pointerEvents: "none" }}
        >
          <div className="rack-tip" dir="rtl">
            <p className="text-xs font-bold text-primary whitespace-nowrap">{m.fa}</p>
            <p className="mt-1 text-[11px] text-muted-foreground whitespace-nowrap">{m.tagFa}</p>
            <p className="mt-1 font-mono text-[10px] text-accent" dir="ltr">
              {m.en} · {m.params}
            </p>
            <p className="mt-1 text-[10px] text-primary">کلیک: تنظیم کاربران همزمان</p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Central hologram                                                    */
/* ------------------------------------------------------------------ */

function HoloCenter({ p, reduced }: { p: Palette; reduced: boolean }) {
  const chip = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  // shrink on small screens so the pod ring stays visible behind the hologram
  const [small] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useFrame((_, rawDelta) => {
    const dt = reduced ? 0 : Math.min(rawDelta, 0.05);
    if (chip.current) chip.current.rotation.y += dt * 0.7;
    if (wire.current) {
      wire.current.rotation.y -= dt * 0.25;
      wire.current.rotation.x += dt * 0.1;
    }
    if (ringA.current) ringA.current.rotation.z += dt * 0.45;
    if (ringB.current) ringB.current.rotation.z -= dt * 0.3;
  });
  return (
    <group position={[0, 1.5, 0]} scale={small ? 0.68 : 1}>
      <mesh ref={chip}>
        <boxGeometry args={[0.85, 0.1, 0.55]} />
        <meshStandardMaterial
          color={p.light}
          emissive={p.green}
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshBasicMaterial color={p.cyan} wireframe transparent opacity={0.35} toneMapped={false} />
      </mesh>
      <mesh ref={ringA} rotation-x={Math.PI / 2.6}>
        <torusGeometry args={[1.35, 0.015, 8, 64]} />
        <meshBasicMaterial color={p.green} transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} rotation-x={Math.PI / 1.7} rotation-y={0.5}>
        <torusGeometry args={[1.6, 0.01, 8, 64]} />
        <meshBasicMaterial color={p.cyan} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <pointLight intensity={7} distance={8} color={p.green} />
      <Sparkles count={60} scale={[4, 3, 4]} size={2} speed={0.3} color={p.green} opacity={0.5} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */

function Hall({
  p,
  nav,
  focus,
  reduced,
  matrixFont,
  onPick,
}: {
  p: Palette;
  nav: React.RefObject<NavState>;
  focus: number;
  reduced: boolean;
  matrixFont: boolean;
  onPick: (i: number) => void;
}) {
  const floorTex = useMemo(() => {
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
    t.repeat.set(22, 22);
    return t;
  }, [p]);
  useEffect(() => () => floorTex.dispose(), [floorTex]);

  const pillars = useMemo(
    () => Array.from({ length: MODELS.length }, (_, i) => angleOf(i) + Math.PI / MODELS.length),
    [],
  );

  return (
    <>
      <color attach="background" args={[p.void]} />
      <fogExp2 attach="fog" args={[p.void, 0.03]} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[3, 9, 4]} intensity={0.45} color={p.light} />
      <pointLight position={[0, 3.2, 6]} intensity={9} distance={14} color={p.green} />
      <pointLight position={[0, 3.2, -6]} intensity={9} distance={14} color={p.cyan} />

      {/* circular hall floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial map={floorTex} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <ringGeometry args={[2.1, 2.4, 64]} />
        <meshBasicMaterial color={p.green} transparent opacity={0.22} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <ringGeometry args={[6.6, 6.7, 72]} />
        <meshBasicMaterial color={p.cyan} transparent opacity={0.16} toneMapped={false} />
      </mesh>

      {/* far light columns between pods */}
      {pillars.map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 12.5, 2, Math.cos(a) * 12.5]}>
          <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
          <meshBasicMaterial
            color={i % 2 ? p.cyan : p.green}
            transparent
            opacity={0.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      <HoloCenter p={p} reduced={reduced} />
      {MODELS.map((m, i) => (
        <Pod
          key={m.id}
          m={m}
          i={i}
          p={p}
          selected={focus === i}
          matrixFont={matrixFont}
          reduced={reduced}
          onPick={onPick}
        />
      ))}

      <group position={[0, 2.6, -21]}>
        <MatrixRain green={p.green} light={p.light} reduced={reduced} />
      </group>
      <group position={[0, 2.6, 21]} rotation-y={Math.PI}>
        <MatrixRain green={p.green} light={p.light} reduced={reduced} />
      </group>

      <HoloRig nav={nav} focus={focus} reduced={reduced} />
      <NavControls nav={nav} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Entry                                                               */
/* ------------------------------------------------------------------ */

export default function HardwareScene({
  focus,
  onPick,
}: {
  focus: number;
  onPick: (i: number) => void;
}) {
  const [p] = useState(getPalette);
  const [reduced] = useState(
    () =>
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const matrixFont = useMatrixFont();
  const nav = useRef<NavState>({
    az: 2.4,
    azT: 2.4,
    rad: freeRad(),
    radT: freeRad(),
    h: 2.2,
    hT: 2.2,
    idle: 0,
    dragging: false,
  });

  // glide to the selected pod / back to the center overview
  useEffect(() => {
    const n = nav.current;
    if (focus >= 0) {
      n.azT = angleOf(focus);
      n.radT = typeof window !== "undefined" && window.innerWidth < 640 ? 2.4 : 2.8;
      n.hT = 1.9;
      n.idle = 0;
    } else {
      n.radT = freeRad();
      n.hT = 2.2;
    }
  }, [focus]);

  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [Math.sin(2.4) * 4.6, 2.2, Math.cos(2.4) * 4.6], fov: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense
        fallback={
          <Html center>
            <span className="font-mono text-primary text-xs">loading showroom…</span>
          </Html>
        }
      >
        <Hall
          p={p}
          nav={nav}
          focus={focus}
          reduced={reduced}
          matrixFont={matrixFont}
          onPick={onPick}
        />
      </Suspense>
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.18} luminanceSmoothing={0.25} />
      </EffectComposer>
    </Canvas>
  );
}
