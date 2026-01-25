import { HoverLinkPreview } from "@/components/ui/hover-link-preview";

const HoverPreviewTest = () => {
    return (
        <div className="flex flex-col gap-12 items-center text-center justify-center min-h-screen bg-neutral-950 text-white">
            <div className="p-10 flex gap-1 font-medium text-xl items-center">
                Hey, have you tried
                <HoverLinkPreview
                    href="https://21st.dev/magic"
                    previewImage="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"
                    imageAlt="Example preview"
                >
                    Magic MCP?
                </HoverLinkPreview>
                It's amazing!
            </div>
            <p>(Try hovering link)</p>
        </div>
    );
};

export default HoverPreviewTest;
