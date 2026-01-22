import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePerformanceStore } from "@/lib/stores/performance-store";

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

  // Simple hash function
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // 2D Noise
  float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;
    // Aspect correction for shapes to remain circular-ish
    uv.x *= uResolution.x / uResolution.y;
    
    float time = uTime * 0.15;

    // Define colors (MacOS Big Sur/Monterey palette)
    vec3 c1 = vec3(0.2, 0.4, 1.0); // Vibrant Blue
    vec3 c2 = vec3(0.9, 0.2, 0.6); // Magenta/Pink
    vec3 c3 = vec3(0.0, 0.8, 0.9); // Cyan/Teal
    vec3 c4 = vec3(1.0, 0.6, 0.2); // Orange/Gold
    
    // Create shifting coordinates for each color blob
    vec2 p1 = uv + vec2(sin(time * 0.5), cos(time * 0.4)) * 0.3;
    vec2 p2 = uv + vec2(cos(time * 0.3), sin(time * 0.6)) * 0.4;
    vec2 p3 = uv + vec2(sin(time * 0.7), cos(time * 0.2)) * 0.3;
    vec2 p4 = uv + vec2(cos(time * 0.6), sin(time * 0.5)) * 0.4;

    // Distort them with noise
    float n1 = noise(p1 * 2.0 + time);
    float n2 = noise(p2 * 2.5 - time);
    float n3 = noise(p3 * 2.0 + time * 0.5);
    float n4 = noise(p4 * 3.0 - time * 0.5);

    // Mix colors based on distance and noise
    // Base
    vec3 color = mix(c1, c2, smoothstep(0.2, 0.8, uv.y + n1 * 0.2));
    
    // Add other splashes
    float dist1 = distance(uv, vec2(0.2, 0.8) + vec2(sin(time), cos(time))*0.2);
    color = mix(color, c3, smoothstep(0.6, 0.0, dist1 + n2 * 0.2));
    
    float dist2 = distance(uv, vec2(0.8, 0.2) + vec2(cos(time*0.8), sin(time*0.7))*0.2);
    color = mix(color, c4, smoothstep(0.6, 0.0, dist2 + n3 * 0.2));
    
    // Soften everything for that "mesh gradient" look
    // Add a final subtle noise grain for texture (optional, keeps it looking natural)
    float grain = random(uv * time) * 0.03;
    color += grain;

    // Increase saturation/vibrance
    color = pow(color, vec3(0.9)); 

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Liquid() {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [size]
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
    <div className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-br from-[#050505] via-[#0a0a0b] to-[#000000]">
      {/* Colorful gradient overlay mimicking the liquid effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-cyan-900/20" />
      <div className="absolute inset-0 bg-gradient-to-tl from-orange-900/20 via-transparent to-pink-900/20" />
    </div>
  );
}

export default function LiquidShader() {
  const isMobile = useIsMobile();
  const { disableShaders, getEffectiveTier, reducedMotion } = usePerformanceStore();
  const tier = getEffectiveTier();

  // Optimization: Don't render heavy shader on mobile, low-end, or when disabled
  if (isMobile || tier === 'lite' || disableShaders || reducedMotion) {
    return <StaticFallback />;
  }

  return (
    <div className="absolute inset-0 -z-10 w-full h-full">
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }} dpr={[1, 1.5]} resize={{ scroll: false }}>
        <Liquid />
      </Canvas>
    </div>
  );
}