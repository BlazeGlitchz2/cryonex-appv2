import { motion } from "framer-motion";
import type { TrustItem } from "@/components/landing/landing-content";
import { trustRailHighlights } from "@/components/landing/landing-content";

interface TrustRailProps {
  items: TrustItem[];
}

export function TrustRail({ items }: TrustRailProps) {
  return (
    <section className="relative -mt-12 px-5 pb-10 sm:px-8 lg:px-10 lg:pb-14">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="editorial-panel rounded-[2rem] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/58">
            {trustRailHighlights.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {items.map((item, index) => (
            <motion.article
              key={item.value}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="editorial-panel rounded-[1.8rem] p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-100">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.28em] text-amber-100/48">
                {item.value}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-white">
                {item.label}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/66">
                {item.detail}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustRail;
