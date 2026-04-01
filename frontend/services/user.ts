export async function login(username: string, password: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password }),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Une erreur s'est produite");
    }
    return await response.json();
}