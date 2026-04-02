"use client"

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { login } from "@/services";

function Login() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const data = await login(email, password);
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("userId", JSON.stringify(data.id));
            localStorage.setItem("userRole", data.role);
            const redirect = searchParams.get("redirect");
            const redirectTo = redirect && redirect.startsWith("/")
                ? redirect
                : data.role === "secretary"
                    ? "/admin"
                    : "/booking";
            window.location.href = redirectTo;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur s'est produite");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-transparent p-8">
            <h1 className="mb-6 text-center text-2xl font-semibold">Connexion</h1>

                {error && (
                    <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@example.com"
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium">
                        Mot de passe
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
            </form>
        </div>
    );
}

export default Login;