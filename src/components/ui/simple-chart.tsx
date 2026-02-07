import React from "react";

type Dataset = {
  label?: string;
  data: number[] | Array<{ x: number; y: number }>;
  color?: string;
};

export type ChartSpec = {
  type: "bar" | "line" | "pie" | "scatter";
  data: {
    labels?: string[];
    datasets: Dataset[];
  };
  options?: {
    title?: string;
    xLabel?: string;
    yLabel?: string;
    legend?: boolean;
  };
};

function uniqueColor(i: number) {
  const palette = [
    "#4ade80",
    "#60a5fa",
    "#f472b6",
    "#fbbf24",
    "#34d399",
    "#a78bfa",
    "#fb7185",
    "#22d3ee",
  ];
  return palette[i % palette.length];
}

const margin = { top: 28, right: 16, bottom: 36, left: 44 };

export function SimpleChart({
  spec,
  width = 560,
  height = 320,
}: {
  spec: ChartSpec;
  width?: number;
  height?: number;
}) {
  const { type, data, options } = spec;
  const w = width;
  const h = height;

  if (!data || !data.datasets || data.datasets.length === 0) {
    return <div className="text-xs text-white/60">No data to display.</div>;
  }

  const labels = data.labels ?? [];
  const datasets = data.datasets.map((d, i) => ({
    ...d,
    color: d.color || uniqueColor(i),
  }));

  if (type === "pie") {
    const values: number[] = (datasets[0].data as number[]) ?? [];
    const total =
      values.reduce(
        (s, v) => s + (Number.isFinite(v) ? (v as number) : 0),
        0,
      ) || 1;
    const cx = w / 2;
    const cy = h / 2 + 8;
    const r = Math.min(w, h) / 2 - 20;

    let startAngle = -Math.PI / 2;
    const slices = values.map((v, i) => {
      const angle = (v / total) * Math.PI * 2;
      const endAngle = startAngle + angle;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      startAngle = endAngle;
      return {
        path,
        color: datasets[0].color!,
        label: labels[i] ?? `#${i + 1}`,
        value: v,
        colorIdx: i,
      };
    });

    return (
      <figure className="inline-block">
        {options?.title && (
          <figcaption className="text-white text-sm mb-2">
            {options.title}
          </figcaption>
        )}
        <svg
          width={w}
          height={h}
          role="img"
          aria-label={options?.title || "Pie chart"}
        >
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={uniqueColor(i)} opacity={0.95} />
          ))}
        </svg>
        {options?.legend !== false && (
          <div className="mt-2 flex flex-wrap gap-2">
            {labels.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-1 text-xs text-white/80"
              >
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: uniqueColor(i) }}
                />
                <span>{l}</span>
              </div>
            ))}
          </div>
        )}
      </figure>
    );
  }

  // Cartesian charts (bar, line, scatter)
  const flatVals: number[] =
    type === "scatter"
      ? (datasets.flatMap((d) =>
          (d.data as Array<{ x: number; y: number }>).map((p) => p.y),
        ) as number[])
      : (datasets.flatMap((d) => d.data as number[]) as number[]);
  const maxY = Math.max(...flatVals, 0);
  const minY = Math.min(...flatVals, 0);
  const yDomain = maxY === minY ? [minY - 1, maxY + 1] : [minY, maxY];

  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;

  const xScaleIndex = (i: number) =>
    labels.length > 1 ? (i / (labels.length - 1)) * innerW : innerW / 2;
  const yScale = (v: number) =>
    innerH - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * innerH;

  return (
    <figure className="inline-block">
      {options?.title && (
        <figcaption className="text-white text-sm mb-2">
          {options.title}
        </figcaption>
      )}
      <svg
        width={w}
        height={h}
        role="img"
        aria-label={options?.title || `${type} chart`}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Axes */}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#333" />
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="#333" />
          {/* Y labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const t = i / 4;
            const yVal = yDomain[0] + t * (yDomain[1] - yDomain[0]);
            const y = yScale(yVal);
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={innerW} y2={y} stroke="#222" />
                <text
                  x={-8}
                  y={y}
                  fill="#aaa"
                  fontSize="10"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {Number.isInteger(yVal) ? yVal : yVal.toFixed(1)}
                </text>
              </g>
            );
          })}
          {/* X labels (only for non-scatter with labels) */}
          {type !== "scatter" &&
            labels.map((l, i) => {
              const x = xScaleIndex(i);
              return (
                <text
                  key={i}
                  x={x}
                  y={innerH + 14}
                  fill="#aaa"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {l}
                </text>
              );
            })}

          {/* Series */}
          {type === "bar" &&
            datasets.map((ds, sIdx) => {
              const series = ds.data as number[];
              const barW =
                labels.length > 0
                  ? Math.max(
                      6,
                      innerW /
                        (labels.length * datasets.length + labels.length),
                    )
                  : 12;
              const seriesOffset = sIdx * barW;
              return (
                <g key={sIdx}>
                  {series.map((v, i) => {
                    const x =
                      xScaleIndex(i) -
                      ((datasets.length - 1) * barW) / 2 +
                      seriesOffset -
                      barW / 2;
                    const y = yScale(v);
                    const height = innerH - y;
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width={barW}
                        height={height}
                        fill={ds.color}
                      />
                    );
                  })}
                </g>
              );
            })}

          {type === "line" &&
            datasets.map((ds, sIdx) => {
              const series = ds.data as number[];
              const d = series
                .map((v, i) => {
                  const x = xScaleIndex(i);
                  const y = yScale(v);
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ");
              return (
                <g key={sIdx}>
                  <path d={d} fill="none" stroke={ds.color} strokeWidth={2} />
                  {series.map((v, i) => {
                    const x = xScaleIndex(i);
                    const y = yScale(v);
                    return (
                      <circle key={i} cx={x} cy={y} r={2.5} fill={ds.color} />
                    );
                  })}
                </g>
              );
            })}

          {type === "scatter" &&
            datasets.map((ds, sIdx) => {
              const points = ds.data as Array<{ x: number; y: number }>;
              const maxX = Math.max(...points.map((p) => p.x), 1);
              const minX = Math.min(...points.map((p) => p.x), 0);
              const xScale = (x: number) =>
                innerW * (maxX === minX ? 0.5 : (x - minX) / (maxX - minX));
              return (
                <g key={sIdx}>
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={xScale(p.x)}
                      cy={yScale(p.y)}
                      r={3}
                      fill={ds.color}
                    />
                  ))}
                </g>
              );
            })}

          {/* Axis labels */}
          {options?.yLabel && (
            <text
              x={-margin.left + 8}
              y={innerH / 2}
              fill="#bbb"
              fontSize="10"
              textAnchor="middle"
              transform={`rotate(-90 ${-margin.left + 8},${innerH / 2})`}
            >
              {options.yLabel}
            </text>
          )}
          {options?.xLabel && (
            <text
              x={innerW / 2}
              y={innerH + 28}
              fill="#bbb"
              fontSize="10"
              textAnchor="middle"
            >
              {options.xLabel}
            </text>
          )}
        </g>
      </svg>

      {options?.legend !== false && (
        <div className="mt-2 flex flex-wrap gap-3">
          {datasets.map((ds, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-xs text-white/80"
            >
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: ds.color }}
              />
              <span>{ds.label ?? `Series ${i + 1}`}</span>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}
