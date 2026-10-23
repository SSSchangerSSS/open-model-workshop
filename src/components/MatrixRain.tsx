import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function MatrixRain({
  green,
  light,
  reduced,
}: {
  green: string;
  light: string;
  reduced: boolean;
}) {
  const { texture, uniforms } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 512, 512);
      ctx.font = "20px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      const glyphs = "0123456789アイウエオカキクケコサシスセソابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی";
      for (let y = 0; y < 24; y++)
        for (let x = 0; x < 24; x++)
          ctx.fillText(glyphs[(x * 7 + y * 11) % glyphs.length] ?? "0", x * 21 + 10, y * 21 + 19);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    const uniforms = {
      atlas: { value: texture },
      time: { value: 0 },
      green: { value: new THREE.Color(green) },
      light: { value: new THREE.Color(light) },
    };
    return { texture, uniforms };
  }, [green, light]);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((_, delta) => {
    if (!reduced) uniforms.time.value += Math.min(delta, 0.05);
  });
  return (
    <mesh position={[0, 4.5, -6]}>
      <planeGeometry args={[28, 13]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
        fragmentShader={`
      varying vec2 vUv; uniform sampler2D atlas; uniform float time; uniform vec3 green; uniform vec3 light;
      float hash(float n){return fract(sin(n*127.1)*43758.5453);}
      void main(){
        float col=floor(vUv.x*64.); float speed=.04+hash(col)*.07;
        float head=fract(vUv.y+time*speed+hash(col+3.));
        float trail=pow(head,9.); vec2 uv=vec2(vUv.x*2.7,vUv.y*1.8+floor(time*speed*24.)/24.);
        float glyph=texture2D(atlas,uv).r; float alpha=glyph*trail*.55;
        gl_FragColor=vec4(mix(green,light,step(.97,head)),alpha);
      }`}
      />
    </mesh>
  );
}
