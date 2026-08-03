import { useEditStore } from '../stores/editstore';
import { usePageStore } from '../stores/pagestore';
import { useUserStore } from '../stores/userstore';
import type { Filter } from '../types/types';
import { getConfig, replaceDollars } from '../util/util';
import { socket } from './websocket';

const pending = new Map();

export function sendEditRequest(
    data: Record<string, unknown>
): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID();
    socket.send(JSON.stringify({ id, ...data }));

    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
    });
}

export async function reportToEnwikiAIV(user: string, reason: string) {
    const res = await sendEditRequest({
        action: 'aiv',
        summary: `Reporting [[Special:Contributions/${user}|${user}]] (Fortress-Beta)`,
        targetuser: user,
        reason: reason,
    });
    console.log(res);
}

socket.subscribe((e) => {
    const ms = JSON.parse(e.data);
    if (ms.type !== 'response') return;

    const req = pending.get(ms.id);
    if (!req) return;
    pending.delete(ms.id);
    if (ms.status === 'success') {
        req.resolve(ms);
    } else {
        req.reject(ms);
    }
});

export async function rollbackCurrentEditWithEnglishSummary(
    reason: string | null = null
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;
    if (!edit) return null;
    const summary =
        reason !== null
            ? `Reverting ${reason} by [[Special:Contributions/${edit.user.username}|${edit.user.username}]] (Fortress-Beta)`
            : `Reverting edits (Fortress-Beta)`;
    const obj = {
        action: 'rollback',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export async function rollbackCurrentEdit(
    summary: string
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;
    if (!edit) return null;
    const obj = {
        action: 'rollback',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export async function rollAndAutoWarnCurrentEditWithEnglishSummary(
    reason: string,
    template: string
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;
    if (!edit) return null;
    const summary = `Reverting ${reason} by [[Special:Contributions/${edit.user.username}|${edit.user.username}]] (Fortress-Beta)`;
    const obj = {
        action: 'rollandwarn',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
        warntp: `uw-${template}`,
        level: 'auto',
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export async function rollAndSingleIssueWarnCurrentEditWithEnglishSummary(
    reason: string,
    template: string
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;
    if (!edit) return null;
    const summary = `Reverting ${reason} by [[Special:Contributions/${edit.user.username}|${edit.user.username}]] (Fortress-Beta)`;
    const obj = {
        action: 'rollandwarn',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
        warntp: `uw-${template}`,
        level: 'single',
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export async function rollAndSingleIssueWarnCurrentEdit(
    summary: string,
    template: string,
    warnsummary: string | null = null
): Promise<Record<string, unknown> | null> {
    const edit = useEditStore.getState().selectedEdit;
    if (!edit) return null;
    if (!warnsummary) {
        warnsummary = getConfig()?.[edit.wiki]?.warnSummary ?? null;
    }
    if (!warnsummary) {
        throw new Error('no config');
    }
    warnsummary = replaceDollars(warnsummary, edit.user.username, template);
    const obj = {
        action: 'rollandwarn',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
        warnsummary,
        warntp: `uw-${template}`,
        level: 'single',
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export function watchCurrentUser() {
    const user = useEditStore.getState().selectedEdit?.user?.username;
    const patchUser = useUserStore.getState().patchUser;
    if (!user) return;

    patchUser(user, { watched: true });

    socket.send(JSON.stringify({ action: 'watch', targetuser: user }));
}

export function unwatchCurrentUser() {
    const user = useEditStore.getState().selectedEdit?.user?.username;
    const patchUser = useUserStore.getState().patchUser;
    if (!user) return;

    patchUser(user, { watched: false });

    socket.send(JSON.stringify({ action: 'unwatch', targetuser: user }));
}

export function setWatchedCurrentUser(watch: boolean) {
    const user = useEditStore.getState().selectedEdit?.user?.username;
    const patchUser = useUserStore.getState().patchUser;
    if (!user) {
        console.log('fail');
        return;
    }

    patchUser(user, { watched: watch });

    if (watch) {
        socket.send(JSON.stringify({ action: 'watch', targetuser: user }));
    } else {
        socket.send(JSON.stringify({ action: 'unwatch', targetuser: user }));
    }
}

export function autoSetWatchedCurrentUser() {
    const user = useEditStore.getState().selectedEdit?.user?.username;
    const patchUser = useUserStore.getState().patchUser;
    const watched = !!useUserStore.getState().users[user ?? '']?.watched;
    if (!user) {
        console.log('fail');
        return;
    }

    patchUser(user, { watched: !watched });
    console.log(useUserStore.getState());

    if (!watched) {
        socket.send(JSON.stringify({ action: 'watch', targetuser: user }));
    } else {
        socket.send(JSON.stringify({ action: 'unwatch', targetuser: user }));
    }
}

export function watchCurrentPage() {
    const patchPage = usePageStore.getState().patchPage;
    const edit = useEditStore.getState().selectedEdit;
    if (!edit) return;
    const title = edit.title;
    const wiki = edit.wiki;
    patchPage(title, wiki, { watched: true });
    socket.send(
        JSON.stringify({
            action: 'watchPage',
            targetwiki: wiki,
            targettitle: title,
        })
    );
}

export function autoSetWatchedCurrentPage() {
    const patchPage = usePageStore.getState().patchPage;
    const edit = useEditStore.getState().selectedEdit;
    if (!edit) return;
    const title = edit.title;
    const wiki = edit.wiki;
    const key = title && wiki ? `${title}|${wiki}` : '';
    const watched = !!usePageStore.getState().pages[key]?.watched;
    if (!title) {
        console.log('fail');
        return;
    }

    patchPage(title, wiki, { watched: !watched });
    console.log(usePageStore.getState().pages);

    if (!watched) {
        socket.send(
            JSON.stringify({
                action: 'watchPage',
                targettitle: title,
                targetwiki: wiki,
            })
        );
    } else {
        socket.send(
            JSON.stringify({
                action: 'unwatchPage',
                targettitle: title,
                targetwiki: wiki,
            })
        );
    }
}

export async function rollAndAutoWarnCurrentEdit(
    summary: string,
    template: string,
    warnsummary: string | null = null
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;

    if (!edit) return null;

    if (!warnsummary) {
        warnsummary = getConfig()?.[edit.wiki]?.warnSummary ?? null;
    }
    if (!warnsummary) {
        throw new Error('no config');
    }
    warnsummary = replaceDollars(warnsummary, edit.user.username, '$1');
    console.log('warn summary: ', warnsummary);
    const obj = {
        action: 'rollandwarn',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
        warnsummary,
        warntp: `uw-${template}`,
        level: 'auto',
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export function changeFilters(filters: Filter) {
    console.log('qwertyuiop');
    socket.send(JSON.stringify({ action: 'updatefilters', filters }));
}
