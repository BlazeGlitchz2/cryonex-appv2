import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";

function LogoPlane() {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useTexture("https://harmless-tapir-303.convex.cloud/api/storage/87893b86-54f0-457c-9239-2ebfde8a2814");
    
    useFrame((state) => {
        if (!meshRef.current) return;
        const { clock, mouse } = state;
        
        // Gentle floating rotation mixed with mouse interaction
        meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1 + (mouse.x * 0.2);
        meshRef.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.2) * 0.1 - (mouse.y * 0.2);
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[3.2, 3.2]} />
            <meshStandardMaterial 
                map={texture} 
                transparent 
                side={THREE.DoubleSide} 
                roughness={0.2}
                metalness={0.8}
                emissive="#ffffff"
                emissiveIntensity={0.1}
            />
        </mesh>
    );
}

function ParticleRing() {
    const ref = useRef<THREE.Points>(null);
    
    useFrame((state) => {
        if (!ref.current) return;
        ref.current.rotation.y -= 0.002;
        ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    });

    const count = 200;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 3.5 + Math.random() * 2;
        positions[i * 3] = Math.cos(angle) * radius; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5; // y
        positions[i * 3 + 2] = Math.sin(angle) * radius; // z
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
                size={0.04}
                color="#8b5cf6"
                transparent
                opacity={0.4}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export default function Logo3D() {
    return (
        <div className="w-full h-[400px] md:h-[500px] relative z-10 flex items-center justify-center pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
                <pointLight position={[-10, -10, -10]} intensity={2} color="#3b82f6" />
                
                <Suspense fallback={null}>
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <LogoPlane />
                    </Float>
                </Suspense>
                
                <ParticleRing />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
}