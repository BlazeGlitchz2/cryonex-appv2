import { SignInPage } from "@/components/ui/sign-in-flow-1";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Login() {
    const { isLoading: authLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate("/app");
        }
    }, [authLoading, isAuthenticated, navigate]);

    return <SignInPage />;
}
