const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export async function fetchJSON(path, opts = {}) {
    const res = await fetch(API_BASE + path, {
        headers: { "Content-Type": "application/json" },
        ...opts
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "API error");
    return json;
};
