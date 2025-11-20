import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-[#161625] border border-[#222238] p-5 flex flex-col gap-2 hover:border-[#7C3AED]/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[#C7CAE5] text-sm">{title}</span>
        <Icon className="w-5 h-5 text-[#8A8FB2]" />
      </div>
      <div className="text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}
