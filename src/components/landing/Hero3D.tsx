import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, MeshTransmissionMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

// Orbital ring around the logo
function OrbitalRing({ radius = 3, speed = 0.5, color = "#a855f7" }: { radius?: number; speed?: number; color?: string }) {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z = state.clock.getElapsedTime() * speed;
            ringRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
        }
    });

    return (
        <mesh ref={ringRef} position={[0, 0, 0]}>
            <torusGeometry args={[radius, 0.02, 16, 100]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
    );
}

// Floating crystal gem
function GlassCrystal({ position, scale = 1, rotationSpeed = 1 }: { position: [number, number, number]; scale?: number; rotationSpeed?: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3 * rotationSpeed;
            meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <octahedronGeometry args={[1, 0]} />
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={0.5}
                    chromaticAberration={0.2}
                    anisotropy={0.3}
                    distortion={0.5}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    iridescence={1}
                    iridescenceIOR={1}
                    iridescenceThicknessRange={[0, 1400]}
                    color="#a855f7"
                />
            </mesh>
        </Float>
    );
}

// Glowing orb
function GlowOrb({ position, color = "#3b82f6", size = 0.5 }: { position: [number, number, number]; color?: string; size?: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
            meshRef.current.scale.setScalar(scale * size);
        }
    });

    return (
        <Float speed={3} floatIntensity={2}>
            <mesh ref={meshRef} position={position}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.4} />
            </mesh>
            <pointLight position={position} color={color} intensity={2} distance={5} />
        </Float>
    );
}

// Particle field
function ParticleField() {
    const count = 50;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                position: [
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 10 - 5
                ],
                speed: 0.5 + Math.random() * 0.5,
                offset: Math.random() * Math.PI * 2
            });
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;

        particles.forEach((particle, i) => {
            const t = state.clock.getElapsedTime() * particle.speed + particle.offset;
            dummy.position.set(
                particle.position[0] + Math.sin(t) * 0.5,
                particle.position[1] + Math.cos(t * 0.7) * 0.5,
                particle.position[2]
            );
            dummy.scale.setScalar(0.03 + Math.sin(t * 2) * 0.01);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </instancedMesh>
    );
}

export default function Hero3D() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    powerPreference: "high-performance",
                    alpha: true
                }}
                style={{ background: 'transparent' }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -5, 5]} intensity={0.8} color="#a855f7" />
                <pointLight position={[5, -10, -5]} intensity={0.5} color="#3b82f6" />

                {/* Main crystals */}
                <GlassCrystal position={[0, 0, 0]} scale={1.5} rotationSpeed={0.5} />
                <GlassCrystal position={[-4, 2, -3]} scale={0.8} rotationSpeed={0.8} />
                <GlassCrystal position={[4, -1.5, -2]} scale={0.6} rotationSpeed={1.2} />

                {/* Orbital rings */}
                <OrbitalRing radius={3} speed={0.3} color="#a855f7" />
                <OrbitalRing radius={4} speed={-0.2} color="#3b82f6" />
                <OrbitalRing radius={5} speed={0.15} color="#ec4899" />

                {/* Glow orbs */}
                <GlowOrb position={[-3, 1, 1]} color="#a855f7" size={0.3} />
                <GlowOrb position={[3, -2, 0]} color="#3b82f6" size={0.4} />
                <GlowOrb position={[0, 3, -2]} color="#ec4899" size={0.25} />

                {/* Ambient particles */}
                <ParticleField />
                <Sparkles count={100} scale={15} size={2} speed={0.3} opacity={0.4} color="#ffffff" />

                {/* Environment for reflections */}
                <Environment preset="night" />
            </Canvas>
        </div>
    );
}
