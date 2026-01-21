import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Loader2 } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class SplineErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Spline loading error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="w-full h-full bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
                    <div className="text-white/50 text-sm">3D Scene Failed to Load</div>
                </div>
            );
        }

        return this.props.children;
    }
}
