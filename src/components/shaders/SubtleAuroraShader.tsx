import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

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

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.1;

    // Gentle, large-scale movement
    vec2 p = uv * 2.0 - 1.0;
    
    // Soft, moving color blobs
    float d1 = length(p + vec2(sin(time * 0.5) * 0.5, cos(time * 0.3) * 0.5));
    float d2 = length(p + vec2(cos(time * 0.4) * 0.6, sin(time * 0.6) * 0.4));
    float d3 = length(p + vec2(sin(time * 0.2) * 0.4, cos(time * 0.7) * 0.3));

    // Smooth color mixing
    vec3 color1 = vec3(0.05, 0.02, 0.1); // Dark background
    vec3 color2 = vec3(0.2, 0.05, 0.3);  // Deep purple
    vec3 color3 = vec3(0.0, 0.1, 0.3);   // Deep blue/teal

    vec3 color = color1;
    color += color2 * (1.0 - smoothstep(0.0, 1.2, d1));
    color += color3 * (1.0 - smoothstep(0.0, 1.0, d2));
    color += vec3(0.1, 0.0, 0.2) * (1.0 - smoothstep(0.0, 1.5, d3));

    // Very subtle noise for texture (optional, keep it minimal)
    float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    color += noise * 0.02;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function AuroraPlane() {
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
                transparent={true}
            />
        </mesh>
    );
}

export default function SubtleAuroraShader() {
    return (
        <div className="absolute inset-0 -z-10 w-full h-full bg-[#030005]">
            <Canvas camera={{ position: [0, 0, 1], fov: 75 }} dpr={[1, 1.5]} resize={{ scroll: false }}>
                <AuroraPlane />
            </Canvas>
        </div>
    );
}
