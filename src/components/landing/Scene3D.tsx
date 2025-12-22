import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Stars, Sparkles, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCrystal({ position, color, speed = 1, scale = 1 }: { position: [number, number, number], color: string, speed?: number, scale?: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.x = Math.cos(t / 4 * speed) / 2;
        meshRef.current.rotation.y = Math.sin(t / 4 * speed) / 2;
        meshRef.current.rotation.z = Math.sin(t / 4 * speed) / 2;
    });

    return (
        <Float speed={2 * speed} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <octahedronGeometry args={[1, 0]} />
                <meshPhysicalMaterial
                    color={color}
                    roughness={0}
                    metalness={0.2}
                    transmission={0.9} // Glass effect
                    thickness={2}
                    clearcoat={1}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </Float>
    );
}

function MainCore() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.y = t * 0.2;
        meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[2, 0]} />
                <meshPhysicalMaterial
                    color="#8B5CF6"
                    roughness={0.1}
                    metalness={0.8}
                    transmission={0.5}
                    thickness={3}
                    clearcoat={1}
                    emissive="#8B5CF6"
                    emissiveIntensity={0.4}
                    wireframe={true}
                />
            </mesh>
            <mesh scale={0.8}>
                <icosahedronGeometry args={[2, 0]} />
                <meshPhysicalMaterial
                    color="#14F195"
                    roughness={0.2}
                    metalness={0.1}
                    transmission={0.9}
                    thickness={2}
                    emissive="#14F195"
                    emissiveIntensity={0.2}
                />
            </mesh>
        </Float>
    );
}

export default function Scene3D() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
            <Canvas gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#8B5CF6" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#14F195" />

                <MainCore />

                <FloatingCrystal position={[-4, 2, -2]} color="#14F195" speed={0.8} scale={0.5} />
                <FloatingCrystal position={[4, -2, -3]} color="#8B5CF6" speed={1.2} scale={0.6} />
                <FloatingCrystal position={[-3, -3, -5]} color="#3b82f6" speed={0.5} scale={0.4} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.5} color="#8B5CF6" />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
