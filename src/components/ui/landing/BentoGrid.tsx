import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[20rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-2xl transition duration-300 shadow-none p-6 bg-white/[0.02] border border-white/10 backdrop-blur-sm justify-between flex flex-col space-y-4 overflow-hidden relative",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex-1 min-h-0 overflow-hidden rounded-xl">
        {header}
      </div>
      
      <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10">
        <div className="mb-2 text-primary/80">
          {icon}
        </div>
        <div className="font-sans font-bold text-white mb-2 text-lg">
          {title}
        </div>
        <div className="font-sans font-normal text-white/60 text-sm leading-relaxed">
          {description}
        </div>
      </div>
    </motion.div>
  );
};
