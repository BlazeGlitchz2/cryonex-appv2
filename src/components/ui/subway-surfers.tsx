import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Move, Minimize2, Maximize2, Play, RotateCcw } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";

export function SubwaySurfersOverlay() {
  const { showSubwaySurfers, toggleSubwaySurfers } = useUIStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game State
  const gameState = useRef({
    ball: { x: 150, y: 75, dx: 0, dy: 0, size: 5 },
    paddle1: { x: 30, y: 60, height: 26, width: 26 }, // Player (Mallet size)
    paddle2: { x: 244, y: 60, height: 26, width: 26 }, // AI (Mallet size)
    width: 300,
    height: 150,
    lastScorer: 'none' as 'player' | 'ai' | 'none'
  });

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
      size: 5
    };

    // Determine direction based on who scored last
    // If Player scored, AI serves (ball goes to Player, dx < 0)
    // If AI scored, Player serves (ball goes to AI, dx > 0)
    // If start (none), random
    let dirX = 0;
    if (state.lastScorer === 'player') dirX = -1;
    else if (state.lastScorer === 'ai') dirX = 1;
    else dirX = Math.random() > 0.5 ? 1 : -1;

    setTimeout(() => {
      if (canvasRef.current && isPlaying) {
        state.ball.dx = dirX * 3; // Slightly faster for hockey feel
        state.ball.dy = (Math.random() * 2 - 1) * 2;
      }
    }, 1000);
  };

  const checkCollision = (rect1: any, rect2: any) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const update = () => {
    const state = gameState.current;
    const { ball, paddle1, paddle2, width, height } = state;

    // Predict next position
    let nextX = ball.x + ball.dx;
    let nextY = ball.y + ball.dy;

    // Wall Collisions (Top/Bottom)
    if (nextY - ball.size < 0) {
      nextY = ball.size;
      ball.dy = Math.abs(ball.dy);
    } else if (nextY + ball.size > height) {
      nextY = height - ball.size;
      ball.dy = -Math.abs(ball.dy);
    }

    // Wall Collisions (Left/Right) - Bounce if not goal
    // Goal is roughly centered, radius 30 visually, so let's give it 35 clearance
    const goalGate = 35;
    const center = height / 2;

    // Left Wall
    if (nextX - ball.size < 0) {
      // If NOT in goal area, bounce
      if (ball.y < center - goalGate || ball.y > center + goalGate) {
        nextX = ball.size;
        ball.dx = Math.abs(ball.dx); // Bounce right
      }
      // Else let it pass through to score
    } 
    // Right Wall
    else if (nextX + ball.size > width) {
      // If NOT in goal area, bounce
      if (ball.y < center - goalGate || ball.y > center + goalGate) {
        nextX = width - ball.size;
        ball.dx = -Math.abs(ball.dx); // Bounce left
      }
      // Else let it pass through to score
    }

    // Paddle Collisions (AABB)
    const ballRect = { x: nextX - ball.size, y: nextY - ball.size, width: ball.size * 2, height: ball.size * 2 };
    
    // Player Collision
    if (checkCollision(ballRect, paddle1)) {
      // Determine hit side roughly
      const centerX = paddle1.x + paddle1.width / 2;
      const centerY = paddle1.y + paddle1.height / 2;
      
      // Simple reflection logic for now, pushing out
      if (ball.x < paddle1.x) { // Hit right side (from left? unlikely for player)
         ball.dx = -Math.abs(ball.dx) * 1.1;
      } else { // Hit right side of paddle (normal)
         ball.dx = Math.abs(ball.dx) * 1.1;
         nextX = paddle1.x + paddle1.width + ball.size + 1;
      }
      
      // Add some english based on paddle movement or hit position
      const hitPoint = (ball.y - centerY) / (paddle1.height / 2);
      ball.dy += hitPoint * 3;
    }

    // AI Collision
    if (checkCollision(ballRect, paddle2)) {
       const centerY = paddle2.y + paddle2.height / 2;
       
       if (ball.x > paddle2.x + paddle2.width) { // Hit left side (from right? unlikely)
          ball.dx = Math.abs(ball.dx) * 1.1;
       } else { // Hit left side of paddle (normal)
          ball.dx = -Math.abs(ball.dx) * 1.1;
          nextX = paddle2.x - ball.size - 1;
       }

       const hitPoint = (ball.y - centerY) / (paddle2.height / 2);
       ball.dy += hitPoint * 3;
    }

    // Cap Speed
    const maxSpeed = 8;
    if (Math.abs(ball.dx) > maxSpeed) ball.dx = maxSpeed * Math.sign(ball.dx);
    if (Math.abs(ball.dy) > maxSpeed) ball.dy = maxSpeed * Math.sign(ball.dy);

    // Apply movement
    ball.x = nextX;
    ball.y = nextY;

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

    // AI Movement
    const aiCenterY = paddle2.y + paddle2.height / 2;
    const aiCenterX = paddle2.x + paddle2.width / 2;
    
    // AI Y Movement
    if (ball.dx > 0) { // Ball coming towards AI
      const diffY = ball.y - aiCenterY;
      const speedY = 2.0; // Slightly slower AI for fairness
      if (Math.abs(diffY) > speedY) {
        paddle2.y += diffY > 0 ? speedY : -speedY;
      } else {
        paddle2.y += diffY;
      }
      
      // AI X Movement (Aggressive when close)
      if (ball.x > width / 2 && Math.abs(ball.y - aiCenterY) < 40) {
          // Move forward to hit
          if (paddle2.x > width - 80) {
              paddle2.x -= 1.5;
          }
      } else {
          // Return to base
          if (paddle2.x < width - 30) {
              paddle2.x += 1.5;
          }
      }

    } else {
      // Return to center Y
      const diffY = (height / 2) - aiCenterY;
      if (Math.abs(diffY) > 1) {
        paddle2.y += diffY > 0 ? 1 : -1;
      }
      // Return to base X
      if (paddle2.x < width - 30) {
          paddle2.x += 1.5;
      }
    }
    
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

    // Clear
    ctx.fillStyle = "#111"; // Darker background for contrast
    ctx.fillRect(0, 0, width, height);

    // Draw Court Lines (Hockey Style)
    ctx.strokeStyle = "#333";
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

    // Goal Creases
    ctx.beginPath();
    ctx.arc(0, height/2, 30, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(width, height/2, 30, Math.PI/2, -Math.PI/2);
    ctx.stroke();

    // Draw Ball (Puck)
    ctx.fillStyle = "#0EE6B7";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#0EE6B7";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw "Get Ready"
    if (ball.dx === 0 && isPlaying) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.shadowBlur = 0;
      ctx.fillText("GET READY", width / 2, height / 2 - 40);
    }

    // Draw Paddles (Mallets)
    
    // Player Mallet
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#F472B6";
    
    // Outer Circle
    ctx.beginPath();
    ctx.arc(paddle1.x + paddle1.width/2, paddle1.y + paddle1.height/2, paddle1.width/2, 0, Math.PI * 2);
    ctx.fillStyle = "#F472B6";
    ctx.fill();
    
    // Handle/Knob
    ctx.beginPath();
    ctx.arc(paddle1.x + paddle1.width/2, paddle1.y + paddle1.height/2, paddle1.width/4, 0, Math.PI * 2);
    ctx.fillStyle = "#BE185D";
    ctx.fill();

    // AI Mallet
    ctx.shadowColor = "#60A5FA";
    
    // Outer Circle
    ctx.beginPath();
    ctx.arc(paddle2.x + paddle2.width/2, paddle2.y + paddle2.height/2, paddle2.width/2, 0, Math.PI * 2);
    ctx.fillStyle = "#60A5FA";
    ctx.fill();
    
    // Handle/Knob
    ctx.beginPath();
    ctx.arc(paddle2.x + paddle2.width/2, paddle2.y + paddle2.height/2, paddle2.width/4, 0, Math.PI * 2);
    ctx.fillStyle = "#1D4ED8";
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
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { paddle1, width, height } = gameState.current;
    
    // Update Y
    let newY = y - paddle1.height / 2;
    newY = Math.max(0, Math.min(height - paddle1.height, newY));
    paddle1.y = newY;

    // Update X (Constrained to left half)
    let newX = x - paddle1.width / 2;
    newX = Math.max(0, Math.min((width / 2) - paddle1.width - 5, newX)); // -5 buffer from net
    paddle1.x = newX;

    if (!isPlaying) draw();
  };

  return (
    <AnimatePresence>
      {showSubwaySurfers && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none"
        >
          <div className="pointer-events-auto bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 w-[300px]">
            <div className="h-8 bg-white/5 flex items-center justify-between px-3 cursor-move select-none border-b border-white/5">
              <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                <Move className="w-3 h-3" />
                <span>Air Hockey</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </button>
                <button 
                  onClick={toggleSubwaySurfers}
                  className="p-1 hover:bg-red-500/20 rounded text-white/70 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            <motion.div 
              animate={{ height: isMinimized ? 0 : 180 }}
              className="overflow-hidden bg-black relative flex flex-col"
            >
              <div className="absolute top-2 left-0 right-0 flex justify-center gap-8 text-xs font-mono font-bold z-10 pointer-events-none">
                <span className="text-pink-400">YOU: {score.player}</span>
                <span className="text-blue-400">CPU: {score.ai}</span>
              </div>

              <div className="relative flex-1 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={150}
                  onMouseMove={handleMouseMove}
                  className="w-full h-full cursor-none touch-none"
                />
                
                {!isPlaying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px]">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white text-xs font-medium transition-all hover:scale-105"
                    >
                      {score.player === 0 && score.ai === 0 ? (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          Start Game
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3 h-3" />
                          Resume
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-white/40 mt-2">Mouse controls paddle (Air Hockey Style)</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}