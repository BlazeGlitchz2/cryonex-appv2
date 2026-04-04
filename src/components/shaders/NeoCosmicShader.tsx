import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import { useIsMobile } from "@/hooks/use-mobile";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex noise function
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
      vec2 uv = vUv;
      // Correct aspect ratio
      uv.x *= uResolution.x / uResolution.y;
      
      float time = uTime * 0.1;
      
      // Create organic movement with multiple noise layers
      float n1 = snoise(uv * 2.0 + vec2(time * 0.5, time * 0.2));
      float n2 = snoise(uv * 4.0 - vec2(time * 0.2, time * 0.8));
      float n3 = snoise(uv * 8.0 + time);
      
      // Combine noise layers for complexity
      float noise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
      
      // Define a premium, aurora-like palette
      vec3 color1 = vec3(0.05, 0.0, 0.1);    // Deep purple void
      vec3 color2 = vec3(0.2, 0.0, 0.4);     // Rich violet
      vec3 color3 = vec3(0.0, 0.3, 0.5);     // Teal/Cyan accent
      vec3 color4 = vec3(0.6, 0.0, 0.8);     // Bright magenta highlight
      
      // Mix colors based on noise
      vec3 color = mix(color1, color2, smoothstep(-0.5, 0.5, noise));
      color = mix(color, color3, smoothstep(0.2, 0.8, n2));
      
      // Add subtle highlights
      float highlight = smoothstep(0.6, 0.8, noise);
      color += color4 * highlight * 0.3;
      
      // Vignette to focus center
      float dist = length(vUv - 0.5);
      color *= 1.0 - smoothstep(0.5, 1.5, dist);

      gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderPlane() {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [size],
  );

  useFrame((state) => {
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// Static fallback for low-end devices
function StaticFallback() {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full bg-[#030005]">
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030005] via-transparent to-[#030005]/50" />
    </div>
  );
}

export default function NeoCosmicShader() {
  const isMobile = useIsMobile();
  const { disableShaders, getEffectiveTier, reducedMotion } =
    usePerformanceStore();
  const tier = getEffectiveTier();

  // Skip heavy shader on mobile, low-end devices, or when shaders are disabled
  if (isMobile || tier === "lite" || disableShaders || reducedMotion) {
    return <StaticFallback />;
  }

  return (
    <div className="absolute inset-0 -z-10 w-full h-full bg-[#030005]">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={[1, 1.5]}
        resize={{ scroll: false }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}
