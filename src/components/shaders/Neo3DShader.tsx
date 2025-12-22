import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float, Stars, Torus, Icosahedron } from "@react-three/drei";
import { motion } from "framer-motion-3d";

// Manual implementation of random points in sphere to avoid 'maath' dependency issues
function generateSpherePoints(count: number, radius: number) {
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = Math.cbrt(Math.random()) * radius;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        points[i * 3] = x;
        points[i * 3 + 1] = y;
        points[i * 3 + 2] = z;
    }
    return points;
}

function ParticleField(props: any) {
    const ref = useRef<any>(null);
    const sphere = useMemo(() => generateSpherePoints(5000, 1.5), []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#8b5cf6" // Violet/Purple
                    size={0.002}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.8}
                />
            </Points>
        </group>
    );
}

function GeometricCore() {
    const meshRef = useRef<any>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} scale={1.2}>
                <icosahedronGeometry args={[1, 1]} />
                <meshBasicMaterial color="#0ea5e9" wireframe transparent opacity={0.15} />
            </mesh>
        </Float>
    );
}

function RetroGrid() {
    const gridRef = useRef<any>(null);

    useFrame((state) => {
        if (gridRef.current) {
            // Move grid towards camera to simulate forward movement
            gridRef.current.position.z = (state.clock.getElapsedTime() * 0.5) % 1;
        }
    });

    return (
        <group rotation={[Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <gridHelper args={[20, 20, 0xff00ff, 0x0ea5e9]} ref={gridRef} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
        </group>
    );
}

function FloatingShapes() {
    return (
        <>
            <Float speed={1.5} rotationIntensity={1} floatIntensity={1} position={[-3, 2, -2]}>
                <Torus args={[0.5, 0.2, 16, 32]}>
                    <meshStandardMaterial color="#8b5cf6" wireframe />
                </Torus>
            </Float>
            <Float speed={2} rotationIntensity={1.5} floatIntensity={1} position={[3, -1, -3]}>
                <Icosahedron args={[0.6, 0]}>
                    <meshStandardMaterial color="#0ea5e9" wireframe />
                </Icosahedron>
            </Float>
            <Float speed={1} rotationIntensity={0.5} floatIntensity={2} position={[-2, -2, -1]}>
                <Torus args={[0.3, 0.1, 16, 16]}>
                    <meshStandardMaterial color="#ec4899" wireframe />
                </Torus>
            </Float>
        </>
    );
}

export default function Neo3DShader() {
    return (
        <div className="absolute inset-0 -z-10 bg-black">
            <Canvas camera={{ position: [0, 0, 4], fov: 60 }} gl={{ alpha: true }}>
                {/* Transparent background for layering */}

                <ParticleField />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <GeometricCore />
                <RetroGrid />
                <FloatingShapes />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
            </Canvas>

            {/* Overlay Gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] pointer-events-none opacity-80" />
        </div>
    );
}
