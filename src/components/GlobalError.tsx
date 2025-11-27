import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface GlobalErrorProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export default function GlobalError({ error, resetErrorBoundary }: GlobalErrorProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold">Something went wrong</h1>
                <p className="text-white/60">
                    We apologize for the inconvenience. The application encountered an unexpected error.
                </p>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-left overflow-auto max-h-40 text-xs font-mono text-red-300">
                    {error.message}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button
                        onClick={resetErrorBoundary}
                        className="bg-white text-black hover:bg-white/90 gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                        className="border-white/10 text-white hover:bg-white/10 gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
