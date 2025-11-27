import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Trail, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function Crystal({ position, color, speed = 1 }: { position: [number, number, number], color: string, speed?: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2 * speed;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3 * speed;
            meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
        }
    });

    return (
        <Float speed={2 * speed} rotationIntensity={1} floatIntensity={1}>
            <Trail width={2} length={6} color={new THREE.Color(color)} attenuation={(t) => t * t}>
                <mesh ref={meshRef} position={position}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshPhysicalMaterial
                        color={color}
                        transmission={0.6}
                        thickness={2}
                        roughness={0}
                        ior={1.5}
                        clearcoat={1}
                        emissive={color}
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </Trail>
        </Float>
    );
}

function Particles() {
    const count = 100; // Reduced from 200 for performance
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshPhongMaterial color="#a855f7" />
        </instancedMesh>
    );
}

export default function Hero3D() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <fog attach="fog" args={['#050014', 10, 30]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="purple" />

                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={80} scale={12} size={4} speed={0.4} opacity={0.5} color="#fff" />

                <Crystal position={[-3, 1, 0]} color="#a855f7" speed={0.8} />
                <Crystal position={[3, -1, -2]} color="#3b82f6" speed={1.2} />
                <Crystal position={[0, 3, -5]} color="#ec4899" speed={1} />

                <Particles />
            </Canvas>
        </div>
    );
}
