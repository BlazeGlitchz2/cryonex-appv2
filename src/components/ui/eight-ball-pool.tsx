import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Trophy } from 'lucide-react';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  id: number;
  type: 'solid' | 'stripe' | 'black' | 'white';
  active: boolean;
}

interface Pocket {
  x: number;
  y: number;
  radius: number;
}

type Player = 'Player 1' | 'Player 2';
type Group = 'solid' | 'stripe' | null;

export function EightBallPool({ isMinimized }: { isMinimized: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const [currentPlayer, setCurrentPlayer] = useState<Player>('Player 1');
  const [player1Group, setPlayer1Group] = useState<Group>(null);
  const [player2Group, setPlayer2Group] = useState<Group>(null);
  const [gameMessage, setGameMessage] = useState("Player 1 Break! Drag cue ball to aim.");
  const [isBallInHand, setIsBallInHand] = useState(true); // Start with ball in hand for break
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  
  // Physics Refs
  const ballsRef = useRef<Ball[]>([]);
  const tableRef = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const pocketsRef = useRef<Pocket[]>([]);
  const animationRef = useRef<number>(0);
  const processingShotRef = useRef(false);
  
  // Shot Analysis Refs
  const shotStateRef = useRef({
    firstHit: null as Ball | null,
    railsContacted: false,
    pocketedBalls: [] as Ball[],
    cueBallPocketed: false,
    turnStartCount: 16
  });

  const FRICTION = 0.988;
  const WALL_BOUNCE = 0.85;
  const BALL_BOUNCE = 0.92;
  const MIN_VELOCITY = 0.08;

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const ballRadius = width / 38; // Slightly smaller balls for better playability

    // Table dimensions (playable area)
    const margin = width * 0.08; // Wider rails
    tableRef.current = {
      width: width - margin * 2,
      height: height - margin * 2,
      x: margin,
      y: margin
    };

    // Define Pockets
    const { x, y, width: w, height: h } = tableRef.current;
    const pr = ballRadius * 1.8; // Pocket radius
    pocketsRef.current = [
      { x: x - ballRadius, y: y - ballRadius, radius: pr }, // Top Left
      { x: x + w + ballRadius, y: y - ballRadius, radius: pr }, // Top Right
      { x: x - ballRadius, y: y + h + ballRadius, radius: pr }, // Bottom Left
      { x: x + w + ballRadius, y: y + h + ballRadius, radius: pr }, // Bottom Right
      { x: x - ballRadius * 1.5, y: y + h/2, radius: pr }, // Middle Left
      { x: x + w + ballRadius * 1.5, y: y + h/2, radius: pr }, // Middle Right
    ];

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
      type: 'white',
      active: true
    });

    // Rack setup
    const startX = width / 2;
    const startY = height * 0.25;
    let id = 1;
    
    // Standard 8-ball rack pattern
    // Row 1: 1 ball
    // Row 2: 2 balls
    // Row 3: 3 balls (8-ball in center)
    // Row 4: 4 balls
    // Row 5: 5 balls
    // Corners of row 5 must be different types (one solid, one stripe)
    
    const rackConfig = [
      { row: 0, col: 0, type: 'solid' },
      { row: 1, col: 0, type: 'stripe' }, { row: 1, col: 1, type: 'solid' },
      { row: 2, col: 0, type: 'solid' }, { row: 2, col: 1, type: 'black' }, { row: 2, col: 2, type: 'stripe' }, // 8-ball
      { row: 3, col: 0, type: 'stripe' }, { row: 3, col: 1, type: 'solid' }, { row: 3, col: 2, type: 'stripe' }, { row: 3, col: 3, type: 'solid' },
      { row: 4, col: 0, type: 'stripe' }, { row: 4, col: 1, type: 'solid' }, { row: 4, col: 2, type: 'stripe' }, { row: 4, col: 3, type: 'solid' }, { row: 4, col: 4, type: 'stripe' }
    ];

    const colors = {
      solid: ['#FACC15', '#1D4ED8', '#DC2626', '#7E22CE', '#F97316', '#15803D', '#713F12'],
      stripe: ['#FACC15', '#1D4ED8', '#DC2626', '#7E22CE', '#F97316', '#15803D', '#713F12'],
      black: ['#000000']
    };

    let solidIdx = 0;
    let stripeIdx = 0;

    rackConfig.forEach(cfg => {
      const x = startX + (cfg.col * ballRadius * 2.05) - (cfg.row * ballRadius * 1.025);
      const y = startY - (cfg.row * ballRadius * 1.8);
      
      let color = '#000';
      if (cfg.type === 'solid') color = colors.solid[solidIdx++ % 7];
      if (cfg.type === 'stripe') color = colors.stripe[stripeIdx++ % 7];
      if (cfg.type === 'black') color = '#000000';

      balls.push({
        x, y, vx: 0, vy: 0,
        radius: ballRadius,
        color,
        id: id++,
        type: cfg.type as any,
        active: true
      });
    });

    ballsRef.current = balls;
    
    // Reset State
    setCurrentPlayer('Player 1');
    setPlayer1Group(null);
    setPlayer2Group(null);
    setGameMessage("Player 1 Break! Drag cue ball to position.");
    setIsBallInHand(true);
    setGameOver(false);
    setWinner(null);
    processingShotRef.current = false;
  };

  // Initialize on mount
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
  }, [isMinimized]);

  // Game Loop
  useEffect(() => {
    if (isMinimized) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const update = () => {
      // Clear canvas
      ctx.fillStyle = '#1a472a'; // Felt green
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const { x: tx, y: ty, width: tw, height: th } = tableRef.current;

      // Draw Pockets
      pocketsRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        // Pocket shading
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#111111';
        ctx.fill();
      });

      // Draw Rails
      ctx.strokeStyle = '#4a3728'; // Wood
      ctx.lineWidth = tx;
      ctx.strokeRect(tx/2, ty/2, tw + tx, th + ty);
      
      // Inner Rail (Cushion)
      ctx.strokeStyle = '#143821'; // Darker felt
      ctx.lineWidth = tx * 0.2;
      ctx.strokeRect(tx, ty, tw, th);

      // Physics & Drawing
      const balls = ballsRef.current;
      let moving = false;

      // Sub-steps for better collision detection
      const steps = 4;
      for (let step = 0; step < steps; step++) {
        for (let i = 0; i < balls.length; i++) {
          const b = balls[i];
          if (!b.active) continue;
          
          // Movement
          b.x += b.vx / steps;
          b.y += b.vy / steps;
          
          // Friction (applied once per frame, not per step to keep it simple, or scale it)
          if (step === 0) {
            b.vx *= FRICTION;
            b.vy *= FRICTION;
            if (Math.abs(b.vx) < MIN_VELOCITY) b.vx = 0;
            if (Math.abs(b.vy) < MIN_VELOCITY) b.vy = 0;
          }
          
          if (b.vx !== 0 || b.vy !== 0) moving = true;

          // Pocket Detection
          for (const p of pocketsRef.current) {
            const dx = b.x - p.x;
            const dy = b.y - p.y;
            if (dx*dx + dy*dy < p.radius*p.radius) {
              b.active = false;
              b.vx = 0;
              b.vy = 0;
              
              // Record shot data
              if (processingShotRef.current) {
                if (b.type === 'white') shotStateRef.current.cueBallPocketed = true;
                else shotStateRef.current.pocketedBalls.push(b);
              }
            }
          }

          if (!b.active) continue;

          // Wall collisions (Rails)
          if (b.x - b.radius < tx) {
            b.x = tx + b.radius;
            b.vx = Math.abs(b.vx) * WALL_BOUNCE;
            if (processingShotRef.current) shotStateRef.current.railsContacted = true;
          } else if (b.x + b.radius > tx + tw) {
            b.x = tx + tw - b.radius;
            b.vx = -Math.abs(b.vx) * WALL_BOUNCE;
            if (processingShotRef.current) shotStateRef.current.railsContacted = true;
          }

          if (b.y - b.radius < ty) {
            b.y = ty + b.radius;
            b.vy = Math.abs(b.vy) * WALL_BOUNCE;
            if (processingShotRef.current) shotStateRef.current.railsContacted = true;
          } else if (b.y + b.radius > ty + th) {
            b.y = ty + th - b.radius;
            b.vy = -Math.abs(b.vy) * WALL_BOUNCE;
            if (processingShotRef.current) shotStateRef.current.railsContacted = true;
          }

          // Ball collisions
          for (let j = i + 1; j < balls.length; j++) {
            const b2 = balls[j];
            if (!b2.active) continue;

            const dx = b2.x - b.x;
            const dy = b2.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < b.radius + b2.radius) {
              // Record first hit
              if (processingShotRef.current && b.type === 'white' && !shotStateRef.current.firstHit) {
                shotStateRef.current.firstHit = b2;
              }
              if (processingShotRef.current && b2.type === 'white' && !shotStateRef.current.firstHit) {
                shotStateRef.current.firstHit = b;
              }

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
              // Prevent divide by zero
              const safeAbsV = absV < 0.0001 ? 1 : absV;
              
              pos0.x += vel0.x / safeAbsV * overlap;
              pos1.x += vel1.x / safeAbsV * overlap;

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
        }
      }

      // Draw Balls
      balls.forEach(b => {
        if (!b.active) return;
        
        // Shadow
        ctx.beginPath();
        ctx.arc(b.x + 2, b.y + 2, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        // Ball Body
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        
        // Stripe
        if (b.type === 'stripe') {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            
            // Number circle background (optional detail)
        }

        // White circle for number (except cue ball)
        if (b.type !== 'white') {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            
            // Number
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${b.radius * 0.5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.id.toString(), b.x, b.y);
        }

        // Shine
        ctx.beginPath();
        ctx.arc(b.x - b.radius*0.3, b.y - b.radius*0.3, b.radius*0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
        
        // Selection ring for ball in hand
        if (b.type === 'white' && isBallInHand && !processingShotRef.current) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius + 4, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
      });

      // Draw Cue Stick
      if (isDragging && dragStart && dragCurrent && !moving && !isBallInHand) {
        const cueBall = balls.find(b => b.type === 'white');
        if (cueBall && cueBall.active) {
            const dx = dragStart.x - dragCurrent.x;
            const dy = dragStart.y - dragCurrent.y;
            const angle = Math.atan2(dy, dx);
            const power = Math.min(Math.sqrt(dx*dx + dy*dy), 200);
            
            ctx.save();
            ctx.translate(cueBall.x, cueBall.y);
            ctx.rotate(angle);
            
            // Aim Line
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(1000, 0);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            
            // Stick
            ctx.fillStyle = '#d4a373';
            ctx.fillRect(-20 - power, -3, 300, 6);
            ctx.fillStyle = '#5c4033'; // Handle
            ctx.fillRect(-20 - power - 100, -4, 100, 8);
            
            ctx.restore();
        }
      }

      // Game Logic: Turn End
      if (processingShotRef.current && !moving) {
        handleTurnEnd();
      }

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isMinimized, isDragging, dragStart, dragCurrent, isBallInHand, currentPlayer, player1Group, player2Group]);

  const handleTurnEnd = () => {
    processingShotRef.current = false;
    const state = shotStateRef.current;
    const balls = ballsRef.current;
    
    let foul = false;
    let foulMessage = "";
    let turnContinues = false;
    let gameWon = false;
    let gameLost = false;

    // 1. Check Scratch
    if (state.cueBallPocketed) {
        foul = true;
        foulMessage = "Scratch! Ball in hand.";
        // Respawn cue ball
        const cueBall = balls.find(b => b.type === 'white');
        if (cueBall) {
            cueBall.active = true;
            cueBall.x = tableRef.current.width / 2;
            cueBall.y = tableRef.current.height * 0.75;
            cueBall.vx = 0;
            cueBall.vy = 0;
        }
    }

    // 2. Check First Hit
    if (!foul) {
        if (!state.firstHit) {
            foul = true;
            foulMessage = "Foul! No ball hit.";
        } else {
            // Check if hit correct group
            const currentGroup = currentPlayer === 'Player 1' ? player1Group : player2Group;
            if (currentGroup) {
                if (state.firstHit.type === 'black') {
                    // Hitting 8 ball first is only allowed if group is cleared
                    const groupBallsRemaining = balls.filter(b => b.active && b.type === currentGroup).length;
                    if (groupBallsRemaining > 0) {
                        foul = true;
                        foulMessage = "Foul! Hit 8-ball too early.";
                    }
                } else if (state.firstHit.type !== currentGroup) {
                    foul = true;
                    foulMessage = `Foul! Must hit ${currentGroup}s first.`;
                }
            }
        }
    }

    // 3. Check Pocketed Balls
    if (!foul) {
        if (state.pocketedBalls.length > 0) {
            // Check for 8 ball
            const eightBall = state.pocketedBalls.find(b => b.type === 'black');
            if (eightBall) {
                const currentGroup = currentPlayer === 'Player 1' ? player1Group : player2Group;
                // If 8 ball is pocketed:
                // - If scratch: LOSS
                // - If group not clear: LOSS
                // - If group clear: WIN
                
                const myGroupBalls = balls.filter(b => b.type === currentGroup && b.active).length; // Active ones left
                
                if (myGroupBalls > 0 || !currentGroup) {
                    gameLost = true;
                    foulMessage = "You sank the 8-ball early! You lose.";
                } else {
                    gameWon = true;
                }
            } else {
                // Normal balls pocketed
                // Assign groups if open
                if (!player1Group && !player2Group) {
                    const firstPocketed = state.pocketedBalls[0];
                    if (firstPocketed.type !== 'white' && firstPocketed.type !== 'black') {
                        const p1Group = currentPlayer === 'Player 1' ? firstPocketed.type : (firstPocketed.type === 'solid' ? 'stripe' : 'solid');
                        const p2Group = p1Group === 'solid' ? 'stripe' : 'solid';
                        setPlayer1Group(p1Group);
                        setPlayer2Group(p2Group);
                        setGameMessage(`Groups Assigned! ${currentPlayer} is ${p1Group === 'solid' ? 'Solids' : 'Stripes'}.`);
                        turnContinues = true;
                    }
                } else {
                    // Check if we pocketed OUR ball
                    const currentGroup = currentPlayer === 'Player 1' ? player1Group : player2Group;
                    const myBallPocketed = state.pocketedBalls.some(b => b.type === currentGroup);
                    const opponentBallPocketed = state.pocketedBalls.some(b => b.type !== currentGroup && b.type !== 'white');
                    
                    if (myBallPocketed) {
                        turnContinues = true;
                    } else if (opponentBallPocketed) {
                        // Pocketed opponent's ball but not ours -> Turn ends (not foul usually in pub rules, but standard rules say turn ends)
                        turnContinues = false;
                    }
                }
            }
        } else {
            // No balls pocketed
            turnContinues = false;
        }
    }

    // 4. Apply Game State Changes
    if (gameLost) {
        setGameOver(true);
        setWinner(currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1');
        setGameMessage(`GAME OVER! ${currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1'} Wins!`);
    } else if (gameWon) {
        setGameOver(true);
        setWinner(currentPlayer);
        setGameMessage(`GAME OVER! ${currentPlayer} Wins!`);
    } else if (foul) {
        setIsBallInHand(true);
        setGameMessage(`${foulMessage} ${currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1'}'s Ball in Hand.`);
        setCurrentPlayer(prev => prev === 'Player 1' ? 'Player 2' : 'Player 1');
    } else if (turnContinues) {
        setGameMessage(`${currentPlayer}'s turn continues.`);
        setIsBallInHand(false);
    } else {
        // Switch turn
        const nextPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
        setCurrentPlayer(nextPlayer);
        setGameMessage(`${nextPlayer}'s Turn.`);
        setIsBallInHand(false);
    }

    // Reset shot state
    shotStateRef.current = {
        firstHit: null,
        railsContacted: false,
        pocketedBalls: [],
        cueBallPocketed: false,
        turnStartCount: balls.filter(b => b.active).length
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const cueBall = ballsRef.current.find(b => b.type === 'white');
    if (!cueBall) return;

    const dist = Math.sqrt(Math.pow(x - cueBall.x, 2) + Math.pow(y - cueBall.y, 2));

    if (isBallInHand) {
        // Check if clicking ON the cue ball to drag it
        if (dist < cueBall.radius * 3) {
            setIsDragging(true);
            setDragStart({ x, y }); // Not used for power, just tracking
        } else {
            // Place ball here if valid
            // Simple validation: inside table
            const { x: tx, y: ty, width: tw, height: th } = tableRef.current;
            if (x > tx && x < tx + tw && y > ty && y < ty + th) {
                // Check overlap
                const overlap = ballsRef.current.some(b => 
                    b.id !== 0 && b.active && 
                    Math.sqrt(Math.pow(x - b.x, 2) + Math.pow(y - b.y, 2)) < b.radius * 2
                );
                
                if (!overlap) {
                    cueBall.x = x;
                    cueBall.y = y;
                    setIsBallInHand(false); // Confirm placement
                    setGameMessage(`${currentPlayer}'s Turn. Drag to shoot.`);
                }
            }
        }
    } else {
        // Shooting mode
        if (dist < cueBall.radius * 3) {
            setIsDragging(true);
            setDragStart({ x, y });
            setDragCurrent({ x, y });
        }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (isBallInHand && isDragging) {
        // Dragging ball
        const cueBall = ballsRef.current.find(b => b.type === 'white');
        if (cueBall) {
            // Boundary checks
            const { x: tx, y: ty, width: tw, height: th } = tableRef.current;
            cueBall.x = Math.max(tx + cueBall.radius, Math.min(tx + tw - cueBall.radius, x));
            cueBall.y = Math.max(ty + cueBall.radius, Math.min(ty + th - cueBall.radius, y));
        }
    } else if (isDragging && dragStart) {
        // Dragging cue stick
        setDragCurrent({ x, y });
    }
  };

  const handlePointerUp = () => {
    if (isBallInHand) {
        setIsDragging(false);
        return;
    }

    if (isDragging && dragStart && dragCurrent) {
        const cueBall = ballsRef.current.find(b => b.type === 'white');
        if (cueBall) {
            const dx = dragStart.x - dragCurrent.x;
            const dy = dragStart.y - dragCurrent.y;
            const power = Math.min(Math.sqrt(dx*dx + dy*dy), 200) * 0.15;
            
            if (power > 0.5) {
                const angle = Math.atan2(dy, dx);
                cueBall.vx = Math.cos(angle) * power;
                cueBall.vy = Math.sin(angle) * power;
                processingShotRef.current = true;
                
                // Reset shot state
                shotStateRef.current = {
                    firstHit: null,
                    railsContacted: false,
                    pocketedBalls: [],
                    cueBallPocketed: false,
                    turnStartCount: ballsRef.current.filter(b => b.active).length
                };
            }
        }
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  return (
    <div className="relative w-full h-full bg-[#1a1a1a] flex flex-col">
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-10">
        <div className={`bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border ${currentPlayer === 'Player 1' ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-white/10'}`}>
            <div className="text-xs text-white/60 uppercase tracking-wider font-bold">Player 1</div>
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${player1Group === 'solid' ? 'bg-red-500' : player1Group === 'stripe' ? 'bg-white border-2 border-red-500' : 'bg-gray-500'}`} />
                <span className="text-white font-medium">{player1Group ? (player1Group === 'solid' ? 'Solids' : 'Stripes') : 'Open'}</span>
            </div>
        </div>

        <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white font-medium text-sm shadow-lg">
            {gameMessage}
        </div>

        <div className={`bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border ${currentPlayer === 'Player 2' ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-white/10'}`}>
            <div className="text-xs text-white/60 uppercase tracking-wider font-bold text-right">Player 2</div>
            <div className="flex items-center gap-2 justify-end">
                <span className="text-white font-medium">{player2Group ? (player2Group === 'solid' ? 'Solids' : 'Stripes') : 'Open'}</span>
                <div className={`w-3 h-3 rounded-full ${player2Group === 'solid' ? 'bg-red-500' : player2Group === 'stripe' ? 'bg-white border-2 border-red-500' : 'bg-gray-500'}`} />
            </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <Trophy className="w-16 h-16 text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <h2 className="text-4xl font-bold text-white mb-2">{winner} Wins!</h2>
            <p className="text-white/60 mb-8">Congratulations on a great game.</p>
            <Button onClick={initGame} className="bg-white text-black hover:bg-white/90">
                Play Again
            </Button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-auto">
        {isBallInHand && !gameOver && (
            <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                Ball in Hand: Tap to place
            </div>
        )}
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