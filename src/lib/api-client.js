// Helper buat call API server via /api/query
// Semua action (chat, location, user) lewat sini
// Auth otomatis via cookie jogjanavigator-auth

export async function apiQuery(type, data = {}) {
    const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
    });
    return res.json();
}
