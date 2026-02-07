"use client";
import { ReactNode } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

export interface Card {
  id: number;
  title: string;
  description: string;
  image?: string;
  backgroundColor?: string;
  content?: ReactNode;
}

interface ScrollStackProps {
  cards: Card[];
  className?: string;
}

const CardItem = ({
  card,
  index,
  progress,
  range,
  targetScale,
}: {
  card: Card;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}) => {
  const scale = useTransform(progress, range, [1, targetScale]);

  // React Bits style: alternating rotation
  const rotate = (index % 2 === 0 ? 1 : -1) * 2;

  return (
    <div className="h-screen flex items-center justify-center sticky top-0">
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${index * 25}px)`,
        }}
        className="relative origin-top w-full max-w-4xl"
      >
        <div
          className="rounded-3xl overflow-hidden shadow-2xl h-[500px] border border-white/10 backdrop-blur-md transition-all duration-500"
          style={{
            backgroundColor: card.backgroundColor || "rgba(20, 20, 20, 0.8)",
            transform: `rotate(${rotate}deg)`,
          }}
        >
          {card.image && (
            <div className="relative w-full h-full">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-3xl font-bold mb-3">{card.title}</h3>
                <p className="text-lg text-gray-200">{card.description}</p>
              </div>
            </div>
          )}
          {!card.image && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                {card.content}
                <h3 className="text-4xl font-bold mb-4 text-white mt-6">
                  {card.title}
                </h3>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  {card.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function ScrollStack({
  cards,
  className = "",
}: ScrollStackProps) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={container} className={`relative ${className}`}>
      {cards.map((card, i) => {
        const targetScale = 1 - (cards.length - i) * 0.05;
        return (
          <CardItem
            key={card.id}
            card={card}
            index={i}
            progress={scrollYProgress}
            range={[i * 0.25, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </div>
  );
}
