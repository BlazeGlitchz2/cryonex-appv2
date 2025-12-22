import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const STYLE_ID = "spectral-ghost-styles";

const DEFAULT_PARAMS = {
    bodyColor: 0x0f2027,
    glowColor: "orange",
    eyeGlowColor: "green",
    ghostOpacity: 0.88,
    ghostScale: 2.4,

    emissiveIntensity: 5.8,
    pulseSpeed: 1.6,
    pulseIntensity: 0.6,

    eyeGlowIntensity: 4.5,
    eyeGlowDecay: 0.95,
    eyeGlowResponse: 0.31,

    rimLightIntensity: 1.8,

    followSpeed: 0.075,
    wobbleAmount: 0.35,
    floatSpeed: 1.6,
    movementThreshold: 0.07,

    particleCount: 250,
    particleDecayRate: 0.005,
    particleColor: "orange",
    createParticlesOnlyWhenMoving: true,
    particleCreationRate: 5,

    revealRadius: 43,
    fadeStrength: 2.2,
    baseOpacity: 0.35,
    revealOpacity: 0.0,

    fireflyGlowIntensity: 2.6,
    fireflySpeed: 0.04,

    analogIntensity: 0.6,
    analogGrain: 0.4,
    analogBleeding: 1.0,
    analogVSync: 1.0,
    analogScanlines: 1.0,
    analogVignette: 1.0,
    analogJitter: 0.4,
    limboMode: false
};

const DEFAULT_TOGGLES = {
    enabled: true,
    ghost: true,
    text: true,
    particles: true,
    fireflies: true,
    bloom: true,
    analog: true,
    reveal: true
};

const DEFAULT_TEXT = {
    titleLines: ["Veil of Dust", "Trail of Ash", "Heart of Ice"],
    subtext: "Whispers through memory"
};

const FLUORESCENT = {
    cyan: 0x00ffff,
    lime: 0x00ff00,
    magenta: 0xff00ff,
    yellow: 0xffff00,
    orange: 0xff4500,
    pink: 0xff1493,
    purple: 0x9400d3,
    blue: 0x0080ff,
    green: 0x00ff80,
    red: 0xff0040,
    teal: 0x00ffaa,
    violet: 0x8a2be2
};

function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
}

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
@import url("https://fonts.googleapis.com/css2?family=Boldonse&display=swap");
@font-face {
  font-family: "PPSupplyMono";
  src: url("https://assets.codepen.io/7558/PPSupplyMono-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
}

.spectral-ghost-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #030010; /* Changed to match app background */
}

.spectral-ghost-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0 !important;
  transition: opacity 2s ease-in;
}
.spectral-ghost-canvas.fade-in { opacity: 1 !important; }

.spectral-preloader {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  opacity: 1;
  transition: opacity 1s ease-out;
}
.spectral-preloader.fade-out { opacity: 0; pointer-events: none; }
.spectral-preloader-content { text-align: center; color: #e0e0e0; }
.spectral-ghost-loader { width: 64px; height: 64px; margin: 0 auto 30px; display: grid; place-items: center; }
.spectral-ghost-svg { filter: drop-shadow(0 0 20px rgba(255,255,255,0.3)); animation: sgFloat 3s ease-in-out infinite; }
.spectral-ghost-eye { animation: sgEye 2s ease-in-out infinite; transform-origin: center; }
.spectral-ghost-eye.right { animation-delay: .1s; }
@keyframes sgFloat { 0%,100%{ transform: translateY(0)} 50%{ transform: translateY(-8px)} }
@keyframes sgEye { 0%,100%{ transform: scale(1)} 50%{ transform: scale(1.3)} }
.spectral-loading-text {
  font-family: "PPSupplyMono", monospace;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 12px;
  animation: sgText 2s ease-in-out infinite;
}
@keyframes sgText { 0%,100%{ opacity: 1 } 50%{ opacity: .1 } }
.spectral-loading-progress { width: 96px; height: 1px; margin: 0 auto; overflow: hidden; }
.spectral-progress-bar { height: 100%; width: 0%; opacity: .1; background: linear-gradient(90deg, #00ff80, #00cc66); transition: width .8s ease; }

.spectral-content {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  text-align: center;
  color: #e0e0e0;
  opacity: 0;
  transition: opacity 1.5s ease-in;
  pointer-events: none;
}
.spectral-content.fade-in { opacity: 1; }
.spectral-quote { font-family: "Boldonse", system-ui; font-size: 6vw; line-height: 1.3; font-weight: 400; letter-spacing: -0.02em; margin: 0 0 5vh; text-transform: uppercase; }
.spectral-author { font-family: "PPSupplyMono", monospace; font-size: 12px; text-transform: uppercase; opacity: .7; }
`;
    document.head.appendChild(style);
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function createMarkup({ showPreloader, text }) {
    const wrap = document.createElement("div");
    wrap.className = "spectral-ghost-wrap";

    const canvas = document.createElement("canvas");
    canvas.className = "spectral-ghost-canvas";
    wrap.appendChild(canvas);

    const content = document.createElement("div");
    content.className = "spectral-content";
    const lines = Array.isArray(text?.titleLines) ? text.titleLines : DEFAULT_TEXT.titleLines;
    const safeLines = lines.map((l) => escapeHtml(l)).filter((l) => l.length > 0);
    const safeSub = escapeHtml(text?.subtext ?? DEFAULT_TEXT.subtext);

    content.innerHTML = `
    <div>
      <h1 class="spectral-quote" data-title></h1>
      <div class="spectral-author" data-subtext></div>
    </div>
  `;
    wrap.appendChild(content);

    const titleEl = content.querySelector("[data-title]");
    const subtextEl = content.querySelector("[data-subtext]");
    titleEl.innerHTML = safeLines.join("<br />");
    subtextEl.textContent = safeSub;

    let preloader = null;
    let progressBar = null;
    if (showPreloader) {
        preloader = document.createElement("div");
        preloader.className = "spectral-preloader";
        preloader.innerHTML = `
      <div class="spectral-preloader-content">
        <div class="spectral-ghost-loader">
          <svg class="spectral-ghost-svg" height="80" width="80" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="m508.374 432.802s-46.6-39.038-79.495-275.781c-8.833-87.68-82.856-156.139-172.879-156.139-90.015 0-164.046 68.458-172.879 156.138-32.895 236.743-79.495 275.782-79.495 275.782-15.107 25.181 20.733 28.178 38.699 27.94 35.254-.478 35.254 40.294 70.516 40.294 35.254 0 35.254-35.261 70.508-35.261s37.396 45.343 72.65 45.343 37.389-45.343 72.651-45.343c35.254 0 35.254 35.261 70.508 35.261s35.27-40.772 70.524-40.294c17.959.238 53.798-2.76 38.692-27.94z" fill="white" opacity=".9"></path>
            <circle class="spectral-ghost-eye left" cx="208" cy="225" r="22" fill="black"></circle>
            <circle class="spectral-ghost-eye right" cx="297" cy="225" r="22" fill="black"></circle>
          </svg>
        </div>
        <div class="spectral-loading-text">Summoning spirits</div>
        <div class="spectral-loading-progress">
          <div class="spectral-progress-bar"></div>
        </div>
      </div>
    `;
        progressBar = preloader.querySelector(".spectral-progress-bar");
        wrap.appendChild(preloader);
    }

    return { wrap, canvas, preloader, progressBar, content, titleEl, subtextEl };
}

export async function createSpectralGhost(options) {
    const container = options?.container;
    if (!(container instanceof HTMLElement)) {
        throw new Error("createSpectralGhost({ container }) requires a valid HTMLElement container.");
    }

    const injectStyles = options?.injectStyles !== false;
    const showPreloader = options?.showPreloader !== false;

    if (injectStyles) ensureStyles();

    container.innerHTML = "";

    const text = { ...DEFAULT_TEXT, ...(options?.text || {}) };
    const { wrap, canvas, preloader, progressBar, content, titleEl, subtextEl } = createMarkup({
        showPreloader,
        text
    });
    container.appendChild(wrap);

    const params = { ...DEFAULT_PARAMS, ...(options?.params || {}) };
    const toggles = { ...DEFAULT_TOGGLES, ...(options?.toggles || {}) };

    const pre = {
        step: 0,
        total: 5,
        update(step) {
            if (!progressBar) return;
            this.step = Math.min(step, this.total);
            progressBar.style.width = `${(this.step / this.total) * 100}%`;
        },
        complete() {
            if (!preloader) {
                content.classList.add("fade-in");
                canvas.classList.add("fade-in");
                return;
            }
            this.update(this.total);
            setTimeout(() => {
                preloader.classList.add("fade-out");
                content.classList.add("fade-in");
                canvas.classList.add("fade-in");
                setTimeout(() => {
                    preloader.style.display = "none";
                }, 1000);
            }, 400);
        }
    };

    pre.update(1);
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 20;

    pre.update(2);
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
        alpha: true,
        premultipliedAlpha: false
    });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.setClearColor(0x000000, 0);

    pre.update(3);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 1.25, 0.0);
    composer.addPass(bloomPass);

    const analogDecayShader = {
        uniforms: {
            tDiffuse: { value: null },
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uAnalogGrain: { value: params.analogGrain },
            uAnalogBleeding: { value: params.analogBleeding },
            uAnalogVSync: { value: params.analogVSync },
            uAnalogScanlines: { value: params.analogScanlines },
            uAnalogVignette: { value: params.analogVignette },
            uAnalogJitter: { value: params.analogJitter },
            uAnalogIntensity: { value: params.analogIntensity },
            uLimboMode: { value: params.limboMode ? 1.0 : 0.0 }
        },
        vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uAnalogGrain;
      uniform float uAnalogBleeding;
      uniform float uAnalogVSync;
      uniform float uAnalogScanlines;
      uniform float uAnalogVignette;
      uniform float uAnalogJitter;
      uniform float uAnalogIntensity;
      uniform float uLimboMode;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float gaussian(float z, float u, float o) {
        return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
      }

      vec3 grain(vec2 uv, float time, float intensity) {
        float seed = dot(uv, vec2(12.9898, 78.233));
        float noise = fract(sin(seed) * 43758.5453 + time * 2.0);
        noise = gaussian(noise, 0.0, 0.5 * 0.5);
        return vec3(noise) * intensity;
      }

      void main() {
        vec2 uv = vUv;
        float time = uTime * 1.8;

        vec2 jitteredUV = uv;
        if (uAnalogJitter > 0.01) {
          float jitterAmount = (random(vec2(floor(time * 60.0))) - 0.5) * 0.003 * uAnalogJitter * uAnalogIntensity;
          jitteredUV.x += jitterAmount;
          jitteredUV.y += (random(vec2(floor(time * 30.0) + 1.0)) - 0.5) * 0.001 * uAnalogJitter * uAnalogIntensity;
        }

        if (uAnalogVSync > 0.01) {
          float vsyncRoll = sin(time * 2.0 + uv.y * 100.0) * 0.02 * uAnalogVSync * uAnalogIntensity;
          float vsyncChance = step(0.95, random(vec2(floor(time * 4.0))));
          jitteredUV.y += vsyncRoll * vsyncChance;
        }

        vec4 color = texture2D(tDiffuse, jitteredUV);

        if (uAnalogBleeding > 0.01) {
          float bleedAmount = 0.012 * uAnalogBleeding * uAnalogIntensity;
          float offsetPhase = time * 1.5 + uv.y * 20.0;
          vec2 redOffset = vec2(sin(offsetPhase) * bleedAmount, 0.0);
          vec2 blueOffset = vec2(-sin(offsetPhase * 1.1) * bleedAmount * 0.8, 0.0);
          float r = texture2D(tDiffuse, jitteredUV + redOffset).r;
          float g = texture2D(tDiffuse, jitteredUV).g;
          float b = texture2D(tDiffuse, jitteredUV + blueOffset).b;
          color = vec4(r, g, b, color.a);
        }

        if (uAnalogGrain > 0.01) {
          vec3 grainEffect = grain(uv, time, 0.075 * uAnalogGrain * uAnalogIntensity);
          grainEffect *= (1.0 - color.rgb);
          color.rgb += grainEffect;
        }

        if (uAnalogScanlines > 0.01) {
          float scanlineFreq = 600.0 + uAnalogScanlines * 400.0;
          float scanlinePattern = sin(uv.y * scanlineFreq) * 0.5 + 0.5;
          float scanlineIntensity = 0.1 * uAnalogScanlines * uAnalogIntensity;
          color.rgb *= (1.0 - scanlinePattern * scanlineIntensity);
          float horizontalLines = sin(uv.y * scanlineFreq * 0.1) * 0.02 * uAnalogScanlines * uAnalogIntensity;
          color.rgb *= (1.0 - horizontalLines);
        }

        if (uAnalogVignette > 0.01) {
          vec2 vignetteUV = (uv - 0.5) * 2.0;
          float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3 * uAnalogVignette * uAnalogIntensity;
          color.rgb *= vignette;
        }

        if (uLimboMode > 0.5) {
          float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          color.rgb = vec3(gray);
        }

        gl_FragColor = color;
      }
    `
    };

    const analogDecayPass = new ShaderPass(analogDecayShader);
    composer.addPass(analogDecayPass);
    composer.addPass(new OutputPass());

    const atmosphereGeometry = new THREE.PlaneGeometry(300, 300);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ghostPosition: { value: new THREE.Vector3(0, 0, 0) },
            revealRadius: { value: params.revealRadius },
            fadeStrength: { value: params.fadeStrength },
            baseOpacity: { value: params.baseOpacity },
            revealOpacity: { value: params.revealOpacity },
            time: { value: 0 }
        },
        vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform vec3 ghostPosition;
      uniform float revealRadius;
      uniform float fadeStrength;
      uniform float baseOpacity;
      uniform float revealOpacity;
      uniform float time;
      varying vec3 vWorldPosition;
      void main() {
        float dist = distance(vWorldPosition.xy, ghostPosition.xy);
        float dynamicRadius = revealRadius + sin(time * 2.0) * 5.0;
        float reveal = smoothstep(dynamicRadius * 0.2, dynamicRadius, dist);
        reveal = pow(reveal, fadeStrength);
        float opacity = mix(revealOpacity, baseOpacity, reveal);
        gl_FragColor = vec4(0.001, 0.001, 0.002, opacity);
      }
    `,
        transparent: true,
        depthWrite: false
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.position.z = -50;
    atmosphere.renderOrder = -100;
    scene.add(atmosphere);

    scene.add(new THREE.AmbientLight(0x0a0a2e, 0.08));
    const rim1 = new THREE.DirectionalLight(0x4a90e2, params.rimLightIntensity);
    rim1.position.set(-8, 6, -4);
    scene.add(rim1);
    const rim2 = new THREE.DirectionalLight(0x50e3c2, params.rimLightIntensity * 0.7);
    rim2.position.set(8, -4, -6);
    scene.add(rim2);

    const ghostGroup = new THREE.Group();
    scene.add(ghostGroup);

    const ghostGeometry = new THREE.SphereGeometry(2, 40, 40);
    const positionAttribute = ghostGeometry.getAttribute("position");
    const positions = positionAttribute.array;
    for (let i = 0; i < positions.length; i += 3) {
        if (positions[i + 1] < -0.2) {
            const x = positions[i];
            const z = positions[i + 2];
            const noise1 = Math.sin(x * 5) * 0.35;
            const noise2 = Math.cos(z * 4) * 0.25;
            const noise3 = Math.sin((x + z) * 3) * 0.15;
            positions[i + 1] = -2.0 + (noise1 + noise2 + noise3);
        }
    }
    ghostGeometry.computeVertexNormals();

    const ghostMaterial = new THREE.MeshStandardMaterial({
        color: params.bodyColor,
        transparent: true,
        opacity: params.ghostOpacity,
        emissive: FLUORESCENT[params.glowColor],
        emissiveIntensity: params.emissiveIntensity,
        roughness: 0.02,
        metalness: 0.0,
        side: THREE.DoubleSide,
        alphaTest: 0.1
    });
    const ghostBody = new THREE.Mesh(ghostGeometry, ghostMaterial);
    ghostGroup.add(ghostBody);

    function createEyes() {
        const eyeGroup = new THREE.Group();
        ghostGroup.add(eyeGroup);

        const socketGeometry = new THREE.SphereGeometry(0.45, 16, 16);
        const socketMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const leftSocket = new THREE.Mesh(socketGeometry, socketMaterial);
        leftSocket.position.set(-0.7, 0.6, 1.9);
        leftSocket.scale.set(1.1, 1.0, 0.6);
        eyeGroup.add(leftSocket);
        const rightSocket = new THREE.Mesh(socketGeometry, socketMaterial);
        rightSocket.position.set(0.7, 0.6, 1.9);
        rightSocket.scale.set(1.1, 1.0, 0.6);
        eyeGroup.add(rightSocket);

        const eyeGeometry = new THREE.SphereGeometry(0.3, 12, 12);
        const leftEyeMaterial = new THREE.MeshBasicMaterial({
            color: FLUORESCENT[params.eyeGlowColor],
            transparent: true,
            opacity: 0
        });
        const leftEye = new THREE.Mesh(eyeGeometry, leftEyeMaterial);
        leftEye.position.set(-0.7, 0.6, 2.0);
        eyeGroup.add(leftEye);

        const rightEyeMaterial = new THREE.MeshBasicMaterial({
            color: FLUORESCENT[params.eyeGlowColor],
            transparent: true,
            opacity: 0
        });
        const rightEye = new THREE.Mesh(eyeGeometry, rightEyeMaterial);
        rightEye.position.set(0.7, 0.6, 2.0);
        eyeGroup.add(rightEye);

        const outerGlowGeometry = new THREE.SphereGeometry(0.525, 12, 12);
        const leftOuterGlowMaterial = new THREE.MeshBasicMaterial({
            color: FLUORESCENT[params.eyeGlowColor],
            transparent: true,
            opacity: 0,
            side: THREE.BackSide
        });
        const leftOuterGlow = new THREE.Mesh(outerGlowGeometry, leftOuterGlowMaterial);
        leftOuterGlow.position.set(-0.7, 0.6, 1.95);
        eyeGroup.add(leftOuterGlow);

        const rightOuterGlowMaterial = new THREE.MeshBasicMaterial({
            color: FLUORESCENT[params.eyeGlowColor],
            transparent: true,
            opacity: 0,
            side: THREE.BackSide
        });
        const rightOuterGlow = new THREE.Mesh(outerGlowGeometry, rightOuterGlowMaterial);
        rightOuterGlow.position.set(0.7, 0.6, 1.95);
        eyeGroup.add(rightOuterGlow);

        return {
            eyeGroup,
            leftEyeMaterial,
            rightEyeMaterial,
            leftOuterGlowMaterial,
            rightOuterGlowMaterial
        };
    }

    const eyes = createEyes();

    const fireflies = [];
    const fireflyGroup = new THREE.Group();
    scene.add(fireflyGroup);
    for (let i = 0; i < 20; i++) {
        const fireflyGeometry = new THREE.SphereGeometry(0.02, 2, 2);
        const fireflyMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff44,
            transparent: true,
            opacity: 0.9
        });
        const firefly = new THREE.Mesh(fireflyGeometry, fireflyMaterial);
        firefly.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20
        );

        const glowGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff88,
            transparent: true,
            opacity: 0.4,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        firefly.add(glow);
        const fireflyLight = new THREE.PointLight(0xffff44, 0.8, 3, 2);
        firefly.add(fireflyLight);

        firefly.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * params.fireflySpeed,
                (Math.random() - 0.5) * params.fireflySpeed,
                (Math.random() - 0.5) * params.fireflySpeed
            ),
            phase: Math.random() * Math.PI * 2,
            pulseSpeed: 2 + Math.random() * 3,
            glowMaterial,
            fireflyMaterial,
            light: fireflyLight
        };
        fireflyGroup.add(firefly);
        fireflies.push(firefly);
    }

    const particles = [];
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);
    const particlePool = [];
    const particleGeometries = [
        new THREE.SphereGeometry(0.05, 6, 6),
        new THREE.TetrahedronGeometry(0.04, 0),
        new THREE.OctahedronGeometry(0.045, 0)
    ];
    const particleBaseMaterial = new THREE.MeshBasicMaterial({
        color: FLUORESCENT[params.particleColor],
        transparent: true,
        opacity: 0,
        alphaTest: 0.1
    });
    for (let i = 0; i < 100; i++) {
        const geometry = particleGeometries[Math.floor(Math.random() * particleGeometries.length)];
        const material = particleBaseMaterial.clone();
        const particle = new THREE.Mesh(geometry, material);
        particle.visible = false;
        particleGroup.add(particle);
        particlePool.push(particle);
    }

    function createParticle() {
        let particle;
        if (particlePool.length > 0) {
            particle = particlePool.pop();
            particle.visible = true;
        } else if (particles.length < params.particleCount) {
            const geometry = particleGeometries[Math.floor(Math.random() * particleGeometries.length)];
            const material = particleBaseMaterial.clone();
            particle = new THREE.Mesh(geometry, material);
            particleGroup.add(particle);
        } else {
            return null;
        }

        particle.position.copy(ghostGroup.position);
        particle.position.z -= 0.8 + Math.random() * 0.6;
        particle.position.x += (Math.random() - 0.5) * 3.5;
        particle.position.y += (Math.random() - 0.5) * 3.5 - 0.8;

        const size = 0.6 + Math.random() * 0.7;
        particle.scale.set(size, size, size);
        particle.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        particle.userData.life = 1.0;
        particle.userData.decay = Math.random() * 0.003 + params.particleDecayRate;
        particle.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.015,
            y: (Math.random() - 0.5) * 0.015,
            z: (Math.random() - 0.5) * 0.015
        };
        particle.userData.velocity = {
            x: (Math.random() - 0.5) * 0.012,
            y: (Math.random() - 0.5) * 0.012 - 0.002,
            z: (Math.random() - 0.5) * 0.012 - 0.006
        };
        particle.material.opacity = Math.random() * 0.9;
        particles.push(particle);
        return particle;
    }

    const mouse = new THREE.Vector2(0, 0);
    const prevMouse = new THREE.Vector2(0, 0);
    const mouseSpeed = new THREE.Vector2(0, 0);
    let lastMouseUpdate = 0;
    let isMouseMoving = false;
    let mouseMovementTimer = null;

    function onPointerMove(e) {
        const now = performance.now();
        if (now - lastMouseUpdate < 16) return;
        const rect = wrap.getBoundingClientRect();
        const cx = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
        const cy = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
        prevMouse.x = mouse.x;
        prevMouse.y = mouse.y;
        mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
        mouse.y = -(((cy - rect.top) / rect.height) * 2 - 1);
        mouseSpeed.x = mouse.x - prevMouse.x;
        mouseSpeed.y = mouse.y - prevMouse.y;
        isMouseMoving = true;
        if (mouseMovementTimer) clearTimeout(mouseMovementTimer);
        mouseMovementTimer = setTimeout(() => {
            isMouseMoving = false;
        }, 80);
        lastMouseUpdate = now;
    }

    wrap.addEventListener("pointermove", onPointerMove, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
        const rect = wrap.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        bloomPass.setSize(w, h);
        analogDecayPass.uniforms.uResolution.value.set(w, h);
    });
    resizeObserver.observe(wrap);
    {
        const rect = wrap.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        bloomPass.setSize(w, h);
        analogDecayPass.uniforms.uResolution.value.set(w, h);
    }

    function applyToggles() {
        ghostGroup.visible = !!toggles.ghost;
        content.style.display = toggles.text ? "" : "none";
        particleGroup.visible = !!toggles.particles;
        fireflyGroup.visible = !!toggles.fireflies;
        atmosphere.visible = !!toggles.reveal;
        bloomPass.enabled = !!toggles.bloom;
        analogDecayPass.enabled = !!toggles.analog;
    }
    applyToggles();

    pre.update(4);
    function forceInitialRender() {
        for (let i = 0; i < 3; i++) composer.render();
        for (let i = 0; i < 10; i++) createParticle();
        composer.render();
        pre.complete();
    }
    pre.update(5);
    setTimeout(forceInitialRender, 100);

    let raf = 0;
    let time = 0;
    let currentMovement = 0;
    let lastFrameTime = 0;
    let frameCount = 0;
    let lastParticleTime = 0;

    function loop(ts) {
        raf = requestAnimationFrame(loop);
        if (!toggles.enabled) return;

        const deltaTime = ts - lastFrameTime;
        lastFrameTime = ts;
        if (deltaTime > 100) return;
        const dt = (deltaTime / 16.67) * 0.01;
        time += dt;
        frameCount++;

        atmosphereMaterial.uniforms.time.value = time;
        analogDecayPass.uniforms.uTime.value = time;
        analogDecayPass.uniforms.uLimboMode.value = params.limboMode ? 1.0 : 0.0;
        analogDecayPass.uniforms.uAnalogIntensity.value = params.analogIntensity;
        analogDecayPass.uniforms.uAnalogGrain.value = params.analogGrain;
        analogDecayPass.uniforms.uAnalogBleeding.value = params.analogBleeding;
        analogDecayPass.uniforms.uAnalogVSync.value = params.analogVSync;
        analogDecayPass.uniforms.uAnalogScanlines.value = params.analogScanlines;
        analogDecayPass.uniforms.uAnalogVignette.value = params.analogVignette;
        analogDecayPass.uniforms.uAnalogJitter.value = params.analogJitter;

        const targetX = mouse.x * 11;
        const targetY = mouse.y * 7;
        const prevGhostPosition = ghostGroup.position.clone();
        ghostGroup.position.x += (targetX - ghostGroup.position.x) * params.followSpeed;
        ghostGroup.position.y += (targetY - ghostGroup.position.y) * params.followSpeed;

        atmosphereMaterial.uniforms.ghostPosition.value.copy(ghostGroup.position);

        const movementAmount = prevGhostPosition.distanceTo(ghostGroup.position);
        currentMovement =
            currentMovement * params.eyeGlowDecay +
            movementAmount * (1 - params.eyeGlowDecay);

        ghostGroup.position.y +=
            Math.sin(time * params.floatSpeed * 1.5) * 0.03 +
            Math.cos(time * params.floatSpeed * 0.7) * 0.018 +
            Math.sin(time * params.floatSpeed * 2.3) * 0.008;

        const pulse1 = Math.sin(time * params.pulseSpeed) * params.pulseIntensity;
        const breathe = Math.sin(time * 0.6) * 0.12;
        ghostMaterial.emissiveIntensity = params.emissiveIntensity + pulse1 + breathe;

        for (const firefly of fireflies) {
            const u = firefly.userData;
            const p = Math.sin((time + u.phase) * u.pulseSpeed) * 0.4 + 0.6;
            u.glowMaterial.opacity = params.fireflyGlowIntensity * 0.4 * p;
            u.fireflyMaterial.opacity = params.fireflyGlowIntensity * 0.9 * p;
            u.light.intensity = params.fireflyGlowIntensity * 0.8 * p;

            u.velocity.x += (Math.random() - 0.5) * 0.001;
            u.velocity.y += (Math.random() - 0.5) * 0.001;
            u.velocity.z += (Math.random() - 0.5) * 0.001;
            u.velocity.clampLength(0, params.fireflySpeed);
            firefly.position.add(u.velocity);
            if (Math.abs(firefly.position.x) > 30) u.velocity.x *= -0.5;
            if (Math.abs(firefly.position.y) > 20) u.velocity.y *= -0.5;
            if (Math.abs(firefly.position.z) > 15) u.velocity.z *= -0.5;
        }

        const mouseDirection = new THREE.Vector2(
            targetX - ghostGroup.position.x,
            targetY - ghostGroup.position.y
        ).normalize();
        const tiltStrength = 0.1 * params.wobbleAmount;
        const tiltDecay = 0.95;
        ghostBody.rotation.z =
            ghostBody.rotation.z * tiltDecay +
            -mouseDirection.x * tiltStrength * (1 - tiltDecay);
        ghostBody.rotation.x =
            ghostBody.rotation.x * tiltDecay +
            mouseDirection.y * tiltStrength * (1 - tiltDecay);
        ghostBody.rotation.y = Math.sin(time * 1.4) * 0.05 * params.wobbleAmount;

        const isMoving = currentMovement > params.movementThreshold;
        const targetGlow = isMoving ? 1.0 : 0.0;
        const glowChangeSpeed = isMoving ? params.eyeGlowResponse * 2 : params.eyeGlowResponse;
        const newOpacity =
            eyes.leftEyeMaterial.opacity +
            (targetGlow - eyes.leftEyeMaterial.opacity) * glowChangeSpeed;
        eyes.leftEyeMaterial.opacity = newOpacity;
        eyes.rightEyeMaterial.opacity = newOpacity;
        eyes.leftOuterGlowMaterial.opacity = newOpacity * 0.3;
        eyes.rightOuterGlowMaterial.opacity = newOpacity * 0.3;

        const normalizedMouseSpeed = Math.sqrt(mouseSpeed.x ** 2 + mouseSpeed.y ** 2) * 8;
        const shouldCreateParticles = params.createParticlesOnlyWhenMoving
            ? currentMovement > 0.005 && isMouseMoving
            : currentMovement > 0.005;

        if (toggles.particles && shouldCreateParticles && ts - lastParticleTime > 100) {
            const speedRate = Math.floor(normalizedMouseSpeed * 3);
            const rate = Math.min(params.particleCreationRate, Math.max(1, speedRate));
            for (let i = 0; i < rate; i++) createParticle();
            lastParticleTime = ts;
        }

        const toUpdate = Math.min(particles.length, 60);
        for (let i = 0; i < toUpdate; i++) {
            const index = (frameCount + i) % particles.length;
            const particle = particles[index];
            if (!particle) continue;
            particle.userData.life -= particle.userData.decay;
            particle.material.opacity = particle.userData.life * 0.85;
            particle.position.x += particle.userData.velocity.x;
            particle.position.y += particle.userData.velocity.y;
            particle.position.z += particle.userData.velocity.z;
            particle.position.x += Math.cos(time * 1.8 + particle.position.y) * 0.0008;
            particle.rotation.x += particle.userData.rotationSpeed.x;
            particle.rotation.y += particle.userData.rotationSpeed.y;
            particle.rotation.z += particle.userData.rotationSpeed.z;
            if (particle.userData.life <= 0) {
                particle.visible = false;
                particle.material.opacity = 0;
                particlePool.push(particle);
                particles.splice(index, 1);
                i--;
            }
        }

        composer.render();
    }

    {
        const rect = wrap.getBoundingClientRect();
        mouse.x = 0;
        mouse.y = 0;
        const fake = new PointerEvent("pointermove", {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
        });
        onPointerMove(fake);
    }

    raf = requestAnimationFrame(loop);

    function setParams(partial) {
        Object.assign(params, partial || {});
        ghostMaterial.color.set(params.bodyColor);
        ghostMaterial.opacity = params.ghostOpacity;
        ghostMaterial.emissive.set(FLUORESCENT[params.glowColor] ?? params.glowColor);
        ghostMaterial.emissiveIntensity = params.emissiveIntensity;
        particleBaseMaterial.color.set(FLUORESCENT[params.particleColor] ?? params.particleColor);
        atmosphereMaterial.uniforms.revealRadius.value = params.revealRadius;
        atmosphereMaterial.uniforms.fadeStrength.value = params.fadeStrength;
        atmosphereMaterial.uniforms.baseOpacity.value = params.baseOpacity;
        atmosphereMaterial.uniforms.revealOpacity.value = params.revealOpacity;
        const eyeColor = FLUORESCENT[params.eyeGlowColor] ?? params.eyeGlowColor;
        eyes.leftEyeMaterial.color.set(eyeColor);
        eyes.rightEyeMaterial.color.set(eyeColor);
        eyes.leftOuterGlowMaterial.color.set(eyeColor);
        eyes.rightOuterGlowMaterial.color.set(eyeColor);
    }

    function setToggles(partial) {
        Object.assign(toggles, partial || {});
        applyToggles();
    }

    function setText(partial) {
        if (!partial) return;
        if (Array.isArray(partial.titleLines)) {
            text.titleLines = partial.titleLines;
            const safeLines = text.titleLines.map((l) => escapeHtml(l)).filter((l) => l.length > 0);
            titleEl.innerHTML = safeLines.join("<br />");
        }
        if (partial.subtext !== undefined) {
            text.subtext = String(partial.subtext);
            subtextEl.textContent = text.subtext;
        }
    }

    function destroy() {
        cancelAnimationFrame(raf);
        wrap.removeEventListener("pointermove", onPointerMove);
        if (mouseMovementTimer) clearTimeout(mouseMovementTimer);
        resizeObserver.disconnect();
        try {
            renderer.dispose();
        } catch { }
        container.innerHTML = "";
    }

    return {
        destroy,
        setParams,
        setToggles,
        setText,
        state: { params, toggles }
    };
}
