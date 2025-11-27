import { motion } from "framer-motion";

const companies = [
    "Acme Corp", "Globex", "Soylent Corp", "Initech", "Umbrella Corp", "Cyberdyne", "Massive Dynamic", "Hooli"
];

export default function TrustedBy() {
    return (
        <section className="py-10 border-y border-white/5 bg-black/20 overflow-hidden">
            <div className="container mx-auto px-6 mb-8 text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Trusted by industry leaders</p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
                    {companies.map((company, i) => (
                        <span key={i} className="text-xl font-bold text-white/20 hover:text-white/40 transition-colors cursor-default">
                            {company}
                        </span>
                    ))}
                    {companies.map((company, i) => (
                        <span key={`dup-${i}`} className="text-xl font-bold text-white/20 hover:text-white/40 transition-colors cursor-default">
                            {company}
                        </span>
                    ))}
                </div>

                <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-16 px-8 ml-16">
                    {/* Duplicate for seamless loop - handled by CSS animation usually, but here we use simple flex duplication */}
                </div>
            </div>

            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          min-width: 200%;
        }
      `}</style>
        </section>
    );
}
