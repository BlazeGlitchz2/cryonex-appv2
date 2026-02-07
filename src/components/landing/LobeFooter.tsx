import { Footer } from "@lobehub/ui";

export const LobeFooter = () => {
  return (
    <Footer
      columns={[
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
      ]}
      bottom={
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-white/40">
            © 2024 Cryonex Systems. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            {/* Social icons if needed */}
          </div>
        </div>
      }
    />
  );
};
