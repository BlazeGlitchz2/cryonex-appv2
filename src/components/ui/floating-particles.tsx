'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
    count?: number;
    color?: string;
    opacity?: number;
}

function Particles({ count = 200, color = '#8b5cf6', opacity = 0.6 }: ParticleFieldProps) {
    const meshRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Spread particles across the screen
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            // Random velocities
            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

            // Random sizes
            sizes[i] = Math.random() * 3 + 1;
        }

        return { positions, velocities, sizes };
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;

        const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
        const time = state.clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            // Gentle floating motion
            positions[i * 3] += particles.velocities[i * 3];
            positions[i * 3 + 1] += particles.velocities[i * 3 + 1] + Math.sin(time * 0.5 + i) * 0.003;
            positions[i * 3 + 2] += particles.velocities[i * 3 + 2];

            // Wrap around boundaries
            if (positions[i * 3] > 10) positions[i * 3] = -10;
            if (positions[i * 3] < -10) positions[i * 3] = 10;
            if (positions[i * 3 + 1] > 10) positions[i * 3 + 1] = -10;
            if (positions[i * 3 + 1] < -10) positions[i * 3 + 1] = 10;
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true;
        meshRef.current.rotation.y = time * 0.02;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={count}
                    array={particles.sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <pointsMaterial
                color={color}
                size={0.05}
                transparent
                opacity={opacity}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export function FloatingParticles({ className = '' }: { className?: string }) {
    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                dpr={[1, 1.5]}
                gl={{ antialias: false, alpha: true }}
            >
                <Particles count={150} color="#8b5cf6" opacity={0.5} />
                <Particles count={50} color="#ec4899" opacity={0.3} />
            </Canvas>
        </div>
    );
}

export default FloatingParticles;
