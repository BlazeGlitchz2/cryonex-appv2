import { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

interface NeonHockeyProps {
  isMinimized: boolean;
}

export function NeonHockey({ isMinimized }: NeonHockeyProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [isLocked, setIsLocked] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Physics State for Momentum
  const lastPaddle1Pos = useRef({ x: 30, y: 60 });
  const lastPaddle2Pos = useRef({ x: 244, y: 60 });
  
  // Game State
  const gameState = useRef({
    ball: { x: 150, y: 75, dx: 0, dy: 0, size: 6, mass: 1, spin: 0 },
    paddle1: { x: 30, y: 60, height: 30, width: 30, vx: 0, vy: 0, mass: 10 },
    paddle2: { x: 244, y: 60, height: 30, width: 30, vx: 0, vy: 0, mass: 10 },
    width: 300,
    height: 150,
    lastScorer: 'none' as 'player' | 'ai' | 'none',
    friction: 0.992, // Ice friction
    airResistance: 0.999 // Air drag
  });

  // Handle Pointer Lock Change
  useEffect(() => {
    const handleLockChange = () => {
      // @ts-ignore
      const currentLock = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
      const isCanvasLocked = currentLock === canvasRef.current;
      setIsLocked(isCanvasLocked);
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener("pointerlockchange", handleLockChange);
      document.addEventListener("mozpointerlockchange", handleLockChange);
      document.addEventListener("webkitpointerlockchange", handleLockChange);
      return () => {
        document.removeEventListener("pointerlockchange", handleLockChange);
        document.removeEventListener("mozpointerlockchange", handleLockChange);
        document.removeEventListener("webkitpointerlockchange", handleLockChange);
      };
    }
  }, []);

  const toggleLock = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.focus();
      // @ts-ignore
      const currentLock = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
      
      if (currentLock === canvas) {
        // @ts-ignore
        const exitLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
        if (exitLock) exitLock.call(document);
      } else {
        // @ts-ignore
        const requestLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        if (requestLock) {
            await requestLock.call(canvas);
        }
      }
    } catch (err) {
      console.error("Pointer lock error:", err);
    }
  };

  // Reset position when mounted or reset
  useEffect(() => {
    setScore({ player: 0, ai: 0 });
    gameState.current.lastScorer = 'none';
    resetBall();
  }, []);

  const resetBall = () => {
    const state = gameState.current;
    state.ball = {
      x: state.width / 2,
      y: state.height / 2,
      dx: 0,
      dy: 0,
      size: 6,
      mass: 1,
      spin: 0
    };

    let dirX = 0;
    if (state.lastScorer === 'player') dirX = -1;
    else if (state.lastScorer === 'ai') dirX = 1;
    else dirX = Math.random() > 0.5 ? 1 : -1;

    setTimeout(() => {
      if (canvasRef.current && isPlaying) {
        state.ball.dx = dirX * 3;
        state.ball.dy = (Math.random() * 2 - 1) * 2.5;
      }
    }, 1000);
  };

  const checkCircleCollision = (c1: {x: number, y: number, r: number}, c2: {x: number, y: number, r: number}) => {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (c1.r + c2.r);
  };

  const resolveCollision = (ball: any, paddle: any) => {
    const paddleCenterX = paddle.x + paddle.width / 2;
    const paddleCenterY = paddle.y + paddle.height / 2;
    const paddleRadius = paddle.width / 2;

    const dx = ball.x - paddleCenterX;
    const dy = ball.y - paddleCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normal vector (collision direction)
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const rvx = ball.dx - paddle.vx;
    const rvy = ball.dy - paddle.vy;

    // Velocity along normal
    const velAlongNormal = rvx * nx + rvy * ny;

    // Do not resolve if velocities are separating
    if (velAlongNormal > 0) return;

    // Coefficient of Restitution (bounciness)
    const e = 0.95; 

    // Impulse scalar (simplified for game feel, assuming paddle has infinite mass relative to puck)
    let j = -(1 + e) * velAlongNormal;
    
    // Apply impulse to ball
    ball.dx += j * nx;
    ball.dy += j * ny;

    // Add "Smash" factor: Transfer some paddle velocity directly to make it feel responsive
    // This simulates the active force applied by the player
    ball.dx += paddle.vx * 0.4;
    ball.dy += paddle.vy * 0.4;

    // Spin Transfer (Tangential Force)
    // Tangent vector
    const tx = -ny;
    const ty = nx;
    
    // Velocity along tangent
    const velAlongTangent = rvx * tx + rvy * ty;
    
    // Friction impulse for spin (approximate)
    const mu = 0.2; // Friction coefficient during collision
    const frictionImpulse = -velAlongTangent * mu;
    
    // Apply spin
    ball.spin += frictionImpulse * 0.5;

    // Separate overlapping objects to prevent sticking (Static Resolution)
    const overlap = (ball.size + paddleRadius) - distance + 1;
    if (overlap > 0) {
        ball.x += nx * overlap;
        ball.y += ny * overlap;
    }
  };

  const update = () => {
    const state = gameState.current;
    const { ball, paddle1, paddle2, width, height, friction, airResistance } = state;

    // Calculate Paddle Velocities (Instantaneous)
    paddle1.vx = paddle1.x - lastPaddle1Pos.current.x;
    paddle1.vy = paddle1.y - lastPaddle1Pos.current.y;
    paddle2.vx = paddle2.x - lastPaddle2Pos.current.x;
    paddle2.vy = paddle2.y - lastPaddle2Pos.current.y;

    lastPaddle1Pos.current = { x: paddle1.x, y: paddle1.y };
    lastPaddle2Pos.current = { x: paddle2.x, y: paddle2.y };

    // Apply Physics Forces to Ball
    // 1. Air Resistance (Drag)
    ball.dx *= airResistance;
    ball.dy *= airResistance;

    // 2. Surface Friction
    ball.dx *= friction;
    ball.dy *= friction;

    // 3. Magnus Effect (Spin influence on trajectory - simplified for 2D)
    // In 2D top-down, spin mainly affects wall bounces, but we can add a slight curve
    // ball.dx += ball.spin * 0.001 * ball.dy; // Very subtle curve
    // ball.dy -= ball.spin * 0.001 * ball.dx;

    let nextX = ball.x + ball.dx;
    let nextY = ball.y + ball.dy;

    // Wall Collisions with Spin Effect
    const wallRestitution = 0.85;
    
    if (nextY - ball.size < 0) {
      nextY = ball.size;
      ball.dy = Math.abs(ball.dy) * wallRestitution;
      // Spin affects bounce angle (friction with wall)
      ball.dx += ball.spin * 0.3;
      ball.spin *= 0.8; // Spin decay on impact
    } else if (nextY + ball.size > height) {
      nextY = height - ball.size;
      ball.dy = -Math.abs(ball.dy) * wallRestitution;
      ball.dx -= ball.spin * 0.3;
      ball.spin *= 0.8;
    }

    const goalGate = 40;
    const center = height / 2;

    // Left/Right Walls (Goals)
    if (nextX - ball.size < 0) {
      if (ball.y < center - goalGate || ball.y > center + goalGate) {
        nextX = ball.size;
        ball.dx = Math.abs(ball.dx) * wallRestitution;
        ball.dy += ball.spin * 0.3;
        ball.spin *= 0.8;
      }
    } 
    else if (nextX + ball.size > width) {
      if (ball.y < center - goalGate || ball.y > center + goalGate) {
        nextX = width - ball.size;
        ball.dx = -Math.abs(ball.dx) * wallRestitution;
        ball.dy -= ball.spin * 0.3;
        ball.spin *= 0.8;
      }
    }

    ball.x = nextX;
    ball.y = nextY;

    // Collision Detection
    const ballCircle = { x: ball.x, y: ball.y, r: ball.size };
    const p1Circle = { x: paddle1.x + paddle1.width/2, y: paddle1.y + paddle1.height/2, r: paddle1.width/2 };
    const p2Circle = { x: paddle2.x + paddle2.width/2, y: paddle2.y + paddle2.height/2, r: paddle2.width/2 };

    if (checkCircleCollision(ballCircle, p1Circle)) {
        resolveCollision(ball, paddle1);
    }

    if (checkCircleCollision(ballCircle, p2Circle)) {
        resolveCollision(ball, paddle2);
    }

    // Cap max speed to prevent tunneling
    const maxSpeed = 12;
    const speed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
    if (speed > maxSpeed) {
        const ratio = maxSpeed / speed;
        ball.dx *= ratio;
        ball.dy *= ratio;
    }
    
    // Stop if very slow
    if (speed < 0.05 && speed > 0) {
        ball.dx = 0;
        ball.dy = 0;
        ball.spin = 0;
    }

    // Scoring
    if (ball.x < -20) {
      setScore(s => ({ ...s, ai: s.ai + 1 }));
      state.lastScorer = 'ai';
      resetBall();
    } else if (ball.x > width + 20) {
      setScore(s => ({ ...s, player: s.player + 1 }));
      state.lastScorer = 'player';
      resetBall();
    }

    // AI Logic (Simplified but effective)
    const aiCenterY = paddle2.y + paddle2.height / 2;
    let targetY = aiCenterY;
    let targetX = paddle2.x;
    
    if (ball.dx > 0) {
        // Predict where ball will be
        targetY = ball.y + (Math.random() * 40 - 20); // Add error
        if (ball.x > width/2 && ball.x < paddle2.x) {
             targetX = Math.max(width/2 + 20, ball.x - 10);
        } else {
             targetX = width - 40;
        }
    } else {
        targetY = height / 2;
        targetX = width - 30;
    }

    const aiSpeed = 1.8; // Slightly faster to keep up with physics
    const dy = targetY - aiCenterY;
    const dx = targetX - paddle2.x;
    
    if (Math.abs(dy) > aiSpeed) paddle2.y += Math.sign(dy) * aiSpeed;
    else paddle2.y += dy;
    
    if (Math.abs(dx) > aiSpeed) paddle2.x += Math.sign(dx) * aiSpeed;
    else paddle2.x += dx;
    
    paddle2.y = Math.max(0, Math.min(height - paddle2.height, paddle2.y));
    paddle2.x = Math.max(width / 2 + 10, Math.min(width - paddle2.width - 5, paddle2.x));

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, ball, paddle1, paddle2 } = gameState.current;

    ctx.fillStyle = "#1a1a1a"; 
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(width/2, height/2, 25, 0, Math.PI*2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
    ctx.beginPath();
    ctx.arc(0, height/2, 30, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(width, height/2, 30, Math.PI/2, -Math.PI/2);
    ctx.stroke();

    ctx.fillStyle = "#0EE6B7";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#0EE6B7";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (ball.dx === 0 && isPlaying) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "white";
      ctx.fillText("GET READY", width / 2, height / 2 - 40);
      ctx.shadowBlur = 0;
    }

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#F472B6";
    
    ctx.beginPath();
    ctx.arc(paddle1.x + paddle1.width/2, paddle1.y + paddle1.height/2, paddle1.width/2, 0, Math.PI * 2);
    ctx.fillStyle = "#F472B6";
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(paddle1.x + paddle1.width/2, paddle1.y + paddle1.height/2, paddle1.width/2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = "#EC4899";
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(paddle1.x + paddle1.width/2, paddle1.y + paddle1.height/2, paddle1.width/4, 0, Math.PI * 2);
    ctx.fillStyle = "#831843";
    ctx.fill();

    ctx.shadowColor = "#60A5FA";
    
    ctx.beginPath();
    ctx.arc(paddle2.x + paddle2.width/2, paddle2.y + paddle2.height/2, paddle2.width/2, 0, Math.PI * 2);
    ctx.fillStyle = "#60A5FA";
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(paddle2.x + paddle2.width/2, paddle2.y + paddle2.height/2, paddle2.width/2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = "#3B82F6";
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(paddle2.x + paddle2.width/2, paddle2.y + paddle2.height/2, paddle2.width/4, 0, Math.PI * 2);
    ctx.fillStyle = "#1E3A8A";
    ctx.fill();
    
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    if (isPlaying && !isMinimized) {
      if (!requestRef.current) {
          requestRef.current = requestAnimationFrame(update);
      }
      if (gameState.current.ball.dx === 0) {
          resetBall();
      }
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = 0;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isMinimized]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const { paddle1, width, height } = gameState.current;
    
    // @ts-ignore
    const currentLock = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
    const isLocked = currentLock === canvasRef.current;

    if (isLocked) {
        const movementX = e.nativeEvent.movementX || 0;
        const movementY = e.nativeEvent.movementY || 0;
        
        paddle1.x += movementX;
        paddle1.y += movementY;
    } else {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        paddle1.x = x - paddle1.width / 2;
        paddle1.y = y - paddle1.height / 2;
    }

    paddle1.y = Math.max(0, Math.min(height - paddle1.height, paddle1.y));
    paddle1.x = Math.max(0, Math.min((width / 2) - paddle1.width - 5, paddle1.x));

    if (!isPlaying) draw();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    // Prevent default to stop scrolling/zooming on smartboards
    if (e.cancelable) e.preventDefault();
    
    try {
        const { paddle1, width, height } = gameState.current;
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        
        // Calculate scale factors in case canvas is resized via CSS
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        
        paddle1.x = x - paddle1.width / 2;
        paddle1.y = y - paddle1.height / 2;

        paddle1.y = Math.max(0, Math.min(height - paddle1.height, paddle1.y));
        paddle1.x = Math.max(0, Math.min((width / 2) - paddle1.width - 5, paddle1.x));

        if (!isPlaying) draw();
    } catch (err) {
        console.error("Touch move error:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Score Board */}
      <div className="h-12 bg-[#0A0A0B] flex items-center justify-center gap-6 border-b border-white/5 shadow-lg z-10 shrink-0">
        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
          <span className="text-[10px] font-bold text-pink-500 tracking-wider">YOU</span>
          <span className="text-xl font-mono font-bold text-white leading-none">{score.player}</span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
          <span className="text-xl font-mono font-bold text-white leading-none">{score.ai}</span>
          <span className="text-[10px] font-bold text-blue-500 tracking-wider">CPU</span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4 bg-[#050505]">
        {/* Table Bezel/Frame */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl border-[6px] border-[#222] bg-[#1a1a1a] group">
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] z-10 rounded-lg" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-transparent z-20 opacity-50" />

            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onTouchStart={(e) => {
                  // Prevent default to stop scrolling/zooming on smartboards
                  if(e.cancelable) e.preventDefault();
                  handleTouchMove(e);
              }}
              onClick={() => {
                if (isPlaying && !isLocked) toggleLock();
              }}
              className="block cursor-none touch-none bg-[#151515] max-w-full h-auto"
              tabIndex={0}
            />
            
            {!isPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] z-30">
                <button
                  onClick={() => {
                    setIsPlaying(true);
                    // Only try to lock on non-touch devices
                    if (!('ontouchstart' in window)) {
                        setTimeout(() => toggleLock(), 50);
                    }
                  }}
                  className="group flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-black rounded-full text-xs font-bold transition-all hover:scale-105 shadow-lg shadow-primary/20"
                >
                  {score.player === 0 && score.ai === 0 ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      START GAME
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      RESUME
                    </>
                  )}
                </button>
                <p className="text-[10px] text-white/40 mt-3 font-medium tracking-wide hidden sm:block">CLICK TO LOCK MOUSE</p>
                <p className="text-[10px] text-white/40 mt-3 font-medium tracking-wide sm:hidden">TAP TO PLAY</p>
              </div>
            )}

            {/* Lock Button Overlay - Hide on touch devices */}
            <div className="absolute top-2 right-2 z-40 hidden sm:block">
                <button 
                  onClick={toggleLock}
                  className={`p-1.5 rounded-md transition-all ${isLocked ? 'text-primary bg-primary/10' : 'text-white/20 hover:text-white hover:bg-white/10'}`}
                  title={isLocked ? "Unlock Mouse" : "Lock Mouse"}
                >
                  {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}