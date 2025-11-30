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
    ball: { x: 150, y: 75, dx: 2, dy: 2, size: 4 },
    paddle1: { y: 50, height: 40, width: 6 }, // Player (slightly thicker)
    paddle2: { y: 50, height: 40, width: 6 }, // AI
    width: 300,
    height: 150
  });

  // Reset position when opened
  useEffect(() => {
    if (showSubwaySurfers) {
      setIsMinimized(false);
      setIsPlaying(false);
      setScore({ player: 0, ai: 0 });
      resetBall();
    }
  }, [showSubwaySurfers]);

  const resetBall = () => {
    gameState.current.ball = {
      x: gameState.current.width / 2,
      y: gameState.current.height / 2,
      dx: (Math.random() > 0.5 ? 1 : -1) * 1.5, // Slower start speed
      dy: (Math.random() * 2 - 1) * 1.5,
      size: 4
    };
  };

  const update = () => {
    const state = gameState.current;
    const { ball, paddle1, paddle2, width, height } = state;

    // Move Ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall Collisions (Top/Bottom)
    if (ball.y - ball.size < 0) {
      ball.y = ball.size; // Push out
      ball.dy = Math.abs(ball.dy); // Force down
    } else if (ball.y + ball.size > height) {
      ball.y = height - ball.size; // Push out
      ball.dy = -Math.abs(ball.dy); // Force up
    }

    // Paddle Collisions
    // Player (Left)
    if (
      ball.dx < 0 && // Only check if moving towards player
      ball.x - ball.size <= paddle1.width &&
      ball.x + ball.size >= 0 && // Don't check if already passed
      ball.y + ball.size >= paddle1.y &&
      ball.y - ball.size <= paddle1.y + paddle1.height
    ) {
      ball.dx = Math.abs(ball.dx) * 1.05; // Slight speed up
      ball.x = paddle1.width + ball.size + 1; // Push out clearly
      
      // Add spin/angle based on hit position
      const hitPoint = (ball.y - (paddle1.y + paddle1.height / 2)) / (paddle1.height / 2);
      ball.dy = hitPoint * 3; // Max vertical speed
    }

    // AI (Right)
    if (
      ball.dx > 0 && // Only check if moving towards AI
      ball.x + ball.size >= width - paddle2.width &&
      ball.x - ball.size <= width &&
      ball.y + ball.size >= paddle2.y &&
      ball.y - ball.size <= paddle2.y + paddle2.height
    ) {
      ball.dx = -Math.abs(ball.dx) * 1.05;
      ball.x = width - paddle2.width - ball.size - 1; // Push out clearly
      
      const hitPoint = (ball.y - (paddle2.y + paddle2.height / 2)) / (paddle2.height / 2);
      ball.dy = hitPoint * 3;
    }

    // Scoring - Wait until fully off screen to prevent glitchy scoring
    if (ball.x < -20) {
      setScore(s => ({ ...s, ai: s.ai + 1 }));
      resetBall();
    } else if (ball.x > width + 20) {
      setScore(s => ({ ...s, player: s.player + 1 }));
      resetBall();
    }

    // AI Movement
    const aiCenter = paddle2.y + paddle2.height / 2;
    // Only move if ball is coming towards AI
    if (ball.dx > 0) {
      // Reaction delay simulation or just slower speed
      const aiSpeed = 1.2; // Even slower AI
      if (aiCenter < ball.y - 10) {
        paddle2.y += aiSpeed;
      } else if (aiCenter > ball.y + 10) {
        paddle2.y -= aiSpeed;
      }
    } else {
      // Return to center when waiting
      if (aiCenter < height / 2 - 10) paddle2.y += 0.5;
      if (aiCenter > height / 2 + 10) paddle2.y -= 0.5;
    }
    
    // Clamp AI paddle
    paddle2.y = Math.max(0, Math.min(height - paddle2.height, paddle2.y));

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
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Draw Net
    ctx.strokeStyle = "#333";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Draw Ball (Neon Green)
    ctx.fillStyle = "#0EE6B7";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#0EE6B7";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw Paddles (Neon Pink & Blue)
    ctx.shadowBlur = 10;
    
    // Player
    ctx.fillStyle = "#F472B6"; // Pink
    ctx.shadowColor = "#F472B6";
    ctx.fillRect(0, paddle1.y, paddle1.width, paddle1.height);

    // AI
    ctx.fillStyle = "#60A5FA"; // Blue
    ctx.shadowColor = "#60A5FA";
    ctx.fillRect(width - paddle2.width, paddle2.y, paddle2.width, paddle2.height);
    
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    if (isPlaying && !isMinimized) {
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isMinimized]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const paddleHeight = gameState.current.paddle1.height;
    
    // Center paddle on mouse
    let newY = y - paddleHeight / 2;
    
    // Clamp
    newY = Math.max(0, Math.min(gameState.current.height - paddleHeight, newY));
    
    gameState.current.paddle1.y = newY;
    if (!isPlaying) draw(); // Redraw to show paddle movement even when paused
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
            {/* Header */}
            <div className="h-8 bg-white/5 flex items-center justify-between px-3 cursor-move select-none border-b border-white/5">
              <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                <Move className="w-3 h-3" />
                <span>Retro Tennis</span>
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

            {/* Game Content */}
            <motion.div 
              animate={{ height: isMinimized ? 0 : 180 }}
              className="overflow-hidden bg-black relative flex flex-col"
            >
              {/* Score Board */}
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
                
                {/* Start Overlay */}
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
                    <p className="text-[10px] text-white/40 mt-2">Move mouse to control paddle</p>
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