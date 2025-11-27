import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Chen",
        role: "Senior Developer",
        content: "Cryonex has completely transformed how I build web apps. The speed is incredible.",
        avatar: "SC"
    },
    {
        name: "Marcus Rodriguez",
        role: "Product Designer",
        content: "The UI components are simply beautiful. It makes prototyping so much faster.",
        avatar: "MR"
    },
    {
        name: "Jessica Wu",
        role: "CTO",
        content: "We migrated our entire team to Cryonex. Productivity has increased by 40%.",
        avatar: "JW"
    }
];

export default function Testimonials() {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Loved by Builders</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                        Don't just take our word for it. Here's what the community has to say.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors relative"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                ))}
                            </div>
                            <p className="text-lg text-white/80 mb-6 leading-relaxed">"{t.content}"</p>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-white">
                                    {t.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold text-white">{t.name}</div>
                                    <div className="text-xs text-muted-foreground">{t.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
