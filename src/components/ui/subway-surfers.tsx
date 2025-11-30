import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Move, Minimize2, Maximize2, Play, RotateCcw, Lock, Unlock } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { toast } from "sonner";

export function SubwaySurfersOverlay() {
  const { showSubwaySurfers, toggleSubwaySurfers } = useUIStore();
  const [isMinimized, setIsMinimized] = useState(false);
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
    ball: { x: 150, y: 75, dx: 0, dy: 0, size: 6 }, // Slightly larger puck
    paddle1: { x: 30, y: 60, height: 30, width: 30 }, // Larger mallet
    paddle2: { x: 244, y: 60, height: 30, width: 30 }, // Larger mallet
    width: 300,
    height: 150,
    lastScorer: 'none' as 'player' | 'ai' | 'none'
  });

  // Handle Pointer Lock Change
  useEffect(() => {
    const handleLockChange = () => {
      // Safely check if the locked element is our canvas
      // @ts-ignore
      const currentLock = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
      const isCanvasLocked = currentLock === canvasRef.current;
      setIsLocked(isCanvasLocked);
    };
    
    // Add safety check for document existence
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
      // @ts-ignore
      const currentLock = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
      
      if (currentLock === canvas) {
        // @ts-ignore
        const exitLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
        if (exitLock) exitLock.call(document);
      } else {
        // Request lock
        // @ts-ignore
        const requestLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        
        if (requestLock) {
            // Try with unadjustedMovement first (better for games, removes OS acceleration)
            try {
                // @ts-ignore
                const promise = requestLock.call(canvas, { unadjustedMovement: true });
                if (promise && typeof promise.catch === 'function') {
                    await promise;
                }
            } catch (err) {
                // Fallback to basic lock if unadjustedMovement is not supported
                // @ts-ignore
                requestLock.call(canvas);
            }
        }
      }
    } catch (err) {
      console.error("Pointer lock error:", err);
      // Don't show toast for user cancellation, only for actual errors
      if (err instanceof Error && err.name !== 'SecurityError') {
         toast.error("Could not lock mouse. Try clicking the game area.");
      }
    }
  };

  // Reset position when opened
  useEffect(() => {
    if (showSubwaySurfers) {
      setIsMinimized(false);
      setIsPlaying(false);
      setScore({ player: 0, ai: 0 });
      gameState.current.lastScorer = 'none';
      resetBall();
    }
  }, [showSubwaySurfers]);

  const resetBall = () => {
    const state = gameState.current;
    state.ball = {
      x: state.width / 2,
      y: state.height / 2,
      dx: 0,
      dy: 0,
      size: 6
    };

    // Determine direction based on who scored last
    let dirX = 0;
    if (state.lastScorer === 'player') dirX = -1;
    else if (state.lastScorer === 'ai') dirX = 1;
    else dirX = Math.random() > 0.5 ? 1 : -1;

    setTimeout(() => {
      if (canvasRef.current && isPlaying) {
        state.ball.dx = dirX * 4; // Faster start
        state.ball.dy = (Math.random() * 2 - 1) * 3;
      }
    }, 1000);
  };

  // Improved Physics Helper: Circle Collision
  const checkCircleCollision = (c1: {x: number, y: number, r: number}, c2: {x: number, y: number, r: number}) => {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (c1.r + c2.r);
  };

  const resolveCollision = (ball: any, paddle: any, pvx: number, pvy: number) => {
    const paddleCenterX = paddle.x + paddle.width / 2;
    const paddleCenterY = paddle.y + paddle.height / 2;
    const paddleRadius = paddle.width / 2;

    const dx = ball.x - paddleCenterX;
    const dy = ball.y - paddleCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normal vector (direction from paddle center to ball center)
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const rvx = ball.dx - pvx;
    const rvy = ball.dy - pvy;

    // Velocity along normal
    const velAlongNormal = rvx * nx + rvy * ny;

    // Do not resolve if velocities are separating
    if (velAlongNormal > 0) return;

    // Restitution (bounciness) - High for air hockey
    const e = 1.1; 

    // Impulse scalar
    let j = -(1 + e) * velAlongNormal;

    // Apply impulse
    ball.dx += j * nx;
    ball.dy += j * ny;

    // Add momentum transfer from paddle (add some "english")
    ball.dx += pvx * 0.4;
    ball.dy += pvy * 0.4;

    // Separate circles to prevent sticking (Push ball out)
    const overlap = (ball.size + paddleRadius) - distance + 1; // +1 buffer
    if (overlap > 0) {
        ball.x += nx * overlap;
        ball.y += ny * overlap;
    }
  };

  const update = () => {
    const state = gameState.current;
    const { ball, paddle1, paddle2, width, height } = state;

    // Calculate Paddle Velocities for Momentum
    const p1vx = paddle1.x - lastPaddle1Pos.current.x;
    const p1vy = paddle1.y - lastPaddle1Pos.current.y;
    const p2vx = paddle2.x - lastPaddle2Pos.current.x;
    const p2vy = paddle2.y - lastPaddle2Pos.current.y;

    // Update last positions
    lastPaddle1Pos.current = { x: paddle1.x, y: paddle1.y };
    lastPaddle2Pos.current = { x: paddle2.x, y: paddle2.y };

    // Predict next position
    let nextX = ball.x + ball.dx;
    let nextY = ball.y + ball.dy;

    // Wall Collisions (Top/Bottom)
    if (nextY - ball.size < 0) {
      nextY = ball.size;
      ball.dy = Math.abs(ball.dy) * 0.95; // Slight energy loss
    } else if (nextY + ball.size > height) {
      nextY = height - ball.size;
      ball.dy = -Math.abs(ball.dy) * 0.95;
    }

    // Wall Collisions (Left/Right) - Bounce if not goal
    const goalGate = 40; // Wider goal
    const center = height / 2;

    // Left Wall
    if (nextX - ball.size < 0) {
      if (ball.y < center - goalGate || ball.y > center + goalGate) {
        nextX = ball.size;
        ball.dx = Math.abs(ball.dx) * 0.9; // Dampen wall hits
      }
    } 
    // Right Wall
    else if (nextX + ball.size > width) {
      if (ball.y < center - goalGate || ball.y > center + goalGate) {
        nextX = width - ball.size;
        ball.dx = -Math.abs(ball.dx) * 0.9;
      }
    }

    // Update ball position temporarily for collision check
    ball.x = nextX;
    ball.y = nextY;

    // Paddle Collisions (Circle-Circle)
    const ballCircle = { x: ball.x, y: ball.y, r: ball.size };
    const p1Circle = { x: paddle1.x + paddle1.width/2, y: paddle1.y + paddle1.height/2, r: paddle1.width/2 };
    const p2Circle = { x: paddle2.x + paddle2.width/2, y: paddle2.y + paddle2.height/2, r: paddle2.width/2 };

    if (checkCircleCollision(ballCircle, p1Circle)) {
        resolveCollision(ball, paddle1, p1vx, p1vy);
    }

    if (checkCircleCollision(ballCircle, p2Circle)) {
        resolveCollision(ball, paddle2, p2vx, p2vy);
    }

    // Friction (Air hockey has very low friction)
    ball.dx *= 0.995;
    ball.dy *= 0.995;

    // Cap Speed (Dynamic cap)
    const maxSpeed = 12;
    const speed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
    if (speed > maxSpeed) {
        const ratio = maxSpeed / speed;
        ball.dx *= ratio;
        ball.dy *= ratio;
    }
    // Min Speed (prevent stalling completely)
    if (speed < 0.1 && speed > 0) {
        ball.dx = 0;
        ball.dy = 0;
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

    // AI Movement (Improved)
    const aiCenterY = paddle2.y + paddle2.height / 2;
    
    // AI Strategy
    let targetY = aiCenterY;
    let targetX = paddle2.x;
    
    if (ball.dx > 0) { // Ball coming towards AI
        // Predict intersection with AI defense line
        // Simple prediction: y + dy * t
        targetY = ball.y + (Math.random() * 20 - 10); // Add error
        
        // Aggressive: Move forward to hit if ball is close
        if (ball.x > width/2 && ball.x < paddle2.x) {
             targetX = Math.max(width/2 + 20, ball.x - 10);
        } else {
             targetX = width - 40; // Base position
        }
    } else {
        // Return to center
        targetY = height / 2;
        targetX = width - 30;
    }

    // Move AI
    const aiSpeed = 2.5;
    const dy = targetY - aiCenterY;
    const dx = targetX - paddle2.x;
    
    if (Math.abs(dy) > aiSpeed) paddle2.y += Math.sign(dy) * aiSpeed;
    else paddle2.y += dy;
    
    if (Math.abs(dx) > aiSpeed) paddle2.x += Math.sign(dx) * aiSpeed;
    else paddle2.x += dx;
    
    // Clamp AI Position
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

    // Clear with a surface texture color
    ctx.fillStyle = "#1a1a1a"; 
    ctx.fillRect(0, 0, width, height);

    // Draw Court Lines (Hockey Style) - Glowing
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    
    // Center Line
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Center Circle
    ctx.beginPath();
    ctx.arc(width/2, height/2, 25, 0, Math.PI*2);
    ctx.stroke();

    // Goal Creases (Red)
    ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
    ctx.beginPath();
    ctx.arc(0, height/2, 30, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(width, height/2, 30, Math.PI/2, -Math.PI/2);
    ctx.stroke();

    // Draw Ball (Puck) - Neon Glow
    ctx.fillStyle = "#0EE6B7";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#0EE6B7";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw "Get Ready"
    if (ball.dx === 0 && isPlaying) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "white";
      ctx.fillText("GET READY", width / 2, height / 2 - 40);
      ctx.shadowBlur = 0;
    }

    // Draw Paddles (Mallets) with 3D effect
    
    // Player Mallet
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#F472B6";
    
    // Outer Circle (Base)
    ctx.beginPath();
    ctx.arc(paddle1.x + paddle1.width/2, paddle1.y + paddle1.height/2, paddle1.width/2, 0, Math.PI * 2);
    ctx.fillStyle = "#F472B6";
    ctx.fill();
    
    // Inner Highlight (3D top)
    ctx.beginPath();
    ctx.arc(paddle1.x + paddle1.width/2, paddle1.y + paddle1.height/2, paddle1.width/2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = "#EC4899";
    ctx.fill();
    
    // Handle/Knob
    ctx.beginPath();
    ctx.arc(paddle1.x + paddle1.width/2, paddle1.y + paddle1.height/2, paddle1.width/4, 0, Math.PI * 2);
    ctx.fillStyle = "#831843";
    ctx.fill();

    // AI Mallet
    ctx.shadowColor = "#60A5FA";
    
    // Outer Circle
    ctx.beginPath();
    ctx.arc(paddle2.x + paddle2.width/2, paddle2.y + paddle2.height/2, paddle2.width/2, 0, Math.PI * 2);
    ctx.fillStyle = "#60A5FA";
    ctx.fill();
    
    // Inner Highlight
    ctx.beginPath();
    ctx.arc(paddle2.x + paddle2.width/2, paddle2.y + paddle2.height/2, paddle2.width/2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = "#3B82F6";
    ctx.fill();
    
    // Handle/Knob
    ctx.beginPath();
    ctx.arc(paddle2.x + paddle2.width/2, paddle2.y + paddle2.height/2, paddle2.width/4, 0, Math.PI * 2);
    ctx.fillStyle = "#1E3A8A";
    ctx.fill();
    
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    if (isPlaying && !isMinimized) {
      // Start loop
      if (!requestRef.current) {
          requestRef.current = requestAnimationFrame(update);
      }
      // Ensure ball starts if it was stuck
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
    
    // Check lock state directly from document for lowest latency and truth
    // @ts-ignore
    const currentLock = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
    const isLocked = currentLock === canvasRef.current;

    if (isLocked) {
        // Relative movement when locked
        // @ts-ignore
        const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        // @ts-ignore
        const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        
        paddle1.x += movementX;
        paddle1.y += movementY;
    } else {
        // Absolute movement when unlocked
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        paddle1.x = x - paddle1.width / 2;
        paddle1.y = y - paddle1.height / 2;
    }

    // Clamp values (Constrained to left half)
    paddle1.y = Math.max(0, Math.min(height - paddle1.height, paddle1.y));
    paddle1.x = Math.max(0, Math.min((width / 2) - paddle1.width - 5, paddle1.x));

    if (!isPlaying) draw();
  };

  // Add Touch Support for Smartboards
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    e.preventDefault(); // Prevent scrolling
    
    try {
        const { paddle1, width, height } = gameState.current;
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        paddle1.x = x - paddle1.width / 2;
        paddle1.y = y - paddle1.height / 2;

        // Clamp values
        paddle1.y = Math.max(0, Math.min(height - paddle1.height, paddle1.y));
        paddle1.x = Math.max(0, Math.min((width / 2) - paddle1.width - 5, paddle1.x));

        if (!isPlaying) draw();
    } catch (err) {
        console.error("Touch move error:", err);
    }
  };

  return (
    <AnimatePresence>
      {showSubwaySurfers && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none sm:right-6 right-4"
        >
          <div className="pointer-events-auto bg-[#0A0A0B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 w-[300px] sm:w-[340px]">
            <div className="h-12 sm:h-9 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between px-3 cursor-move select-none border-b border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold text-white/90 tracking-wide">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>NEON HOCKEY</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleLock}
                  className={`p-2 sm:p-1.5 hover:bg-white/10 rounded-md transition-all ${isLocked ? 'text-primary bg-primary/10' : 'text-white/50 hover:text-white'}`}
                  title={isLocked ? "Unlock Mouse" : "Lock Mouse"}
                >
                  {isLocked ? <Lock className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> : <Unlock className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                </button>
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 sm:p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> : <Minimize2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                </button>
                <button 
                  onClick={toggleSubwaySurfers}
                  className="p-2 sm:p-1.5 hover:bg-red-500/20 rounded-md text-white/50 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>

            <motion.div 
              animate={{ height: isMinimized ? 0 : 240 }}
              className="overflow-hidden bg-[#111] relative flex flex-col"
            >
              {/* Score Board */}
              <div className="h-12 bg-[#0A0A0B] flex items-center justify-center gap-6 border-b border-white/5 shadow-lg z-10">
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
                    {/* Inner Shadow Overlay for Depth */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] z-10 rounded-lg" />
                    
                    {/* Gloss Reflection */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-transparent z-20 opacity-50" />

                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={150}
                      onMouseMove={handleMouseMove}
                      onTouchMove={handleTouchMove}
                      onTouchStart={(e) => {
                          // Prevent default to stop scrolling/zooming
                          if(e.cancelable) e.preventDefault();
                          handleTouchMove(e);
                      }}
                      onClick={() => {
                        if (isPlaying && !isLocked) toggleLock();
                      }}
                      className="block cursor-none touch-none bg-[#151515]"
                      tabIndex={0}
                    />
                    
                    {!isPlaying && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] z-30">
                        <button
                          onClick={() => setIsPlaying(true)}
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
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}