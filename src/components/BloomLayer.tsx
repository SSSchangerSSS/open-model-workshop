import { EffectComposer, Bloom } from "@react-three/postprocessing";

/**
 * Bloom pass, isolated in its own lazy chunk.
 * Desktop-only: on phones / low-power devices this module is never fetched,
 * and the ~250KB postprocessing library stays out of the critical path.
 */
export default function BloomLayer() {
  return (
    <EffectComposer>
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.18} luminanceSmoothing={0.25} />
    </EffectComposer>
  );
}
