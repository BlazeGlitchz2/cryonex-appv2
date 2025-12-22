"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"

export interface PreviewItem {
    key: string;
    image: string;
    title: string;
    subtitle: string;
}

interface HoverPreviewProps {
    items: Record<string, PreviewItem>;
    children: React.ReactNode;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Syne:wght@400;700;800&display=swap');

  .hover-preview-container {
    position: relative;
    font-family: 'Space Grotesk', sans-serif;
  }

  .hover-link {
    color: #fff;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    position: relative;
    display: inline-block;
    transition: color 0.3s ease;
  }

  .hover-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb);
    transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .hover-link:hover::after {
    width: 100%;
  }

  .preview-card {
    position: fixed;
    pointer-events: none;
    z-index: 1000;
    opacity: 0;
    transform: translateY(10px) scale(0.95);
    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform, opacity;
  }

  .preview-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .preview-card-inner {
    background: #1a1a1a;
    border-radius: 16px;
    padding: 8px;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.8),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      0 0 60px rgba(255, 107, 107, 0.1);
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .preview-card img {
    width: 280px;
    height: auto;
    border-radius: 10px;
    display: block;
  }

  .preview-card-title {
    padding: 12px 8px 8px;
    font-size: 0.85rem;
    color: #fff;
    font-weight: 600;
    font-family: 'Syne', sans-serif;
  }

  .preview-card-subtitle {
    padding: 0 8px 8px;
    font-size: 0.75rem;
    color: #666;
  }
`

export const HoverLink = ({
    previewKey,
    children,
    onHoverStart,
    onHoverMove,
    onHoverEnd,
}: {
    previewKey: string
    children: React.ReactNode
    onHoverStart: (key: string, e: React.MouseEvent) => void
    onHoverMove: (e: React.MouseEvent) => void
    onHoverEnd: () => void
}) => {
    return (
        <span
            className="hover-link text-primary"
            onMouseEnter={(e) => onHoverStart(previewKey, e)}
            onMouseMove={onHoverMove}
            onMouseLeave={onHoverEnd}
        >
            {children}
        </span>
    )
}

const PreviewCard = ({
    data,
    position,
    isVisible,
    cardRef,
}: {
    data: PreviewItem | null
    position: { x: number; y: number }
    isVisible: boolean
    cardRef: React.RefObject<HTMLDivElement | null>
}) => {
    if (!data) return null

    return (
        <div
            ref={cardRef}
            className={`preview-card ${isVisible ? "visible" : ""}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            <div className="preview-card-inner">
                <img
                    src={data.image || "/placeholder.svg"}
                    alt={data.title || ""}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
                <div className="preview-card-title">{data.title}</div>
                <div className="preview-card-subtitle">{data.subtitle}</div>
            </div>
        </div>
    )
}

export function HoverPreview({ items, children }: HoverPreviewProps) {
    const [activePreview, setActivePreview] = useState<PreviewItem | null>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isVisible, setIsVisible] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    // Preload all images on mount
    useEffect(() => {
        Object.entries(items).forEach(([, data]) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = data.image
        })
    }, [items])

    const updatePosition = useCallback((e: React.MouseEvent | MouseEvent) => {
        const cardWidth = 300
        const cardHeight = 250 // Approximate card height
        const offsetX = 15
        const offsetY = 20 // Gap between cursor and card bottom

        // Position card so its bottom-left is above the cursor
        let x = e.clientX - cardWidth / 2 // Center horizontally on cursor
        let y = e.clientY - cardHeight - offsetY // Position above cursor

        // Boundary checks - keep card on screen
        if (x + cardWidth > window.innerWidth - 20) {
            x = window.innerWidth - cardWidth - 20
        }
        if (x < 20) {
            x = 20
        }

        // If card would go above viewport, position below cursor instead
        if (y < 20) {
            y = e.clientY + offsetY
        }

        setPosition({ x, y })
    }, [])

    const handleHoverStart = useCallback(
        (key: string, e: React.MouseEvent) => {
            setActivePreview(items[key])
            setIsVisible(true)
            updatePosition(e)
        },
        [items, updatePosition],
    )

    const handleHoverMove = useCallback(
        (e: React.MouseEvent) => {
            if (isVisible) {
                updatePosition(e)
            }
        },
        [isVisible, updatePosition],
    )

    const handleHoverEnd = useCallback(() => {
        setIsVisible(false)
    }, [])

    // Clone children to inject props if they are HoverLinks, 
    // but since we are passing children as a render prop or just wrapping text, 
    // we might need a context or just pass the handlers down.
    // For simplicity, we'll assume the children use the exported HoverLink and we pass the handlers to them via a render prop pattern or context.
    // Actually, let's just export the handlers and let the parent compose it, 
    // OR make this a wrapper that provides context.
    // To stick to the prompt's style but make it reusable, I'll use a render prop pattern.

    return (
        <>
            <style>{styles}</style>
            <div className="hover-preview-container">
                {/* We render children and pass the handlers if they are functions, 
            but standard children prop doesn't work that way easily without cloning.
            Let's just expose a Context or return the handlers. 
            Actually, the simplest way is to just render the children and expect them to use the handlers passed.
            But wait, the user wants to use it "smartly".
            Let's rewrite this to be a Context Provider.
        */}
                <HoverPreviewContext.Provider value={{ handleHoverStart, handleHoverMove, handleHoverEnd }}>
                    {children}
                </HoverPreviewContext.Provider>

                <PreviewCard data={activePreview} position={position} isVisible={isVisible} cardRef={cardRef} />
            </div>
        </>
    )
}

import { createContext, useContext } from 'react';

const HoverPreviewContext = createContext<{
    handleHoverStart: (key: string, e: React.MouseEvent) => void;
    handleHoverMove: (e: React.MouseEvent) => void;
    handleHoverEnd: () => void;
} | null>(null);

export const SmartHoverLink = ({ previewKey, children }: { previewKey: string, children: React.ReactNode }) => {
    const context = useContext(HoverPreviewContext);
    if (!context) return <span>{children}</span>;

    return (
        <HoverLink
            previewKey={previewKey}
            onHoverStart={context.handleHoverStart}
            onHoverMove={context.handleHoverMove}
            onHoverEnd={context.handleHoverEnd}
        >
            {children}
        </HoverLink>
    );
}
