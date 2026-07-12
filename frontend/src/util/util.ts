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
        return { color: '#f66', fontWeight: 'bold' };
    }
    if (diffsize < 0) {
        return { color: '#f66', fontWeight: 'normal' };
    }
    if (diffsize === 0) {
        return { color: '#bbb', fontWeight: 'normal' };
    }
    if (diffsize < 500) {
        return { color: '#6c6', fontWeight: 'normal' };
    }
    return { color: '#6c6', fontWeight: 'bold' };
}

export function locallyParseEditSummary(
    content: string,
    domain: string
): string {
    const newContent = content
        .replace(
            /\[\[([^|\]]+)\|([^|\]]+)\]\]/g,
            (_, group, group2) =>
                `<a href="https://${domain}/wiki/${encodeURIComponent(group.replace(/<\/?(?:ins|del)[^>]*>/g, ''))}" target="_blank" class="diff-link">${group2}</a>`
        )
        .replace(
            /\[\[([^|\]]+)\]\]/g,
            (_, group) =>
                `<a href="https://${domain}/wiki/${encodeURIComponent(group.replace(/<\/?(?:ins|del)[^>]*>/g, ''))}" target="_blank" class="diff-link">${group}</a>`
        );
    return newContent;
}
