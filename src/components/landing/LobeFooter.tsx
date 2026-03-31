export const LobeFooter = () => {
  const columns = [
    {
      title: "Product",
      items: [
        { title: "Features", url: "#" },
        { title: "Pricing", url: "#" },
        { title: "Integrations", url: "#" },
      ],
    },
    {
      title: "Resources",
      items: [
        { title: "Documentation", url: "#" },
        { title: "API Reference", url: "#" },
        { title: "Community", url: "#" },
      ],
    },
    {
      title: "Company",
      items: [
        { title: "About", url: "/about" },
        { title: "Blog", url: "#" },
        { title: "Careers", url: "#" },
      ],
    },
    {
      title: "Legal",
      items: [
        { title: "Privacy Policy", url: "/privacy" },
        { title: "Terms of Service", url: "/terms" },
        { title: "Cookie Policy", url: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#07031c]/80 px-6 py-10 text-white/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        {columns.map((column) => (
          <div key={column.title} className="space-y-3">
            <h3 className="text-sm font-semibold text-white">{column.title}</h3>
            <div className="space-y-2">
              {column.items.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  className="block text-sm text-white/55 transition-colors hover:text-white"
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl items-center justify-between border-t border-white/10 pt-6">
        <span className="text-sm text-white/40">
          © 2024 Cryonex Systems. All rights reserved.
        </span>
        <div className="flex items-center gap-4" />
      </div>
    </footer>
  );
};
