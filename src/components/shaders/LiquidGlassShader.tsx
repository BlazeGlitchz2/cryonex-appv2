'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Liquid glass orb with refraction
function GlassOrb({ position = [0, 0, 0], scale = 1, color = '#3b82f6' }: { position?: number[], scale?: number, color?: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
            <mesh ref={meshRef} position={position as any} scale={scale}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshPhysicalMaterial
                    color={color}
                    transmission={0.9}
                    thickness={0.5}
                    roughness={0}
                    metalness={0}
                    ior={1.5}
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </Float>
    );
}

// Floating glass shards
function GlassShards() {
    const positions = useMemo(() => {
        const pos = [];
        for (let i = 0; i < 8; i++) {
            pos.push([
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4 - 2
            ]);
        }
        return pos;
    }, []);

    return (
        <>
            {positions.map((pos, i) => (
                <Float key={i} speed={1 + Math.random()} rotationIntensity={0.3} floatIntensity={0.5}>
                    <mesh position={pos as any} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
                        <boxGeometry args={[0.1 + Math.random() * 0.3, 0.3 + Math.random() * 0.5, 0.02]} />
                        <meshPhysicalMaterial
                            color={i % 2 === 0 ? '#60a5fa' : '#a78bfa'}
                            transmission={0.95}
                            thickness={0.2}
                            roughness={0.1}
                            metalness={0}
                            ior={1.5}
                            transparent
                            opacity={0.4}
                        />
                    </mesh>
                </Float>
            ))}
        </>
    );
}

// Ripple effect plane
function LiquidPlane() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            if (material.uniforms) {
                material.uniforms.uTime.value = state.clock.getElapsedTime();
            }
        }
    });

    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color('#1e3a8a') },
                uColor2: { value: new THREE.Color('#7c3aed') },
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float uTime;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    pos.z += sin(pos.x * 2.0 + uTime) * 0.1;
                    pos.z += sin(pos.y * 2.0 + uTime * 0.8) * 0.1;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float uTime;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                
                void main() {
                    float wave = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
                    wave *= sin(vUv.y * 8.0 + uTime * 0.7) * 0.5 + 0.5;
                    vec3 color = mix(uColor1, uColor2, wave);
                    float alpha = 0.15 + wave * 0.1;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
        });
    }, []);

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} material={shaderMaterial}>
            <planeGeometry args={[20, 20, 32, 32]} />
        </mesh>
    );
}

// Ambient particles
function AmbientParticles() {
    const pointsRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(100 * 3);
        for (let i = 0; i < 100; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
        return positions;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={100}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#60a5fa"
                size={0.03}
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

export default function LiquidGlassShader() {
    return (
        <div className="absolute inset-0 -z-10">
            {/* Gradient background base */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950" />

            <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true, antialias: true }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={1} color="#60a5fa" />
                <pointLight position={[-5, -5, 5]} intensity={0.5} color="#a78bfa" />

                <GlassOrb position={[0, 0, -1]} scale={2} color="#3b82f6" />
                <GlassOrb position={[-2.5, 1, -2]} scale={0.8} color="#8b5cf6" />
                <GlassOrb position={[2.5, -0.5, -2]} scale={0.6} color="#06b6d4" />

                <GlassShards />
                <LiquidPlane />
                <AmbientParticles />
            </Canvas>

            {/* Glass overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none opacity-30" />
        </div>
    );
}
