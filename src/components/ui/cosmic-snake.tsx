import { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";

interface CosmicSnakeProps {
  isMinimized: boolean;
}

export function CosmicSnake({ isMinimized }: CosmicSnakeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game Constants
  const GRID_SIZE = 15;
  const TILE_COUNT_X = 20; // 300px / 15
  const TILE_COUNT_Y = 10; // 150px / 15
  
  // Game State
  const gameState = useRef({
    snake: [{ x: 10, y: 10 }],
    velocity: { x: 0, y: 0 },
    food: { x: 15, y: 5 },
    nextVelocity: { x: 0, y: 0 },
    lastUpdate: 0,
    speed: 100 // ms per frame
  });

  useEffect(() => {
    const saved = localStorage.getItem("snake-highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const resetGame = () => {
    gameState.current = {
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      velocity: { x: 1, y: 0 },
      nextVelocity: { x: 1, y: 0 },
      food: { x: 15, y: 5 },
      lastUpdate: 0,
      speed: 120
    };
    setScore(0);
    spawnFood();
  };

  const spawnFood = () => {
    const { snake } = gameState.current;
    let valid = false;
    let x = 0, y = 0;
    
    while (!valid) {
      x = Math.floor(Math.random() * TILE_COUNT_X);
      y = Math.floor(Math.random() * TILE_COUNT_Y);
      
      valid = !snake.some(segment => segment.x === x && segment.y === y);
    }
    
    gameState.current.food = { x, y };
  };

  const update = (timestamp: number) => {
    if (!isPlaying || isMinimized) return;

    const state = gameState.current;
    
    if (timestamp - state.lastUpdate > state.speed) {
      state.lastUpdate = timestamp;
      
      // Update velocity
      state.velocity = { ...state.nextVelocity };
      
      // Move Head
      const head = { ...state.snake[0] };
      head.x += state.velocity.x;
      head.y += state.velocity.y;
      
      // Wrap around
      if (head.x < 0) head.x = TILE_COUNT_X - 1;
      if (head.x >= TILE_COUNT_X) head.x = 0;
      if (head.y < 0) head.y = TILE_COUNT_Y - 1;
      if (head.y >= TILE_COUNT_Y) head.y = 0;
      
      // Check Collision with Self
      if (state.snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
      }
      
      state.snake.unshift(head);
      
      // Check Food
      if (head.x === state.food.x && head.y === state.food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("snake-highscore", newScore.toString());
          }
          return newScore;
        });
        state.speed = Math.max(50, state.speed * 0.98); // Speed up
        spawnFood();
      } else {
        state.snake.pop();
      }
      
      draw();
    }
    
    requestRef.current = requestAnimationFrame(update);
  };

  const gameOver = () => {
    setIsPlaying(false);
    draw();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid (Subtle)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT_X; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= TILE_COUNT_Y; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(canvas.width, i * GRID_SIZE);
      ctx.stroke();
    }

    const { snake, food } = gameState.current;

    // Draw Food (Glowing)
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#F472B6";
    ctx.fillStyle = "#F472B6";
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE/2, 
      food.y * GRID_SIZE + GRID_SIZE/2, 
      GRID_SIZE/2 - 2, 
      0, Math.PI*2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? "#0EE6B7" : "#059669";
      
      if (isHead) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#0EE6B7";
      }
      
      ctx.fillRect(
        segment.x * GRID_SIZE + 1, 
        segment.y * GRID_SIZE + 1, 
        GRID_SIZE - 2, 
        GRID_SIZE - 2
      );
      
      ctx.shadowBlur = 0;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      const { velocity } = gameState.current;
      
      switch(e.key) {
        case "ArrowUp":
          if (velocity.y === 0) gameState.current.nextVelocity = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (velocity.y === 0) gameState.current.nextVelocity = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          if (velocity.x === 0) gameState.current.nextVelocity = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (velocity.x === 0) gameState.current.nextVelocity = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && !isMinimized) {
      requestRef.current = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, isMinimized]);

  // Initial Draw
  useEffect(() => {
    resetGame();
    // Small delay to ensure canvas is ready
    setTimeout(draw, 100);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Score Board */}
      <div className="h-12 bg-[#0A0A0B] flex items-center justify-between px-6 border-b border-white/5 shadow-lg z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-3 h-3 text-yellow-500" />
          <span className="text-xs font-medium text-white/60">HI: {highScore}</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
          <span className="text-[10px] font-bold text-emerald-500 tracking-wider">SCORE</span>
          <span className="text-xl font-mono font-bold text-white leading-none">{score}</span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4 bg-[#050505]">
        <div className="relative rounded-xl overflow-hidden shadow-2xl border-[6px] border-[#222] bg-[#1a1a1a] group">
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              className="block bg-[#050505]"
            />
            
            {!isPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[2px] z-30">
                <button
                  onClick={() => {
                    resetGame();
                    setIsPlaying(true);
                  }}
                  className="group flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full text-xs font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
                >
                  {score === 0 ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      START GAME
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      PLAY AGAIN
                    </>
                  )}
                </button>
                <p className="text-[10px] text-white/40 mt-3 font-medium tracking-wide">USE ARROW KEYS</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
