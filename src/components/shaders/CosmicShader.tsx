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

  // Fractal Brownian Motion
  float random (in vec2 st) {
      return fract(sin(dot(st.xy,
                           vec2(12.9898,78.233)))*
          43758.5453123);
  }

  // Based on Morgan McGuire @morgan3d
  // https://www.shadertoy.com/view/4dS3Wd
  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      // Four corners in 2D of a tile
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
  }

  #define OCTAVES 6
  float fbm (in vec2 st) {
      float value = 0.0;
      float amplitude = .5;
      float frequency = 0.;
      //
      // Loop of octaves
      for (int i = 0; i < OCTAVES; i++) {
          value += amplitude * noise(st);
          st *= 2.;
          amplitude *= .5;
      }
      return value;
  }

  void main() {
    vec2 uv = vUv;
    // Correct for aspect ratio
    uv.x *= uResolution.x / uResolution.y;
    
    float time = uTime * 0.05;

    vec3 color = vec3(0.0);
    
    // Base nebula layers
    vec2 q = vec2(0.);
    q.x = fbm( uv + 0.00*time);
    q.y = fbm( uv + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( uv + 1.0*q + vec2(1.7,9.2)+ 0.15*time );
    r.y = fbm( uv + 1.0*q + vec2(8.3,2.8)+ 0.126*time);

    float f = fbm(uv+r);

    // Deep space colors
    vec3 c1 = vec3(0.1, 0.05, 0.2); // Deep purple/black
    vec3 c2 = vec3(0.2, 0.1, 0.4);  // Indigo
    vec3 c3 = vec3(0.6, 0.1, 0.4);  // Magenta
    vec3 c4 = vec3(0.1, 0.4, 0.6);  // Cyan accents

    color = mix(c1, c2, clamp((f*f)*4.0,0.0,1.0));
    color = mix(color, c3, clamp(length(q),0.0,1.0));
    color = mix(color, c4, clamp(length(r.x),0.0,1.0));

    // Enhance contrast and vibrancy
    color = (f*f*f + 0.6*f*f + 0.5*f) * color * 1.5;
    
    // Stars
    float starNoise = random(uv + vec2(time * 0.01));
    if (starNoise > 0.995) {
        float brightness = (starNoise - 0.995) * 200.0;
        // Twinkle
        brightness *= 0.5 + 0.5 * sin(uTime * 3.0 + starNoise * 100.0);
        color += vec3(brightness);
    }

    // Subtle vignette
    vec2 center = vUv * 2.0 - 1.0;
    float dist = length(center);
    color *= 1.0 - dist * 0.3;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Nebula() {
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
      {/* Subtle gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-cyan-900/5" />
    </div>
  );
}

export default function CosmicShader() {
  const isMobile = useIsMobile();
  const { disableShaders, getEffectiveTier, reducedMotion } = usePerformanceStore();
  const tier = getEffectiveTier();

  // Skip heavy shader on mobile, low-end devices, or when shaders are disabled
  if (isMobile || tier === 'lite' || disableShaders || reducedMotion) {
    return <StaticFallback />;
  }

  return (
    <div className="absolute inset-0 -z-10 w-full h-full">
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }} dpr={[1, 1.5]} resize={{ scroll: false }}>
        <Nebula />
      </Canvas>
    </div>
  );
}