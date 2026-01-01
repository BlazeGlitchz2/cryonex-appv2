import { Header } from '@lobehub/ui';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { GradientButton } from '@/components/ui/gradient-button';

export const LobeHeader = () => {
    const navigate = useNavigate();
    return (
        <Header
            logo={
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                    <img src="/assets/cryonex-logo-official.png" alt="Cryonex Logo" className="h-9 w-9" />
                    <span className="text-xl font-bold tracking-tight text-white">
                        Cryonex
                    </span>
                </div>
            }
            actions={
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/login")}
                        className="text-white/60 hover:text-white hidden md:inline-flex hover:bg-white/5"
                    >
                        Sign In
                    </Button>
                    <GradientButton
                        onClick={() => navigate("/app")}
                        className="min-w-[120px] px-6 py-2 h-10 text-sm"
                    >
                        Launch App
                    </GradientButton>
                </div>
            }
        />
    );
};
