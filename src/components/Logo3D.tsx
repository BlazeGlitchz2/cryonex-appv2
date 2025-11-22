import { useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Float, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";

function LogoMesh() {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    // Load texture
    const texture = useLoader(TextureLoader, "/logo.png");

    useFrame((state) => {
        if (!meshRef.current) return;

        // Auto rotation
        meshRef.current.rotation.y += 0.005;

        // Mouse interaction tilt
        if (hovered) {
            const { x, y } = state.mouse;
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, y * 0.5, 0.1);
            meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, -x * 0.5, 0.1);
        }
    });

    return (
        <group
            ref={meshRef}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={2.5}
        >
            {/* Coin/Disc shape */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[1, 1, 0.1, 64]} />
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Front Face with Logo */}
            <mesh position={[0, 0, 0.06]}>
                <circleGeometry args={[0.9, 64]} />
                <meshStandardMaterial
                    map={texture}
                    transparent
                    opacity={1}
                    metalness={0.5}
                    roughness={0.2}
                />
            </mesh>

            {/* Back Face with Logo (flipped) */}
            <mesh position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[0.9, 64]} />
                <meshStandardMaterial
                    map={texture}
                    transparent
                    opacity={1}
                    metalness={0.5}
                    roughness={0.2}
                />
            </mesh>
        </group>
    );
}

export default function Logo3D() {
    return (
        <div className="w-full h-[500px] md:h-[600px] relative z-10">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <LogoMesh />
                </Float>

                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
