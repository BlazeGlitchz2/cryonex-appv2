import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

function Shard({ position, color, scale, speed }: any) {
    const mesh = useRef<THREE.Mesh>(null);
    const randomRot = useMemo(() => [Math.random() * Math.PI, Math.random() * Math.PI, 0], []);

    useFrame((state) => {
        if (!mesh.current) return;

        // Mouse parallax
        const { mouse } = state;
        const x = (mouse.x * window.innerWidth) / 50;
        const y = (mouse.y * window.innerHeight) / 50;

        mesh.current.rotation.x += 0.01 * speed;
        mesh.current.rotation.y += 0.015 * speed;

        mesh.current.position.x = position[0] + x * 0.05 * speed;
        mesh.current.position.y = position[1] + y * 0.05 * speed;
    });

    return (
        <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={mesh} position={position} rotation={randomRot as any} scale={scale}>
                <octahedronGeometry args={[1, 0]} />
                <meshPhysicalMaterial
                    color={color}
                    roughness={0}
                    metalness={0.1}
                    transmission={0.9} // Glass-like
                    thickness={1}
                    clearcoat={1}
                />
            </mesh>
        </Float>
    );
}

export function CrystallineShards() {
    const shards = useMemo(() => {
        return new Array(15).fill(0).map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10,
            ],
            color: Math.random() > 0.5 ? "#D2FF00" : "#FFFFFF", // Neon Lime or White
            scale: Math.random() * 0.5 + 0.2,
            speed: Math.random() * 0.5 + 0.5,
        }));
    }, []);

    return (
        <div className="absolute inset-0 z-20 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Environment preset="city" />

                {shards.map((shard, i) => (
                    <Shard key={i} {...shard} />
                ))}
            </Canvas>
        </div>
    );
}
