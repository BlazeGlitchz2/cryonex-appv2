"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useDeviceInfo } from "@/hooks/use-mobile";
import { usePerformanceStore } from "@/lib/stores/performance-store";

// Optimized static background for low-power devices (Android, tablets, smartboards)
function OptimizedBackground() {
  return (
    <div
      className="w-full h-screen"
      style={{
        background:
          "linear-gradient(135deg, #050010 0%, #1a0b2e 25%, #110524 50%, #1a0b2e 75%, #050010 100%)",
        overflow: "hidden",
      }}
    >
      {/* Subtle animated gradient orbs for visual interest without heavy GPU usage */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(168, 85, 247, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}

// WebGL background with Three.js shader
function WebGLBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    camera: THREE.Camera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    uniforms: any;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Vertex shader
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `;

    // Fragment shader
    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time*0.05;
        float lineWidth = 0.002;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i=0; i < 5; i++){
            color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
          }
        }
        
        gl_FragColor = vec4(color[0],color[1],color[2],1.0);
      }
    `;

    // Initialize Three.js scene
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    // Handle window resize
    const onWindowResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };

    // Initial resize
    onWindowResize();
    window.addEventListener("resize", onWindowResize, false);

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }
    };

    // Store scene references for cleanup
    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: 0,
    };

    // Start animation
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", onWindowResize);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);

        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }

        sceneRef.current.renderer.dispose();
        geometry.dispose();
        material.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen"
      style={{
        background: "#000",
        overflow: "hidden",
      }}
    />
  );
}

export function ShaderAnimation() {
  const { isLowPowerDevice, isAndroid, isTablet, isSmartboard } =
    useDeviceInfo();
  const { disableShaders } = usePerformanceStore((state) => state);
  const effectiveTier = usePerformanceStore((state) =>
    state.qualityTier === "auto"
      ? state.detectedTier || "full"
      : state.qualityTier,
  );

  const shouldOptimize =
    isLowPowerDevice ||
    isAndroid ||
    isTablet ||
    isSmartboard ||
    effectiveTier === "lite" ||
    disableShaders;

  if (shouldOptimize) {
    return <OptimizedBackground />;
  }

  return <WebGLBackground />;
}
