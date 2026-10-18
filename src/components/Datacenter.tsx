import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html, Lightformer, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Mail, RotateCcw, Server, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactTerminal } from './ContactTerminal';
import { MatrixRain } from './MatrixRain';

const models = [
  { name: 'Qwen', detail: 'گفتگو و پردازش فارسی', position: [-4.4, 0, 0] as [number, number, number] },
  { name: 'Llama', detail: 'ایجنت‌های سازمانی', position: [-2.2, 0, -1.4] as [number, number, number] },
  { name: 'DeepSeek', detail: 'استدلال و برنامه‌نویسی', position: [2.2, 0, -1.4] as [number, number, number] },
  { name: 'Mistral', detail: 'استنتاج سریع و محلی', position: [4.4, 0, 0] as [number, number, number] },
];
type Palette = { void: string; metal: string; green: string; cyan: string; light: string; tile: string };
function getPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  return Object.fromEntries(['void', 'metal', 'green', 'cyan', 'light', 'tile'].map(key => [key, css.getPropertyValue(`--scene-${key}`).trim()])) as Palette;
}

function CameraRig({ selected, reduced }: { selected: number; reduced: boolean }) {
  const time = useRef(0);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, pointer, size }, rawDelta) => {
    const dt = Math.min(rawDelta, .05); time.current += dt;
    const intro = reduced ? 1 : Math.min(time.current / 3, 1);
    const mobile = size.width < 640;
    const pos = models[selected]?.position;
    const x = pos ? pos[0] * .25 : 0;
    target.set(x + (reduced ? 0 : pointer.x * .3), mobile ? 5.1 : 4.4, (mobile ? 15.2 : 12.5) + (1 - intro) * 6);
    camera.position.lerp(target, reduced ? 1 : 1 - Math.exp(-3 * dt));
    camera.lookAt(x * .6, 1.3, -.7);
  });
  return null;
}

function Floor({ p }: { p: Palette }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const ctx = c.getContext('2d');
    if (ctx) { ctx.fillStyle = p.tile; ctx.fillRect(0,0,256,256); ctx.strokeStyle = p.metal; ctx.lineWidth = 3; ctx.strokeRect(2,2,252,252); ctx.fillStyle = p.metal; for (let i=0;i<28;i++) ctx.fillRect(20+i*8,120,3,16); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 12); return t;
  }, [p]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh rotation-x={-Math.PI/2} position={[0,-.03,0]} receiveShadow><planeGeometry args={[30,26]}/><meshStandardMaterial map={texture} metalness={.65} roughness={.32}/></mesh>;
}

// Asset-backed models are added below once validated.
function World({ p, selected, setSelected, contact, reduced }: { p: Palette; selected: number; setSelected: (i: number) => void; contact: () => void; reduced: boolean }) {
  return <>
    <color attach="background" args={[p.void]}/><fog attach="fog" args={[p.void,18,38]}/>
    <ambientLight intensity={.7}/><directionalLight position={[2,8,5]} intensity={2} color={p.light}/>
    <pointLight position={[-5,3,2]} intensity={18} color={p.green}/><pointLight position={[5,4,1]} intensity={24} color={p.cyan}/>
    <Environment resolution={128}><Lightformer intensity={3} position={[0,7,0]} rotation-x={Math.PI/2} scale={[12,12,1]} color={p.light}/><Lightformer intensity={2} position={[5,3,0]} rotation-y={-Math.PI/2} scale={[10,6,1]} color={p.cyan}/></Environment>
    <Floor p={p}/><MatrixRain green={p.green} light={p.light} reduced={reduced}/><CameraRig selected={selected} reduced={reduced}/>
    <Suspense fallback={<Html center><span className="font-mono text-primary text-xs">loading nodes…</span></Html>}>
      <Equipment p={p} selected={selected} setSelected={setSelected} contact={contact}/>
    </Suspense>
  </>;
}

export default function Datacenter() {
  const [p] = useState(getPalette);
  const [selected,setSelected] = useState(-1);
  const [open,setOpen] = useState(false);
  const [restart,setRestart] = useState(0);
  const [reduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const dialog = document.querySelector('[role="dialog"]');
    const first = dialog?.querySelector<HTMLElement>('button,input'); first?.focus();
    function key(e: KeyboardEvent) {
      if(e.key === 'Escape') setOpen(false);
      if(e.key !== 'Tab' || !dialog) return;
      const nodes = Array.from(dialog.querySelectorAll<HTMLElement>('button,input,textarea')); const first = nodes[0]; const last = nodes.at(-1);
      if(e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if(!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    window.addEventListener('keydown',key);
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown',key); if(previous instanceof HTMLElement) previous.focus(); };
  },[open]);
  const model = models[selected];
  return <section className="datacenter" aria-label="دیتاسنتر سه‌بعدی هوش برتر">
    <Canvas key={restart} dpr={1} camera={{position:[0,4.4,19],fov:49}} gl={{antialias:true}}><World p={p} selected={selected} setSelected={setSelected} reduced={reduced} contact={()=>setOpen(true)}/></Canvas>
    <div className="datacenter-copy">
      <p className="font-mono text-xs text-primary" dir="ltr">THE MATRIX / PRIVATE AI INFRASTRUCTURE</p>
      <h1 className="mt-4 font-black">هوش برتر<span className="text-primary">_</span></h1>
      <p className="mt-3 max-w-md text-sm md:text-base text-muted-foreground">مدل‌های باز، سرورهای اختصاصی، اتوماسیون هوشمند.<br/>زیرساخت شما؛ هوش بی‌مرز.</p>
    </div>
    <div className="datacenter-bottom">
      <div className="flex flex-wrap gap-2 mb-4" dir="ltr">{models.map((m,i)=><Button key={m.name} variant="outline" onClick={()=>setSelected(i)} aria-pressed={selected===i} className={selected===i?'border-primary text-primary':'text-muted-foreground'}><Server/>{m.name}</Button>)}<Button variant="outline" size="icon" title="نمای کلی" aria-label="نمای کلی" onClick={()=>{setSelected(-1);setRestart(n=>n+1);}}><RotateCcw/></Button></div>
      <div className="flex flex-wrap justify-between gap-4 items-end">
        <div><p className="font-mono text-xs text-primary" dir="ltr">{model ? `NODE / ${model.name.toUpperCase()}` : 'SELF-HOSTED / OPEN-WEIGHT'}</p><p className="mt-2 text-sm">{model?.detail || 'n8n · Flowise · GPU Servers'}</p><p className="mt-1 text-xs text-muted-foreground">نمای مفهومی زیرساخت؛ وضعیت سرورها زنده نیست.</p></div>
        <div className="flex gap-2"><Button ref={closeRef} className="h-11" onClick={()=>setOpen(true)}><Mail/>ارتباط با متخصص</Button><Button asChild variant="outline" className="h-11"><Link to="/services">خدمات<ArrowLeft/></Link></Button></div>
      </div>
    </div>
    {open && <div className="connection-overlay" role="dialog" aria-modal="true" aria-label="ارتباط با متخصص" onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}><div><ContactTerminal model={model?.name || 'زیرساخت هوش مصنوعی'} onClose={()=>setOpen(false)}/></div></div>}
  </section>;
}
