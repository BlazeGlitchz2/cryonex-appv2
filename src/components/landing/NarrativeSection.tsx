import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import type { NarrativeSectionContent } from "@/components/landing/landing-content";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface NarrativeSectionProps {
  content: NarrativeSectionContent;
}

export function NarrativeSection({ content }: NarrativeSectionProps) {
  const mediaFirst = content.align === "left";

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className={mediaFirst ? "lg:order-1" : "lg:order-2"}
          >
            <div className="editorial-panel overflow-hidden rounded-[2rem] p-3">
              <div className="relative overflow-hidden rounded-[1.4rem] border border-white/8">
                <OptimizedImage
                  src={content.image}
                  alt={content.alt}
                  blurPlaceholder={false}
                  imgClassName="h-auto w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,20,0.02),rgba(4,8,20,0.46))]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className={mediaFirst ? "lg:order-2" : "lg:order-1"}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100/58">
              {content.eyebrow}
            </p>
            <div className="warm-accent-line mt-3 h-px w-20" />
            <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.06em] text-white md:text-4xl">
              {content.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
              {content.body}
            </p>

            <div className="mt-7 space-y-3">
              {content.bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="editorial-panel flex items-start gap-3 rounded-[1.4rem] px-4 py-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-400/12 text-cyan-100">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-7 text-white/72">{bullet}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default NarrativeSection;
