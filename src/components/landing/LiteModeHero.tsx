export function LiteModeHero() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020202]">
      {/* Base Gradient - Deep and Static */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-[#050505] to-black" />

      {/* Subtle Top Right Glow - Boosted Opacity */}
      <div className="absolute -top-[20%] -right-[10%] w-[70vh] h-[70vh] rounded-full bg-cyan-500/15 blur-[120px]" />

      {/* Subtle Bottom Left Glow - Boosted Opacity */}
      <div className="absolute -bottom-[20%] -left-[10%] w-[70vh] h-[70vh] rounded-full bg-blue-600/20 blur-[120px]" />

      {/* Static Grid Pattern - Boosted Opacity */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.25]" />

      {/* Noise Texture - Boosted Opacity */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
