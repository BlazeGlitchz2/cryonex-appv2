import { useEffect, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { select } from "d3-selection";
import { drag } from "d3-drag";
import { feature } from "topojson-client";

interface RotatingEarthProps {
  width?: number;
  height?: number;
  interactive?: boolean;
}

export function RotatingEarth({
  width = 200,
  height = 200,
  interactive = false,
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const projection = geoOrthographic()
      .scale(width / 2.5)
      .translate([width / 2, height / 2])
      .clipAngle(90);

    const path = geoPath(projection, context);
    const graticule = geoGraticule();

    const rotation = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };

    const render = (land: any) => {
      context.clearRect(0, 0, width, height);

      // Draw graticule
      context.beginPath();
      path(graticule());
      context.strokeStyle = "rgba(255, 255, 255, 0.1)";
      context.lineWidth = 0.5;
      context.stroke();

      // Draw land
      context.beginPath();
      path(land);
      context.fillStyle = "rgba(255, 255, 255, 0.15)";
      context.fill();
      context.strokeStyle = "rgba(255, 255, 255, 0.3)";
      context.lineWidth = 0.5;
      context.stroke();

      // Draw dots
      const dots = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        for (let lon = -180; lon <= 180; lon += 5) {
          dots.push([lon, lat]);
        }
      }

      dots.forEach((coords) => {
        const projected = projection(coords as [number, number]);
        if (projected) {
          context.beginPath();
          context.arc(projected[0], projected[1], 0.8, 0, 2 * Math.PI);
          context.fillStyle = "rgba(255, 255, 255, 0.4)";
          context.fill();
        }
      });
    };

    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
      .then((response) => response.json())
      .then((topology) => {
        const land = feature(topology, topology.objects.land);

        const animate = () => {
          // Only rotate if interactive mode is off OR if hovered
          if (!interactive || isHovered) {
            rotation.x += velocity.x;
            rotation.y += velocity.y;
          }
          projection.rotate([rotation.x, rotation.y]);
          render(land);
          animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Set initial velocity only if not interactive
        if (!interactive) {
          velocity.x = 0.5;
          velocity.y = 0;
        }

        animate();

        // Drag interaction
        const dragBehavior = drag()
          .on("drag", (event: any) => {
            rotation.x += event.dx * 0.5;
            rotation.y -= event.dy * 0.5;
            velocity.x = 0;
            velocity.y = 0;
          })
          .on("end", () => {
            if (!interactive || isHovered) {
              velocity.x = 0.5;
              velocity.y = 0;
            }
          });

        select(canvas).call(dragBehavior as any);
      })
      .catch((err) => {
        console.error("Error loading globe data:", err);
        setError("Failed to load globe");
      });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, interactive, isHovered]);

  if (error) {
    return <div className="text-xs text-red-400">{error}</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="cursor-grab active:cursor-grabbing"
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    />
  );
}
