import { useEditStore } from '../stores/editstore';
import type { WSResponse } from '../types/types';

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

export async function getAndSetNewDiff(
    newid: number,
    oldid: number,
    domain: string,
    setTemp: (i: WSResponse) => void,
    setUseTemp: (i: boolean) => void
) {
    setUseTemp(true);
    const currentEdit = useEditStore.getState().selectedEdit;
    if (!currentEdit) return;
    setTemp({ ...currentEdit, diffhtml: 'loading' });
    console.log(oldid, newid);
    const res = await fetch(
        `https://${domain}/w/api.php?action=compare&fromrev=${oldid}&torev=${newid}&prop=diff%7Cids%7Ctitle%7Csize%7Cparsedcomment%7Cuser&formatversion=2&format=json&origin=*`,
        {
            headers: new Headers({
                'User-Agent':
                    'Fortress anti-vandalism application OAuth2 testing/0.2.0 (User:enbi@enwiki; lawfulbaguette@gmail.com)',
            }),
        }
    );
    const err = res.headers.get('mediawiki-api-error');
    if (err) {
        throw new Error(err);
    }
    const data = await res.json();
    const compare = data.compare;
    setTemp({
        ...currentEdit,
        diffhtml: compare.body ?? 'error',
        newsize: Number(compare.tosize),
        oldsize: Number(compare.fromsize),
        diffsize: Number(compare.tosize) - Number(compare.fromsize),
    });
}
