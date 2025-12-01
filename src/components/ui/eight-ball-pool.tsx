import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  id: number;
  type: 'solid' | 'stripe' | 'black' | 'white';
}

export function EightBallPool({ isMinimized }: { isMinimized: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [gameMessage, setGameMessage] = useState("Drag cue ball to shoot!");
  
  // Game state refs to avoid re-renders during loop
  const ballsRef = useRef<Ball[]>([]);
  const tableRef = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  const FRICTION = 0.985;
  const WALL_BOUNCE = 0.8;
  const BALL_BOUNCE = 0.9;
  const MAX_POWER = 25;

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const ballRadius = width / 35;

    // Table dimensions (playable area)
    const margin = width * 0.05;
    tableRef.current = {
      width: width - margin * 2,
      height: height - margin * 2,
      x: margin,
      y: margin
    };

    const balls: Ball[] = [];
    
    // Cue ball
    balls.push({
      x: width / 2,
      y: height * 0.75,
      vx: 0,
      vy: 0,
      radius: ballRadius,
      color: '#ffffff',
      id: 0,
      type: 'white'
    });

    // Rack setup
    const startX = width / 2;
    const startY = height * 0.25;
    const rows = 5;
    let id = 1;
    
    const colors = [
      '#FACC15', '#1D4ED8', '#DC2626', '#7E22CE', '#F97316', 
      '#15803D', '#713F12', '#000000', '#FACC15', '#1D4ED8', 
      '#DC2626', '#7E22CE', '#F97316', '#15803D', '#713F12'
    ];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col <= row; col++) {
        const x = startX + (col * ballRadius * 2.1) - (row * ballRadius * 1.05);
        const y = startY - (row * ballRadius * 1.85);
        
        // 8 ball in the middle of 3rd row
        let color = colors[id - 1];
        let type: Ball['type'] = id < 8 ? 'solid' : id > 8 ? 'stripe' : 'black';
        
        // Specific 8-ball placement logic could go here, but simple rack for now
        if (row === 2 && col === 1) {
            color = '#000000';
            type = 'black';
        } else if (id === 8) {
            // Swap if 8 was assigned elsewhere
            color = colors[10]; // arbitrary swap
            type = 'stripe';
        }

        balls.push({
          x,
          y,
          vx: 0,
          vy: 0,
          radius: ballRadius,
          color,
          id: id++,
          type
        });
      }
    }

    ballsRef.current = balls;
    setGameMessage("Drag cue ball to shoot!");
  };

  useEffect(() => {
    if (isMinimized) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    initGame();

    const update = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.fillStyle = '#1a472a'; // Felt green
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw table borders
      const { x: tx, y: ty, width: tw, height: th } = tableRef.current;
      ctx.strokeStyle = '#4a3728'; // Wood
      ctx.lineWidth = tx;
      ctx.strokeRect(tx/2, ty/2, tw + tx, th + ty);

      // Physics & Drawing
      const balls = ballsRef.current;
      let moving = false;

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        
        // Movement
        b.x += b.vx;
        b.y += b.vy;
        
        // Friction
        b.vx *= FRICTION;
        b.vy *= FRICTION;

        if (Math.abs(b.vx) < 0.05) b.vx = 0;
        if (Math.abs(b.vy) < 0.05) b.vy = 0;
        
        if (b.vx !== 0 || b.vy !== 0) moving = true;

        // Wall collisions
        if (b.x - b.radius < tx) {
          b.x = tx + b.radius;
          b.vx = -b.vx * WALL_BOUNCE;
        } else if (b.x + b.radius > tx + tw) {
          b.x = tx + tw - b.radius;
          b.vx = -b.vx * WALL_BOUNCE;
        }

        if (b.y - b.radius < ty) {
          b.y = ty + b.radius;
          b.vy = -b.vy * WALL_BOUNCE;
        } else if (b.y + b.radius > ty + th) {
          b.y = ty + th - b.radius;
          b.vy = -b.vy * WALL_BOUNCE;
        }

        // Ball collisions
        for (let j = i + 1; j < balls.length; j++) {
          const b2 = balls[j];
          const dx = b2.x - b.x;
          const dy = b2.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < b.radius + b2.radius) {
            // Collision resolution
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // Rotate ball positions
            const pos0 = { x: 0, y: 0 };
            const pos1 = { x: dx * cos + dy * sin, y: dy * cos - dx * sin };

            // Rotate velocities
            const vel0 = { x: b.vx * cos + b.vy * sin, y: b.vy * cos - b.vx * sin };
            const vel1 = { x: b2.vx * cos + b2.vy * sin, y: b2.vy * cos - b2.vx * sin };

            // Collision reaction
            const vxTotal = vel0.x - vel1.x;
            vel0.x = ((b.radius - b2.radius) * vel0.x + 2 * b2.radius * vel1.x) / (b.radius + b2.radius);
            vel1.x = vxTotal + vel0.x;

            // Update positions to avoid overlap
            const absV = Math.abs(vel0.x) + Math.abs(vel1.x);
            const overlap = (b.radius + b2.radius) - Math.abs(pos0.x - pos1.x);
            pos0.x += vel0.x / absV * overlap;
            pos1.x += vel1.x / absV * overlap;

            // Rotate back
            const pos0F = { 
              x: pos0.x * cos - pos0.y * sin,
              y: pos0.y * cos + pos0.x * sin
            };
            const pos1F = {
              x: pos1.x * cos - pos1.y * sin,
              y: pos1.y * cos + pos1.x * sin
            };

            const vel0F = {
              x: vel0.x * cos - vel0.y * sin,
              y: vel0.y * cos + vel0.x * sin
            };
            const vel1F = {
              x: vel1.x * cos - vel1.y * sin,
              y: vel1.y * cos + vel1.x * sin
            };

            b.x += pos0F.x;
            b.y += pos0F.y;
            b2.x += pos1F.x;
            b2.y += pos1F.y;

            b.vx = vel0F.x * BALL_BOUNCE;
            b.vy = vel0F.y * BALL_BOUNCE;
            b2.vx = vel1F.x * BALL_BOUNCE;
            b2.vy = vel1F.y * BALL_BOUNCE;
          }
        }

        // Draw Ball
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.strokeStyle = '#00000033';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();

        // Shine
        ctx.beginPath();
        ctx.arc(b.x - b.radius*0.3, b.y - b.radius*0.3, b.radius*0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff66';
        ctx.fill();
        ctx.closePath();

        // Stripe
        if (b.type === 'stripe') {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.closePath();
        }
      }

      // Draw Cue Stick
      if (isDragging && dragStart && dragCurrent && !moving) {
        const cueBall = balls.find(b => b.type === 'white');
        if (cueBall) {
            const dx = dragStart.x - dragCurrent.x;
            const dy = dragStart.y - dragCurrent.y;
            const angle = Math.atan2(dy, dx);
            const power = Math.min(Math.sqrt(dx*dx + dy*dy), 150);
            
            ctx.save();
            ctx.translate(cueBall.x, cueBall.y);
            ctx.rotate(angle);
            
            // Stick
            ctx.fillStyle = '#d4a373';
            ctx.fillRect(-20 - power, -2, 200, 4);
            
            // Guide line
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(power * 2, 0);
            ctx.strokeStyle = '#ffffff33';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            
            ctx.restore();
        }
      }

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isMinimized, isDragging, dragStart, dragCurrent]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Check if clicked on cue ball
    const cueBall = ballsRef.current.find(b => b.type === 'white');
    if (cueBall) {
        const dist = Math.sqrt(Math.pow(x - cueBall.x, 2) + Math.pow(y - cueBall.y, 2));
        if (dist < cueBall.radius * 3) { // Generous hit area
            setIsDragging(true);
            setDragStart({ x, y });
            setDragCurrent({ x, y });
        }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    setDragCurrent({ x, y });
  };

  const handlePointerUp = () => {
    if (isDragging && dragStart && dragCurrent) {
        const cueBall = ballsRef.current.find(b => b.type === 'white');
        if (cueBall) {
            const dx = dragStart.x - dragCurrent.x;
            const dy = dragStart.y - dragCurrent.y;
            const power = Math.min(Math.sqrt(dx*dx + dy*dy), 150) * 0.15;
            const angle = Math.atan2(dy, dx);
            
            cueBall.vx = Math.cos(angle) * power;
            cueBall.vy = Math.sin(angle) * power;
        }
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  return (
    <div className="relative w-full h-full bg-[#1a1a1a] flex flex-col">
      <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-10">
        <div className="bg-black/50 backdrop-blur-md px-4 py-1 rounded-full text-white/80 text-xs font-medium border border-white/10">
          {gameMessage}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-black/50 border-white/10 text-white hover:bg-white/20"
          onClick={initGame}
          title="Reset Game"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}