import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { useThemeStore } from "@/lib/stores/theme-store";

interface CryonexLogoProps {
    isStreaming?: boolean;
    className?: string;
    scale?: number;
}

function InteractiveCore({ isStreaming, theme }: { isStreaming?: boolean; theme: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    const materialRef = useRef<any>(null);

    // Theme colors
    const colors = {
        cosmic: {
            idle: "#8b5cf6", // Violet
            active: "#d946ef", // Fuchsia
            finished: "#6366f1", // Indigo
            emissive: "#4c1d95"
        },
        liquid: {
            idle: "#3b82f6", // Blue
            active: "#06b6d4", // Cyan
            finished: "#0ea5e9", // Sky
            emissive: "#1e3a8a"
        }
    };

    const currentTheme = (colors as any)[theme === 'liquid' ? 'liquid' : 'cosmic'];
    const baseColor = isStreaming ? currentTheme.active : currentTheme.idle;
    const finishedColor = currentTheme.finished;

    useFrame((state) => {
        if (!meshRef.current) return;

        const { clock, mouse } = state;
        const t = clock.getElapsedTime();
        
        // Rotation
        meshRef.current.rotation.y = t * (isStreaming ? 0.8 : 0.2);
        meshRef.current.rotation.z = t * (isStreaming ? 0.4 : 0.1);

        // Talking animation (pulse/distort)
        if (materialRef.current) {
            // Lerp distortion based on streaming state
            const targetDistort = isStreaming ? 0.6 + Math.sin(t * 10) * 0.2 : 0.3;
            materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 0.1);
            
            // Lerp color
            const targetColor = new THREE.Color(isStreaming ? baseColor : finishedColor);
            materialRef.current.color.lerp(targetColor, 0.05);
        }

        // Mouse interaction (only if not streaming heavily)
        if (!isStreaming) {
            const targetX = mouse.y * 0.5;
            const targetY = mouse.x * 0.5;
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.1);
            meshRef.current.rotation.y += THREE.MathUtils.lerp(0, targetY, 0.1);
        }
    });

    return (
        <Sphere args={[1, 64, 64]} ref={meshRef} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <MeshDistortMaterial
                ref={materialRef}
                color={baseColor}
                attach="material"
                distort={0.3}
                speed={isStreaming ? 4 : 1.5}
                roughness={0.2}
                metalness={0.8}
                emissive={currentTheme.emissive}
                emissiveIntensity={isStreaming ? 0.8 : 0.5}
            />
        </Sphere>
    );
}

function ParticleRing() {
    const ref = useRef<THREE.Points>(null);
    
    useFrame((state) => {
        if (!ref.current) return;
        ref.current.rotation.y -= 0.002;
        ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    });

    const count = 100; // Reduced count for performance
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 3 + Math.random() * 1.5;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#c4b5fd"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

export default function CryonexLogo({ isStreaming = false, className, scale = 1 }: CryonexLogoProps) {
    const { theme } = useThemeStore();

    return (
        <div className={`relative z-10 flex items-center justify-center pointer-events-auto ${className || "w-full h-full"}`}>
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
                
                <group scale={scale}>
                    <Float speed={isStreaming ? 4 : 2} rotationIntensity={isStreaming ? 1 : 0.5} floatIntensity={0.5}>
                        <InteractiveCore isStreaming={isStreaming} theme={theme} />
                    </Float>
                    {scale > 0.8 && <ParticleRing />}
                </group>

                <Environment preset="city" />
            </Canvas>
        </div>
    );
}

