import { motion } from "framer-motion";
import type { WorkflowCardContent } from "@/components/landing/landing-content";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface FeatureFilmstripProps {
  items: WorkflowCardContent[];
}

export function FeatureFilmstrip({ items }: FeatureFilmstripProps) {
  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100/58">
            Core workflows
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">
            Show the product in context, not as a pile of features.
          </h2>
          <p className="mt-4 text-base leading-8 text-white/68">
            The filmstrip is where the landing proves Cryonex is one connected
            system: intake, guided review, and active practice inside the same
            product world.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {items.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="editorial-panel overflow-hidden rounded-[2rem]"
            >
              <div className="relative overflow-hidden border-b border-white/8">
                <OptimizedImage
                  src={item.image}
                  alt={item.alt}
                  blurPlaceholder={false}
                  imgClassName="h-64 w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(4,8,20,0.42))]" />
              </div>

              <div className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-100">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/48">
                  {item.eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/66">
                  {item.outcome}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureFilmstrip;
