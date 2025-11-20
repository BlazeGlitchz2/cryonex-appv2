import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface CreateTileProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function CreateTile({ title, subtitle, icon: Icon, onClick }: CreateTileProps) {
  return (
    <motion.button
      onClick={onClick}
      className="rounded-2xl bg-[#161625] border border-[#222238] p-5 flex flex-col items-start gap-3 hover:border-[#7C3AED] hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#7C3AED]" />
      </div>
      <div className="text-left">
        <h3 className="text-white font-medium mb-1">{title}</h3>
        <p className="text-sm text-[#8A8FB2]">{subtitle}</p>
      </div>
    </motion.button>
  );
}
