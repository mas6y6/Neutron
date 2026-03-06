export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

export async function animationCooldown() {
    await sleep(100);
    await new Promise(requestAnimationFrame);
}

export function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || "";
}

export async function fetchWithCsrf(url: string, init?: RequestInit) {
    const token = getCsrfToken();

    const headers = new Headers(init?.headers || {});
    if (token) {
        headers.set('X-CSRF-Token', token);
    }
    return fetch(url, { ...init, headers, credentials: "same-origin" });
}