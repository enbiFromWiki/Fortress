export async function fetchCred(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    const res = await fetch(input, { ...init, credentials: 'include' });
    return res;
}

export function calculateDiffColour(diffsize: number): {
    color: string;
    fontWeight: string;
} {
    if (diffsize <= -500) {
        return { color: '#c66', fontWeight: 'bold' };
    }
    if (diffsize < 0) {
        return { color: '#c66', fontWeight: 'normal' };
    }
    if (diffsize === 0) {
        return { color: '#bbb', fontWeight: 'normal' };
    }
    if (diffsize < 500) {
        return { color: '#6c6', fontWeight: 'normal' };
    }
    return { color: '#6c6', fontWeight: 'bold' };
}
