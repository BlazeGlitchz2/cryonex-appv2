import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float } from "@react-three/drei";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Github, Mail, Lock, ArrowRight } from "lucide-react";
import * as THREE from "three";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

// --- 3D Components ---

const CosmicOrb = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColorStart: { value: new THREE.Color("#6b21a8") }, // Purple
            uColorEnd: { value: new THREE.Color("#3b82f6") },   // Blue
        }),
        []
    );

    useFrame((state) => {
        const { clock } = state;
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.getElapsedTime();
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
            meshRef.current.rotation.z = clock.getElapsedTime() * 0.05;
        }
    });

    const vertexShader = `
    varying vec2 vUv;
    varying float vDisplacement;
    uniform float uTime;
    
    // Simplex noise function (simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      float noise = snoise(position * 1.5 + uTime * 0.2);
      vDisplacement = noise;
      vec3 newPosition = position + normal * noise * 0.3;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

    const fragmentShader = `
    varying vec2 vUv;
    varying float vDisplacement;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;

    void main() {
      float mixStrength = (vDisplacement + 1.0) * 0.5;
      vec3 color = mix(uColorStart, uColorEnd, mixStrength);
      gl_FragColor = vec4(color, 0.9);
    }
  `;

    return (
        <mesh ref={meshRef} scale={2.5}>
            <icosahedronGeometry args={[1, 64]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                wireframe={false}
            />
        </mesh>
    );
};

const Scene = () => {
    return (
        <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <CosmicOrb />
            </Float>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
    );
};

// --- Login Page Component ---

const Login = () => {
    const { signIn } = useAuthActions();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        try {
            await signIn("google", { redirectTo: "/app" });
        } catch (error) {
            console.error("Google sign-in error:", error);
            toast.error("Failed to sign in with Google");
        }
    };

    const handleGithubSignIn = async () => {
        try {
            await signIn("github", { redirectTo: "/app" });
        } catch (error) {
            console.error("Github sign-in error:", error);
            toast.error("Failed to sign in with GitHub");
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#050014]">
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <div className="glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden group">
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary mb-4 box-glow">
                                <Lock size={24} />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2 text-glow">Welcome Back</h1>
                            <p className="text-muted-foreground">Enter your credentials to access the cosmos.</p>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" placeholder="name@example.com" className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="password" type="password" placeholder="••••••••" className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 transition-colors" />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                <label
                                    htmlFor="remember"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                                >
                                    Remember me
                                </label>
                            </div>

                            <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-5px_var(--primary)] transition-all hover:scale-[1.02]">
                                Sign In <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-muted-foreground backdrop-blur-md">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={handleGithubSignIn} className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white">
                                <Github className="mr-2 h-4 w-4" /> GitHub
                            </Button>
                            <Button variant="outline" onClick={handleGoogleSignIn} className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white">
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </Button>
                        </div>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Don't have an account? </span>
                            <a href="#" className="text-primary hover:underline font-medium">Sign up</a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;