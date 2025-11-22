import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Environment, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

function InteractiveCore() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (!meshRef.current) return;

        const { clock, mouse } = state;
        
        // Organic rotation
        meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
        meshRef.current.rotation.z = clock.getElapsedTime() * 0.1;

        // Mouse interaction - tilt towards mouse
        const targetX = mouse.y * 0.5;
        const targetY = mouse.x * 0.5;
        
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.1);
        meshRef.current.rotation.y += THREE.MathUtils.lerp(0, targetY, 0.1);

        // Pulse scale on hover
        const targetScale = hovered ? 2.2 : 1.8;
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    });

    return (
        <Sphere args={[1, 64, 64]} ref={meshRef} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <MeshDistortMaterial
                color={hovered ? "#a78bfa" : "#8b5cf6"}
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.2}
                metalness={0.8}
                emissive={hovered ? "#8b5cf6" : "#4c1d95"}
                emissiveIntensity={0.5}
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

    const count = 200;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 3 + Math.random() * 1.5;
        positions[i * 3] = Math.cos(angle) * radius; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5; // y
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
                size={0.05}
                color="#c4b5fd"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

export default function Logo3D() {
    return (
        <div className="w-full h-[400px] md:h-[500px] relative z-10 flex items-center justify-center pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
                <pointLight position={[0, 0, 5]} intensity={0.8} color="#ffffff" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <InteractiveCore />
                </Float>
                
                <ParticleRing />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
}